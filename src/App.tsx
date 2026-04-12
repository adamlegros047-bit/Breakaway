import { useState, useEffect, useRef } from 'react';
import { Board, AREA_MAP } from './components/Board';
import { Scoreboard } from './components/Scoreboard';
import { PlayArea } from './components/PlayArea';
import { PositionRoster } from './components/PositionRoster';
import { PlayerHand } from './components/PlayerHand';
import { useAI } from './hooks/useAI';
import { Card } from './components/Card';
import { StartScreen } from './components/StartScreen';
import { FaceoffModal } from './components/FaceoffModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CardDetailModal } from './components/CardDetailModal';
import { ResolutionPanel } from './components/ResolutionPanel';
import type { ResolutionItem } from './components/ResolutionPanel';
import { useGame } from './hooks/useGame';
import { getAdjacentAreas, getAreasWithinHops } from './logic/adjacency';
import { COLOR_ACTIONS } from './logic/colorActions';
import type { Card as CardType } from './types';

function App() {
  const { 
    state, startGame, playCard, endTurn, movePuckTo, switchWithBench, 
    startFaceoff, nextPeriod, cancelChallenge,
    selectPerk, confirmPerk, beginShotPhase, revertScoreAndDeflect
  } = useGame();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [viewingCard, setViewingCard] = useState<CardType | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [showBenchFor, setShowBenchFor] = useState<'home' | 'away' | null>(null);
  const [showDeckFor, setShowDeckFor] = useState<'home' | 'away' | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [pendingMove, setPendingMove] = useState<{ options: string[], distance: number, reason: 'Move' | 'Stretch Pass' | 'Poke-check' | 'Deflect' } | null>(null);
  const [pendingFaceoffPullback, setPendingFaceoffPullback] = useState<{ winner: 'home' | 'away'; options: string[] } | null>(null);
  const [faceoffJustWon, setFaceoffJustWon] = useState<'home' | 'away' | null>(null);
  const [resolutionQueue, setResolutionQueue] = useState<ResolutionItem[]>([]);
  const [resolvingCardName, setResolvingCardName] = useState<string>('');

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

  // After perk is confirmed, offer the pullback move
  useEffect(() => {
    const prev = prevPerkRef.current;
    prevPerkRef.current = state.pendingPerk;
    if (prev !== null && state.pendingPerk === null && faceoffJustWon) {
      const adjacent = getAdjacentAreas(state.puck.area, state.puck.side);
      const currentY = parseFloat(AREA_MAP[`${state.puck.side}-${state.puck.area}`]?.y || '50');
      // Home winner pulls toward own (bottom) net = higher y; Away toward top net = lower y
      const pullbackOptions = adjacent.filter(key => {
        const areaY = parseFloat(AREA_MAP[key]?.y || '50');
        return faceoffJustWon === 'home' ? areaY > currentY : areaY < currentY;
      });
      if (pullbackOptions.length > 0) {
        setPendingFaceoffPullback({ winner: faceoffJustWon, options: pullbackOptions });
      }
      setFaceoffJustWon(null);
    }
  }, [state.pendingPerk, faceoffJustWon]);

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

  const handleStart = () => { startGame(); setHasStarted(true); };

  const handleRestart = () => {
    setConfirmConfig({
      message: "Restart the game? All progress will be lost.",
      onConfirm: () => { startGame(); setConfirmConfig(null); }
    });
  };

  const handleBackToStart = () => {
    setConfirmConfig({
      message: "Return to main menu? Current game progress will be reset.",
      onConfirm: () => { setHasStarted(false); setConfirmConfig(null); }
    });
  };

  // Apply a single resolution item immediately
  const applyResolutionItem = (item: ResolutionItem) => {
    if (item.type === 'action') {
      if (item.value === 'Move') {
        const adjacent = getAdjacentAreas(state.puck.area, state.puck.side);
        setPendingMove({ options: adjacent, distance: 1, reason: 'Move' });
      } else if (item.value === 'Stretch Pass') {
        // Up to 2 areas away via BFS
        const reachable = getAreasWithinHops(state.puck.area, state.puck.side, 2);
        setPendingMove({ options: reachable, distance: 2, reason: 'Stretch Pass' });
      } else if (item.value === 'Shoot' || item.value === 'On-Net') {
        // Both Shoot and On-Net enter the shot phase
        beginShotPhase(state.turn);
      } else if (item.value === 'Body-Check') {
        // Non-puck-holder takes possession — move puck to same area to update possession state
        if (state.puck.possession !== state.turn) {
          movePuckTo(state.puck.area, state.puck.side);
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
        const options = pullbackNodes.length > 0 ? pullbackNodes : adjacent;
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
            const reachable = getAreasWithinHops(lastPlay.originArea, lastPlay.originSide as any, lastPlay.distance);
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
    }
    // Save, abilities, specials: handled via pendingPerk / existing challenge flow
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
      {!hasStarted && <StartScreen onStart={handleStart} />}

      {state.activeChallenge && (
        <FaceoffModal state={state} onPlayCard={playCard} onClose={cancelChallenge} />
      )}

      {state.pendingPerk && (
        <div className="reward-overlay">
          <div className="reward-modal">
            <div className="reward-header">
              <h3>CARD RESOLUTION</h3>
              <p>{state.pendingPerk.winner.toUpperCase()} Team, resolve your card perks.</p>
            </div>
            <div className="reward-body">
              <div className="reward-card-preview">
                <Card card={state.pendingPerk.card} />
              </div>
              <div className="reward-controls">
                <div className="control-group">
                  <label>PICK 1 ACTION</label>
                  <div className="reward-options">
                    {state.pendingPerk.card.actions.map(act => (
                      <button 
                        key={act}
                        className={`opt-btn ${state.pendingPerk?.selectedAction === act ? 'active' : ''}`}
                        onClick={() => selectPerk(act, undefined)}
                      >{act}</button>
                    ))}
                    {state.pendingPerk.card.actions.length === 0 && <span className="no-opts">No actions available</span>}
                  </div>
                </div>
                <div className="control-group">
                  <label>PICK 1 ABILITY</label>
                  <div className="reward-options">
                    {state.pendingPerk.card.abilities.map(ab => (
                      <button 
                        key={ab}
                        className={`opt-btn ${state.pendingPerk?.selectedAbility === ab ? 'active' : ''}`}
                        onClick={() => selectPerk(undefined, ab)}
                        style={{'--ability-color': ab.toLowerCase()} as any}
                      >{ab}</button>
                    ))}
                    {state.pendingPerk.card.abilities.length === 0 && <span className="no-opts">No abilities available</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="reward-footer">
              <button 
                className="confirm-reward-btn" 
                disabled={
                  (state.pendingPerk.card.actions.length > 0 && !state.pendingPerk.selectedAction) ||
                  (state.pendingPerk.card.abilities.length > 0 && !state.pendingPerk.selectedAbility)
                }
                onClick={confirmPerk}
              >CONFIRM RESOLUTION</button>
            </div>
          </div>
        </div>
      )}

      {viewingCard && (
        <CardDetailModal 
          card={viewingCard}
          onClose={() => setViewingCard(null)}
          isPlayDisabled={
            !hasStarted || 
            !!state.pendingPerk || 
            (!!state.activeChallenge && (
              (state.turn === 'home' && !!state.activeChallenge.homeCard) ||
              (state.turn === 'away' && !!state.activeChallenge.awayCard)
            ))
          }
          pendingShot={!!state.pendingShot && state.pendingShot.shooter === state.turn}
          onPlay={(selection) => {
            const card = viewingCard;
            playCard(state.turn, card.id);
            const cardName = card.name;
            setViewingCard(null);

            // Player-selected actions & specials
            const selectedItems: ResolutionItem[] = [
              ...selection.actions.map(v => ({ type: 'action' as const, value: v })),
              ...selection.specials.map(v => ({ type: 'special' as const, value: v })),
            ];

            // Auto-granted actions from colour abilities (always queued, no selection needed)
            const colorItems: ResolutionItem[] = card.abilities.flatMap(ability => {
              const actions = COLOR_ACTIONS[ability] ?? [];
              return actions.map(v => ({ type: 'action' as const, value: v }));
            });

            const items: ResolutionItem[] = [...selectedItems, ...colorItems];

            if (items.length === 1) {
              applyResolutionItem(items[0]);
            } else if (items.length > 1) {
              setResolutionQueue(items);
              setResolvingCardName(cardName);
            }
            // 0 items: card plays with no effects
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

      {resolutionQueue.length > 0 && (
        <ResolutionPanel
          cardName={resolvingCardName}
          queue={resolutionQueue}
          onActivate={(item) => {
            // Find and remove the FIRST matching item in the queue
            setResolutionQueue(prev => {
              const idx = prev.findIndex(q => q.type === item.type && q.value === item.value);
              if (idx === -1) return prev;
              return prev.filter((_, i) => i !== idx);
            });
            applyResolutionItem(item);
          }}
          onDone={() => {
            setResolutionQueue([]);
            setResolvingCardName('');
          }}
        />
      )}

      {hasStarted && (
        <div className="tactical-interface">
          <Scoreboard state={state} />
          <PlayArea 
            state={state} 
            onCardDrop={(id) => playCard(state.turn, id)}
          />
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
                  {state.phase === 1 && (
                    <button className="act-btn faceoff-btn" onClick={startFaceoff}>START FACEOFF</button>
                  )}
                  <button className="act-btn phase-btn" onClick={endTurn}>NEXT PHASE</button>
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

      {/* Bench Overlay Modal */}
      {showBenchFor && (
        <div className="bench-expanded-overlay" onClick={() => setShowBenchFor(null)}>
          <div className="bench-cards-container" onClick={e => e.stopPropagation()}>
            <h3>{showBenchFor.toUpperCase()} BENCH</h3>
            <div className="bench-grid">
              {activeBench.map(card => (
                <div key={card.id} className="bench-card-item">
                  <Card 
                    card={card} 
                    onClick={() => {
                      if (selectedCardId) {
                        handleBenchSwap(showBenchFor, selectedCardId, card.id);
                        setShowBenchFor(null);
                      }
                    }} 
                  />
                  {selectedCardId && <div className="swap-hint">CLICK TO SWAP</div>}
                </div>
              ))}
            </div>
            <button className="close-bench-btn" onClick={() => setShowBenchFor(null)}>CLOSE</button>
          </div>
        </div>
      )}

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
          overflow-y: auto;
          flex: 1;
          padding-bottom: 16px;
          scrollbar-width: thin;
        }
        .swap-hint { font-size: 9px; color: #ffcc00; text-align: center; margin-top: 8px; font-weight: 800; }
        .close-bench-btn {
          margin-top: 16px; background: #ff3b30; border: none;
          color: white; padding: 12px 22px; border-radius: 6px; cursor: pointer; font-weight: 800;
          width: fit-content; align-self: center; transition: background 0.2s;
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
