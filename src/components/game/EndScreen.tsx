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

function setHighScore(score: number) {
  if (typeof window === 'undefined') return;
  const current = getHighScore();
  if (score > current) localStorage.setItem('curling_highscore', String(score));
}

export default function EndScreen({ gameState, onRestart }: Props) {
  const { totalScore, difficulty } = gameState;
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>(difficulty);
  const [highScore, setHighScoreState] = useState(0);

  const winner =
    totalScore.player > totalScore.ai
      ? 'player'
      : totalScore.ai > totalScore.player
      ? 'ai'
      : 'draw';

  useEffect(() => {
    if (winner === 'player') setHighScore(totalScore.player);
    setHighScoreState(getHighScore());
  }, [winner, totalScore.player]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Confetti-like particles */}
      {winner === 'player' && <Confetti />}

      <motion.div
        className="bg-slate-900/95 border border-white/20 rounded-3xl p-8 w-96 max-w-[90vw] text-center shadow-2xl"
        initial={{ scale: 0.6, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22, delay: 0.1 }}
      >
        {/* Emoji badge */}
        <motion.div
          className="text-7xl mb-4"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          {winner === 'player' ? '🏆' : winner === 'ai' ? '🤖' : '🤝'}
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-1">
          {winner === 'player'
            ? 'You Win!'
            : winner === 'ai'
            ? 'CPU Wins!'
            : "It's a Draw!"}
        </h2>
        <p className="text-white/40 text-sm mb-6 font-mono">
          {difficulty.toUpperCase()} difficulty
        </p>

        {/* Final score */}
        <div className="flex justify-center gap-10 mb-4">
          <ScorePill label="YOU" score={totalScore.player} color={PLAYER_COLOR} />
          <ScorePill label="CPU" score={totalScore.ai} color={AI_COLOR} />
        </div>

        {/* High score */}
        <div className="text-xs font-mono text-yellow-400 mb-6">
          🥇 Personal Best: {highScore} pts
        </div>

        {/* Difficulty picker */}
        <div className="flex gap-2 mb-4">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDiff(d)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
                selectedDiff === d
                  ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <motion.button
          onClick={() => onRestart(selectedDiff)}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg transition-all shadow-lg shadow-cyan-500/30"
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

// ── Confetti ──────────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const dur = 2 + Math.random() * 2;
        const color = ['#22d3ee', '#f43f5e', '#fbbf24', '#a78bfa', '#34d399'][i % 5];
        const size = 6 + Math.random() * 8;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${left}%`,
              top: '-20px',
              width: size,
              height: size,
              backgroundColor: color,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 40 : 900,
              rotate: Math.random() * 720 - 360,
              x: (Math.random() - 0.5) * 200,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: dur, delay, ease: 'easeIn' }}
          />
        );
      })}
    </div>
  );
}
