import { useReducer, useCallback } from 'react';
import type { GameState, Card, Area, ActionType, AbilityColor, PendingPerk } from '../types';
import { createInitialGameState, switchTurn, drawCard, getZone, resolveChallenge } from '../logic/gameEngine';

type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'PLAY_CARD', player: 'home' | 'away', cardId: string }
  | { type: 'MOVE_PUCK', area: number }
  | { type: 'BEGIN_SHOT_PHASE' }
  | { type: 'SHOT_CARD', card: Card }
  | { type: 'SCORE' }
  | { type: 'SAVE' }
  | { type: 'MOVE_PUCK_TO', area: Area, side: 'home' | 'away' | 'neutral', record?: { originArea: Area, originSide: 'home' | 'away' | 'neutral', distance: number } }
  | { type: 'REVERT_SCORE_AND_DEFLECT', scoringTeam: 'home' | 'away', originArea: Area, originSide: 'home' | 'away' | 'neutral' }
  | { type: 'END_TURN' }
  | { type: 'START_FACEOFF' }
  | { type: 'CANCEL_CHALLENGE' }
  | { type: 'NEXT_PERIOD' }
  | { type: 'SPEND_MOMENTUM', player: 'home' | 'away' }
  | { type: 'SELECT_PERK', action?: ActionType, ability?: AbilityColor }
  | { type: 'CONFIRM_PERK' }
  | { type: 'SWITCH_WITH_BENCH', player: 'home' | 'away', handCardId: string, benchCardId: string };

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return createInitialGameState();
      
    case 'START_FACEOFF': {
      return {
        ...state,
        phase: 2,
        activeChallenge: {
          type: 'Face-off',
          initiator: 'home',
          area: 9,
          homeCard: null,
          awayCard: null,
          status: 'pending'
        },
        logs: [...state.logs, "Both players: Select a card for the Face-off!"]
      };
    }

    case 'PLAY_CARD': {
      const player = state[action.player];
      const card = player.hand.find(c => c.id === action.cardId);
      if (!card) return state;
      
      const newHand = player.hand.filter(c => c.id !== action.cardId);
      const newDiscard = [...player.discard, card];
      
      let newState: GameState = {
        ...state,
        [action.player]: {
          ...player,
          hand: newHand,
          discard: newDiscard,
        },
        activeCards: [...state.activeCards, card],
        logs: [...state.logs, `${player.name} played ${card.name}`],
      };

      // Handle Challenges (Face-off, Shot, etc.)
      if (state.activeChallenge) {
        const updatedChallenge = {
          ...state.activeChallenge,
          [`${action.player}Card`]: card
        };

        if (updatedChallenge.homeCard && updatedChallenge.awayCard) {
          // Resolve Challenge
          const initiator = updatedChallenge.initiator;
          const type = updatedChallenge.type;
          const resolvedState = resolveChallenge({ ...newState, activeChallenge: updatedChallenge }, updatedChallenge.homeCard, updatedChallenge.awayCard);
          
          // Award Momentum? Rulebook says "Winning certain challenges... grants momentum tokens"
          // Winner check: possession for face-off, initiator vs non-initiator for shots
          let challengeWinner: 'home' | 'away' | null = null;
          if (type === 'Face-off') {
            challengeWinner = resolvedState.puck.possession;
          } else if (type === 'Shot') {
            const isGoal = resolvedState.logs[resolvedState.logs.length-1].includes('GOAL');
            challengeWinner = isGoal ? initiator : (initiator === 'home' ? 'away' : 'home');
          }

          if (challengeWinner) {
            resolvedState[challengeWinner].momentumTokens = Math.min(resolvedState[challengeWinner].momentumTokens + 1, 10);
          }
          
          return resolvedState;
        } else {
          return {
            ...newState,
            activeChallenge: updatedChallenge,
            logs: [...newState.logs, `${player.name} is READY.`]
          };
        }
      }

      // Track lastPlayerCardNumber
      if (card.number !== undefined && card.number >= 1 && card.number <= 7) {
        newState.lastPlayerCardNumber = card.number;
      }

      // Continuous Shot Phase Logic
      if (state.pendingShot) {
        if (state.pendingShot.shooter === action.player) {
          // Attacker reacting to the defender's shot card
          if (card.actions.includes('Score')) {
            const newStateAfterShot = { ...newState, pendingShot: null };
            return gameReducer(newStateAfterShot, { type: 'SCORE' });
          } else if (card.actions.includes('Tip')) {
            // Reverts the defender's play (handled in App.tsx loop) & keeps shot taking alive
            newState.logs = [...newState.logs, `Tip! ${player.name} forces opponent to play a new shot card.`];
            newState.pendingPerk = { winner: action.player, card };
          } else {
            // Miss! 
            newState.pendingShot = null;
            const dropArea = newState.lastPlayerCardNumber || 0;
            const offZone = action.player === 'home' ? 'away' : 'home';
            newState.puck = {
               area: dropArea as any,
               side: offZone,
               possession: null
            };
            newState.logs = [...newState.logs, `Shot MISSED! Puck bounces to ${offZone} zone area ${dropArea}.`];
            // Play continues normally with their newly played card
            newState.pendingPerk = { winner: action.player, card };
          }
        } else {
          // Defender's turn. This is officially the "Shot Card".
          newState.lastShotCard = card;
          newState.logs = [...newState.logs, `${player.name} played the Shot Card. Attacker responding...`];
          newState.pendingPerk = { winner: action.player, card };
        }
        
        return {
          ...newState,
          phase: 3
        };
      }

      // Score action outside of shot phase has no effect
      if (card.actions.includes('Score')) {
        return {
          ...newState,
          logs: [...newState.logs, `❌ Score requires a Shoot action first.`]
        };
      }

      // If NOT a challenge-starting card, trigger Perk Selection immediately
      if (!state.activeChallenge) {
        newState.pendingPerk = {
          winner: action.player,
          card
        };
      }

      return {
        ...newState,
        phase: 3, 
      };
    }

    case 'MOVE_PUCK': {
      const zone = getZone(state.puck.area, state.puck.side, state.turn);
      const isOffensive = zone === 'Offensive';
      const currentBonus = state.passingBonusMap[state.turn];
      const newBonus = isOffensive ? Math.min(currentBonus + 1, 3) : 0;

      return {
        ...state,
        puck: { ...state.puck, area: action.area as any },
        passingBonusMap: {
          ...state.passingBonusMap,
          [state.turn]: newBonus
        },
        logs: [...state.logs, `Puck moved to Area ${action.area} (${zone})`]
      };
    }

    case 'BEGIN_SHOT_PHASE': {
      return {
        ...state,
        pendingShot: { shooter: action.shooter as any },
        logs: [...state.logs, '🏒 ON A SHOT. Defender must play a shot card.']
      };
    }

    case 'SCORE': {
      const scoringTeam = state.turn;
      
      return {
        ...state,
        [scoringTeam]: {
          ...state[scoringTeam],
          score: state[scoringTeam].score + 1
        },
        stoppage: true,
        activeCards: [],
        puck: { area: 9, side: 'neutral', possession: null },
        passingBonusMap: { home: 0, away: 0 },
        lastShotCard: null,
        lastPlay: {
          player: scoringTeam,
          type: 'Score',
          originArea: state.puck.area,
          originSide: state.puck.side
        },
        logs: [...state.logs, `GOAL!!! ${scoringTeam.toUpperCase()} SCORES!`],
      };
    }

    case 'REVERT_SCORE_AND_DEFLECT': {
      const scoringTeam = action.scoringTeam;
      const defendingZone = scoringTeam === 'home' ? 'away' : 'home';
      
      // Determine if the shot came from the left or right side to pick Area 0 or Area 12
      // Using a simple heuristic based on typical layout (odd vs even or specific keys)
      // Actually, we'll just rely on the UI to map this eventually or use Area 0 as default if we don't have X coords.
      // But 0 and 12 are the faceoff dots. Let's just pass the area down.
      const faceoffArea = [1, 3, 0].includes(action.originArea) ? 0 : 12;

      return {
        ...state,
        [scoringTeam]: {
          ...state[scoringTeam],
          score: Math.max(0, state[scoringTeam].score - 1)
        },
        stoppage: true,
        puck: {
          area: faceoffArea,
          side: defendingZone,
          possession: null
        },
        logs: [...state.logs, `Deflection! Goal reverted. Stoppage out of play. Face-off at ${defendingZone} zone face-off dot.`],
      };
    }

    case 'SAVE': {
      return {
        ...state,
        stoppage: true,
        lastShotCard: null,
        activeCards: [],
        logs: [...state.logs, "GREAT SAVE! Play continues."],
      };
    }

    case 'END_TURN': {
      const currentPlayer = state[state.turn];
      const updatedPlayer = drawCard(currentPlayer);
      
      const newState = {
        ...state,
        [state.turn]: updatedPlayer,
      };
      
      return switchTurn(newState);
    }

    case 'SWITCH_WITH_BENCH': {
      const player = state[action.player];
      const handCard = player.hand.find(c => c.id === action.handCardId);
      const benchCard = player.bench.find(c => c.id === action.benchCardId);
      
      if (!handCard || !benchCard) return state;

      const isPreFaceoff = state.stoppage || !!state.activeChallenge;
      const zone = getZone(state.puck.area, state.puck.side, action.player);
      const isAllowedZone = zone === 'Offensive' || zone === 'Neutral';

      // Rule Check for Pre-Faceoff Swap Limit
      if (isPreFaceoff && player.preFaceoffSwaps <= 0) {
        return { ...state, logs: [...state.logs, `LINE CHANGE FAILED: No pre-faceoff swaps remaining for ${player.name}!`] };
      }
      
      if (!isAllowedZone && !isPreFaceoff) {
        return { ...state, logs: [...state.logs, `LINE CHANGE FAILED: Only allowed in Offensive/Neutral zones!`] };
      }

      const newHand = player.hand.map(c => c.id === action.handCardId ? benchCard : c);
      const newBench = player.bench.map(c => c.id === action.benchCardId ? handCard : c);

      return {
        ...state,
        [action.player]: {
          ...player,
          hand: newHand,
          bench: newBench,
          preFaceoffSwaps: isPreFaceoff ? player.preFaceoffSwaps - 1 : player.preFaceoffSwaps,
        },
        logs: [...state.logs, `${player.name} performed a Line Change. Remaining pre-faceoff swaps: ${isPreFaceoff ? player.preFaceoffSwaps - 1 : player.preFaceoffSwaps}`],
      };
    }


    case 'CANCEL_CHALLENGE': {
      return {
        ...state,
        activeChallenge: null,
        logs: [...state.logs, "Challenge cancelled."]
      };
    }

    case 'NEXT_PERIOD': {
      if (state.currentPeriod === 3) return state; // End of game

      const nextPeriod = (state.currentPeriod === 1 ? 2 : 3) as any;
      
      return {
        ...state,
        currentPeriod: nextPeriod,
        home: { ...state.home, preFaceoffSwaps: 2 },
        away: { ...state.away, preFaceoffSwaps: 2 },
        stoppage: true,
        phase: 1, // Lineup phase
        activeCards: [],
        logs: [...state.logs, `--- PERIOD ${nextPeriod} START ---`, "Lineup phase: 2 swaps allowed for both players."]
      };
    }

    case 'SPEND_MOMENTUM': {
      const player = state[action.player];
      if (player.momentumTokens <= 0) return state;

      return {
        ...state,
        [action.player]: {
          ...player,
          momentumTokens: player.momentumTokens - 1,
          momentumBonus: player.momentumBonus + 1,
        },
        logs: [...state.logs, `${player.name} spent 1 Momentum Token for a +1 bonus!`]
      };
    }

    case 'MOVE_PUCK_TO': {
      const newState = {
        ...state,
        puck: {
          ...state.puck,
          area: action.area,
          side: action.side
        },
        logs: [...state.logs, `Puck moved to Area ${action.area} (${action.side})`]
      };

      if (action.record) {
        newState.lastPlay = {
          player: state.turn,
          type: 'Move',
          originArea: action.record.originArea,
          originSide: action.record.originSide,
          distance: action.record.distance
        };
      }
      return newState;
    }

    case 'SELECT_PERK': {
      if (!state.pendingPerk) return state;
      return {
        ...state,
        pendingPerk: {
          ...state.pendingPerk,
          selectedAction: action.action ?? state.pendingPerk.selectedAction,
          selectedAbility: action.ability ?? state.pendingPerk.selectedAbility,
        }
      };
    }

    case 'CONFIRM_PERK': {
      if (!state.pendingPerk) return state;
      const { selectedAction, selectedAbility, winner } = state.pendingPerk;
      return {
        ...state,
        pendingPerk: null,
        logs: [...state.logs, `${winner.toUpperCase()} resolved: ${selectedAction || 'None'} / ${selectedAbility || 'None'}.`]
      };
    }

    default:
      return state;
  }
};

