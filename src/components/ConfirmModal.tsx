import React from 'react';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <div className="confirm-icon">⚠️</div>
        <p className="confirm-message">{message}</p>
        
        <div className="confirm-actions">
          <button className="confirm-btn primary-btn" onClick={onConfirm}>
            PROCEED
          </button>
          <button className="confirm-btn secondary-btn" onClick={onCancel}>
            CANCEL
          </button>
        </div>
      </div>

      <style>{`
        .confirm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 25, 45, 0.85);
          backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .confirm-modal-content {
          width: 90%;
          max-width: 420px;
          background: linear-gradient(135deg, #1e3c5a 0%, #051423 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 50px 100px rgba(0,0,0,0.7);
          transform-origin: center;
          animation: modalScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .confirm-icon {
          font-size: 40px;
          margin-bottom: 20px;
          filter: drop-shadow(0 0 10px rgba(255, 184, 0, 0.4));
        }

        .confirm-message {
          color: white;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.5;
          margin-bottom: 30px;
          letter-spacing: 0.5px;
        }

        .confirm-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .confirm-btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
        }

        .primary-btn {
          background: #ff3b30;
          border: none;
          color: white;
          box-shadow: 0 10px 30px rgba(255, 59, 48, 0.4);
        }

        .primary-btn:hover {
          background: #ff453a;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 15px 40px rgba(255, 59, 48, 0.6);
        }

        .secondary-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #aaa;
        }

        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
