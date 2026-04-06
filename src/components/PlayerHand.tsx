
import React from 'react';
import type { PlayerState } from '../types';
import { Card } from './Card';

interface PlayerHandProps {
  player: PlayerState;
  onCardClick: (cardId: string) => void;
  selectedCardId?: string | null;
  isTurn: boolean;
  hideCards?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ player, onCardClick, selectedCardId, isTurn, hideCards }) => {
  return (
    <div className={`player-hand-minimal ${isTurn ? 'active-turn' : ''}`}>
      <div className="cards-scroll">
        {player.hand.map(card => (
          <div 
            key={card.id} 
            className={`hand-card-wrapper ${selectedCardId === card.id ? 'selected' : ''}`}
            draggable={isTurn}
            onDragStart={(e) => {
              e.dataTransfer.setData('cardId', card.id);
              e.dataTransfer.setData('player', player.isHome ? 'home' : 'away');
            }}
          >
            <Card 
              card={card} 
              onClick={() => onCardClick(card.id)} 
              disabled={!isTurn}
              isFaceDown={hideCards}
            />
          </div>
        ))}
      </div>

      <style>{`
        .player-hand-minimal {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .active-turn {
          /* Subtle glowing indicator for turn */
          filter: drop-shadow(0 0 10px rgba(0, 122, 255, 0.3));
        }
        .cards-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 10px;
          scrollbar-width: none;
        }
        .cards-scroll::-webkit-scrollbar { display: none; }
        
        .hand-card-wrapper {
          transform: scale(0.65);
          transform-origin: center top;
          width: 95px; /* Adjust width contribution when scaled */
          transition: transform 0.2s;
        }
        .hand-card-wrapper:hover {
          transform: scale(0.85) translateY(-20px);
          z-index: 100;
        }
        .card-wrapper {
          position: relative;
          transition: transform 0.2s;
        }
        .card-wrapper.selected {
          transform: translateY(-20px) scale(1.05);
          filter: drop-shadow(0 0 15px #00d1b2);
        }
        .card-wrapper.selected::after {
          content: 'SELECTED';
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #00d1b2;
          color: white;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};
