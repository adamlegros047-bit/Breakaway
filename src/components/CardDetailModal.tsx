import React, { useState } from 'react';
import type { Card as CardType, ActionType, AbilityColor } from '../types';
import { Card } from './Card';

interface CardPlaySelection {
  actions: ActionType[];
  abilities: AbilityColor[];
  specials: string[];
}

interface CardDetailModalProps {
  card: CardType;
  onPlay: (selection: CardPlaySelection) => void;
  onClose: () => void;
  isPlayDisabled?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onPlay, onClose, isPlayDisabled }) => {
  const [selectedActions, setSelectedActions] = useState<Set<ActionType>>(new Set(card.actions));
  const [selectedAbilities, setSelectedAbilities] = useState<Set<AbilityColor>>(new Set(card.abilities));
  const [selectedSpecials, setSelectedSpecials] = useState<Set<string>>(new Set(card.specials));

  const toggle = <T extends string>(set: Set<T>, item: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    next.has(item) ? next.delete(item) : next.add(item);
    setter(next);
  };

  const handlePlay = () => {
    onPlay({
      actions: Array.from(selectedActions),
      abilities: Array.from(selectedAbilities),
      specials: Array.from(selectedSpecials),
    });
  };

  const anySelected = selectedActions.size > 0 || selectedAbilities.size > 0 || selectedSpecials.size > 0;

  return (
    <div className="card-detail-overlay">
      <div className="card-detail-window">
        <button className="detail-exit-btn" onClick={onClose} aria-label="Close">×</button>
        
        <div className="detail-layout">
          {/* Card Preview */}
          <div className="detail-preview-pane">
            <div className="detail-card-wrapper">
              <Card card={card} />
            </div>
            <div className="detail-number-badge">
              <span className="num-val">{card.number !== undefined ? card.number : '?'}</span>
              <span className="num-label">POWER</span>
            </div>
          </div>

          {/* Details + Selection */}
          <div className="detail-info-pane">
            <h2 className="detail-title">{card.name.toUpperCase()}</h2>
            <p className="selection-hint">Select which to use — or play with none.</p>

            <div className="detail-scroll-area">
              {/* Actions */}
              {card.actions.length > 0 && (
                <div className="detail-section">
                  <h4 className="section-title">ACTIONS</h4>
                  <div className="tag-cloud">
                    {card.actions.map(a => (
                      <button
                        key={a}
                        className={`act-tag selectable ${selectedActions.has(a) ? 'selected' : ''}`}
                        onClick={() => toggle(selectedActions, a, setSelectedActions)}
                      >{a}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Abilities */}
              {card.abilities.length > 0 && (
                <div className="detail-section">
                  <h4 className="section-title">ABILITIES</h4>
                  <div className="tag-cloud">
                    {card.abilities.map(a => (
                      <button
                        key={a}
                        className={`ab-tag selectable ${selectedAbilities.has(a) ? 'selected' : ''}`}
                        style={{'--ab-color': a.toLowerCase()} as any}
                        onClick={() => toggle(selectedAbilities, a, setSelectedAbilities)}
                      >{a}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specials */}
              {card.specials.length > 0 && (
                <div className="detail-section">
                  <h4 className="section-title">SPECIALS</h4>
                  <div className="tag-cloud">
                    {card.specials.map((s, i) => (
                      <button
                        key={i}
                        className={`spec-tag selectable ${selectedSpecials.has(s) ? 'selected' : ''}`}
                        onClick={() => toggle(selectedSpecials, s, setSelectedSpecials)}
                      >{s}</button>
                    ))}
                  </div>
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

            <div className="detail-footer">
              <div className="selection-summary">
                {anySelected
                  ? `Playing: ${[...selectedActions, ...selectedAbilities, ...selectedSpecials].join(', ')}`
                  : 'Playing card with no abilities selected'}
              </div>
              <button
                className={`play-card-btn ${isPlayDisabled ? 'disabled' : ''}`}
                onClick={!isPlayDisabled ? handlePlay : undefined}
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
          flex: 0 0 220px;
          background: rgba(255,255,255,0.03);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .detail-card-wrapper {
          transform: scale(1.25);
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
        .detail-title { margin: 0 0 4px 0; font-size: 22px; color: #fff; letter-spacing: 1px; }
        .selection-hint { margin: 0 0 18px 0; font-size: 11px; color: rgba(255,255,255,0.35); font-style: italic; letter-spacing: 0.5px; }

        .detail-scroll-area {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 16px;
          padding-right: 6px;
        }
        .detail-section { margin-bottom: 22px; }
        .section-title { 
          font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.3); 
          margin: 0 0 10px 0; letter-spacing: 1.5px;
        }
        
        .tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }

        /* Selectable tags — shared base */
        .selectable {
          cursor: pointer;
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.15s ease;
          opacity: 0.45;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
        }
        .selectable.selected {
          opacity: 1;
          border-color: rgba(255,255,255,0.5);
          color: #fff;
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 8px rgba(255,255,255,0.15);
        }
        .selectable:hover { opacity: 0.85; }

        .act-tag.selected  { border-color: #4fc3f7; background: rgba(79,195,247,0.15); color: #4fc3f7; }
        .ab-tag.selected   { border-color: var(--ab-color); background: rgba(255,255,255,0.08); }
        .spec-tag.selected { border-color: #ffcc00; background: rgba(255,204,0,0.12); color: #ffcc00; }

        .detail-list { margin: 0; padding: 0; list-style: none; font-size: 13px; color: rgba(255,255,255,0.8); }
        .detail-list li { margin-bottom: 8px; line-height: 1.4; }
        .drawback-list { color: #ff6666; font-style: italic; }

        .detail-footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; display: flex; flex-direction: column; gap: 10px; }
        .selection-summary {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          font-style: italic;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .play-card-btn {
          width: 100%;
          background: #ffcc00;
          color: #000;
          border: none;
          padding: 13px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
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
          .detail-preview-pane { flex-direction: row; flex: 0 0 auto; justify-content: center; gap: 40px; padding: 20px; }
          .detail-card-wrapper { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};
