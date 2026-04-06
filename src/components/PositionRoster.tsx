import React, { useState } from 'react';

interface PositionRosterProps {
  side: 'home' | 'away';
}

export const PositionRoster: React.FC<PositionRosterProps> = ({ side }) => {
  const [expanded, setExpanded] = useState(false);
  const slots = ['1', '2', '3', '4', '5', '6', '7', '8', 'G'];

  const sideLabel = side === 'home' ? 'WHITE POS' : 'BLACK POS';

  return (
    <>
      <div 
        className={`roster-tab-container ${side}-tab ${expanded ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <div className="roster-grid">
            {slots.map(slot => (
              <div key={slot} className="roster-slot">
                <span className="slot-label">{slot}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="roster-tab-label">
            {sideLabel.split('').map((char, i) => (
              <span key={i} className="tab-char">{char}</span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .roster-tab-container {
          position: fixed;
          bottom: 5%;
          z-index: 100;
          background: #080808;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.8), inset 0 0 15px rgba(255,255,255,0.05);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s, opacity 0.3s;
          cursor: pointer;
          color: white;
        }

        .home-tab {
          left: 0;
          border-left: none;
          transform-origin: left bottom;
        }

        .away-tab {
          right: 0;
          border-right: none;
          transform-origin: right bottom;
        }

        /* Collapsed State */
        .roster-tab-container.collapsed {
          padding: 10px 6px;
          opacity: 0.8;
        }
        
        .home-tab.collapsed {
          border-radius: 0 8px 8px 0;
        }
        
        .away-tab.collapsed {
          border-radius: 8px 0 0 8px;
        }

        .roster-tab-container.collapsed:hover {
          opacity: 1;
        }

        .roster-tab-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .tab-char {
          font-size: 8px;
          font-weight: 900;
          color: #888;
          line-height: 1;
        }

        /* Expanded State */
        .roster-tab-container.expanded {
          padding: 12px;
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 15px 15px 50px rgba(0,0,0,0.9);
        }

        .home-tab.expanded {
          border-radius: 0 12px 12px 0;
        }

        .away-tab.expanded {
          border-radius: 12px 0 0 12px;
        }

        /* Grid */
        .roster-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .roster-slot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #111;
          border: 1px solid #444;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);
          transition: border-color 0.2s, color 0.2s;
        }
        
        .roster-slot:hover {
          border-color: #00d1b2;
          color: #00d1b2;
        }

        .slot-label {
          font-size: 11px;
          font-weight: 900;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </>
  );
};
