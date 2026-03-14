/**
 * AI opponent logic.
 *
 * The AI calculates a shot (aimAngle, power, curlDirection) based on
 * the current game state and difficulty level.
 *
 * Strategy:
 *  - Hard:   tries to draw to the centre (or take out player stones)
 *  - Medium: draws accurately but with moderate error
 *  - Easy:   lots of noise, sometimes misses the house entirely
 */

import type { Stone, Difficulty, Vec2 } from '@/types/game';
import { distanceBetween } from './physics';
import {
  HOUSE_CENTER,
  HACK_Y,
  SHEET_WIDTH,
  MAX_SPEED,
  FRICTION,
} from './constants';
import { getStonesInHouse } from './scoring';

export interface AIShot {
  aimAngle: number; // radians, 0 = straight
  power: number; // 0–1
  curlDirection: 1 | -1;
}

// Noise levels per difficulty
const NOISE: Record<Difficulty, { angle: number; power: number }> = {
  easy: { angle: 0.25, power: 0.25 },
  medium: { angle: 0.1, power: 0.1 },
  hard: { angle: 0.025, power: 0.025 },
};

/**
 * Decide whether to throw a draw (toward house centre)
 * or a takeout (at a specific player stone).
 */
export function computeAIShot(
  stones: Stone[],
  difficulty: Difficulty
): AIShot {
  const playerStones = stones.filter((s) => s.active && s.team === 'player');
  const inHouse = getStonesInHouse(stones);
  const playerInHouse = inHouse.filter((s) => s.team === 'player');

  // On hard/medium difficulty: if a player stone is sitting closest, try to take it out
  if (
    difficulty !== 'easy' &&
    playerInHouse.length > 0 &&
    playerInHouse[0].dist < 30
  ) {
    // Find the actual stone object
    const target = playerStones.find((s) => s.id === playerInHouse[0].id);
    if (target) {
      return buildShotAt(target.position, difficulty, -1);
    }
  }

  // Default: draw to the centre
  return buildShotAt(HOUSE_CENTER, difficulty, 1);
}

/**
 * Given a target position on the sheet, work backwards to compute
 * the (angle, power) needed from the hack, then add noise.
 */
function buildShotAt(
  target: Vec2,
  difficulty: Difficulty,
  curlDir: 1 | -1
): AIShot {
  const hackPos: Vec2 = { x: SHEET_WIDTH / 2, y: HACK_Y };

  // Ideal angle from hack to target
  const dx = target.x - hackPos.x;
  const dy = target.y - hackPos.y; // negative (target is above hack)
  const idealAngle = Math.atan2(dx, -dy); // 0 = straight up

  // Ideal power: kinematic equation  v² = 2 · FRICTION · dist
  // (constant decel stops stone exactly at target)
  const dist = distanceBetween(hackPos, target);
  const rawSpeed = Math.sqrt(2 * FRICTION * dist);
  const idealPower = Math.min(1, rawSpeed / MAX_SPEED);

  // Add difficulty noise
  const noise = NOISE[difficulty];
  const randAngle = (Math.random() - 0.5) * 2 * noise.angle;
  const randPower = (Math.random() - 0.5) * 2 * noise.power;

  return {
    aimAngle: idealAngle + randAngle,
    power: Math.max(0.1, Math.min(1, idealPower + randPower)),
    curlDirection: curlDir,
  };
}

/**
 * Convert an AIShot into an initial velocity + angular velocity for a stone.
 */
export function shotToVelocity(
  shot: AIShot
): { velocity: Vec2; angularVelocity: number } {
  const speed = shot.power * MAX_SPEED;
  // angle 0 = straight up (negative Y), positive angle = right
  const velocity: Vec2 = {
    x: Math.sin(shot.aimAngle) * speed,
    y: -Math.cos(shot.aimAngle) * speed,
  };
  const angularVelocity = shot.curlDirection * 0.4;
  return { velocity, angularVelocity };
}
