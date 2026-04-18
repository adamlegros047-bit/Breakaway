import React from 'react';

export type ActionPanelItem = { type: 'action' | 'special'; value: string };

interface CardActionPanelProps {
  cardName: string;
  queue: ActionPanelItem[];
  onActivate: (item: ActionPanelItem) => void;
  onSkip: () => void;
}

// Colour coding per action type for quick visual parsing
const ACTION_COLORS: Record<string, string> = {
  'Move':          '#4fc3f7',
  'Stretch Pass':  '#4fc3f7',
  'Shoot':         '#ff6b6b',
  'On-Net':        '#ff6b6b',
  'Score':         '#ff6b6b',
  'Body-Check':    '#ff9f43',
  'Poke-check':    '#ff9f43',
  'Deflect':       '#a29bfe',
  'Tip':           '#a29bfe',
  'Draw':          '#00d1b2',
};

export const CardActionPanel: React.FC<CardActionPanelProps> = ({
  cardName,
  queue,
  onActivate,
  onSkip,
}) => {
  if (queue.length === 0) return null;

  return (
    <>
      <div className="cap-panel">
        <div className="cap-header">
          <div className="cap-card-name">{cardName.toUpperCase()}</div>
          <div className="cap-subhead">SELECT AN ACTION</div>
        </div>

        <div className="cap-list">
          {queue.map((item, i) => {
            const color = ACTION_COLORS[item.value] ?? (item.type === 'special' ? '#ffcc00' : 'rgba(255,255,255,0.7)');
            return (
              <button
                key={`${item.type}-${item.value}-${i}`}
                className="cap-item-btn"
                style={{ '--item-color': color } as React.CSSProperties}
                onClick={() => onActivate(item)}
              >
                <span className="cap-item-type">{item.type === 'special' ? 'SPL' : 'ACT'}</span>
                <span className="cap-item-value">{item.value}</span>
                <span className="cap-item-arrow">›</span>
              </button>
            );
          })}
        </div>

        <button className="cap-skip-btn" onClick={onSkip}>
          SKIP ALL
        </button>
      </div>

      <style>{`
        .cap-panel {
          position: fixed;
          right: 160px;
          top: 25%;
          z-index: 99;
          background: rgba(8, 16, 30, 0.96);
          backdrop-filter: blur(40px);
          border: 2px solid rgba(255, 255, 255, 0.12);
          border-right: none;
          border-radius: 20px 0 0 20px;
          box-shadow: -15px 15px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.03);
          color: white;
          font-family: 'Inter', sans-serif;
          width: 180px;
          display: flex;
          flex-direction: column;
          animation: capSlideIn 0.25s cubic-bezier(0.19, 1, 0.22, 1);
          overflow: hidden;
        }

        @keyframes capSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .cap-header {
          padding: 12px 14px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
        }
        .cap-card-name {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cap-subhead {
          font-size: 7.5px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.3);
          margin-top: 3px;
        }

        .cap-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 10px 6px;
        }

        .cap-item-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 8px 10px;
          cursor: pointer;
          color: #fff;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s, border-color 0.15s, transform 0.12s;
          text-align: left;
        }
        .cap-item-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: var(--item-color, rgba(255,255,255,0.4));
          transform: translateX(-3px);
        }

        .cap-item-type {
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1px;
          color: var(--item-color, rgba(255,255,255,0.5));
          background: rgba(255,255,255,0.06);
          padding: 2px 5px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .cap-item-value {
          font-size: 11px;
          font-weight: 700;
          color: var(--item-color, #fff);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cap-item-arrow {
          font-size: 16px;
          color: var(--item-color, rgba(255,255,255,0.3));
          opacity: 0.6;
          flex-shrink: 0;
        }

        .cap-skip-btn {
          margin: 8px 10px 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: rgba(255,255,255,0.3);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
          padding: 7px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .cap-skip-btn:hover {
          color: #ff6b6b;
          border-color: rgba(255,107,107,0.4);
        }
      `}</style>
    </>
  );
};
