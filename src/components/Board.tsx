import type { GameState, Area } from '../types';

interface BoardProps {
  state: GameState;
  onAreaClick?: (area: Area, side: 'home' | 'away' | 'neutral') => void;
  onNavigateZone?: (direction: 'up' | 'down') => void;
}

export const AREA_MAP: Record<string, { x: string; y: string }> = {
  // Home Defensive Zone (Bottom)
  'home-1': { x: '30%', y: '74%' },
  'home-2': { x: '70%', y: '74%' },
  'home-3': { x: '12%', y: '82%' },
  'home-0': { x: '35%', y: '82%' },
  'home-12': { x: '65%', y: '82%' },
  'home-4': { x: '88%', y: '82%' },
  'home-5': { x: '12%', y: '93%' },
  'home-7': { x: '50%', y: '94%' },
  'home-8': { x: '50%', y: '90%' },
  'home-6': { x: '88%', y: '93%' },
  
  // Away Defensive Zone (Top)
  'away-1': { x: '70%', y: '26%' },
  'away-2': { x: '30%', y: '26%' },
  'away-3': { x: '88%', y: '18%' },
  'away-0': { x: '65%', y: '18%' },
  'away-12': { x: '35%', y: '18%' },
  'away-4': { x: '12%', y: '18%' },
  'away-5': { x: '88%', y: '7%' },
  'away-7': { x: '50%', y: '6%' },
  'away-8': { x: '50%', y: '10%' },
  'away-6': { x: '12%', y: '7%' },
  
  'neutral-6':  { x: '22%', y: '42%' },    // 10 Left
  'neutral-7':  { x: '78%', y: '42%' },    // 10 Right
  'neutral-10': { x: '50%', y: '42%' },    // Upper 9
  'neutral-9':  { x: '50%', y: '50.00%' }, // Centre (Face-off)
  'neutral-11': { x: '50%', y: '58%' },    // Lower 9
  'neutral-8':  { x: '22%', y: '58%' },    // 11 Left
  'neutral-12': { x: '78%', y: '58%' },    // 11 Right

  'home-bench': { x: '12.5%', y: '5.71%' }, 
  'away-bench': { x: '87.5%', y: '94.29%' }, 
};

export const Board: React.FC<BoardProps> = ({ state, onAreaClick, onNavigateZone }) => {
  const puckY = parseFloat(AREA_MAP[`${state.puck.side}-${state.puck.area}`]?.y || '50');
  const puckKey = `${state.puck.side}-${state.puck.area}`;

  // Determine current zone based on puck position
  const currentZone = puckY < 33.5 ? 'offensive' : puckY > 66.5 ? 'defensive' : 'neutral';

  // Translate the background to "zoom" into the current zone
  let translateY = '0%';
  if (currentZone === 'neutral') translateY = '-33.33%';
  if (currentZone === 'defensive') translateY = '-66.66%';

  // Arrow visibility: can we go further up or down?
  const canGoUp = currentZone !== 'offensive';
  const canGoDown = currentZone !== 'defensive';

  return (
    <div className="tactical-zone-window">
      <div className="dynamic-board-viewport">
        <div className="board-content-wrapper" style={{ transform: `translateY(${translateY})` }}>
          <div className="board-bg-full" />

          {/* Area Nodes — filtered to current zone only */}
          {Object.entries(AREA_MAP).filter(([k]) => !k.includes('bench')).map(([key, pos]) => {
            const isPuckHere = puckKey === key;
            const py = parseFloat(pos.y);
            const nodeZone = py < 33.5 ? 'offensive' : py > 66.5 ? 'defensive' : 'neutral';
            if (nodeZone !== currentZone) return null;

            const [side, areaId] = key.split('-');
            return (
              <div 
                key={key}
                className={`area-node ${side} ${isPuckHere ? 'has-puck' : ''}`}
                style={{ left: pos.x, top: pos.y }}
                onClick={() => onAreaClick?.(parseInt(areaId) as Area, side as any)}
              >
                <div className="node-label">{areaId === '12' ? '0' : areaId}</div>
                {isPuckHere && <div className="puck-visual" />}
              </div>
            );
          })}
        </div>

        {/* Zone Navigation Arrows — only shown when movement is possible */}
        <div className="zone-nav-arrows">
          {canGoUp && (
            <button
              className="zone-nav-btn up"
              onClick={() => onNavigateZone?.('up')}
              title="Move to previous zone"
            >▲</button>
          )}
          {canGoDown && (
            <button
              className="zone-nav-btn down"
              onClick={() => onNavigateZone?.('down')}
              title="Move to next zone"
            >▼</button>
          )}
        </div>
      </div>

      <style>{`
        .tactical-zone-window {
          width: 96vw;
          max-width: 700px;
          height: 55vh;
          max-height: 420px;
          border-radius: 0 0 20px 20px;
          border: 1px solid rgba(255,255,255,0.1);
          border-top: none;
          background: #000;
          overflow: hidden;
          position: relative;
          z-index: 1;
          box-shadow: 0 20px 60px rgba(0,0,0,0.9);
        }
        .dynamic-board-viewport {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        .board-content-wrapper {
          position: absolute;
          width: 100%;
          height: 300%;
          top: 0; left: 0;
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .board-bg-full {
          position: absolute;
          inset: 0;
          background-image: url(/rink_board1.jpg);
          background-size: 100% 100%;
          opacity: 0.92;
        }

        /* Nodes */
        .area-node {
          position: absolute;
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          transform: translate(-50%, -50%);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 10;
          background: rgba(0,0,0,0.2);
        }
        .area-node:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.4);
          transform: translate(-50%, -50%) scale(1.12);
        }
        .node-label { font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.2); }

        .has-puck { border-color: #ffcc00; box-shadow: 0 0 20px rgba(255,204,0,0.5); }
        .puck-visual {
          position: absolute;
          width: 68%; height: 68%;
          background: #111;
          border: 2px solid #ffcc00;
          border-radius: 50%;
          animation: puckPulse 1.5s infinite;
        }
        @keyframes puckPulse {
          0%   { transform: scale(1);   box-shadow: 0 0 0 0   rgba(255,204,0,0.7); }
          70%  { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255,204,0,0); }
          100% { transform: scale(1);   box-shadow: 0 0 0 0   rgba(255,204,0,0); }
        }

        /* Bench nodes */
        .bench-node {
          position: absolute;
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.5);
          transform: translate(-50%, -50%);
          font-size: 9px; font-weight: 800; color: #00d1b2;
          letter-spacing: 1px; cursor: pointer; border-radius: 4px;
          z-index: 20;
        }
        .bench-node:hover { background: rgba(0,209,178,0.15); }

        /* Zone Navigation Arrows */
        .zone-nav-arrows {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 50;
        }
        .zone-nav-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: none;
          font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }
        .zone-nav-btn.active {
          background: rgba(255,255,255,0.15);
          color: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        }
        .zone-nav-btn.active:hover {
          background: rgba(255,255,255,0.28);
          transform: scale(1.08);
        }
        .zone-nav-btn.disabled {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
        }

        /* Bench overlay */
      `}</style>
    </div>
  );
};
