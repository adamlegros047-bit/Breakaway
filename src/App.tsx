import { useState, useEffect, useRef } from 'react';
import { Board, AREA_MAP } from './components/Board';
import { Scoreboard } from './components/Scoreboard';
import { PlayArea } from './components/PlayArea';
import { PositionRoster } from './components/PositionRoster';
import { PlayerHand } from './components/PlayerHand';
import { useAI } from './hooks/useAI';
import { Card } from './components/Card';
import { StartScreen } from './components/StartScreen';
import { BenchBuilderScreen } from './components/BenchBuilderScreen';
import { FaceoffModal } from './components/FaceoffModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CardDetailModal } from './components/CardDetailModal';
import { CardActionPanel } from './components/CardActionPanel';
import type { ActionPanelItem } from './components/CardActionPanel';
import { useGame } from './hooks/useGame';
import { getAdjacentAreas, getAreasWithinHops } from './logic/adjacency';
import { COLOR_ACTIONS } from './logic/colorActions';
import type { Card as CardType } from './types';
import { getOfficialDeck } from './cards';

// Nodes that can never be a move destination during live play
const BLOCKED_MOVE_NODES = new Set(['neutral-9']);
const filterNodes = (nodes: string[]) => nodes.filter(k => !BLOCKED_MOVE_NODES.has(k));

