
import type { GameState, PlayerState, Card, Area, Zone } from '../types';
import { shuffle, FULL_DECK, getOfficialDeck } from '../cards';

const INITIAL_HAND_SIZE = 5;
const MAX_HAND_SIZE = 8;

export const createInitialPlayer = (id: string, name: string, isHome: boolean, customDeck?: Card[]): PlayerState => {
  const deckSource = customDeck || FULL_DECK;
  const fullDeck = shuffle(deckSource);
  
  // Required Bench Cards (by name for flexibility with custom decks)
  const benchNames = ['Power Play', 'Goalie', 'Coaching', 'Line Change', 'Timeout'];
  const bench: Card[] = [];
  const deckAfterBench: Card[] = [];

  fullDeck.forEach(card => {
    if (benchNames.includes(card.name) && bench.length < 5 && !bench.find(b => b.name === card.name)) {
      bench.push({ ...card, id: `${card.id}-${id}` }); // Unique ID for player instance
    } else {
      deckAfterBench.push(card);
    }
  });

  const hand = deckAfterBench.splice(0, INITIAL_HAND_SIZE);
  
  return {
    id,
    name,
    hand,
    deck: deckAfterBench,
    discard: [],
    bench,
    score: 0,
    momentumTokens: isHome ? 1 : 0,
    momentumHand: [],
    isHome,
    maxHandSize: MAX_HAND_SIZE,
    preFaceoffSwaps: 2,
    momentumBonus: 0,
  };
};

export const createInitialGameState = (): GameState => {
  const home = createInitialPlayer('home-player', 'Home Player', true, getOfficialDeck('white'));
  const away = createInitialPlayer('away-player', 'Away Player', false, getOfficialDeck('black'));
  
  return {
    home,
    away,
    puck: {
      area: 9, 
      side: 'neutral',
      possession: null,
    },
    currentPeriod: 1,
    turn: 'home',
    phase: 1,
    momentumCards: [],
    officiatingCard: null,
    passingBonusMap: { home: 0, away: 0 },
    activeChallenge: null,
    activeCards: [],
    lastShotCard: null,
    pendingPerk: null,
    isFinalMinute: false,
    stoppage: true, // Start with a stoppage for the opening face-off
    logs: ['Game started. Ready for opening face-off.'],
  };
};

const SUIT_HIERARCHY: Record<string, number> = {
  Stick: 4,
  Skate: 3,
  Glove: 2,
  Helmet: 1,
};

const getBestSuitValue = (card: Card): number => {
  if (card.suits.length === 0) return 0;
  return Math.max(...card.suits.map(s => SUIT_HIERARCHY[s] || 0));
};

export const resolveChallenge = (state: GameState, homeCard: Card, awayCard: Card): GameState => {
  if (!state.activeChallenge) return state;
  
  const newState = { ...state };
  const isFaceoff = state.activeChallenge.type === 'Face-off';
  
  // Only apply momentum bonus for non-faceoff challenges (like Shots)
  const homeVal = (homeCard.number || 0) + (isFaceoff ? 0 : state.home.momentumBonus);
  const awayVal = (awayCard.number || 0) + (isFaceoff ? 0 : state.away.momentumBonus);
  
  // Reset bonuses after using them in a challenge
  newState.home.momentumBonus = 0;
  newState.away.momentumBonus = 0;

  let winner: 'home' | 'away' | 'redraw' = 'redraw';

  if (homeVal > awayVal) {
    winner = 'home';
  } else if (awayVal > homeVal) {
    winner = 'away';
  } else {
    // Tied Numbers - For Face-offs, we must redraw if numbers are tied.
    if (isFaceoff) {
      winner = 'redraw';
    } else {
      // For other challenges (Shots), ties are broken by Suits
      const homeSuit = getBestSuitValue(homeCard);
      const awaySuit = getBestSuitValue(awayCard);
      
      if (homeSuit > awaySuit) {
        winner = 'home';
      } else if (awaySuit > homeSuit) {
        winner = 'away';
      } else {
        winner = 'redraw'; 
      }
    }
  }

  if (winner === 'redraw') {
    const redrawMsg = isFaceoff ? "TIE! Players must select another card." : "TIE! Re-draw needed.";
    newState.logs.push(redrawMsg);
    // Clear the played cards so they can start over
    if (newState.activeChallenge) {
      newState.activeChallenge.homeCard = null;
      newState.activeChallenge.awayCard = null;
    }
    return newState;
  }

  // Award Possession/Result
  if (state.activeChallenge.type === 'Face-off') {
    newState.puck.possession = winner;
    newState.stoppage = false;
    newState.turn = winner;
    newState.phase = 3; 
    newState.pendingPerk = {
      winner,
      card: winner === 'home' ? homeCard : awayCard
    };
    newState.logs.push(`${winner.toUpperCase()} won the face-off! Resolve your card.`);
  } else if (state.activeChallenge.type === 'Shot') {
    // For Shots, higher value wins. Goalie wins = Save. Shooter wins = Goal.
    if (winner === state.activeChallenge.initiator) {
      // Goal!
      const scoringTeam = winner;
      newState[scoringTeam].score += 1;
      newState.stoppage = true;
      newState.puck = { area: 9, side: 'neutral', possession: null };
      newState.logs.push(`🚨 GOAL!!! ${scoringTeam.toUpperCase()} SCORES!`);
    } else {
      // Save!
      newState.stoppage = true; // Traditionally stoppage after a goalie hold
      newState.logs.push(`🧤 GREAT SAVE! Game stoppage.`);
    }
    newState.phase = 1; // Back to stoppage phase
  }

  newState.activeChallenge = null;
  newState.activeCards = winner === 'home' ? [awayCard, homeCard] : [homeCard, awayCard];
  
  return newState;
};

export const switchTurn = (state: GameState): GameState => {
  const nextTurn = state.turn === 'home' ? 'away' : 'home';
  return {
    ...state,
    turn: nextTurn,
    phase: 1,
  };
};

export const drawCard = (player: PlayerState): PlayerState => {
  if (player.deck.length === 0) return player;
  const card = player.deck[0];
  return {
    ...player,
    hand: [...player.hand, card],
    deck: player.deck.slice(1),
  };
};

export const getZone = (_area: Area, side: 'home' | 'away' | 'neutral', team: 'home' | 'away'): Zone => {
  if (side === 'neutral') return 'Neutral';
  if (team === 'home') {
    if (side === 'home') return 'Defensive';
    return 'Offensive';
  } else {
    if (side === 'away') return 'Defensive';
    return 'Offensive';
  }
};
