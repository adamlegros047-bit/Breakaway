
import React, { useState } from 'react';
import type { GameState } from '../types';
import { Card } from './Card';

interface FaceoffModalProps {
  state: GameState;
  onPlayCard: (player: 'home' | 'away', cardId: string) => void;
  onClose: () => void;
}

export const FaceoffModal: React.FC<FaceoffModalProps> = ({ state, onPlayCard, onClose }) => {
  const challenge = state.activeChallenge;
  if (!challenge) return null;

  const [dragOver, setDragOver] = useState<'home' | 'away' | null>(null);

  const handleDrop = (e: React.DragEvent, targetPlayer: 'home' | 'away') => {
    e.preventDefault();
    setDragOver(null);
    const cardId = e.dataTransfer.getData('cardId');
    const player = e.dataTransfer.getData('player') as 'home' | 'away';

    if (player === targetPlayer) {
      onPlayCard(player, cardId);
    }
  };

  const handleDragOver = (e: React.DragEvent, targetPlayer: 'home' | 'away') => {
    e.preventDefault();
    setDragOver(targetPlayer);
  };

  return (
    <div className="faceoff-modal-overlay">
      <div className="faceoff-arena">
        <button className="close-x-btn" onClick={onClose}>&times;</button>
        <div className="arena-header">
          <h2>{challenge.type === 'Shot' ? '🥅 SHOT CHALLENGE' : '🏒 FACE-OFF'}</h2>
          <p>Drag your card into the arena!</p>
        </div>

        <div className="drop-zones-container">
          {/* HOME ZONE */}
          <div 
            className={`drop-zone home-zone ${dragOver === 'home' ? 'drag-over' : ''} ${challenge.homeCard ? 'occupied' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'home')}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, 'home')}
          >
            <div className="zone-label">HOME</div>
            {challenge.homeCard ? (
              <div className="dropped-card">
                <Card card={challenge.homeCard} disabled />
              </div>
            ) : (
              <div className="zone-placeholder">DROP HERE</div>
            )}
          </div>

          <div className="v-divider">VS</div>

          {/* AWAY ZONE */}
          <div 
            className={`drop-zone away-zone ${dragOver === 'away' ? 'drag-over' : ''} ${challenge.awayCard ? 'occupied' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'away')}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, 'away')}
          >
            <div className="zone-label">AWAY</div>
            {challenge.awayCard ? (
              <div className="dropped-card">
                <Card card={challenge.awayCard} disabled />
              </div>
            ) : (
              <div className="zone-placeholder">DROP HERE</div>
            )}
          </div>
        </div>

        {challenge.homeCard && challenge.awayCard && (
           <div className="calculating-overlay">
             <div className="spinner"></div>
             <h3>RESOLVING...</h3>
           </div>
        )}
      </div>

      <style>{`
        .faceoff-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 240px; /* Leave space for hand-dock */
          background: rgba(5, 25, 45, 0.7);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          animation: fadeIn 0.3s ease-out;
        }

        .faceoff-arena {
          width: 700px;
          height: 480px;
          background: linear-gradient(135deg, rgba(30, 60, 90, 0.95) 0%, rgba(5, 20, 35, 0.98) 100%);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 30px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }

        .close-x-btn {
          position: absolute;
          top: 20px;
          right: 25px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 32px;
          cursor: pointer;
          transition: all 0.2s;
          line-height: 1;
        }

        .close-x-btn:hover {
          color: #ff3b30;
          transform: scale(1.2);
        }

        .arena-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .arena-header h2 {
          font-size: 28px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin: 0;
          text-shadow: 0 0 20px rgba(255,255,255,0.3);
        }

        .arena-header p {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          font-weight: 700;
          margin-top: 10px;
        }

        .drop-zones-container {
          display: flex;
          align-items: center;
          gap: 60px;
          flex: 1;
        }

        .drop-zone {
          width: 220px;
          height: 320px;
          border: 3px dashed rgba(255,255,255,0.2);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(0,0,0,0.2);
        }

        .home-zone.drag-over { border-color: #007aff; background: rgba(0, 122, 255, 0.1); }
        .away-zone.drag-over { border-color: #ff3b30; background: rgba(255, 59, 48, 0.1); }

        .home-zone.occupied { border-style: solid; border-color: #007aff; box-shadow: 0 0 30px rgba(0, 122, 255, 0.2); }
        .away-zone.occupied { border-style: solid; border-color: #ff3b30; box-shadow: 0 0 30px rgba(255, 59, 48, 0.2); }

        .zone-label {
          position: absolute;
          top: -40px;
          font-weight: 900;
          font-size: 18px;
          color: rgba(255,255,255,0.8);
        }

        .zone-placeholder {
          font-weight: 900;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 1px;
        }

        .v-divider {
          font-size: 48px;
          font-weight: 900;
          color: rgba(255,255,255,0.1);
          font-style: italic;
        }

        .dropped-card {
          transform: scale(0.9);
        }

        .calculating-overlay {
          position: absolute;
          inset: 0;
          background: rgba(5, 25, 45, 0.8);
          border-radius: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.1);
          border-top-color: #00d1b2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      `}</style>
    </div>
  );
};
