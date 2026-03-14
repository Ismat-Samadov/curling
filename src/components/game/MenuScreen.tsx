/**
 * MenuScreen — the main menu / title screen.
 *
 * NOTE: All colours that change based on runtime data use inline styles,
 * not Tailwind dynamic class fragments, so Tailwind v4 doesn't purge them.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Difficulty } from '@/types/game';

interface Props {
  onStart: (difficulty: Difficulty) => void;
}

interface DiffInfo {
  label: string;
  description: string;
  emoji: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const DIFFICULTY_INFO: Record<Difficulty, DiffInfo> = {
  easy: {
    label: 'Easy',
    emoji: '😊',
    description: 'AI throws wildly — perfect for beginners',
    accentColor: '#10b981',
    gradientFrom: '#10b981',
    gradientTo: '#0d9488',
  },
  medium: {
    label: 'Medium',
    emoji: '🤔',
    description: 'AI aims for the house with some error',
    accentColor: '#f59e0b',
    gradientFrom: '#f59e0b',
    gradientTo: '#ea580c',
  },
  hard: {
    label: 'Hard',
    emoji: '😤',
    description: 'Precise AI — strategic takeouts included',
    accentColor: '#f43f5e',
    gradientFrom: '#f43f5e',
    gradientTo: '#db2777',
  },
};

export default function MenuScreen({ onStart }: Props) {
  const [selected, setSelected] = useState<Difficulty>('medium');
  const info = DIFFICULTY_INFO[selected];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a, #172554, #0f172a)' }}>

      {/* Background ice particles */}
      <IceParticles />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 w-full max-w-md">

        {/* Logo */}
        <motion.div
          className="text-center"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-8xl mb-2 select-none"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🥌
          </motion.div>
          <h1 className="text-5xl font-black tracking-tight" style={{ color: '#ffffff' }}>
            Curl<span style={{ color: '#22d3ee' }}>Master</span>
          </h1>
          <p className="text-sm mt-2 font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            SLIDE · CURL · SCORE
          </p>
        </motion.div>

        {/* Difficulty selection */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <p className="text-xs font-mono uppercase tracking-widest text-center mb-3"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Select Difficulty
          </p>

          <div className="flex flex-col gap-2">
            {(Object.entries(DIFFICULTY_INFO) as [Difficulty, DiffInfo][]).map(([diff, info]) => {
              const isSelected = selected === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setSelected(diff)}
                  className="relative w-full rounded-2xl p-4 text-left overflow-hidden transition-transform active:scale-98"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${info.gradientFrom}22, ${info.gradientTo}44)`
                      : 'rgba(255,255,255,0.07)',
                    border: `2px solid ${isSelected ? info.accentColor + '90' : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: isSelected ? `0 0 20px ${info.accentColor}30` : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: isSelected ? info.accentColor : '#ffffff' }}>
                        {info.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {info.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-lg font-bold" style={{ color: info.accentColor }}>✓</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={() => onStart(selected)}
          className="w-full py-4 rounded-2xl font-black text-xl tracking-wide transition-all"
          style={{
            background: `linear-gradient(135deg, #22d3ee, #2563eb)`,
            color: '#ffffff',
            boxShadow: '0 8px 32px rgba(34,211,238,0.35)',
          }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          🥌 Start Game
        </motion.button>

        {/* Controls hint */}
        <motion.div
          className="text-center font-mono"
          style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p>← → Aim &nbsp;·&nbsp; Z/X Curl &nbsp;·&nbsp; Enter Confirm/Throw &nbsp;·&nbsp; P Pause</p>
          <p className="mt-1">8 ends · 8 stones per team · Last stone advantage</p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Ice particle background ───────────────────────────────────────────────────

function IceParticles() {
  // Fixed positions to avoid SSR/hydration mismatch
  const particles = [
    { left: 12, size: 8, dur: 9, delay: 0 },
    { left: 28, size: 5, dur: 7, delay: 1.5 },
    { left: 45, size: 12, dur: 11, delay: 0.5 },
    { left: 60, size: 6, dur: 8, delay: 2.5 },
    { left: 75, size: 9, dur: 10, delay: 1 },
    { left: 88, size: 4, dur: 7, delay: 3 },
    { left: 5, size: 7, dur: 12, delay: 4 },
    { left: 35, size: 10, dur: 9, delay: 2 },
    { left: 55, size: 5, dur: 8, delay: 3.5 },
    { left: 92, size: 8, dur: 11, delay: 0.8 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: '-5%',
            background: 'rgba(147,210,238,0.18)',
          }}
          animate={{ y: ['0vh', '105vh'], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
