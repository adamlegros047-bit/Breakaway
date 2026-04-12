import React from 'react';
import type { ActionType, AbilityColor } from '../types';

export type ResolutionItem =
  | { type: 'action'; value: ActionType }
  | { type: 'ability'; value: AbilityColor }
  | { type: 'special'; value: string };

interface ResolutionPanelProps {
  cardName: string;
  queue: ResolutionItem[];
  onActivate: (item: ResolutionItem) => void;
  onDone: () => void;
}

const typeLabel: Record<ResolutionItem['type'], string> = {
  action: 'ACTION',
  ability: 'ABILITY',
  special: 'SPECIAL',
};

const typeColor: Record<ResolutionItem['type'], string> = {
  action: '#4fc3f7',
  ability: '#ffcc00',
  special: '#c084fc',
};

export const ResolutionPanel: React.FC<ResolutionPanelProps> = ({ cardName, queue, onActivate, onDone }) => {
  return (
    <div className="resolution-panel">
      <div className="res-header">
        <span className="res-card-name">{cardName.toUpperCase()}</span>
        <span className="res-subtitle">Choose what to activate next</span>
      </div>

      <div className="res-queue">
        {queue.map((item, i) => (
          <button
            key={`${item.type}-${item.value}-${i}`}
            className="res-item-btn"
            style={{ '--tcolor': typeColor[item.type] } as any}
            onClick={() => onActivate(item)}
          >
            <span className="res-type-badge">{typeLabel[item.type]}</span>
            <span className="res-value">{item.value}</span>
            <span className="res-activate-arrow">▶</span>
          </button>
        ))}
      </div>

      <button className="res-done-btn" onClick={onDone}>
        ✓ Done — skip remaining ({queue.length})
      </button>

      <style>{`
        .resolution-panel {
          position: fixed;
          bottom: 100px;
          right: 16px;
          width: 240px;
          background: linear-gradient(145deg, #1c1c2e, #12121e);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
          z-index: 5000;
          overflow: hidden;
          animation: resSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes resSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .res-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .res-card-name {
          font-size: 13px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.5px;
        }
        .res-subtitle {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          font-style: italic;
        }

        .res-queue {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 260px;
          overflow-y: auto;
        }

        .res-item-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-left: 3px solid var(--tcolor);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          color: #fff;
        }
        .res-item-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--tcolor);
          transform: translateX(2px);
        }

        .res-type-badge {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: var(--tcolor);
          opacity: 0.8;
          flex-shrink: 0;
        }
        .res-value {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .res-activate-arrow {
          font-size: 10px;
          color: var(--tcolor);
          opacity: 0.6;
          flex-shrink: 0;
        }

        .res-done-btn {
          width: 100%;
          padding: 11px;
          background: rgba(255,255,255,0.04);
          border: none;
          border-top: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: 0.3px;
        }
        .res-done-btn:hover {
          background: rgba(255,80,80,0.1);
          color: #ff8080;
        }
      `}</style>
    </div>
  );
};
