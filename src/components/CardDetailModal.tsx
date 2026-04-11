import React from 'react';
import type { Card as CardType } from '../types';
import { Card } from './Card';

interface CardDetailModalProps {
  card: CardType;
  onPlay: () => void;
  onClose: () => void;
  isPlayDisabled?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onPlay, onClose, isPlayDisabled }) => {
  return (
    <div className="card-detail-overlay">
      <div className="card-detail-window">
        {/* Exit Button */}
        <button className="detail-exit-btn" onClick={onClose} aria-label="Close">×</button>
        
        <div className="detail-layout">
          {/* Card Preview Section */}
          <div className="detail-preview-pane">
            <div className="detail-card-wrapper">
              <Card card={card} />
            </div>
            <div className="detail-number-badge">
              <span className="num-val">{card.number !== undefined ? card.number : '?'}</span>
              <span className="num-label">POWER</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="detail-info-pane">
            <h2 className="detail-title">{card.name.toUpperCase()}</h2>
            
            <div className="detail-scroll-area">
              {/* Actions */}
              {card.actions.length > 0 && (
                <div className="detail-section">
                  <h4 className="section-title">ACTIONS</h4>
                  <div className="tag-cloud">
                    {card.actions.map(a => <span key={a} className="act-tag">{a}</span>)}
                  </div>
                </div>
              )}

              {/* Abilities */}
              {card.abilities.length > 0 && (
                <div className="detail-section">
                  <h4 className="section-title">ABILITIES</h4>
                  <div className="tag-cloud">
                    {card.abilities.map(a => (
                      <span key={a} className="ab-tag" style={{'--ab-color': a.toLowerCase()} as any}>{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specials */}
              {card.specials.length > 0 && (
                <div className="detail-section">
                  <h4 className="section-title">SPECIALS</h4>
                  <ul className="detail-list">
                    {card.specials.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Drawbacks */}
              {card.drawbacks && card.drawbacks.length > 0 && (
                <div className="detail-section drawbacks">
                  <h4 className="section-title">DRAWBACKS</h4>
                  <ul className="detail-list drawback-list">
                    {card.drawbacks.map((d, i) => <li key={i}>⚠ {d}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="detail-footer">
              <button 
                className={`play-card-btn ${isPlayDisabled ? 'disabled' : ''}`} 
                onClick={!isPlayDisabled ? onPlay : undefined}
                disabled={isPlayDisabled}
              >
                {isPlayDisabled ? 'PLAY LOCKED' : 'PLAY CARD'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .card-detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: modalFadeIn 0.3s ease-out;
        }
        .card-detail-window {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          width: 90vw;
          max-width: 600px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 30px 60px rgba(0,0,0,0.8);
          position: relative;
          overflow: hidden;
        }
        .detail-exit-btn {
          position: absolute;
          top: 15px; right: 20px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 32px;
          cursor: pointer;
          z-index: 10;
          transition: color 0.2s;
        }
        .detail-exit-btn:hover { color: #fff; }

        .detail-layout { display: flex; height: 100%; }
        
        .detail-preview-pane {
          flex: 0 0 240px;
          background: rgba(255,255,255,0.03);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .detail-card-wrapper {
          transform: scale(1.3);
          transform-origin: center;
        }
        .detail-number-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255,255,255,0.05);
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .num-val { font-size: 32px; font-weight: 900; color: #ffcc00; line-height: 1; }
        .num-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); margin-top: 4px; letter-spacing: 1px; }

        .detail-info-pane {
          flex: 1;
          padding: 30px;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .detail-title { margin: 0 0 20px 0; font-size: 24px; color: #fff; letter-spacing: 1px; }

        .detail-scroll-area {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 10px;
        }
        .detail-section { margin-bottom: 25px; }
        .section-title { 
          font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.3); 
          margin: 0 0 10px 0; letter-spacing: 1.5px;
        }
        
        .tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
        .act-tag { 
          background: rgba(255,255,255,0.1); color: #fff; 
          padding: 4px 10px; border-radius: 6px; font-size: 12px; 
          font-weight: 600; 
        }
        .ab-tag { 
          background: rgba(255,255,255,0.1); color: #fff; 
          padding: 4px 10px; border-radius: 6px; font-size: 12px; 
          font-weight: 600;
          border-left: 3px solid var(--ab-color);
        }

        .detail-list { margin: 0; padding: 0; list-style: none; font-size: 14px; color: rgba(255,255,255,0.8); }
        .detail-list li { margin-bottom: 8px; line-height: 1.4; }
        
        .drawback-list { color: #ff6666; font-style: italic; }

        .detail-footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
        .play-card-btn {
          width: 100%;
          background: #ffcc00;
          color: #000;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .play-card-btn:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255,204,0,0.3); }

        .play-card-btn.disabled {
          background: #333;
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 600px) {
          .detail-layout { flex-direction: column; }
          .detail-preview-pane { flex-direction: row; flex: 0 0 auto; justify-content: center; gap: 40px; }
          .detail-card-wrapper { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};
