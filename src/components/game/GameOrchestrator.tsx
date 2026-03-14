/**
 * GameOrchestrator — top-level component that wires:
 *   - Game state (useGameState)
 *   - Physics loop (usePhysicsLoop)
 *   - Canvas rendering (CurlingCanvas)
 *   - UI panels, modals, sound, AI scheduling
 *
 * Phase flow:
 *   menu → aiming → power → simulating → ai_turn → simulating → ... → scoring → advance_end → ...
 */

'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { usePhysicsLoop } from '@/hooks/usePhysicsLoop';
import CurlingCanvas from './CurlingCanvas';
import ScoreBoard from './ScoreBoard';
import GameControls from './GameControls';
import EndScoreModal from './EndScoreModal';
import EndScreen from './EndScreen';
import PauseMenu from './PauseMenu';
import MenuScreen from './MenuScreen';
import type { Difficulty, Stone } from '@/types/game';
import { playThrow, playCollision, playStop, startMusic, stopMusic } from '@/lib/sounds';
import { SHEET_WIDTH, HACK_Y } from '@/lib/constants';
import { computeAIShot, shotToVelocity } from '@/lib/ai';

export default function GameOrchestrator() {
  const {
    state,
    startGame,
    confirmAim,
    setAim,
    setPower,
    setCurl,
    throwStone,
    aiThrowStone,
    updateStones,
    stonesStopped,
    advanceEnd,
    togglePause,
    toggleSound,
    toggleMusic,
    restart,
  } = useGameState();

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Physics loop ──────────────────────────────────────────────────────────
  usePhysicsLoop({
    active: state.phase === 'simulating' && !state.paused,
    stones: state.stones,
    onFrame: updateStones,
    onStopped: () => {
      if (state.soundEnabled) playStop();
      stonesStopped();
    },
    onCollision: () => {
      if (state.soundEnabled) playCollision();
    },
  });

  // ── AI turn scheduling ────────────────────────────────────────────────────
  // When phase === 'ai_turn', schedule the AI throw after a short delay.
  useEffect(() => {
    if (state.phase !== 'ai_turn' || state.paused) return;

    const delay = 900 + Math.random() * 400; // 900–1300 ms "thinking" time
    aiTimerRef.current = setTimeout(() => {
      const shot = computeAIShot(state.stones, state.difficulty);
      const { velocity, angularVelocity } = shotToVelocity(shot);
      const id = `stone-${state.currentEnd}-${state.stonesThrown}`;
      const stone: Stone = {
        id,
        team: 'ai',
        position: { x: SHEET_WIDTH / 2, y: HACK_Y },
        velocity,
        angularVelocity,
        rotation: 0,
        active: true,
      };
      if (state.soundEnabled) playThrow();
      aiThrowStone(stone);
    }, delay);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.paused]);

  // ── Music ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.musicEnabled && state.phase !== 'menu' && state.phase !== 'end_screen') {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [state.musicEnabled, state.phase]);

  // ── Keyboard shortcut: P = pause ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') togglePause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause]);

  // ── Player throw ──────────────────────────────────────────────────────────
  const handleThrow = () => {
    if (state.soundEnabled) playThrow();
    throwStone();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-2 md:p-4">
      {/* ── Menu ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {state.phase === 'menu' && <MenuScreen onStart={startGame} />}
      </AnimatePresence>

      {/* ── Main game layout ──────────────────────────────────────────────── */}
      {state.phase !== 'menu' && (
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-start justify-center gap-4">
          {/* ── Left / Canvas column ─────────────────────────────────────── */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3 w-full lg:w-auto">
            {/* Top bar */}
            <div className="w-full flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">🥌 CurlMaster</span>
                <span className="text-xs font-mono bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full uppercase">
                  {state.difficulty}
                </span>
              </div>
              <div className="flex gap-2">
                <IconButton onClick={toggleSound} title={state.soundEnabled ? 'Mute' : 'Unmute'}>
                  {state.soundEnabled ? '🔊' : '🔇'}
                </IconButton>
                <IconButton onClick={toggleMusic} title={state.musicEnabled ? 'Music off' : 'Music on'}>
                  🎵
                </IconButton>
                <IconButton onClick={togglePause} title="Pause (P)">
                  ⏸
                </IconButton>
              </div>
            </div>

            {/* Phase indicator */}
            <PhaseIndicator state={state} />

            {/* Canvas wrapper — scales to fit viewport height */}
            <div
              className="w-full relative"
              style={{ maxHeight: 'min(70vh, 900px)', aspectRatio: '480/900' }}
            >
              <CurlingCanvas gameState={state} />
            </div>
          </div>

          {/* ── Right sidebar ────────────────────────────────────────────── */}
          <div className="w-full lg:w-72 flex flex-col gap-3">
            <ScoreBoard gameState={state} />
            <GameControls
              gameState={state}
              onSetAim={setAim}
              onSetPower={setPower}
              onSetCurl={setCurl}
              onThrow={handleThrow}
              onConfirmAim={confirmAim}
            />
            <StoneCountBar gameState={state} />

            {/* Keyboard legend */}
            <div className="text-xs font-mono text-white/25 leading-5 hidden lg:block px-1">
              <div>← → · Aim angle</div>
              <div>↑ ↓ · Power</div>
              <div>Z / X · Curl direction</div>
              <div>Enter / Space · Confirm / Throw</div>
              <div>P · Pause</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <EndScoreModal gameState={state} onContinue={advanceEnd} />
      <PauseMenu
        gameState={state}
        onResume={togglePause}
        onRestart={(d: Difficulty) => { restart(); startGame(d); }}
        onToggleSound={toggleSound}
        onToggleMusic={toggleMusic}
      />
      <AnimatePresence>
        {state.phase === 'end_screen' && (
          <EndScreen gameState={state} onRestart={startGame} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function IconButton({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center text-sm"
    >
      {children}
    </button>
  );
}

function PhaseIndicator({ state }: { state: ReturnType<typeof useGameState>['state'] }) {
  const messages: Partial<Record<string, string>> = {
    aiming: '🎯 Aim your stone',
    power: '💪 Set your power, then throw',
    ai_turn: '🤖 CPU is throwing…',
    simulating: '🥌 Stone in motion…',
    scoring: '📊 Calculating score…',
  };

  const msg = messages[state.phase];
  if (!msg) return null;

  return (
    <motion.div
      key={state.phase}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full"
    >
      {msg}
    </motion.div>
  );
}

function StoneCountBar({ gameState: gs }: { gameState: ReturnType<typeof useGameState>['state'] }) {
  const { stonesPerTeam, stones, currentEnd } = gs;
  const total = stonesPerTeam * 2;

  const playerThrown = stones.filter(
    (s) => s.team === 'player' && s.id.startsWith(`stone-${currentEnd}`)
  ).length;
  const aiThrown = stones.filter(
    (s) => s.team === 'ai' && s.id.startsWith(`stone-${currentEnd}`)
  ).length;

  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 text-xs font-mono text-white/60">
      <div className="flex justify-between mb-2">
        <span className="text-cyan-400">YOU {playerThrown}/{stonesPerTeam}</span>
        <span className="text-rose-400">CPU {aiThrown}/{stonesPerTeam}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: stonesPerTeam }, (_, i) => (
          <div key={`p${i}`} className="h-3 flex-1 rounded-full transition-all"
            style={{ background: i < playerThrown ? '#22d3ee' : 'rgba(255,255,255,0.1)' }} />
        ))}
        <div className="w-px bg-white/20 mx-1" />
        {Array.from({ length: stonesPerTeam }, (_, i) => (
          <div key={`a${i}`} className="h-3 flex-1 rounded-full transition-all"
            style={{ background: i < aiThrown ? '#f43f5e' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
    </div>
  );
}
