import React, { useState } from 'react';
import type { GameState } from '../types';

interface ScoreboardProps {
  state: GameState;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ state }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div 
        className={`jumbotron-container ${expanded ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <div className="board-full">
            <div className="period-bar">
              PERIOD {state.currentPeriod}
            </div>
            
            <div className="teams-row">
              <div className="team-col home-col">
                <div className="team-name">HOME</div>
                <div className="score-digit">{state.home.score}</div>
                <div className="momentum-box">
                  <span className="mom-label">MOMENTUM</span>
                  <span className="mom-val">{state.home.momentumTokens}</span>
                </div>
              </div>
              
              <div className="center-divider" />
              
              <div className="team-col away-col">
                <div className="team-name">AWAY</div>
                <div className="score-digit">{state.away.score}</div>
                <div className="momentum-box">
                  <span className="mom-label">MOMENTUM</span>
                  <span className="mom-val">{state.away.momentumTokens}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="board-mini">
            <div className="mini-col">
              <span className="mini-label">H<br />O<br />M<br />E</span>
              <span className="mini-score">{state.home.score}</span>
            </div>
            <div className="mini-divider" />
            <div className="mini-col">
              <span className="mini-score">{state.away.score}</span>
              <span className="mini-label">A<br />W<br />A<br />Y</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .jumbotron-container {
          position: fixed;
          left: 0;
          top: 30%;
          z-index: 100;
          background: #080808;
          border: 2px solid #222;
          border-left: none;
          box-shadow: 10px 10px 30px rgba(0,0,0,0.8), inset 0 0 15px rgba(255,255,255,0.05);
          color: white;
          font-family: 'Inter', monospace;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
          cursor: pointer;
        }

        .jumbotron-container.collapsed {
          border-radius: 0 12px 12px 0;
          padding: 10px 8px;
          opacity: 0.8;
          transform: translateX(0);
        }
        
        .jumbotron-container.collapsed:hover {
          opacity: 1;
        }

        .jumbotron-container.expanded {
          border-radius: 0 16px 16px 0;
          padding: 16px;
          border-color: #333;
          box-shadow: 15px 15px 50px rgba(0,0,0,0.9), inset 0 0 20px rgba(255,255,255,0.1);
        }

        /* --- Mini Layout --- */
        .board-mini {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .mini-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .mini-label {
          font-size: 8px;
          font-weight: 900;
          color: #666;
          text-align: center;
          line-height: 1;
          letter-spacing: 1px;
        }
        .mini-score {
          font-size: 20px;
          font-weight: 900;
          color: #ff3b30;
          text-shadow: 0 0 8px rgba(255,59,48,0.6);
        }
        .mini-col:last-child .mini-score {
          color: #00d1b2;
          text-shadow: 0 0 8px rgba(0,209,178,0.6);
        }
        .mini-divider {
          width: 24px;
          height: 2px;
          background: #333;
        }

        /* --- Full Layout --- */
        .board-full {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 220px;
        }

        .period-bar {
          text-align: center;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 4px;
          color: #ffc107;
          background: #1a1a1a;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid #333;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
          text-shadow: 0 0 5px rgba(255,193,7,0.5);
        }

        .teams-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .center-divider {
          width: 2px;
          height: 60px;
          background: #333;
        }

        .team-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .team-name {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 8px;
          color: #ddd;
        }

        .score-digit {
          background: #050505;
          padding: 4px 16px;
          border-radius: 8px;
          border: 1px solid #222;
          font-size: 48px;
          font-weight: 900;
          line-height: 1;
          color: #ff3b30;
          text-shadow: 0 0 15px rgba(255,59,48,0.7);
          box-shadow: inset 0 5px 15px rgba(0,0,0,1);
          font-family: 'Courier New', Courier, monospace; /* Digital look fallback */
        }
        .away-col .score-digit {
          color: #00d1b2;
          text-shadow: 0 0 15px rgba(0,209,178,0.7);
        }

        .momentum-box {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1a1a1a;
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid #333;
        }
        .mom-label {
          font-size: 9px;
          font-weight: 700;
          color: #777;
          letter-spacing: 1px;
        }
        .mom-val {
          font-size: 14px;
          font-weight: 900;
          color: #eee;
        }
      `}</style>
    </>
  );
};