export const useGame = () => {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState());

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const playCard = useCallback((player: 'home' | 'away', cardId: string) => 
    dispatch({ type: 'PLAY_CARD', player, cardId }), []);
  const endTurn = useCallback(() => dispatch({ type: 'END_TURN' }), []);

  const movePuckTo = useCallback((area: Area, side: 'home' | 'away' | 'neutral', record?: { originArea: Area, originSide: 'home' | 'away' | 'neutral', distance: number }) => 
    dispatch({ type: 'MOVE_PUCK_TO', area, side, record }), []);

  const beginShotPhase = useCallback((shooter: 'home' | 'away') => dispatch({ type: 'BEGIN_SHOT_PHASE', shooter } as any), []);

  const revertScoreAndDeflect = useCallback((scoringTeam: 'home' | 'away', originArea: Area, originSide: 'home' | 'away' | 'neutral') => 
    dispatch({ type: 'REVERT_SCORE_AND_DEFLECT', scoringTeam, originArea, originSide }), []);

  return {
    state,
    startGame,
    playCard,
    endTurn,
    movePuckTo,
    revertScoreAndDeflect,
    beginShotPhase,
    switchWithBench: (player: 'home' | 'away', handCardId: string, benchCardId: string) => 
      dispatch({ type: 'SWITCH_WITH_BENCH', player, handCardId, benchCardId }),
    startFaceoff: () => dispatch({ type: 'START_FACEOFF' }),
    cancelChallenge: () => dispatch({ type: 'CANCEL_CHALLENGE' }),
    nextPeriod: () => dispatch({ type: 'NEXT_PERIOD' }),
    spendMomentum: (player: 'home' | 'away') => dispatch({ type: 'SPEND_MOMENTUM', player }),
    selectPerk: (action?: ActionType, ability?: AbilityColor) => 
      dispatch({ type: 'SELECT_PERK', action, ability }),
    confirmPerk: () => dispatch({ type: 'CONFIRM_PERK' }),
  };
};
