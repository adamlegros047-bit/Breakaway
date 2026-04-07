import React from 'react';
import type { GameState } from '../types';
import { Card } from './Card';

interface PlayAreaProps {
  state: GameState;
  onCardDrop?: (cardId: string) => void;
}

export const PlayArea: React.FC<PlayAreaProps> = ({ state, onCardDrop }) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId && onCardDrop) {
      onCardDrop(cardId);
    }
  };

  // Determine which cards to show
  const activeCards = isExpanded 
    ? state.activeCards.slice(-4) 
    : state.activeCards.slice(-1);

  return (
    <>
      <div 
        className={`play-area-container ${isDragOver ? 'drag-over' : ''} ${isExpanded ? 'expanded' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDoubleClick={() => setIsExpanded(!isExpanded)}
        title={state.activeCards.length > 1 ? "Double-click to toggle history" : ""}
      >
        <div className="play-area-header">
          {isExpanded ? 'CARD HISTORY' : 'PLAY AREA'}
        </div>
        <div className="play-area-content">
          {state.activeCards.length === 0 ? (
            <div className="empty-play-state">No Active Cards</div>
          ) : (
            <>
              <div className="active-cards-list">
                {activeCards.map((card, idx) => (
                  <div key={`${card.id}-${idx}`} className="play-card-wrapper">
                    <Card card={card} />
                  </div>
                ))}
              </div>
              {state.activeCards.length > 1 && !isExpanded && (
                <div className="history-hint">Double click for history (+{state.activeCards.length - 1})</div>
              )}
              {isExpanded && state.activeCards.length > 4 && (
                <div className="history-limit">+ {state.activeCards.length - 4} more previous</div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .play-area-container {
          position: fixed;
          right: 0;
          top: 25%;
          z-index: 100;
          background: rgba(8, 16, 30, 0.95);
          backdrop-filter: blur(40px);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-right: none;
          border-radius: 20px 0 0 20px;
          box-shadow: -15px 15px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05);
          color: white;
          font-family: 'Inter', sans-serif;
          width: 150px;
          min-height: 220px;
          max-height: 80vh;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          display: flex;
          flex-direction: column;
        }
        .play-area-container.expanded {
          width: 170px;
          background: rgba(10, 20, 35, 0.98);
          box-shadow: -20px 20px 60px rgba(0,0,0,0.9);
        }
        .play-area-container.drag-over {
          border-color: #00d1b2;
          box-shadow: -10px 10px 30px rgba(0,209,178,0.3), inset 0 0 25px rgba(0,209,178,0.1);
          background: rgba(0,209,178,0.05);
        }

        .play-area-header {
          background: rgba(255, 255, 255, 0.05);
          text-align: center;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 2.5px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #8899aa;
          text-transform: uppercase;
        }

        .play-area-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px;
          gap: 12px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .play-area-content::-webkit-scrollbar { display: none; }

        .empty-play-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.15);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-align: center;
          height: 100%;
          min-height: 150px;
        }

        .active-cards-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          align-items: center;
        }

        .expanded .active-cards-list {
          gap: -20px; /* Slight stack overlap even in history? No, let's keep it clear. */
        }

        .play-card-wrapper {
          transform: scale(0.68);
          transform-origin: center top;
          width: 95px;
          height: 140px;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .expanded .play-card-wrapper {
          height: 100px; /* Vertical stack overlap */
          transform: scale(0.62);
        }
        .expanded .play-card-wrapper:last-child {
          height: 140px;
        }

        .play-card-wrapper:hover {
          transform: scale(0.75) translateX(-8px);
          z-index: 50;
        }

        .history-hint {
          font-size: 8px;
          font-weight: 800;
          color: #00d1b2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
          opacity: 0.7;
          animation: pulse 2s infinite ease-in-out;
          margin-top: 8px;
        }

        .history-limit {
          font-size: 8px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          margin-top: 10px;
          padding-bottom: 10px;
        }

        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.9; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
};
