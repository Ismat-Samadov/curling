/**
 * EndScreen — animated game-over / winner screen.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GameState, Difficulty } from '@/types/game';
import { PLAYER_COLOR, AI_COLOR } from '@/lib/constants';

interface Props {
  gameState: GameState;
  onRestart: (difficulty: Difficulty) => void;
}

function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem('curling_highscore') ?? '0', 10);
}

function saveHighScore(score: number) {
  if (typeof window === 'undefined') return;
  const current = getHighScore();
  if (score > current) localStorage.setItem('curling_highscore', String(score));
}

export default function EndScreen({ gameState, onRestart }: Props) {
  const { totalScore, difficulty } = gameState;
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>(difficulty);
  const [highScore, setHighScore] = useState(0);

  const winner =
    totalScore.player > totalScore.ai
      ? 'player'
      : totalScore.ai > totalScore.player
      ? 'ai'
      : 'draw';

  useEffect(() => {
    if (winner === 'player') saveHighScore(totalScore.player);
    setHighScore(getHighScore());
  }, [winner, totalScore.player]);

  const DIFFS: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {winner === 'player' && <Confetti />}

      <motion.div
        className="rounded-3xl p-8 w-96 max-w-[92vw] text-center shadow-2xl relative z-10"
        style={{
          background: 'rgba(15,23,42,0.97)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
        initial={{ scale: 0.6, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22, delay: 0.1 }}
      >
        <motion.div
          className="text-7xl mb-4"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          {winner === 'player' ? '🏆' : winner === 'ai' ? '🤖' : '🤝'}
        </motion.div>

        <h2 className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>
          {winner === 'player' ? 'You Win!' : winner === 'ai' ? 'CPU Wins!' : "It's a Draw!"}
        </h2>
        <p className="text-sm mb-6 font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {difficulty.toUpperCase()} difficulty
        </p>

        <div className="flex justify-center gap-10 mb-4">
          <ScorePill label="YOU" score={totalScore.player} color={PLAYER_COLOR} />
          <ScorePill label="CPU" score={totalScore.ai} color={AI_COLOR} />
        </div>

        <div className="text-xs font-mono mb-6" style={{ color: '#fbbf24' }}>
          🥇 Personal Best: {highScore} pts
        </div>

        {/* Difficulty picker */}
        <div className="flex gap-2 mb-4">
          {DIFFS.map((d) => {
            const isActive = selectedDiff === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDiff(d)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                style={{
                  background: isActive ? '#22d3ee' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${isActive ? '#22d3ee' : 'rgba(255,255,255,0.18)'}`,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        <motion.button
          onClick={() => onRestart(selectedDiff)}
          className="w-full py-3 rounded-2xl font-bold text-lg"
          style={{
            background: 'linear-gradient(135deg, #22d3ee, #2563eb)',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(34,211,238,0.3)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Play Again 🥌
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function ScorePill({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-xs font-mono uppercase mb-1" style={{ color }}>
        {label}
      </div>
      <div className="text-5xl font-bold" style={{ color }}>
        {score}
      </div>
    </div>
  );
}

// ── Confetti (fixed positions to avoid SSR mismatch) ─────────────────────────

const CONFETTI_PIECES = [
  { left: 5, delay: 0, dur: 2.5, x: 30, color: '#22d3ee', size: 8 },
  { left: 15, delay: 0.2, dur: 3, x: -40, color: '#f43f5e', size: 10 },
  { left: 25, delay: 0.1, dur: 2.8, x: 20, color: '#fbbf24', size: 7 },
  { left: 35, delay: 0.4, dur: 3.2, x: -20, color: '#a78bfa', size: 9 },
  { left: 45, delay: 0, dur: 2.6, x: 50, color: '#34d399', size: 8 },
  { left: 55, delay: 0.3, dur: 3.1, x: -30, color: '#22d3ee', size: 6 },
  { left: 65, delay: 0.15, dur: 2.7, x: 40, color: '#f43f5e', size: 11 },
  { left: 75, delay: 0.5, dur: 3.3, x: -50, color: '#fbbf24', size: 8 },
  { left: 85, delay: 0.1, dur: 2.9, x: 15, color: '#a78bfa', size: 7 },
  { left: 92, delay: 0.35, dur: 2.5, x: -35, color: '#34d399', size: 9 },
  { left: 10, delay: 0.6, dur: 3.4, x: -20, color: '#22d3ee', size: 6 },
  { left: 50, delay: 0.45, dur: 2.8, x: 25, color: '#f43f5e', size: 10 },
  { left: 70, delay: 0.2, dur: 3.0, x: -45, color: '#fbbf24', size: 7 },
  { left: 30, delay: 0.7, dur: 2.6, x: 35, color: '#a78bfa', size: 8 },
  { left: 80, delay: 0.05, dur: 3.2, x: -25, color: '#34d399', size: 9 },
];

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {CONFETTI_PIECES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{
            y: '110vh',
            rotate: [0, 360],
            x: p.x,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
