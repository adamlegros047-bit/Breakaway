import React from 'react';
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  isFaceDown?: boolean;
}



export const Card: React.FC<CardProps> = ({ card, onClick, disabled, isFaceDown }) => {
  const isWhite = card.id.includes('-white-');
  const isBlack = card.id.includes('-black-');
  
  const spriteStyle = !isFaceDown ? (
    card.image ? {
      backgroundImage: `url(${card.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : card.sprite ? {
      backgroundImage: `url(/cards/sheet${card.sprite.sheet}.png)`,
      backgroundPosition: `${card.sprite.x * 11.111}% ${(card.sprite.y * 14.286) + (card.name === 'Skating' ? 2 : 0)}%`,
      backgroundSize: '1000% 800%',
    } : {}
  ) : (
    isFaceDown ? {
      backgroundImage: isWhite ? `url(/cards/whiteback.png)` : isBlack ? `url(/cards/blackback.png)` : 'none',
      backgroundColor: (isWhite || isBlack) ? 'transparent' : '#1a1a1a',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : {}
  );

  return (
    <div 
      className={`card ${disabled ? 'disabled' : ''} ${isFaceDown ? 'face-down' : ''}`}
      onClick={!disabled ? onClick : undefined}
      draggable={!disabled && !isFaceDown}
      onDragStart={(e) => {
        e.dataTransfer.setData('cardId', card.id);
        e.dataTransfer.effectAllowed = 'move';
        // Add a class for visual feedback if needed
        (e.target as HTMLElement).classList.add('dragging');
      }}
      onDragEnd={(e) => {
        (e.target as HTMLElement).classList.remove('dragging');
      }}
      style={spriteStyle}
    >
      {/* Text overlays removed per user request */}


      <style>{`
        .card {
          width: 140px;
          height: 200px;
          background-color: white;
          background-repeat: no-repeat;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          user-select: none;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          position: relative;
          border: 1px solid rgba(0,0,0,0.1);
          overflow: visible;
          margin-bottom: 25px; /* Space for the label */
        }
        .card:hover { 
          transform: translateY(-8px) scale(1.02); 
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
          z-index: 1000;
        }
        .card.disabled { 
          opacity: 0.8; 
          cursor: not-allowed; 
          transform: none; 
        }
      `}</style>
    </div>
  );
};
