/**
 * PauseMenu — overlay shown when the game is paused.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, Difficulty } from '@/types/game';

interface Props {
  gameState: GameState;
  onResume: () => void;
  onRestart: (difficulty: Difficulty) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export default function PauseMenu({
  gameState,
  onResume,
  onRestart,
  onToggleSound,
  onToggleMusic,
}: Props) {
  const { paused, soundEnabled, musicEnabled, difficulty } = gameState;

  return (
    <AnimatePresence>
      {paused && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-slate-900/95 border border-white/20 rounded-3xl p-8 w-80 text-center shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="text-4xl mb-3">⏸️</div>
            <h2 className="text-2xl font-bold text-white mb-6">Game Paused</h2>

            {/* Sound toggles */}
            <div className="flex flex-col gap-2 mb-6">
              <ToggleRow
                label="Sound Effects"
                icon={soundEnabled ? '🔊' : '🔇'}
                enabled={soundEnabled}
                onToggle={onToggleSound}
              />
              <ToggleRow
                label="Background Music"
                icon={musicEnabled ? '🎵' : '🎵'}
                enabled={musicEnabled}
                onToggle={onToggleMusic}
              />
            </div>

            <button
              onClick={onResume}
              className="w-full py-3 mb-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-white font-bold text-lg transition-all"
            >
              Resume ▶
            </button>
            <button
              onClick={() => onRestart(difficulty)}
              className="w-full py-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 font-semibold transition-all text-sm"
            >
              Restart Game
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  label,
  icon,
  enabled,
  onToggle,
}: {
  label: string;
  icon: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-white/5 border border-white/10">
      <span className="text-sm text-white/70 flex items-center gap-2">
        {icon} {label}
      </span>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-cyan-500' : 'bg-white/20'
        }`}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
          animate={{ x: enabled ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
