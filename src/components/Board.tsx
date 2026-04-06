import React, { useState } from 'react';
import type { GameState, Area } from '../types';
import { Card } from './Card';

interface BoardProps {
  state: GameState;
  onAreaClick?: (area: Area, side: 'home' | 'away' | 'neutral') => void;
  onPlayCard?: (cardId: string) => void;
  onBenchSwap?: (player: 'home' | 'away', handCardId: string, benchCardId: string) => void;
  selectedHandCardId?: string | null;
}

const AREA_MAP: Record<string, { x: number; y: number }> = {
  // ... existing AREA_MAP ...
  'home-0': { x: 180, y: 400 },
  'home-1': { x: 310, y: 540 },
  'home-2': { x: 310, y: 260 },
  'home-3': { x: 430, y: 540 },
  'home-4': { x: 430, y: 260 },
  'home-5': { x: 530, y: 400 },
  
  'away-0': { x: 920, y: 400 },
  'away-1': { x: 790, y: 260 },
  'away-2': { x: 790, y: 540 },
  'away-3': { x: 670, y: 260 },
  'away-4': { x: 670, y: 540 },
  'away-5': { x: 570, y: 400 },

  'neutral-6': { x: 1100 - 380, y: 400 },
  'neutral-7': { x: 380, y: 400 },
  'neutral-8': { x: 550, y: 48 }, 
  'neutral-9': { x: 550, y: 400 },
  'neutral-10': { x: 550, y: 1100 - 450 }, 
  'neutral-11': { x: 383, y: 400 },

  // BENCH AREAS (Estimated from 90deg rotation)
  // Home Bench was at (212, 808) vertical -> newX = 1100-808=292, newY = 212
  'home-bench': { x: 236, y: 168 }, // Near the scoreboard home
  'away-bench': { x: 864, y: 168 }, // Near the scoreboard away
  'home-deck': { x: 60, y: 400 },
  'away-deck': { x: 1040, y: 400 },
};

