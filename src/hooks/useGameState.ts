/**
 * Central game state manager.
 *
 * Phase flow:
 *   menu → aiming → power → simulating → (ai_turn → simulating →) ... → scoring → (next end or end_screen)
 *
 * 'ai_turn' is a special phase that means "physics is idle, waiting for the AI to throw".
 * This prevents the physics loop from firing stonesStopped() prematurely.
 */

'use client';

import { useCallback, useReducer } from 'react';
import type { GameState, Stone, Team, Difficulty } from '@/types/game';
import {
  TOTAL_ENDS,
  STONES_PER_TEAM,
  HACK_Y,
  SHEET_WIDTH,
  MAX_SPEED,
} from '@/lib/constants';
import { calculateEndScore } from '@/lib/scoring';

// ─── Initial state ────────────────────────────────────────────────────────────

function makeInitialState(
  difficulty: Difficulty = 'medium',
  soundEnabled = true,
  musicEnabled = false
): GameState {
  return {
    phase: 'menu',
    difficulty,
    currentEnd: 1,
    totalEnds: TOTAL_ENDS,
    stonesThrown: 0,
    stonesPerTeam: STONES_PER_TEAM,
    hammerTeam: 'player',
    currentThrower: 'player',
    stones: [],
    scores: [],
    totalScore: { player: 0, ai: 0 },
    aimAngle: 0,
    power: 0.5,
    curlDirection: 1,
    paused: false,
    showEndScoring: false,
    soundEnabled,
    musicEnabled,
  };
}

// ─── Extended phase type (internal) ──────────────────────────────────────────
// We extend the GamePhase with 'ai_turn' for internal use
type ExtendedPhase = GameState['phase'] | 'ai_turn' | 'power';

// ─── Action types ─────────────────────────────────────────────────────────────

