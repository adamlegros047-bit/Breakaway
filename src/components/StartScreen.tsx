import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="start-screen-overlay">
      <div className="start-content">
        <h1 className="game-title">BREAKAWAY</h1>
        <p className="game-subtitle">PRO HOCKEY STRATEGY GAME</p>
        
        <div className="features">
          <div className="feature">🏒 Realistic Rink Board</div>
          <div className="feature">📋 Rules-Accurate Challenges</div>
          <div className="feature">🔄 Dynamic Line Changes</div>
        </div>

        <button className="start-btn" onClick={onStart}>
          START GAME
        </button>
      </div>

      <style>{`
        .start-screen-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #05192d 0%, #000 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          color: white;
          font-family: 'Inter', sans-serif;
        }
        .start-content {
          text-align: center;
          animation: fadeIn 1s ease-out;
        }
        .game-title {
          font-size: 80px;
          font-weight: 900;
          letter-spacing: 15px;
          margin-bottom: 0;
          background: linear-gradient(180deg, #fff 0%, #ccc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(255,255,255,0.3));
        }
        .game-subtitle {
          font-size: 18px;
          color: #ff3b30;
          letter-spacing: 5px;
          font-weight: 700;
          margin-bottom: 50px;
        }
        .features {
          display: flex;
          gap: 30px;
          justify-content: center;
          margin-bottom: 60px;
        }
        .feature {
          background: rgba(255,255,255,0.05);
          padding: 10px 20px;
          border-radius: 50px;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .start-btn {
          background: #ff3b30;
          color: white;
          border: none;
          padding: 20px 60px;
          font-size: 24px;
          font-weight: 900;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s;
          letter-spacing: 4px;
          box-shadow: 0 15px 40px rgba(255, 59, 48, 0.4);
        }
        .start-btn:hover {
          transform: translateY(-5px) scale(1.05);
          background: #ff453a;
          box-shadow: 0 20px 50px rgba(255, 59, 48, 0.6);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
