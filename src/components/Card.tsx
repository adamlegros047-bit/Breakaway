import React from 'react';
import type { Card as CardType, AbilityColor } from '../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  isFaceDown?: boolean;
}

const ABILITY_COLORS: Record<AbilityColor, string> = {
  Black: '#212121',
  Blue: '#2196f3',
  Bronze: '#cd7f32',
  Brown: '#795548',
  Gold: '#ffc107',
  Green: '#4caf50',
  Orange: '#ff9800',
  Purple: '#9c27b0',
  Red: '#f44336',
  Silver: '#9e9e9e',
  Yellow: '#ffeb3b',
  Pink: '#e91e63',
};

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
      {!isFaceDown && !card.sprite && (
        <div className="card-fallback">
          <div className="card-header">
            <span className="card-number">{card.isGoalie ? 'G' : card.number}</span>
          </div>
          <div className="card-body">
            <div className="card-name">{card.name}</div>
          </div>
          <div className="card-footer">
            <div className="card-abilities">
              {card.abilities.map((ability, i) => (
                <div 
                  key={i} 
                  className="ability-dot" 
                  style={{ backgroundColor: ABILITY_COLORS[ability] }}
                />
              ))}
            </div>
            <span className="card-points">{card.points}</span>
          </div>
        </div>
      )}
      
      {/* Name Label below the card image */}
      {!isFaceDown && (
        <div className="card-name-label">{card.name}</div>
      )}

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
        .card-name-label {
          position: absolute;
          bottom: -22px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          pointer-events: none;
        }
        .card-fallback {
            padding: 10px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .card-header { display: flex; justify-content: space-between; }
        .card-number { font-size: 24px; font-weight: 800; color: #333; }
        .card-body { flex: 1; display: flex; align-items: center; justify-content: center; }
        .card-name { font-weight: 700; text-align: center; color: #555; text-transform: uppercase; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; }
        .ability-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }
        .card-points { font-size: 12px; font-weight: 800; color: #999; }
      `}</style>
    </div>
  );
};
