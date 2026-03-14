/**
 * MenuScreen — the main menu / title screen.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Difficulty } from '@/types/game';

interface Props {
  onStart: (difficulty: Difficulty) => void;
}

const DIFFICULTY_INFO: Record<
  Difficulty,
  { label: string; description: string; emoji: string; color: string }
> = {
  easy: {
    label: 'Easy',
    emoji: '😊',
    description: 'AI throws wildly — perfect for beginners',
    color: 'from-emerald-500 to-teal-600',
  },
  medium: {
    label: 'Medium',
    emoji: '🤔',
    description: 'AI aims for the house with some error',
    color: 'from-amber-500 to-orange-600',
  },
  hard: {
    label: 'Hard',
    emoji: '😤',
    description: 'Precise AI — sweeping tactics employed',
    color: 'from-rose-500 to-pink-600',
  },
};

export default function MenuScreen({ onStart }: Props) {
  const [selected, setSelected] = useState<Difficulty>('medium');

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Background ice particles */}
      <IceParticles />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-md">
        {/* Logo */}
        <motion.div
          className="text-center"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          <motion.div
            className="text-8xl mb-2"
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🥌
          </motion.div>
          <h1 className="text-5xl font-black tracking-tight text-white">
            Curl<span className="text-cyan-400">Master</span>
          </h1>
          <p className="text-white/50 text-sm mt-2 font-mono tracking-wide">
            SLIDE · CURL · SCORE
          </p>
        </motion.div>

        {/* Difficulty selection */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest text-center mb-3">
            Select Difficulty
          </p>
          <div className="flex flex-col gap-3">
            {(Object.entries(DIFFICULTY_INFO) as [Difficulty, typeof DIFFICULTY_INFO[Difficulty]][]).map(
              ([diff, info]) => (
                <motion.button
                  key={diff}
                  onClick={() => setSelected(diff)}
                  className={`relative w-full rounded-2xl p-4 border text-left transition-all overflow-hidden ${
                    selected === diff
                      ? 'border-cyan-400/60 bg-white/10 shadow-lg shadow-cyan-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selected === diff && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${info.color} opacity-10`}
                      layoutId="diffHighlight"
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.emoji}</span>
                    <div>
                      <div className="font-bold text-white">{info.label}</div>
                      <div className="text-xs text-white/50">{info.description}</div>
                    </div>
                    {selected === diff && (
                      <motion.div
                        className="ml-auto text-cyan-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              )
            )}
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={() => onStart(selected)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xl tracking-wide shadow-2xl shadow-cyan-500/40 transition-all"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          🥌 Start Game
        </motion.button>

        {/* Controls hint */}
        <motion.div
          className="text-center text-white/30 text-xs font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>← → Aim · ↑ ↓ Power · Enter Throw · P Pause</p>
          <p className="mt-1">8 ends · 8 stones each · First to score wins</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Ice particle background ───────────────────────────────────────────────────

function IceParticles() {
  const particles = Array.from({ length: 20 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((_, i) => {
        const size = 4 + Math.random() * 12;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const dur = 6 + Math.random() * 8;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-300/20"
            style={{ width: size, height: size, left: `${left}%`, top: '-10%' }}
            animate={{ y: ['0vh', '110vh'], opacity: [0, 0.6, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}
