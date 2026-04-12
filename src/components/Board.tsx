import type { GameState, Area } from '../types';

interface BoardProps {
  state: GameState;
  onAreaClick?: (area: Area, side: 'home' | 'away' | 'neutral') => void;
  onNavigateZone?: (direction: 'up' | 'down') => void;
  adjacentMoveAreas?: string[]; // e.g. ['away-0', 'neutral-9']
}

export const AREA_MAP: Record<string, { x: string; y: string }> = {
  // Home Defensive Zone (Bottom) — mirrored from offensive zone
  'home-1': { x: '70%', y: '69%' },   // Right blue line inner
  'home-2': { x: '30%', y: '69%' },   // Left blue line inner
  'home-3': { x: '88%', y: '78%' },   // Right point (blue line)
  'home-0': { x: '68%', y: '83%' },   // Right face-off circle (near area 3)
  'home-12': { x: '32%', y: '83%' },  // Left face-off circle (near area 4)
  'home-4': { x: '12%', y: '78%' },   // Left point (blue line)
  'home-5': { x: '82%', y: '97%' },   // Behind net right
  'home-8': { x: '50%', y: '92%' },   // Crease (in front of goal)
  'home-7': { x: '50%', y: '98%' },   // Behind the net (center)
  'home-6': { x: '18%', y: '97%' },   // Behind net left
  
  // Away Defensive Zone (Top) — offensive zone for home
  'away-1': { x: '70%', y: '31%' },   // Right blue line inner
  'away-2': { x: '30%', y: '31%' },   // Left blue line inner
  'away-3': { x: '88%', y: '22%' },   // Right point (blue line)
  'away-0': { x: '68%', y: '17%' },   // Right face-off circle (near area 3)
  'away-12': { x: '32%', y: '17%' },  // Left face-off circle (near area 4)
  'away-4': { x: '12%', y: '22%' },   // Left point (blue line)
  'away-5': { x: '82%', y: '3%' },    // Behind net right
  'away-8': { x: '50%', y: '8%' },    // Crease (in front of goal)
  'away-7': { x: '50%', y: '2%' },    // Behind the net (center)
  'away-6': { x: '18%', y: '3%' },    // Behind net left
  
  'neutral-6':  { x: '22%', y: '42%' },    // 10 Left
  'neutral-7':  { x: '78%', y: '42%' },    // 10 Right
  'neutral-10': { x: '50%', y: '45%' },    // Upper 9
  'neutral-9':  { x: '50%', y: '50.00%' }, // Centre (Face-off)
  'neutral-11': { x: '50%', y: '55%' },    // Lower 9
  'neutral-8':  { x: '22%', y: '58%' },    // 11 Left
  'neutral-12': { x: '78%', y: '58%' },    // 11 Right

  'home-bench': { x: '12.5%', y: '5.71%' }, 
  'away-bench': { x: '87.5%', y: '94.29%' }, 
};

export const Board: React.FC<BoardProps> = ({ state, onAreaClick, onNavigateZone, adjacentMoveAreas = [] }) => {
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
            const isMoveTarget = adjacentMoveAreas.includes(key);
            return (
              <div 
                key={key}
                className={`area-node ${side} ${isPuckHere ? 'has-puck' : ''} ${isMoveTarget ? 'move-target' : ''}`}
                style={{ left: pos.x, top: pos.y }}
                onClick={() => onAreaClick?.(parseInt(areaId) as Area, side as any)}
              >
                <div className="node-label">{areaId === '12' ? '0' : areaId}</div>
                {isPuckHere && (
                  <div className="puck-visual">
                    {state.puck.possession === 'home' && <span className="possession-marker home">H</span>}
                    {state.puck.possession === 'away' && <span className="possession-marker away">V</span>}
                  </div>
                )}
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
          border: none;
          transform: translate(-50%, -50%);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 10;
          background: transparent;
        }
        .area-node:hover {
          background: rgba(255,255,255,0.06);
        }

        /* Move target: glowing destination node */
        .area-node.move-target {
          background: rgba(255, 220, 0, 0.18);
          border: 2px solid rgba(255, 220, 0, 0.85);
          box-shadow: 0 0 14px rgba(255, 220, 0, 0.6);
          animation: moveTargetPulse 1.2s infinite;
        }
        .area-node.move-target:hover {
          background: rgba(255, 220, 0, 0.32);
          border-color: #ffdc00;
        }
        @keyframes moveTargetPulse {
          0%   { box-shadow: 0 0 10px rgba(255, 220, 0, 0.5); }
          50%  { box-shadow: 0 0 22px rgba(255, 220, 0, 0.9); }
          100% { box-shadow: 0 0 10px rgba(255, 220, 0, 0.5); }
        }
        .node-label { display: none; }

        .has-puck { border-color: #ffcc00; box-shadow: 0 0 20px rgba(255,204,0,0.5); }
        .puck-visual {
          position: absolute;
          width: 68%; height: 68%;
          background: #111;
          border: 2px solid #ffcc00;
          border-radius: 50%;
          animation: puckPulse 1.5s infinite;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .possession-marker {
          font-weight: 950;
          font-size: 18px;
          line-height: 1;
          pointer-events: none;
        }
        .possession-marker.home { color: #ffcc00; }
        .possession-marker.away { color: #ffffff; }

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
