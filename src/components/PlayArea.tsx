import React from 'react';
import type { GameState } from '../types';
import { Card } from './Card';

interface PlayAreaProps {
  state: GameState;
}

export const PlayArea: React.FC<PlayAreaProps> = ({ state }) => {
  return (
    <>
      <div className="play-area-container">
        <div className="play-area-header">PLAY AREA</div>
        <div className="play-area-content">
          {state.activeCards.length === 0 ? (
            <div className="empty-play-state">No Active Cards</div>
          ) : (
            <div className="active-cards-list">
              {state.activeCards.map((card, idx) => (
                <div key={`${card.id}-${idx}`} className="play-card-wrapper">
                  <Card card={card} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .play-area-container {
          position: fixed;
          right: 0;
          top: 30%;
          z-index: 100;
          background: rgba(8, 16, 30, 0.95);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-right: none;
          border-radius: 12px 0 0 12px;
          box-shadow: -10px 10px 30px rgba(0,0,0,0.8), inset 0 0 15px rgba(255,255,255,0.05);
          color: white;
          font-family: 'Inter', sans-serif;
          width: 140px;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .play-area-header {
          background: rgba(255, 255, 255, 0.1);
          text-align: center;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #aaa;
        }

        .play-area-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          gap: 10px;
        }

        .empty-play-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.2);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          text-align: center;
          height: 100%;
          min-height: 120px;
        }

        .active-cards-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          align-items: center;
        }

        .play-card-wrapper {
          transform: scale(0.65);
          transform-origin: top center;
          width: 92px;  /* card native width * scale roughly */
          height: 155px;
          margin-bottom: -40px; /* tighten the stack */
          transition: transform 0.2s;
        }
        
        .play-card-wrapper:last-child {
          margin-bottom: 0; 
        }

        .play-card-wrapper:hover {
          transform: scale(0.75) translateX(-5px);
          z-index: 10;
        }
      `}</style>
    </>
  );
};
