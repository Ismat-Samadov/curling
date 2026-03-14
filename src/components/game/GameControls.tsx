/**
 * GameControls — aim joystick, power bar, curl selector, and throw button.
 *
 * Phase 'aiming': show aim slider + curl selector + "Set Power" button
 * Phase 'power': show power bar + "Throw!" button
 *
 * Supports mouse/keyboard and touch input.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { GameState } from '@/types/game';
import { playClick } from '@/lib/sounds';

interface Props {
  gameState: GameState;
  onSetAim: (angle: number) => void;
  onSetPower: (power: number) => void;
  onSetCurl: (dir: 1 | -1) => void;
  onThrow: () => void;
  onConfirmAim: () => void;
}

export default function GameControls({
  gameState,
  onSetAim,
  onSetPower,
  onSetCurl,
  onThrow,
  onConfirmAim,
}: Props) {
  const { phase, aimAngle, power, curlDirection, soundEnabled } = gameState;

  const sfx = useCallback(() => {
    if (soundEnabled) playClick();
  }, [soundEnabled]);

  // ── Keyboard controls ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'aiming' && phase !== 'power') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z') onSetCurl(-1);
      if (e.key === 'x' || e.key === 'X') onSetCurl(1);

      if (phase === 'aiming') {
        if (e.key === 'ArrowLeft') onSetAim(aimAngle - 0.03);
        if (e.key === 'ArrowRight') onSetAim(aimAngle + 0.03);
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sfx(); onConfirmAim(); }
      } else if (phase === 'power') {
        if (e.key === 'ArrowUp') onSetPower(Math.min(1, power + 0.05));
        if (e.key === 'ArrowDown') onSetPower(Math.max(0.05, power - 0.05));
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sfx(); onThrow(); }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, aimAngle, power, onSetAim, onSetPower, onThrow, onConfirmAim, onSetCurl, sfx]);

  if (phase !== 'aiming' && phase !== 'power') return null;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── Aim panel ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20"
      >
        {/* Aim angle */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-cyan-300 uppercase tracking-widest">Aim</span>
          <span className="text-xs font-mono text-white/60">
            {((aimAngle * 180) / Math.PI).toFixed(1)}°
          </span>
        </div>
        <input
          type="range"
          min={-0.55}
          max={0.55}
          step={0.01}
          value={aimAngle}
          disabled={phase === 'power'}
          onChange={(e) => onSetAim(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full accent-cyan-400 cursor-pointer disabled:opacity-40"
        />

        {/* Curl */}
        <div className="flex gap-2 mt-3">
          {([[-1, '↺ In-turn'], [1, '↻ Out-turn']] as const).map(([dir, label]) => (
            <button
              key={dir}
              onClick={() => { sfx(); onSetCurl(dir); }}
              disabled={phase === 'power'}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 ${
                curlDirection === dir
                  ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {phase === 'aiming' && (
          <button
            onClick={() => { sfx(); onConfirmAim(); }}
            className="w-full mt-3 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-white font-bold text-lg transition-all shadow-lg shadow-cyan-500/30"
          >
            Set Power →
          </button>
        )}

        <p className="text-center text-white/25 text-xs mt-2">
          {phase === 'aiming'
            ? '← → to aim · Z/X curl · Enter confirm'
            : '↑ ↓ to adjust power · Enter to throw'}
        </p>
      </motion.div>

      {/* ── Power panel (only in 'power' phase) ─────────────────────────── */}
      {phase === 'power' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-cyan-300 uppercase tracking-widest">Power</span>
            <span className="text-xs font-mono text-white/60">{Math.round(power * 100)}%</span>
          </div>

          {/* Visual bar */}
          <div className="w-full h-5 bg-white/10 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${power * 100}%`,
                background: `linear-gradient(to right, #22d3ee, ${
                  power > 0.75 ? '#f43f5e' : power > 0.45 ? '#f59e0b' : '#22d3ee'
                })`,
              }}
              animate={{ width: `${power * 100}%` }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>

          <input
            type="range"
            min={0.05}
            max={1}
            step={0.01}
            value={power}
            onChange={(e) => onSetPower(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full accent-cyan-400 cursor-pointer"
          />

          <button
            onClick={() => { sfx(); onThrow(); }}
            className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-bold text-lg transition-all shadow-lg shadow-cyan-500/30"
          >
            🥌 Throw!
          </button>
        </motion.div>
      )}
    </div>
  );
}