function App() {
  const { 
    state, startGame, playCard, endTurn, movePuckTo, switchWithBench, 
    startFaceoff, nextPeriod, cancelChallenge,
    selectPerk, confirmPerk, beginShotPhase, revertScoreAndDeflect, takePossession, drawCardForPlayer, callStoppage,
    initiateGrindChallenge, contestGrindChallenge, concedeGrindChallenge
  } = useGame();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [viewingCard, setViewingCard] = useState<CardType | null>(null);
  const [appPhase, setAppPhase] = useState<'start' | 'bench-home' | 'bench-away' | 'playing'>('start');
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [showBenchFor, setShowBenchFor] = useState<'home' | 'away' | null>(null);
  const [showDeckFor, setShowDeckFor] = useState<'home' | 'away' | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [pendingMove, setPendingMove] = useState<{ options: string[], distance: number, reason: 'Move' | 'Stretch Pass' | 'Poke-check' | 'Deflect' } | null>(null);
  const [pendingFaceoffPullback, setPendingFaceoffPullback] = useState<{ winner: 'home' | 'away'; options: string[] } | null>(null);
  const [faceoffJustWon, setFaceoffJustWon] = useState<'home' | 'away' | null>(null);
  // Tracks whether current player has played a card this turn (gates NEXT PHASE)
  const [hasPlayedThisTurn, setHasPlayedThisTurn] = useState(false);
  // Pending action/special items from the last played card
  const [resolutionQueue, setResolutionQueue] = useState<ActionPanelItem[]>([]);
  const [resolvingCardName, setResolvingCardName] = useState('');
  // Count of pending Doubles picks (1 = regular Doubles, 2 = Breakaway)
  const [pendingDoubles, setPendingDoubles] = useState(0);
  // Tracks the most recently played card (for Grind Challenge reference)
  const [lastPlayedCard, setLastPlayedCard] = useState<CardType | null>(null);
  // Tracks which Yellow card the opponent selected to contest a Grind Challenge
  const [grindResponseCardId, setGrindResponseCardId] = useState<string | null>(null);
  // Stored bench selections from the builder phase
  const [homeBenchSelection, setHomeBenchSelection] = useState<CardType[]>([]);
  // Tracks which bench card is selected for a swap
  const [selectedBenchCardId, setSelectedBenchCardId] = useState<string | null>(null);

  // Pre-generated decks shown in the bench builder (stable across renders)
  const [homeDeckForBuilder] = useState(() => getOfficialDeck('white'));
  const [awayDeckForBuilder] = useState(() => getOfficialDeck('black'));

  const hasStarted = appPhase === 'playing';

  // Refs to track previous state for transition detection
  const prevChallengeRef = useRef(state.activeChallenge);
  const prevPerkRef = useRef(state.pendingPerk);

  // Detect when a faceoff challenge resolves
  useEffect(() => {
    const prev = prevChallengeRef.current;
    prevChallengeRef.current = state.activeChallenge;
    if (prev?.type === 'Face-off' && state.activeChallenge === null && state.puck.possession) {
      setFaceoffJustWon(state.puck.possession);
    }
  }, [state.activeChallenge]);

  // After perk is confirmed, offer the pullback move (or auto-move for centre ice)
  useEffect(() => {
    const prev = prevPerkRef.current;
    prevPerkRef.current = state.pendingPerk;
    if (prev !== null && state.pendingPerk === null && faceoffJustWon) {
      const isCenterFaceoff = state.puck.side === 'neutral' && state.puck.area === 9;

      if (isCenterFaceoff) {
        // Auto-move to the nearest neutral node on the winner's side:
        // Away team faces toward the top (neutral-10), Home toward the bottom (neutral-11)
        const targetArea = faceoffJustWon === 'away' ? 10 : 11;
        movePuckTo(targetArea as any, 'neutral');
      } else {
        const adjacent = getAdjacentAreas(state.puck.area, state.puck.side);
        const currentY = parseFloat(AREA_MAP[`${state.puck.side}-${state.puck.area}`]?.y || '50');
        const pullbackOptions = filterNodes(adjacent.filter(key => {
          const areaY = parseFloat(AREA_MAP[key]?.y || '50');
          return faceoffJustWon === 'home' ? areaY > currentY : areaY < currentY;
        }));
        if (pullbackOptions.length > 0) {
          setPendingFaceoffPullback({ winner: faceoffJustWon, options: pullbackOptions });
        }
      }
      setFaceoffJustWon(null);
    }
  }, [state.pendingPerk, faceoffJustWon]);

  // Auto-confirm pendingPerk — no modal, effects already applied via applyResolutionItem
  useEffect(() => {
    if (state.pendingPerk) {
      confirmPerk();
    }
  }, [state.pendingPerk]);

  useAI(
    state,
    { playCard, endTurn, movePuckTo, selectPerk, confirmPerk },
    isAIEnabled && hasStarted
  );

  const activeBench = showBenchFor ? state[showBenchFor].bench : [];
  const activeDeckDisplay = showDeckFor ? state[showDeckFor].deck : [];

  const puckKey = `${state.puck.side}-${state.puck.area}`;
  const puckY = parseFloat(AREA_MAP[puckKey]?.y || '50');
  const currentZone = puckY < 33.5 ? 'offensive' : puckY > 66.5 ? 'defensive' : 'neutral';

  const handleStart = () => { setAppPhase('bench-home'); };

  const handleHomeBenchConfirm = (bench: CardType[]) => {
    setHomeBenchSelection(bench);
    setAppPhase('bench-away');
  };

  const handleAwayBenchConfirm = (awayBench: CardType[]) => {
    startGame(homeBenchSelection, awayBench);
    setAppPhase('playing');
  };

  const handleRestart = () => {
    setConfirmConfig({
      message: "Restart the game? All progress will be lost.",
      onConfirm: () => { setAppPhase('bench-home'); setConfirmConfig(null); }
    });
  };

  const handleBackToStart = () => {
    setConfirmConfig({
      message: "Return to main menu? Current game progress will be reset.",
      onConfirm: () => { setAppPhase('start'); setConfirmConfig(null); }
    });
  };

  // Apply a single resolution item immediately
  const applyResolutionItem = (item: ResolutionItem) => {
    if (item.type === 'action') {
      if (item.value === 'Move') {
        const adjacent = filterNodes(getAdjacentAreas(state.puck.area, state.puck.side));
        setPendingMove({ options: adjacent, distance: 1, reason: 'Move' });
      } else if (item.value === 'Stretch Pass') {
        // Up to 2 areas away via BFS
        const reachable = filterNodes(getAreasWithinHops(state.puck.area, state.puck.side, 2));
        setPendingMove({ options: reachable, distance: 2, reason: 'Stretch Pass' });
      } else if (item.value === 'Shoot' || item.value === 'On-Net') {
        // Both Shoot and On-Net enter the shot phase
        beginShotPhase(state.turn);
      } else if (item.value === 'Body-Check') {
        // The player who played Body-Check takes possession of the puck
        takePossession(state.turn);
      } else if (item.value === 'Draw') {
        // Draw the top card from the current player's deck into their hand
        drawCardForPlayer(state.turn);
      } else if (item.value === 'Doubles') {
        // Open the action picker — player chooses any 1 action
        setPendingDoubles(c => c + 1);
      } else if (item.value === 'Stoppage') {
        // Immediately stop play; puck moves to nearest zone face-off dot
        callStoppage(state.turn);
      } else if (item.value === 'Grind Challenge') {
        // Use the last played card as the challenge card
        if (lastPlayedCard) {
          initiateGrindChallenge(state.turn, lastPlayedCard);
        }
      } else if (item.value === 'Poke-check') {
        // Take possession; show nodes 1 step toward own net
        const adjacent = getAdjacentAreas(state.puck.area, state.puck.side);
        const currentY = parseFloat(AREA_MAP[`${state.puck.side}-${state.puck.area}`]?.y || '50');
        // Home player retreats toward bottom (higher y); Away toward top (lower y)
        const pullbackNodes = adjacent.filter(key => {
          const areaY = parseFloat(AREA_MAP[key]?.y || '50');
          return state.turn === 'home' ? areaY > currentY : areaY < currentY;
        });
        const options = filterNodes(pullbackNodes.length > 0 ? pullbackNodes : adjacent);
        setPendingMove({ options, distance: 1, reason: 'Poke-check' });

        // Penalty if opponent's active card is a Player Card (1-7) or Goalie
        const opponent = state.turn === 'home' ? 'away' : 'home';
        const opponentCard = state.activeCards.find(c =>
          state[opponent].discard.some(d => d.id === c.id)
        ) ?? state[opponent].discard[state[opponent].discard.length - 1];

        if (opponentCard && (
          (opponentCard.number !== undefined && opponentCard.number >= 1 && opponentCard.number <= 7)
          || opponentCard.isGoalie
        )) {
          // Log the penalty — full penalty state management TBD
          console.warn(`Poke-check penalty: ${state.turn} penalised for slashing a Player/Goalie card`);
        }
      } else if (item.value === 'Deflect') {
        const opponent = state.turn === 'home' ? 'away' : 'home';
        const lastPlay = state.lastPlay;
        if (lastPlay && lastPlay.player === opponent) {
          if (lastPlay.type === 'Move' && lastPlay.originArea !== undefined && lastPlay.distance) {
            movePuckTo(lastPlay.originArea, lastPlay.originSide as any);
            const reachable = filterNodes(getAreasWithinHops(lastPlay.originArea, lastPlay.originSide as any, lastPlay.distance));
            setPendingMove({ options: reachable, distance: lastPlay.distance, reason: 'Deflect' });
          } else if (lastPlay.type === 'Score' && lastPlay.originArea !== undefined) {
              revertScoreAndDeflect(lastPlay.player as 'home'|'away', lastPlay.originArea, lastPlay.originSide as any);
          }
        }
      } else if (item.value === 'Tip') {
        const opponent = state.turn === 'home' ? 'away' : 'home';
        const lastPlay = state.lastPlay;
        if (state.pendingShot && lastPlay && lastPlay.player === opponent) {
           if (lastPlay.type === 'Move' && lastPlay.originArea !== undefined && lastPlay.originSide) {
             // Retroactively undo the opponent's shot card movement!
             movePuckTo(lastPlay.originArea, lastPlay.originSide as any);
           }
        }
      }
    } else if (item.type === 'special') {
      if (item.value === 'Breakaway') {
        // Grant 2 consecutive Doubles picks
        setPendingDoubles(2);
      }
    }
    // Other specials handled via pendingPerk / existing challenge flow
  };

  const handleAreaClick = (area: any, side: any) => {
    if (state.activeChallenge || state.pendingPerk) return;

    // Faceoff pullback: winner chooses optional 1-step move toward own net
    if (pendingFaceoffPullback) {
      const key = `${side}-${area}`;
      if (pendingFaceoffPullback.options.includes(key)) {
        movePuckTo(area, side);
      }
      setPendingFaceoffPullback(null);
      return;
    }

    // If awaiting move destination from a Move card
    if (pendingMove !== null) {
      const key = `${side}-${area}`;
      if (pendingMove.options.includes(key)) {
        if (['Move', 'Stretch Pass', 'Deflect'].includes(pendingMove.reason)) {
          movePuckTo(area, side, { originArea: state.puck.area, originSide: state.puck.side, distance: pendingMove.distance });
        } else {
          movePuckTo(area, side);
        }
      }
      setPendingMove(null);
      return;
    }

    if (selectedCardId) {
      const card = state[state.turn].hand.find(c => c.id === selectedCardId);
      if (card?.actions.includes('Move')) {
        // Obsolete legacy direct mode - kept for fallback mapping
        const adjacent = getAdjacentAreas(state.puck.area, state.puck.side);
        setPendingMove({ options: adjacent, distance: 1, reason: 'Move' });
        setSelectedCardId(null);
        playCard(state.turn, selectedCardId);
        return;
      }
      playCard(state.turn, selectedCardId);
      setSelectedCardId(null);
    } else {
      movePuckTo(area, side);
    }
  };

  const handleBenchSwap = (player: 'home' | 'away', handCardId: string, benchCardId: string) => {
    switchWithBench(player, handCardId, benchCardId);
    setSelectedCardId(null);
  };

  const closeBenchOverlay = () => {
    setShowBenchFor(null);
    setSelectedBenchCardId(null);
  };

  // Navigate zone: up = toward offensive (top), down = toward defensive (bottom)
  const handleNavigateZone = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      // Move from defensive → neutral (entry node 12) or neutral → offensive (entry node 0)
      if (currentZone === 'defensive') movePuckTo(12 as any, 'neutral');
      else if (currentZone === 'neutral') movePuckTo(0 as any, 'away');
    } else {
      // Move from offensive → neutral (entry node 9) or neutral → defensive (entry node 0)
      if (currentZone === 'offensive') movePuckTo(9 as any, 'neutral');
      else if (currentZone === 'neutral') movePuckTo(0 as any, 'home');
    }
  };

  return (
    <div className="app-main">
      {appPhase === 'start' && <StartScreen onStart={handleStart} />}

      {appPhase === 'bench-home' && (
        <BenchBuilderScreen
          playerLabel="HOME PLAYER"
          playerColor="white"
          availableCards={homeDeckForBuilder}
          onConfirm={handleHomeBenchConfirm}
        />
      )}

      {appPhase === 'bench-away' && (
        <BenchBuilderScreen
          playerLabel="AWAY PLAYER"
          playerColor="black"
          availableCards={awayDeckForBuilder}
          onConfirm={handleAwayBenchConfirm}
        />
      )}
      {state.activeChallenge && (
        <FaceoffModal state={state} onPlayCard={playCard} onClose={cancelChallenge} />
      )}


      {viewingCard && (
        <CardDetailModal 
          card={viewingCard}
          onClose={() => setViewingCard(null)}
          isPlayDisabled={
            !hasStarted ||
            // Already played a card this turn — must wait for next turn
            hasPlayedThisTurn ||
            // Stoppage / lineup phase: must start a face-off first
            (state.stoppage && !state.activeChallenge) ||
            // Card already played this turn — awaiting perk resolution
            !!state.pendingPerk ||
            // During a face-off, current player has already submitted their card
            (!!state.activeChallenge && (
              (state.turn === 'home' && !!state.activeChallenge.homeCard) ||
              (state.turn === 'away' && !!state.activeChallenge.awayCard)
            ))
          }
          pendingShot={!!state.pendingShot && state.pendingShot.shooter === state.turn}
          hasPossession={state.puck.possession === state.turn}
          onPlay={(selection) => {
            const card = viewingCard;
            playCard(state.turn, card.id);
            setViewingCard(null);
            setHasPlayedThisTurn(true);
            setLastPlayedCard(card);

            // Build the list of items from player selections + auto-granted colour abilities
            const items: ActionPanelItem[] = [
              ...selection.actions.map(v => ({ type: 'action' as const, value: v })),
              ...selection.specials.map(v => ({ type: 'special' as const, value: v })),
              ...card.abilities.flatMap(ability => {
                const acts = COLOR_ACTIONS[ability] ?? [];
                return acts
                  // Grind Challenge only available when player does NOT have possession
                  .filter(a => !(a === 'Grind Challenge' && state.puck.possession === state.turn))
                  .map(v => ({ type: 'action' as const, value: v }));
              }),
            ];

            if (items.length > 0) {
              // Queue up — player activates each via the sidebar panel
              setResolutionQueue(items);
              setResolvingCardName(card.name);
            }
          }}
        />
      )}

      {confirmConfig && (
        <ConfirmModal
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}

      {hasStarted && (
        <div className="tactical-interface">
          <Scoreboard state={state} />
          <PlayArea 
            state={state} 
            onCardDrop={(id) => playCard(state.turn, id)}
          />
          <CardActionPanel
            cardName={resolvingCardName}
            queue={resolutionQueue}
            onActivate={(item) => {
              applyResolutionItem(item);
              setResolutionQueue(prev => {
                const idx = prev.findIndex(q => q.type === item.type && q.value === item.value);
                return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
              });
            }}
            onSkip={() => setResolutionQueue([])}
          />

          {/* Doubles action picker — shown when a Purple ability grants a free-choice action */}
          {pendingDoubles > 0 && (() => {
            const hasPendingShot = !!state.pendingShot && state.pendingShot.shooter === state.turn;
            const hasPossession  = state.puck.possession === state.turn;
            const allActions = (
              ['Move','Stretch Pass','Shoot','On-Net','Score','Body-Check',
               'Poke-check','Deflect','Tip','Draw','Block','Intercept',
               'Substitution','Icing','Clone','Punch','Save'] as const
            ).filter(a => {
              if (a === 'Score' && !hasPendingShot) return false;
              if ((a === 'Move' || a === 'Stretch Pass') && !hasPossession) return false;
              // Grind Challenge cannot be chosen from Doubles
              return true;
            });
            return (
              <div style={{
                position: 'fixed', right: '340px', top: '25%', zIndex: 200,
                background: 'rgba(40,10,70,0.97)', backdropFilter: 'blur(40px)',
                border: '2px solid rgba(160,100,255,0.4)', borderRight: 'none',
                borderRadius: '20px 0 0 20px',
                boxShadow: '-15px 15px 40px rgba(0,0,0,0.8), 0 0 30px rgba(140,80,255,0.2)',
                width: '180px', fontFamily: "'Inter',sans-serif", overflow: 'hidden',
              }}>
                <div style={{ padding:'12px 14px 8px', borderBottom:'1px solid rgba(160,100,255,0.2)',
                  background:'rgba(160,100,255,0.07)' }}>
                  <div style={{ fontSize:'9px', fontWeight:900, letterSpacing:'2px', color:'#c084fc' }}>
                    {pendingDoubles > 1 ? 'BREAKAWAY' : 'DOUBLES'}
                  </div>
                  <div style={{ fontSize:'7.5px', fontWeight:700, letterSpacing:'1.5px',
                    color:'rgba(255,255,255,0.35)', marginTop:'3px' }}>
                    {pendingDoubles > 1
                      ? `PICK ${pendingDoubles} — CHOOSE ANY ACTION`
                      : 'CHOOSE ANY ACTION'}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px', padding:'10px 10px 6px' }}>
                  {allActions.map(act => (
                    <button key={act}
                      onClick={() => {
                        applyResolutionItem({ type: 'action', value: act });
                        setPendingDoubles(c => Math.max(0, c - 1));
                      }}
                      style={{
                        display:'flex', alignItems:'center', gap:'8px',
                        background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(160,100,255,0.25)',
                        borderRadius:'10px', padding:'7px 10px', cursor:'pointer',
                        color:'#c084fc', fontFamily:"'Inter',sans-serif",
                        fontSize:'11px', fontWeight:700, textAlign:'left',
                        transition:'background 0.15s, transform 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(160,100,255,0.12)'; (e.currentTarget as HTMLElement).style.transform='translateX(-3px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.transform=''; }}
                    >{act}</button>
                  ))}
                </div>
                <button onClick={() => setPendingDoubles(0)}
                  style={{
                    margin:'6px 10px 12px', background:'transparent',
                    border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px',
                    color:'rgba(255,255,255,0.3)', fontSize:'9px', fontWeight:800,
                    letterSpacing:'1.5px', padding:'7px', cursor:'pointer',
                    fontFamily:"'Inter',sans-serif", width:'calc(100% - 20px)',
                  }}>CANCEL ALL</button>
              </div>
            );
          })()}

          {state.pendingGrindChallenge && (() => {
            const { challenger, challengerCard } = state.pendingGrindChallenge!;
            const opponent = challenger === 'home' ? 'away' : 'home';
            const opponentHand = state[opponent].hand;
            const selectedIsYellow = grindResponseCardId
              ? opponentHand.find(c => c.id === grindResponseCardId)?.abilities.includes('Yellow') ?? false
              : false;
            return (
              <div style={{
                position: 'fixed', inset: 0, zIndex: 500,
                background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Inter',sans-serif",
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a120a 0%, #0d0a00 100%)',
                  border: '2px solid rgba(250,200,50,0.4)', borderRadius: '24px',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(250,200,50,0.15)',
                  padding: '32px', width: '560px', maxWidth: '94vw',
                  animation: 'modalFadeIn 0.3s ease-out',
                }}>
                  <div style={{ textAlign:'center', marginBottom:'20px' }}>
                    <div style={{ fontSize:'11px', fontWeight:800, letterSpacing:'3px',
                      color:'#fbbf24', marginBottom:'6px' }}>💥 GRIND CHALLENGE</div>
                    <div style={{ fontSize:'20px', fontWeight:900, color:'#fff', marginBottom:'4px' }}>
                      {challenger.toUpperCase()} CHALLENGES!
                    </div>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)' }}>
                      Played <strong style={{color:'#fbbf24'}}>{challengerCard.name}</strong>
                      {challengerCard.number !== undefined && <> (#{challengerCard.number})</>}
                    </div>
                  </div>

                  <div style={{ marginBottom:'16px' }}>
                    <div style={{ fontSize:'10px', fontWeight:800, letterSpacing:'2px',
                      color:'rgba(255,255,255,0.35)', marginBottom:'10px' }}>
                      {opponent.toUpperCase()} — SELECT ANY CARD TO RESPOND
                      &nbsp;<span style={{color:'#fbbf24'}}>★ Only Yellow cards count</span>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center',
                      maxHeight:'180px', overflowY:'auto', padding:'4px' }}>
                      {opponentHand.map(c => {
                        const isYellow = c.abilities.includes('Yellow');
                        const isSelected = grindResponseCardId === c.id;
                        return (
                          <button key={c.id} onClick={() => setGrindResponseCardId(c.id)}
                            title={isYellow ? 'Yellow — counts as a valid contest' : 'Not Yellow — will not count; challenger auto-wins'}
                            style={{
                              padding:'7px 12px', borderRadius:'10px', cursor:'pointer',
                              fontFamily:"'Inter',sans-serif", fontSize:'12px', fontWeight:700,
                              border: isSelected
                                ? `2px solid ${isYellow ? '#fbbf24' : '#ff6b6b'}`
                                : `2px solid ${isYellow ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`,
                              background: isSelected
                                ? (isYellow ? 'rgba(250,200,50,0.18)' : 'rgba(255,107,107,0.15)')
                                : 'rgba(255,255,255,0.04)',
                              color: isSelected
                                ? (isYellow ? '#fbbf24' : '#ff6b6b')
                                : (isYellow ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.3)'),
                              transition: 'all 0.15s',
                              position: 'relative',
                            }}>
                            {isYellow && <span style={{ marginRight:'4px' }}>★</span>}
                            {c.name}{c.number !== undefined ? ` #${c.number}` : ''}
                          </button>
                        );
                      })}
                    </div>
                    {grindResponseCardId && !selectedIsYellow && (
                      <div style={{ marginTop:'10px', fontSize:'11px', color:'#ff6b6b',
                        fontWeight:700, textAlign:'center' }}>
                        ⚠ Non-Yellow card — challenger auto-wins if played
                      </div>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:'12px' }}>
                    <button
                      disabled={!grindResponseCardId}
                      onClick={() => {
                        if (grindResponseCardId) {
                          contestGrindChallenge(grindResponseCardId);
                          setGrindResponseCardId(null);
                        }
                      }}
                      style={{
                        flex:1, padding:'14px', borderRadius:'12px',
                        cursor: grindResponseCardId ? 'pointer' : 'not-allowed',
                        background: grindResponseCardId ? '#fbbf24' : '#333',
                        color: grindResponseCardId ? '#000' : 'rgba(255,255,255,0.2)',
                        border:'none', fontFamily:"'Inter',sans-serif", fontSize:'14px',
                        fontWeight:800, letterSpacing:'0.5px', transition:'all 0.2s',
                      }}>
                      {selectedIsYellow ? '⚔️ CONTEST' : (grindResponseCardId ? '⚔️ PLAY (challenger wins)' : '⚔️ PLAY CARD')}
                    </button>
                    <button
                      onClick={() => {
                        concedeGrindChallenge();
                        setGrindResponseCardId(null);
                        setResolutionQueue(prev => [{ type: 'action', value: 'Move' }, ...prev]);
                        setResolvingCardName('Grind Challenge (Free Move)');
                      }}
                      style={{
                        flex:1, padding:'14px', borderRadius:'12px', cursor:'pointer',
                        background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)',
                        border:'1.5px solid rgba(255,255,255,0.12)', fontFamily:"'Inter',sans-serif",
                        fontSize:'14px', fontWeight:800, letterSpacing:'0.5px', transition:'all 0.2s',
                      }}>
                      🏳️ CONCEDE
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <PositionRoster side="home" />
          <PositionRoster side="away" />
          {/* Fixed overlays */}
          <div className="header-controls">
            <button className="back-btn" onClick={handleBackToStart}>← BACK</button>
            <button 
              className={`ai-toggle-btn ${isAIEnabled ? 'enabled' : 'disabled'}`}
              onClick={() => setIsAIEnabled(!isAIEnabled)}
            >
              CPU: {isAIEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="global-stats">
            <div className="stat-pill">SWAPS {state.home.preFaceoffSwaps}H / {state.away.preFaceoffSwaps}A</div>
            <div className={`turn-badge ${state.turn}`}>
              {state.turn === 'home' ? '⚪ HOME' : '⚫ AWAY'}
            </div>
            <button className="restart-btn" onClick={handleRestart}>↺</button>
          </div>

          {/* Central HUD Stack */}
          <div className="hud-stack">

            {/* Zone Tracker — cap of the stack */}
            <div className={`zone-tracker ${currentZone}`}>
              <span className="zone-label">
                {state.pendingShot ? (
                  <span style={{ color: '#ffea00', animation: 'pulse 1.5s infinite' }}>
                    🚨 ON A SHOT 🚨
                  </span>
                ) : (
                  currentZone === 'offensive' ? 'OFFENSIVE ZONE'
                  : currentZone === 'defensive' ? 'DEFENSIVE ZONE'
                  : 'NEUTRAL ZONE'
                )}
              </span>
              <div className="zone-bar-bg">
                <div className="zone-bar-fill" style={{ width: `${puckY}%` }} />
              </div>
            </div>

            {/* Dynamic Board Window */}
            <Board
              state={state}
              onAreaClick={handleAreaClick}
              onNavigateZone={handleNavigateZone}
              adjacentMoveAreas={pendingFaceoffPullback?.options ?? pendingMove?.options ?? []}
            />

            {/* Move destination prompt */}
            {pendingMove !== null && (
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,220,0,0.92)',
                color: '#111',
                fontWeight: 900,
                fontSize: '13px',
                letterSpacing: '0.05em',
                padding: '7px 18px',
                borderRadius: '20px',
                zIndex: 100,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}>
                🏒 {pendingMove.reason === 'Stretch Pass' ? 'SELECT DESTINATION (2 areas max)' : pendingMove.reason === 'Deflect' ? 'DEFLECTION! SELECT NEW DESTINATION' : pendingMove.reason === 'Poke-check' ? 'POKE-CHECK! PULL PUCK BACK' : 'SELECT DESTINATION — click a glowing node'}
                <button
                  onClick={() => setPendingMove(null)}
                  style={{ marginLeft: 12, background: 'none', border: '1px solid #111', borderRadius: 8, padding: '2px 8px', cursor: 'pointer', fontWeight: 800, pointerEvents: 'all' }}
                >✕ Cancel</button>
              </div>
            )}

            {/* Faceoff pullback prompt */}
            {pendingFaceoffPullback !== null && (
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,200,120,0.95)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '13px',
                letterSpacing: '0.05em',
                padding: '7px 18px',
                borderRadius: '20px',
                zIndex: 100,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}>
                ✅ {pendingFaceoffPullback.winner.toUpperCase()} WON — pull puck toward your net, or
                <button
                  onClick={() => setPendingFaceoffPullback(null)}
                  style={{ marginLeft: 12, background: 'none', border: '1px solid #fff', borderRadius: 8, padding: '2px 10px', cursor: 'pointer', fontWeight: 800, color: '#fff', pointerEvents: 'all' }}
                >Leave it here</button>
              </div>
            )}

            {/* Hand Dock with outside deck indicators */}
            <div className="hand-dock-wrapper">
              
              {/* Home Deck — left side outside the box */}
              <div className="deck-pod home-deck">
                <button className="deck-bench-btn" onClick={() => setShowBenchFor('home')}>BENCH</button>
                <div className="deck-visual white-deck" onClick={() => setShowDeckFor('home')}>
                  <span className="deck-count">{state.home.deck.length}</span>
                </div>
                <span className="deck-tag">WHITE</span>
              </div>

              <div className="hand-dock">
                <div className="hand-row">
                  <PlayerHand
                    player={state[state.turn]}
                    onCardClick={(id) => {
                      const card = state[state.turn].hand.find(c => c.id === id);
                      if (card) setViewingCard(card);
                    }}
                    selectedCardId={selectedCardId}
                    isTurn={true}
                  />
                </div>

                {/* Action Buttons */}
                <div className="action-row">
                  {state.stoppage && !state.activeChallenge && (
                    <button className="act-btn faceoff-btn" onClick={startFaceoff}>START FACEOFF</button>
                  )}
                  <button
                    className="act-btn phase-btn"
                    disabled={!hasPlayedThisTurn}
                    onClick={() => { endTurn(); setHasPlayedThisTurn(false); }}
                    style={!hasPlayedThisTurn ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                    title={!hasPlayedThisTurn ? 'Play a card before ending your turn' : undefined}
                  >NEXT PHASE</button>
                  {!state.activeChallenge && (
                    <button className="act-btn period-btn" onClick={nextPeriod}>NEXT PERIOD</button>
                  )}
                </div>
              </div>

              {/* Away Deck — right side outside the box */}
              <div className="deck-pod away-deck">
                <button className="deck-bench-btn" onClick={() => setShowBenchFor('away')}>BENCH</button>
                <div className="deck-visual black-deck" onClick={() => setShowDeckFor('away')}>
                  <span className="deck-count">{state.away.deck.length}</span>
                </div>
                <span className="deck-tag">BLACK</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Bench Overlay Modal — two-step swap */}
      {showBenchFor && (() => {
        const benchPlayer = state[showBenchFor];
        const bench = benchPlayer.bench;
        const hand  = benchPlayer.hand;

        return (
          <div className="bench-expanded-overlay" onClick={closeBenchOverlay}>
            <div className="bench-cards-container bench-swap-container" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="bench-swap-header">
                <h3>{showBenchFor.toUpperCase()} BENCH</h3>
                {!selectedBenchCardId && !selectedCardId && (
                  <p className="bench-swap-instruction">SELECT A BENCH CARD TO SWAP OUT</p>
                )}
                {(selectedBenchCardId || selectedCardId) && (
                  <p className="bench-swap-instruction active">NOW SELECT A HAND CARD TO SWAP IN ↓</p>
                )}
              </div>

              {/* STEP 1 — Bench cards */}
              <div className="bench-section-label">BENCH</div>
              <div className="bench-grid">
                {bench.map(card => {
                  const isSelected = selectedBenchCardId === card.id;
                  return (
                    <div
                      key={card.id}
                      className={`bench-card-item ${
                        isSelected ? 'bench-card-selected' : ''
                      } ${
                        selectedCardId ? 'bench-card-swappable' : ''
                      }`}
                      onClick={() => {
                        if (selectedCardId) {
                          // Hand-first flow: hand card already chosen → swap immediately
                          handleBenchSwap(showBenchFor, selectedCardId, card.id);
                          closeBenchOverlay();
                          setSelectedCardId(null);
                        } else if (isSelected) {
                          // Deselect
                          setSelectedBenchCardId(null);
                        } else {
                          // Bench-first flow: select this bench card
                          setSelectedBenchCardId(card.id);
                        }
                      }}
                    >
                      <Card card={card} />
                      {isSelected && <div className="swap-badge selected-badge">✓ SELECTED</div>}
                      {selectedCardId && !isSelected && <div className="swap-badge swappable-badge">SWAP OUT</div>}
                    </div>
                  );
                })}
              </div>

              {/* STEP 2 — Hand cards (shown when bench card selected) */}
              {selectedBenchCardId && (
                <>
                  <div className="bench-section-label" style={{ marginTop: 20 }}>
                    YOUR HAND — pick a card to swap in
                  </div>
                  <div className="bench-grid">
                    {hand.map(card => (
                      <div
                        key={card.id}
                        className="bench-card-item bench-card-swappable"
                        onClick={() => {
                          handleBenchSwap(showBenchFor, card.id, selectedBenchCardId);
                          closeBenchOverlay();
                        }}
                      >
                        <Card card={card} />
                        <div className="swap-badge swappable-badge">SWAP IN</div>
                      </div>
                    ))}
                    {hand.length === 0 && (
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontStyle: 'italic' }}>Hand is empty</p>
                    )}
                  </div>
                </>
              )}

              <button className="close-bench-btn" onClick={closeBenchOverlay}>CLOSE</button>
            </div>
          </div>
        );
      })()}

      {/* Deck Overlay Modal */}
      {showDeckFor && (
        <div className="bench-expanded-overlay" onClick={() => setShowDeckFor(null)}>
          <div className="bench-cards-container deck-cards-container" onClick={e => e.stopPropagation()}>
            <h3>{showDeckFor.toUpperCase()} DECK ({activeDeckDisplay.length})</h3>
            <div className="bench-grid">
              {activeDeckDisplay.map((card, idx) => (
                <div key={`${card.id}-${idx}`} className="bench-card-item">
                  <Card card={card} />
                </div>
              ))}
            </div>
            <button className="close-bench-btn" onClick={() => setShowDeckFor(null)}>CLOSE</button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .app-main {
          width: 100vw;
          min-height: 100vh;
          background: #02060c;
          overflow-x: hidden;
          overflow-y: auto;
          font-family: 'Inter', sans-serif;
          color: white;
        }

        /* --- Fixed Overlays --- */
        .card-detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: modalFadeIn 0.3s ease-out;
        }
        .bench-expanded-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          z-index: 5000;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .bench-cards-container {
          background: #050d18; 
          padding: 24px;
          border-radius: 20px; 
          border: 1px solid rgba(255,255,255,0.1);
          width: 90vw;
          max-width: 1100px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.9);
        }
        .bench-cards-container h3 {
          margin-bottom: 16px;
          text-align: center;
          color: white;
          letter-spacing: 2px;
        }
        .bench-grid { 
          display: flex; 
          gap: 16px; 
          flex-wrap: wrap; 
          justify-content: center;
          padding-bottom: 8px;
          scrollbar-width: thin;
        }

        /* Bench swap modal overrides */
        .bench-swap-container {
          overflow-y: auto;
        }
        .bench-swap-header {
          text-align: center;
          margin-bottom: 12px;
        }
        .bench-swap-instruction {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.35);
          margin-top: 4px;
        }
        .bench-swap-instruction.active {
          color: #00d1b2;
        }
        .bench-section-label {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 12px;
        }

        /* Individual card wrappers in the bench overlay */
        .bench-card-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          border-radius: 10px;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .bench-card-item:hover {
          transform: translateY(-4px);
        }
        .bench-card-selected {
          outline: 2px solid #00d1b2;
          outline-offset: 3px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,209,178,0.4);
        }
        .bench-card-swappable {
          cursor: pointer;
        }
        .bench-card-swappable:hover {
          box-shadow: 0 0 18px rgba(255,204,0,0.35);
          outline: 2px solid rgba(255,204,0,0.6);
          outline-offset: 3px;
        }

        /* Badge overlaid at the bottom of a card */
        .swap-badge {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
        }
        .selected-badge {
          background: #00d1b2;
          color: #000;
        }
        .swappable-badge {
          background: rgba(255,204,0,0.9);
          color: #000;
        }

        .swap-hint { font-size: 9px; color: #ffcc00; text-align: center; margin-top: 8px; font-weight: 800; }
        .close-bench-btn {
          margin-top: 20px; background: #ff3b30; border: none;
          color: white; padding: 12px 22px; border-radius: 6px; cursor: pointer; font-weight: 800;
          width: fit-content; align-self: center; transition: background 0.2s;
          flex-shrink: 0;
        }
        .close-bench-btn:hover { background: #ff5247; }

        .header-controls {
          position: fixed; top: 16px; left: 16px; z-index: 200;
          display: flex; gap: 8px;
        }
        .back-btn {
          background: #112244; border: none; color: white;
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
          font-weight: 800; border: 1px solid rgba(255,255,255,0.2);
        }
        .back-btn:hover { background: #1a3060; }
        .ai-toggle-btn {
          background: #441111; border: none; color: white;
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
          font-weight: 800; border: 1px solid rgba(255,0,0,0.4);
          transition: background 0.2s, border-color 0.2s;
        }
        .ai-toggle-btn.enabled {
          background: #114422; border-color: rgba(0,255,0,0.4);
        }

        .global-stats {
          position: fixed; top: 16px; right: 16px; z-index: 200;
          display: flex; align-items: center; gap: 10px;
        }
        .stat-pill {
          font-size: 10px; font-weight: 800;
          color: rgba(255,255,255,0.4); letter-spacing: 0.5px;
        }
        .turn-badge {
          padding: 5px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 900; letter-spacing: 1px;
        }
        .turn-badge.home { background: #fff; color: #000; }
        .turn-badge.away { background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.3); }
        .restart-btn {
          background: transparent; border: 1px solid rgba(255,59,48,0.4);
          color: #ff3b30; width: 30px; height: 30px; border-radius: 50%;
          font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }

        /* --- Central HUD Stack --- */
        .tactical-interface {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 70px 0 40px;
        }

        .hud-stack {
          display: flex; flex-direction: column; align-items: center;
          gap: 16px;
          width: 96vw; max-width: 700px;
        }

        /* Zone Tracker */
        .zone-tracker {
          width: 100%;
          padding: 10px 20px 12px;
          border-radius: 16px 16px 0 0;
          border: 1px solid rgba(255,255,255,0.12);
          border-bottom: none;
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          transition: background 0.4s, border-color 0.4s, box-shadow 0.4s;
        }
        .zone-tracker.offensive {
          background: rgba(255,59,48,0.18);
          border-color: rgba(255,59,48,0.35);
          box-shadow: 0 -8px 30px rgba(255,59,48,0.12);
        }
        .zone-tracker.neutral {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
        }
        .zone-tracker.defensive {
          background: rgba(0,122,255,0.18);
          border-color: rgba(0,122,255,0.35);
          box-shadow: 0 -8px 30px rgba(0,122,255,0.12);
        }
        .zone-label {
          font-size: 11px; font-weight: 900; letter-spacing: 3px;
          color: rgba(255,255,255,0.85);
        }
        .zone-bar-bg {
          width: 100%; height: 3px;
          background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;
        }
        .zone-bar-fill {
          height: 100%; border-radius: 2px;
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
          background: white;
        }
        .offensive .zone-bar-fill { background: #ff3b30; }
        .defensive .zone-bar-fill { background: #007aff; }

        /* Hand Dock Wrapper — deck pods sit outside the box */
        .hand-dock-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        /* Hand Dock */
        .hand-dock {
          flex: 1;
          min-width: 0;
          background: rgba(8, 16, 30, 0.96);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 16px 18px 20px;
          display: flex; flex-direction: column; gap: 14px;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.6);
        }

        .hand-row {
          display: flex; align-items: center;
          justify-content: center; gap: 12px;
        }

        /* Deck Pods & Bench */
        .deck-pod {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          flex-shrink: 0;
        }
        .deck-bench-btn {
          font-size: 10px; font-weight: 800; letter-spacing: 1px;
          background: rgba(255,255,255,0.1); color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px; padding: 4px 8px; cursor: pointer;
          margin-bottom: 4px; transition: background 0.2s;
        }
        .deck-bench-btn:hover { background: rgba(255,255,255,0.2); }

        .deck-visual {
          width: 48px; height: 66px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .deck-visual:hover {
          transform: translateY(-2px);
          box-shadow: 2px 4px 5px rgba(0,0,0,0.4);
        }
        .white-deck {
          background: #f0f0f0;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .black-deck {
          background: #111;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .deck-count {
          font-size: 18px; font-weight: 900;
          color: #ff3b30;
          text-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        .deck-tag {
          font-size: 8px; font-weight: 800;
          letter-spacing: 1.5px; color: rgba(255,255,255,0.35);
        }

        /* Action Buttons */
        .action-row {
          display: flex; gap: 8px;
        }
        .act-btn {
          flex: 1;
          padding: 12px 8px;
          border-radius: 10px;
          font-size: 10px; font-weight: 900; letter-spacing: 0.5px;
          cursor: pointer; border: none;
          transition: all 0.2s;
        }
        .faceoff-btn { background: #00d1b2; color: #000; }
        .faceoff-btn:hover { background: #00eeca; }
        .phase-btn  { background: #fff; color: #000; }
        .phase-btn:hover  { background: #ddd; }
        .period-btn { background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.15); }
        .period-btn:hover { background: rgba(255,255,255,0.14); }

        /* Reward Modal */
        .reward-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8); backdrop-filter: blur(15px);
          z-index: 6000; display: flex; align-items: center; justify-content: center;
        }
        .reward-modal {
          background: #050d18; border: 1px solid rgba(255,255,255,0.15);
          border-radius: 24px; width: 90vw; max-width: 600px; padding: 32px;
          display: flex; flex-direction: column; gap: 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,1);
        }
        .reward-header h3 { margin-bottom: 4px; letter-spacing: 2px; color: #ffcc00; }
        .reward-header p { font-size: 11px; opacity: 0.6; font-weight: 700; letter-spacing: 1px; }
        .reward-body { display: flex; gap: 32px; align-items: center; }
        .reward-card-preview { transform: scale(1.1); transform-origin: center; }
        .reward-controls { flex: 1; display: flex; flex-direction: column; gap: 20px; }
        .control-group label { display: block; font-size: 9px; font-weight: 950; letter-spacing: 2px; color: #aaa; margin-bottom: 10px; }
        .reward-options { display: flex; flex-wrap: wrap; gap: 8px; }
        .opt-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 8px 12px; border-radius: 8px; font-size: 10px; font-weight: 800;
          cursor: pointer; transition: all 0.2s;
        }
        .opt-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); }
        .opt-btn.active { 
          background: var(--ability-color, #00d1b2); 
          color: #000; 
          border-color: transparent;
          box-shadow: 0 0 15px var(--ability-color, #00d1b2);
        }
        .no-opts { font-size: 9px; opacity: 0.3; font-style: italic; }
        .reward-footer { display: flex; justify-content: flex-end; pt: 10px; }
        .confirm-reward-btn {
          width: 100%; padding: 16px; border-radius: 12px; background: #fff; color: #000;
          border: none; font-weight: 900; letter-spacing: 1px; cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }
        .confirm-reward-btn:disabled { opacity: 0.2; cursor: not-allowed; transform: none !important; }
        .confirm-reward-btn:hover:not(:disabled) { transform: translateY(-2px); background: #eee; }
      `}</style>
    </div>
  );
}

export default App;
