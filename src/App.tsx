import { useState } from 'react';
import { Board, AREA_MAP } from './components/Board';
import { PlayerHand } from './components/PlayerHand';
import { StartScreen } from './components/StartScreen';
import { FaceoffModal } from './components/FaceoffModal';
import { ConfirmModal } from './components/ConfirmModal';
import { useGame } from './hooks/useGame';

function App() {
  const { 
    state, startGame, playCard, endTurn, movePuckTo, switchWithBench, 
    startFaceoff, nextPeriod, cancelChallenge 
  } = useGame();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ message: string; onConfirm: () => void } | null>(null);

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

  const handleAreaClick = (area: any, side: any) => {
    if (state.activeChallenge) return;
    if (selectedCardId) {
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
      else if (currentZone === 'neutral') movePuckTo(0 as any, 'home');
    } else {
      // Move from offensive → neutral (entry node 9) or neutral → defensive (entry node 0)
      if (currentZone === 'offensive') movePuckTo(9 as any, 'neutral');
      else if (currentZone === 'neutral') movePuckTo(0 as any, 'away');
    }
  };

  return (
    <div className="app-main">
      {!hasStarted && <StartScreen onStart={handleStart} />}

      {state.activeChallenge && (
        <FaceoffModal state={state} onPlayCard={playCard} onClose={cancelChallenge} />
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
          {/* Fixed overlays */}
          <button className="back-btn" onClick={handleBackToStart}>← BACK</button>
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
                {currentZone === 'offensive' ? 'OFFENSIVE ZONE'
                  : currentZone === 'defensive' ? 'DEFENSIVE ZONE'
                  : 'NEUTRAL ZONE'}
              </span>
              <div className="zone-bar-bg">
                <div className="zone-bar-fill" style={{ width: `${puckY}%` }} />
              </div>
            </div>

            {/* Dynamic Board Window */}
            <Board
              state={state}
              onAreaClick={handleAreaClick}
              onBenchSwap={handleBenchSwap}
              onNavigateZone={handleNavigateZone}
              selectedHandCardId={selectedCardId}
            />

            {/* Hand Dock */}
            <div className="hand-dock">
              <div className="hand-row">
                {/* Home Deck */}
                <div className="deck-pod home-deck">
                  <div className="deck-visual white-deck">
                    <span className="deck-count">{state.home.deck.length}</span>
                  </div>
                  <span className="deck-tag">WHITE</span>
                </div>

                {/* Cards */}
                <PlayerHand
                  player={state[state.turn]}
                  onCardClick={(id) => setSelectedCardId(selectedCardId === id ? null : id)}
                  selectedCardId={selectedCardId}
                  isTurn={true}
                />

                {/* Away Deck */}
                <div className="deck-pod away-deck">
                  <div className="deck-visual black-deck">
                    <span className="deck-count">{state.away.deck.length}</span>
                  </div>
                  <span className="deck-tag">BLACK</span>
                </div>
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

          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .app-main {
          width: 100vw; height: 100vh;
          background: #02060c;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          color: white;
        }

        /* --- Fixed Overlays --- */
        .back-btn {
          position: fixed; top: 16px; left: 16px; z-index: 200;
          background: #112244; border: none; color: white;
          padding: 8px 14px; border-radius: 8px;
          font-size: 11px; font-weight: 800; cursor: pointer;
          transition: background 0.2s;
        }
        .back-btn:hover { background: #1a3060; }

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
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }

        .hud-stack {
          display: flex; flex-direction: column; align-items: center;
          gap: 0;
          width: 92vw; max-width: 520px;
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

        /* Hand Dock */
        .hand-dock {
          width: 100%;
          background: rgba(12, 22, 38, 0.92);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.1);
          border-top: none;
          border-radius: 0 0 20px 20px;
          padding: 16px 18px 20px;
          display: flex; flex-direction: column; gap: 14px;
        }

        .hand-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
        }

        /* Deck Pods */
        .deck-pod {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          flex-shrink: 0;
        }
        .deck-visual {
          width: 48px; height: 66px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
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
      `}</style>
    </div>
  );
}

export default App;
