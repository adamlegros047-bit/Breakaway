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
      style={spriteStyle}
    >
      {!isFaceDown && !card.hideSuits && card.suits && card.suits.length > 0 && (
        <>
          <div className={`card-suits top-left multi-${card.suits.length}`} style={{ backgroundColor: card.powerPlayColor || '#EF4444' }}>
            {card.suits.map((suit) => (
              <img 
                key={suit}
                src={`/icons/suit_${suit.toLowerCase()}.png`}  
                alt={`${suit} icon`} 
                className="suit-img"
              />
            ))}
          </div>
          <div className={`card-suits bottom-right multi-${card.suits.length}`} style={{ backgroundColor: card.powerPlayColor || '#EF4444' }}>
            {card.suits.map((suit) => (
              <img 
                key={suit}
                src={`/icons/suit_${suit.toLowerCase()}.png`}  
                alt={`${suit} icon`} 
                className="suit-img"
              />
            ))}
          </div>
        </>
      )}

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
        .card-suits {
          position: absolute;
          width: 33px;
          height: 33px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 1px 3px rgba(0,0,0,0.6);
          overflow: hidden;
          z-index: 2;
        }
        .card-suits.multi-1 {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
        }
        .card-suits.multi-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-content: center;
          gap: 1px;
          padding: 4px;
        }
        .card-suits.multi-3, .card-suits.multi-4 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 1px;
          padding: 4px;
        }
        .card-suits.top-left {
          top: 3px;
          left: -1px;
        }
        .card-suits.bottom-right {
          bottom: 3px;
          right: -1px;
          transform: rotate(180deg);
        }
        .suit-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
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