type Action =
  | { type: 'START_GAME'; difficulty: Difficulty }
  | { type: 'CONFIRM_AIM' }
  | { type: 'SET_AIM'; angle: number }
  | { type: 'SET_POWER'; power: number }
  | { type: 'SET_CURL'; direction: 1 | -1 }
  | { type: 'THROW_STONE' }
  | { type: 'AI_THROW_STONE'; stone: Stone }
  | { type: 'UPDATE_STONES'; stones: Stone[] }
  | { type: 'STONES_STOPPED' }
  | { type: 'ADVANCE_END' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'RESTART' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      // Determine who throws first — non-hammer team goes first
      const hammerTeam: Team = 'player';
      const firstThrower: Team = 'ai'; // non-hammer throws first
      return {
        ...makeInitialState(action.difficulty, state.soundEnabled, state.musicEnabled),
        phase: 'aiming' as GameState['phase'],
        hammerTeam,
        currentThrower: firstThrower,
        // If AI throws first, we use ai_turn
        ...(firstThrower === 'ai' ? { phase: 'ai_turn' as GameState['phase'] } : {}),
      };
    }

    case 'CONFIRM_AIM':
      if (state.phase !== 'aiming') return state;
      return { ...state, phase: 'power' as GameState['phase'] };

    case 'SET_AIM':
      if (state.phase !== 'aiming') return state;
      return { ...state, aimAngle: action.angle };

    case 'SET_POWER':
      if (state.phase !== ('power' as GameState['phase'])) return state;
      return { ...state, power: action.power };

    case 'SET_CURL':
      return { ...state, curlDirection: action.direction };

    case 'THROW_STONE': {
      if (state.phase !== ('power' as GameState['phase'])) return state;
      const id = `stone-${state.currentEnd}-${state.stonesThrown}`;
      const speed = state.power * MAX_SPEED;
      const vx = Math.sin(state.aimAngle) * speed;
      const vy = -Math.cos(state.aimAngle) * speed;

      const newStone: Stone = {
        id,
        team: 'player',
        position: { x: SHEET_WIDTH / 2, y: HACK_Y },
        velocity: { x: vx, y: vy },
        angularVelocity: state.curlDirection * 0.4,
        rotation: 0,
        active: true,
      };

      return {
        ...state,
        phase: 'simulating',
        stones: [...state.stones, newStone],
        stonesThrown: state.stonesThrown + 1,
      };
    }

    case 'AI_THROW_STONE': {
      return {
        ...state,
        phase: 'simulating',
        stones: [...state.stones, action.stone],
        stonesThrown: state.stonesThrown + 1,
      };
    }

    case 'UPDATE_STONES':
      return { ...state, stones: action.stones };

    case 'STONES_STOPPED': {
      if (state.phase !== 'simulating') return state;

      const totalStonesThisEnd = state.stonesPerTeam * 2;
      const endOver = state.stonesThrown >= totalStonesThisEnd;

      if (endOver) {
        return { ...state, phase: 'scoring' };
      }

      // Next thrower alternates each stone
      const nextThrower: Team =
        state.currentThrower === 'player' ? 'ai' : 'player';

      return {
        ...state,
        phase: nextThrower === 'ai'
          ? ('ai_turn' as GameState['phase'])
          : 'aiming',
        currentThrower: nextThrower,
      };
    }

    case 'ADVANCE_END': {
      const endScore = calculateEndScore(state.stones, state.currentEnd);
      const newScores = [...state.scores, endScore];
      const newTotal = {
        player: state.totalScore.player + endScore.player,
        ai: state.totalScore.ai + endScore.ai,
      };

      const isLastEnd = state.currentEnd >= state.totalEnds;
      if (isLastEnd) {
        return { ...state, scores: newScores, totalScore: newTotal, phase: 'end_screen', showEndScoring: false };
      }

      // Loser of end gets the hammer next end
      let newHammer: Team = state.hammerTeam;
      if (endScore.scorer === 'player') newHammer = 'ai';
      else if (endScore.scorer === 'ai') newHammer = 'player';

      // Non-hammer team throws first
      const nextFirstThrower: Team = newHammer === 'player' ? 'ai' : 'player';

      return {
        ...state,
        currentEnd: state.currentEnd + 1,
        stonesThrown: 0,
        stones: [],
        scores: newScores,
        totalScore: newTotal,
        hammerTeam: newHammer,
        currentThrower: nextFirstThrower,
        phase: nextFirstThrower === 'ai'
          ? ('ai_turn' as GameState['phase'])
          : 'aiming',
        showEndScoring: false,
        aimAngle: 0,
        power: 0.5,
      };
    }

    case 'TOGGLE_PAUSE':
      if (state.phase === 'end_screen' || state.phase === 'menu') return state;
      return { ...state, paused: !state.paused };

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };

    case 'TOGGLE_MUSIC':
      return { ...state, musicEnabled: !state.musicEnabled };

    case 'RESTART':
      return makeInitialState(state.difficulty, state.soundEnabled, state.musicEnabled);

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, makeInitialState());

  const startGame = useCallback((d: Difficulty) => dispatch({ type: 'START_GAME', difficulty: d }), []);
  const confirmAim = useCallback(() => dispatch({ type: 'CONFIRM_AIM' }), []);
  const setAim = useCallback((angle: number) => dispatch({ type: 'SET_AIM', angle }), []);
  const setPower = useCallback((power: number) => dispatch({ type: 'SET_POWER', power }), []);
  const setCurl = useCallback((direction: 1 | -1) => dispatch({ type: 'SET_CURL', direction }), []);
  const throwStone = useCallback(() => dispatch({ type: 'THROW_STONE' }), []);
  const aiThrowStone = useCallback((stone: Stone) => dispatch({ type: 'AI_THROW_STONE', stone }), []);
  const updateStones = useCallback((stones: Stone[]) => dispatch({ type: 'UPDATE_STONES', stones }), []);
  const stonesStopped = useCallback(() => dispatch({ type: 'STONES_STOPPED' }), []);
  const advanceEnd = useCallback(() => dispatch({ type: 'ADVANCE_END' }), []);
  const togglePause = useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), []);
  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const toggleMusic = useCallback(() => dispatch({ type: 'TOGGLE_MUSIC' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  return {
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
  };
}