export const Board: React.FC<BoardProps> = ({ state, onAreaClick, onBenchSwap, selectedHandCardId }) => {
  const { puck, home, away } = state;
  const puckKey = `${puck.side}-${puck.area}`;
  const [showBenchFor, setShowBenchFor] = useState<'home' | 'away' | null>(null);

  const activeBench = showBenchFor ? state[showBenchFor].bench : [];

  return (
    <div className="dashboard-wrapper">
      <div className="game-dashboard landscape">
        <div className="board-bg" />

        {/* ... Scoreboard indicators ... */}
        <div className="scoreboard visitor-score" style={{ left: '842px', top: '48px' }}>
          {away.score}
        </div>
        <div className="scoreboard home-score" style={{ left: '292px', top: '48px' }}>
          {home.score}
        </div>
        <div className="period-overlay" style={{ left: '584px', top: '168px' }}>
          {state.currentPeriod}
        </div>

        <div className="turn-indicator">
          {state.turn === 'home' ? 'HOME' : 'AWAY'} TEAM'S TURN
        </div>

        {/* Bench Toggles */}
        <div 
          className="bench-node home" 
          style={{ left: AREA_MAP['home-bench'].x, top: AREA_MAP['home-bench'].y }}
          onClick={() => setShowBenchFor(showBenchFor === 'home' ? null : 'home')}
        >
          VIEW BENCH
        </div>
        <div 
          className="bench-node away" 
          style={{ left: AREA_MAP['away-bench'].x, top: AREA_MAP['away-bench'].y }}
          onClick={() => setShowBenchFor(showBenchFor === 'away' ? null : 'away')}
        >
          VIEW BENCH
        </div>

        {/* Bench Overlay */}
        {showBenchFor && (
          <div className="bench-overlay-mask" onClick={() => setShowBenchFor(null)}>
            <div className="bench-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>
                {showBenchFor.toUpperCase()} BENCH 
                {selectedHandCardId && <span style={{ color: '#00d1b2', marginLeft: '10px' }}>(SELECT CARD TO SWAP)</span>}
              </h3>
              <div className="bench-cards-row">
                {activeBench.map(card => (
                  <div 
                    key={card.id} 
                    className={`bench-card-item ${selectedHandCardId ? 'can-swap' : ''}`}
                    onClick={() => {
                      if (selectedHandCardId && showBenchFor) {
                        onBenchSwap?.(showBenchFor, selectedHandCardId, card.id);
                        setShowBenchFor(null);
                      }
                    }}
                  >
                    <Card card={card} disabled={!selectedHandCardId || showBenchFor !== state.turn} />
                  </div>
                ))}
              </div>
              <button 
                className="close-bench-btn"
                onClick={() => setShowBenchFor(null)}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
        
        {/* Decks */}
        <div 
          className="deck-node home" 
          style={{ left: AREA_MAP['home-deck'].x, top: AREA_MAP['home-deck'].y }}
        >
          {home.deck.length > 0 && (
            <div className="deck-card-visual">
              <Card card={home.deck[0]} isFaceDown={true} disabled={true} />
              <div className="deck-count">{home.deck.length}</div>
            </div>
          )}
        </div>
        <div 
          className="deck-node away" 
          style={{ left: AREA_MAP['away-deck'].x, top: AREA_MAP['away-deck'].y }}
        >
          {away.deck.length > 0 && (
            <div className="deck-card-visual">
              <Card card={away.deck[0]} isFaceDown={true} disabled={true} />
              <div className="deck-count">{away.deck.length}</div>
            </div>
          )}
        </div>

        {/* ... Areas & Puck ... */}
        {Object.entries(AREA_MAP).filter(([k]) => !k.includes('bench') && !k.includes('deck')).map(([key, pos]) => {
          const [side, area] = key.split('-');
          return (
            <div 
              key={key}
              className={`area-node-interactive ${puckKey === key ? 'has-puck' : ''}`}
              style={{ left: pos.x, top: pos.y }}
              onClick={() => onAreaClick?.(parseInt(area) as Area, side as any)}
            >
              {puckKey === key && <div className="puck-visual" />}
            </div>
          );
        })}

        <div className="play-area-container">
          {state.activeCards.map((card, idx) => (
            <div key={`${card.id}-${idx}`} className="active-card-slot" style={{ transform: `scale(0.65) translateX(${idx * 120}px)` }}>
              <Card card={card} disabled />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* ... existing styles ... */
        .deck-node {
          position: absolute;
          width: 80px;
          height: 110px;
          transform: translate(-50%, -50%) scale(0.6);
          z-index: 10;
        }
        .deck-card-visual {
          position: relative;
        }
        .deck-count {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .bench-node {
          position: absolute;
          width: 80px;
          height: 30px;
          background: rgba(0,209,178,0.8);
          color: white;
          font-size: 10px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          z-index: 15;
          transform: translate(-50%, -50%);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .bench-node:hover {
          background: #00d1b2;
          transform: translate(-50%, -50%) scale(1.1);
        }
        .bench-overlay-mask {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        .bench-content {
          background: #1a1a1a;
          padding: 40px;
          border-radius: 20px;
          border: 1px solid #333;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          text-align: center;
          max-width: 90%;
        }
        .bench-cards-row {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 30px;
        }
        .bench-card-item {
          transition: all 0.2s;
        }
        .bench-card-item.can-swap:hover {
          transform: translateY(-10px);
          filter: brightness(1.2);
          cursor: pointer;
        }
        .close-bench-btn {
          background: #ff3b30;
          color: white;
          border: none;
          padding: 10px 40px;
          border-radius: 30px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-bench-btn:hover {
          background: #ff1a1a;
          transform: scale(1.05);
        }

        .dashboard-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          min-height: 100vh;
          width: 100%;
          background: #05192d;
        }
        /* ... OTHER STYLES ... */
        .game-dashboard {
          position: relative;
          width: 1100px;
          height: 800px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          border-radius: 40px;
          overflow: hidden;
          background: #000;
        }
        .board-bg {
          position: absolute;
          width: 800px;
          height: 1100px;
          left: 150px;
          top: -150px;
          background-image: url(/rink_board.jpg);
          background-size: cover;
          transform: rotate(90deg);
          transform-origin: center center;
          opacity: 0.95;
        }
        .scoreboard {
          position: absolute;
          font-family: 'Digital-7', monospace;
          font-size: 40px;
          color: #ff3b30;
          font-weight: 900;
          text-shadow: 0 0 15px rgba(255, 59, 48, 0.8);
          width: 50px;
          text-align: center;
          z-index: 10;
        }
        .period-overlay {
          position: absolute;
          font-size: 32px;
          font-weight: 900;
          color: #212121;
          background: rgba(255,255,255,0.8);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          z-index: 10;
        }
        .turn-indicator {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 59, 48, 0.9);
          color: white;
          padding: 8px 24px;
          border-radius: 30px;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 2px;
          box-shadow: 0 4px 15px rgba(255, 59, 48, 0.4);
          z-index: 100;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .area-node-interactive {
          position: absolute;
          width: 40px;
          height: 40px;
          margin-left: -20px;
          margin-top: -20px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 20;
          transition: all 0.2s;
        }
        .area-node-interactive:hover {
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 15px rgba(255,255,255,0.2);
        }
        .puck-visual {
          width: 24px;
          height: 24px;
          background: #222;
          border: 3px solid #ff3b30;
          border-radius: 50%;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 15px rgba(255, 59, 48, 0.5);
        }
        .play-area-container {
          position: absolute;
          left: 450px;
          top: 280px;
          width: 200px;
          height: 150px;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .active-card-slot {
          position: absolute;
          transform-origin: center center;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};
