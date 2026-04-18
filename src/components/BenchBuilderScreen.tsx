import React, { useState, useMemo } from 'react';
import type { Card } from '../types';
import { Card as CardComponent } from './Card';

const BENCH_LIMIT_POINTS = 85;
const BENCH_SIZE = 5;
const DEFAULT_BENCH_NAMES = ['Power Play', 'Goalie', 'Coaching', 'Line Change', 'Timeout'];

interface BenchBuilderScreenProps {
  playerLabel: string;       // e.g. "HOME PLAYER"
  playerColor: 'white' | 'black';
  availableCards: Card[];    // Full deck for this player
  onConfirm: (bench: Card[]) => void;
}

export const BenchBuilderScreen: React.FC<BenchBuilderScreenProps> = ({
  playerLabel,
  playerColor,
  availableCards,
  onConfirm,
}) => {
  const [bench, setBench] = useState<Card[]>([]);
  const [viewingCard, setViewingCard] = useState<Card | null>(null);

  const totalPoints = useMemo(() => bench.reduce((sum, c) => sum + c.points, 0), [bench]);
  const isBenchFull = bench.length >= BENCH_SIZE;
  const canConfirm = bench.length === BENCH_SIZE;

  const isOnBench = (card: Card) => bench.some(b => b.id === card.id);

  const toggleCard = (card: Card) => {
    if (isOnBench(card)) {
      // Remove from bench
      setBench(prev => prev.filter(b => b.id !== card.id));
    } else {
      // Add to bench (if not full and points won't exceed limit)
      if (isBenchFull) return;
      if (totalPoints + card.points > BENCH_LIMIT_POINTS) return;
      setBench(prev => [...prev, card]);
    }
  };

  const accentColor = playerColor === 'white' ? '#e0e0e0' : '#555';
  const accentGlow = playerColor === 'white' ? 'rgba(255,255,255,0.25)' : 'rgba(80,80,80,0.4)';
  const progressPct = Math.min((totalPoints / BENCH_LIMIT_POINTS) * 100, 100);
  const progressColor = totalPoints > BENCH_LIMIT_POINTS ? '#ff3b30'
    : totalPoints > BENCH_LIMIT_POINTS * 0.8 ? '#ffcc00'
    : '#00d1b2';

  const applyDefaultBench = () => {
    const defaultCards: Card[] = [];
    for (const name of DEFAULT_BENCH_NAMES) {
      const found = availableCards.find(
        c => c.name.toLowerCase() === name.toLowerCase() && !defaultCards.some(d => d.id === c.id)
      );
      if (found) defaultCards.push(found);
    }
    setBench(defaultCards);
  };

  return (
    <div className="bb-overlay">
      {/* Header */}
      <div className="bb-header">
        <div className="bb-player-tag" style={{ borderColor: accentColor, boxShadow: `0 0 20px ${accentGlow}` }}>
          <span className="bb-deck-dot" style={{ background: playerColor === 'white' ? '#fff' : '#222', border: '2px solid #555' }} />
          {playerLabel}
        </div>
        <h2 className="bb-title">BUILD YOUR BENCH</h2>
        <p className="bb-subtitle">Select exactly 5 cards · Points cap: {BENCH_LIMIT_POINTS}</p>

        {/* Point counter */}
        <div className="bb-points-bar-wrap">
          <div className="bb-points-label">
            <span style={{ color: progressColor, fontWeight: 900 }}>{totalPoints}</span>
            <span style={{ opacity: 0.4 }}> / {BENCH_LIMIT_POINTS} pts</span>
            <span className="bb-slots-badge">{bench.length} / {BENCH_SIZE} cards</span>
          </div>
          <div className="bb-points-bar-bg">
            <div
              className="bb-points-bar-fill"
              style={{ width: `${progressPct}%`, background: progressColor }}
            />
          </div>
        </div>
      </div>

      {/* Bench zone */}
      <div className="bb-bench-zone">
        <div className="bb-bench-label">YOUR BENCH</div>
        <div className="bb-bench-slots">
          {Array.from({ length: BENCH_SIZE }).map((_, i) => {
            const card = bench[i];
            return (
              <div
                key={i}
                className={`bb-bench-slot ${card ? 'filled' : 'empty'}`}
                onClick={() => card && toggleCard(card)}
                title={card ? `Remove ${card.name}` : 'Empty slot'}
              >
                {card ? (
                  <>
                    {/* Scale wrapper — shrinks the card to a mini thumbnail */}
                    <div className="bb-bench-card-wrap">
                      <div className="bb-bench-card-inner">
                        <CardComponent card={card} />
                      </div>
                    </div>
                    <div className="bb-remove-hint">✕</div>
                  </>
                ) : (
                  <div className="bb-empty-slot-inner">
                    <span className="bb-slot-num">{i + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available cards grid */}
      <div className="bb-pool-section">
        <div className="bb-pool-label">
          YOUR DECK
          <span className="bb-pool-count">{availableCards.length} cards</span>
        </div>
        <div className="bb-pool-grid">
          {availableCards.map(card => {
            const onBench = isOnBench(card);
            const wouldExceedPoints = !onBench && totalPoints + card.points > BENCH_LIMIT_POINTS;
            const blocked = !onBench && isBenchFull;
            const disabled = (wouldExceedPoints || blocked) && !onBench;

            return (
              <div
                key={card.id}
                className={`bb-pool-card ${onBench ? 'selected' : ''} ${disabled ? 'dimmed' : ''}`}
                onClick={() => !disabled && toggleCard(card)}
                title={
                  onBench ? 'Click to remove'
                  : blocked ? 'Bench is full (5 cards)'
                  : wouldExceedPoints ? `Would exceed ${BENCH_LIMIT_POINTS}pt limit`
                  : `Add to bench (+${card.points}pts)`
                }
              >
                <CardComponent card={card} onClick={() => {}} />
                <div className="bb-card-pts">{card.points}pt</div>
                {onBench && <div className="bb-card-check">✓</div>}
                {disabled && <div className="bb-card-lock">🔒</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer confirm */}
      <div className="bb-footer">
        <div className="bb-footer-actions">
          <button
            className="bb-default-btn"
            onClick={applyDefaultBench}
            title="Auto-select: Power Play, Goalie, Coaching, Line Change, Timeout"
          >
            ⚡ DEFAULT BENCH
          </button>
          {!canConfirm && (
            <p className="bb-footer-hint">
              {bench.length < BENCH_SIZE
                ? `Pick ${BENCH_SIZE - bench.length} more card${BENCH_SIZE - bench.length !== 1 ? 's' : ''}`
                : `Remove ${bench.length - BENCH_SIZE} card${bench.length - BENCH_SIZE !== 1 ? 's' : ''}`}
            </p>
          )}
          <button
            className="bb-confirm-btn"
            disabled={!canConfirm}
            onClick={() => onConfirm(bench)}
            style={canConfirm ? { boxShadow: `0 0 30px ${accentGlow}` } : {}}
          >
            LOCK IN BENCH →
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');

        .bb-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(160deg, #020912 0%, #050d18 60%, #000 100%);
          z-index: 9000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          color: white;
        }

        /* ── Header ── */
        .bb-header {
          flex-shrink: 0;
          padding: 12px 28px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(20px);
        }
        .bb-player-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.5);
          border: 1px solid;
          padding: 3px 12px;
          border-radius: 20px;
          margin-bottom: 2px;
        }
        .bb-deck-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }
        .bb-title {
          font-size: clamp(18px, 3vw, 28px);
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
        }
        .bb-subtitle {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1px;
          margin: 0;
        }

        /* Points bar */
        .bb-points-bar-wrap {
          width: 100%;
          max-width: 520px;
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .bb-points-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 700;
        }
        .bb-slots-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          background: rgba(255,255,255,0.08);
          padding: 2px 10px;
          border-radius: 20px;
          color: rgba(255,255,255,0.6);
        }
        .bb-points-bar-bg {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          overflow: hidden;
        }
        .bb-points-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease, background 0.3s ease;
        }

        /* ── Bench zone ── */
        .bb-bench-zone {
          flex-shrink: 0;
          padding: 8px 24px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
        }
        .bb-bench-label {
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.3);
        }
        .bb-bench-slots {
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: center;
        }
        /* The outer slot — fixed to the mini-card footprint */
        .bb-bench-slot {
          position: relative;
          cursor: pointer;
          transition: transform 0.18s;
          width: 64px;
          height: 92px;
          border-radius: 7px;
          overflow: hidden;
        }
        .bb-bench-slot.filled:hover { transform: scale(1.06); }
        .bb-bench-slot.empty { pointer-events: none; cursor: default; }

        /* Scale wrapper: card is rendered at native 140×200px then shrunk */
        .bb-bench-card-wrap {
          width: 64px;
          height: 92px;
          overflow: hidden;
          border-radius: 7px;
          position: relative;
        }
        .bb-bench-card-inner {
          position: absolute;
          top: 0; left: 0;
          transform-origin: top left;
          transform: scale(0.457);
          /* 140 × 0.457 ≈ 64px  |  200 × 0.457 ≈ 91px */
          pointer-events: none;
        }

        .bb-empty-slot-inner {
          width: 64px;
          height: 92px;
          border-radius: 7px;
          border: 2px dashed rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.02);
        }
        .bb-slot-num {
          font-size: 14px;
          font-weight: 900;
          color: rgba(255,255,255,0.1);
        }
        .bb-remove-hint {
          position: absolute;
          inset: 0;
          background: rgba(200,0,0,0.82);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          opacity: 0;
          transition: opacity 0.15s;
          pointer-events: none;
        }
        .bb-bench-slot.filled:hover .bb-remove-hint { opacity: 1; }

        /* ── Card pool ── */
        .bb-pool-section {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .bb-pool-label {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bb-pool-count {
          font-size: 9px;
          color: rgba(255,255,255,0.2);
        }
        .bb-pool-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        .bb-pool-card {
          position: relative;
          cursor: pointer;
          border-radius: 10px;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.2s;
          outline: 2px solid transparent;
          outline-offset: 2px;
        }
        .bb-pool-card:hover:not(.dimmed) {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 12px 28px rgba(0,0,0,0.6);
        }
        .bb-pool-card.selected {
          outline-color: #00d1b2;
          box-shadow: 0 0 20px rgba(0,209,178,0.35);
        }
        .bb-pool-card.dimmed {
          opacity: 0.28;
          cursor: not-allowed;
        }
        .bb-card-pts {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.85);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.6);
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .bb-card-check {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #00d1b2;
          color: #000;
          font-size: 11px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,209,178,0.5);
        }
        .bb-card-lock {
          position: absolute;
          top: -6px;
          right: -6px;
          font-size: 12px;
        }

        /* ── Footer ── */
        .bb-footer {
          flex-shrink: 0;
          padding: 10px 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(20px);
        }
        .bb-footer-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .bb-footer-hint {
          width: 100%;
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1px;
          font-weight: 700;
          margin: 0;
        }
        .bb-default-btn {
          padding: 14px 22px;
          border-radius: 12px;
          border: 1px solid rgba(255,204,0,0.4);
          background: rgba(255,204,0,0.08);
          color: #ffcc00;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .bb-default-btn:hover {
          background: rgba(255,204,0,0.18);
          border-color: rgba(255,204,0,0.7);
          transform: translateY(-1px);
        }

        .bb-confirm-btn {
          padding: 16px 60px;
          border-radius: 12px;
          border: none;
          background: #fff;
          color: #000;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 2px;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
        }
        .bb-confirm-btn:disabled {
          opacity: 0.2;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
        .bb-confirm-btn:not(:disabled):hover {
          transform: translateY(-2px) scale(1.03);
        }

        @keyframes bbFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
