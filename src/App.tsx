import { useState } from 'react';
import { Board } from './components/Board';
import { PlayerHand } from './components/PlayerHand';
import { StartScreen } from './components/StartScreen';
import { FaceoffModal } from './components/FaceoffModal';
import { useGame } from './hooks/useGame';

function App() {
  const { 
    state, startGame, playCard, endTurn, movePuckTo, switchWithBench, 
    startFaceoff, nextPeriod, spendMomentum, cancelChallenge 
  } = useGame();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    startGame();
    setHasStarted(true);
  };

  const handleRestart = () => {
    if (window.confirm("Restart the game? All progress will be lost.")) {
      startGame();
    }
  };

  const handleAreaClick = (area: any, side: any) => {
    if (state.activeChallenge) return; // Use modal for challenges

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

  return (
    <div className="app-main">
      {!hasStarted && <StartScreen onStart={handleStart} />}
      {state.activeChallenge && (
        <FaceoffModal state={state} onPlayCard={playCard} onClose={cancelChallenge} />
      )}
      
      <div className="scroll-container">
        <Board 
          state={state}
          onAreaClick={handleAreaClick}
          onBenchSwap={handleBenchSwap}
          selectedHandCardId={selectedCardId}
        />
        
        <div className="floating-controls">
          <div className="swap-info">
            SWAPS: {state.home.preFaceoffSwaps} (H) | {state.away.preFaceoffSwaps} (A) <br/>
            BONUS: +{state.home.momentumBonus} (H) | +{state.away.momentumBonus} (A)
          </div>
          {state.phase === 1 && (
            <button className="control-btn faceoff-trigger-btn" onClick={startFaceoff}>
               START FACEOFF
            </button>
          )}
          {!state.activeChallenge && (
            <button className="control-btn period-btn" onClick={() => nextPeriod()}>
               NEXT PERIOD
            </button>
          )}
          <div className="momentum-actions">
            <button className="mom-btn" onClick={() => spendMomentum('home')}>SPEND MOM (H)</button>
            <button className="mom-btn" onClick={() => spendMomentum('away')}>SPEND MOM (A)</button>
          </div>
          <button className="control-btn restart-btn" onClick={handleRestart}>
             RESTART
          </button>
          <button className="control-btn next-phase-btn" onClick={endTurn}>
             NEXT PHASE
          </button>
        </div>

        <div className="hand-dock">
          <PlayerHand 
            player={state[state.turn]} 
            onCardClick={(id) => setSelectedCardId(selectedCardId === id ? null : id)} 
            selectedCardId={selectedCardId}
            isTurn={true}
          />
        </div>
      </div>

      <style>{`
        .app-main {
          width: 100vw;
          min-height: 100vh;
          background: #05192d;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .scroll-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          padding-bottom: 280px;
        }
        .floating-controls {
          position: fixed;
          top: 30px;
          right: 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          z-index: 2000;
        }
        .swap-info {
          background: rgba(0,0,0,0.5);
          color: #aaa;
          font-size: 10px;
          font-weight: 700;
          text-align: center;
          padding: 4px;
          border-radius: 4px;
        }
        .faceoff-trigger-btn {
          background: #00d1b2 !important;
          color: white !important;
          box-shadow: 0 10px 30px rgba(0, 209, 178, 0.4) !important;
        }
        .control-btn {
          border: none;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 900;
          font-size: 14px;
          cursor: pointer;
          letter-spacing: 2px;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .next-phase-btn {
          background: #ff3b30;
          color: white;
          box-shadow: 0 10px 30px rgba(255, 59, 48, 0.4);
        }
        .restart-btn {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
        }
        .period-btn {
          background: #5856d6 !important;
          color: white !important;
        }
        .momentum-actions {
          display: flex;
          gap: 5px;
        }
        .mom-btn {
          flex: 1;
          background: #ffcc00;
          border: none;
          padding: 8px;
          border-radius: 4px;
          font-weight: 800;
          font-size: 9px;
          cursor: pointer;
          color: #000;
        }
        .control-btn:hover {
          transform: translateY(-3px) scale(1.05);
          filter: brightness(1.2);
        }
        .hand-dock {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(20px);
          padding: 20px;
          display: flex;
          justify-content: center;
          z-index: 1000;
          border-top: 1px solid rgba(255,255,255,0.1);
          height: 240px;
        }
      `}</style>
    </div>
  );
}

export default App;
