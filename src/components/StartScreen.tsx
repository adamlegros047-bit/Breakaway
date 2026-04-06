import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const menuOptions = [
    { label: "Play Now", action: onStart, primary: true },
    { label: "Multiplayer", action: () => alert("Multiplayer coming soon!") },
    { label: "Options", action: () => alert("Options coming soon!") },
    { label: "Market", action: () => alert("Market coming soon!") },
    { label: "Credits", action: () => alert("Credits coming soon!") },
    { label: "Exit Game", action: () => window.close() },
  ];

  return (
    <div className="start-screen-overlay">
      <div className="start-content">
        <h1 className="game-title">BREAKAWAY</h1>
        <p className="game-subtitle">PRO HOCKEY STRATEGY GAME</p>
        
        <div className="menu-container">
          {menuOptions.map((option, idx) => (
            <button 
              key={idx}
              className={`menu-btn ${option.primary ? 'primary-btn' : ''} ${option.label === 'Exit Game' ? 'exit-btn' : ''}`}
              onClick={option.action}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="version-tag">VER 1.0.4</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');

        .start-screen-overlay {
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(255, 59, 48, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(88, 86, 214, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #050d18 0%, #000 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          color: white;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .start-content {
          text-align: center;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          max-width: 800px;
        }

        .game-title {
          font-size: clamp(45px, 15vw, 110px);
          font-weight: 900;
          letter-spacing: -2px;
          margin-bottom: -10px;
          text-transform: uppercase;
          background: linear-gradient(180deg, #fff 0%, #999 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));
          line-height: 0.9;
          white-space: nowrap;
        }

        .game-subtitle {
          font-size: 14px;
          color: #ff3b30;
          letter-spacing: 8px;
          font-weight: 800;
          margin-bottom: 50px;
          opacity: 0.9;
        }

        .menu-container {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          padding: 30px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          margin: 0 20px;
        }

        .menu-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 16px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 2px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
        }

        .menu-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: scale(1.02);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .primary-btn {
          background: #ff3b30;
          border: none;
          color: #fff;
          font-size: 20px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(255, 59, 48, 0.3);
          margin-bottom: 10px;
        }

        .primary-btn:hover {
          background: #ff453a;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 15px 50px rgba(255, 59, 48, 0.5);
        }

        .exit-btn {
          margin-top: 10px;
          color: #666;
          border-color: transparent;
          font-size: 12px;
        }

        .exit-btn:hover {
          color: #ff3b30;
          background: rgba(255, 59, 48, 0.05);
          border-color: rgba(255, 59, 48, 0.2);
        }

        .version-tag {
          margin-top: 40px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 3px;
          font-weight: 700;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
