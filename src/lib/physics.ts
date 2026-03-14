/**
 * Physics engine for curling stone simulation.
 *
 * Coordinate system:
 *   - Y increases downward (canvas convention)
 *   - Stone travels UP the sheet (from HACK_Y toward HOUSE_CENTER)
 *   - Curl is applied perpendicular to velocity, direction set by angularVelocity sign
 */

import type { Stone, Vec2 } from '@/types/game';
import {
  FRICTION,
  MIN_SPEED,
  CURL_FACTOR,
  STONE_RADIUS,
  HOG_LINE_Y,
  SHEET_WIDTH,
} from './constants';

// ─── Single-step update ───────────────────────────────────────────────────────

/**
 * Advance one physics frame for all active stones.
 * Returns the updated stone array (immutable – creates new objects).
 */
export function stepPhysics(stones: Stone[]): Stone[] {
  // First move all stones
  let updated = stones.map((s) => {
    if (!s.active) return s;
    return moveStone(s);
  });

  // Then resolve collisions between all pairs
  updated = resolveCollisions(updated);

  return updated;
}

function moveStone(stone: Stone): Stone {
  const speed = magnitude(stone.velocity);

  if (speed < MIN_SPEED) {
    // Stone has come to rest — check if it's past the hog line
    const active = stone.position.y <= HOG_LINE_Y;
    return { ...stone, velocity: { x: 0, y: 0 }, angularVelocity: 0, active };
  }

  // Apply curl — a small lateral force proportional to speed and angular velocity
  const curlX = stone.angularVelocity * speed * CURL_FACTOR;

  // Apply friction (opposing velocity direction)
  const frictionFactor = Math.max(0, 1 - FRICTION / speed);
  const newVx = stone.velocity.x * frictionFactor + curlX;
  const newVy = stone.velocity.y * frictionFactor;

  // Decay angular velocity (curling slows as stone slows)
  const newAngular = stone.angularVelocity * 0.999;

  const newPos = {
    x: stone.position.x + newVx,
    y: stone.position.y + newVy,
  };

  // Deactivate if stone leaves sheet laterally
  const outOfBounds =
    newPos.x < -STONE_RADIUS ||
    newPos.x > SHEET_WIDTH + STONE_RADIUS ||
    newPos.y < -STONE_RADIUS; // went past the back board

  return {
    ...stone,
    position: newPos,
    velocity: { x: newVx, y: newVy },
    angularVelocity: newAngular,
    rotation: stone.rotation + newAngular,
    active: !outOfBounds,
  };
}

// ─── Collision resolution ─────────────────────────────────────────────────────

function resolveCollisions(stones: Stone[]): Stone[] {
  const result = stones.map((s) => ({ ...s }));
  const diameter = STONE_RADIUS * 2;

  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const a = result[i];
      const b = result[j];

      if (!a.active && !b.active) continue;

      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < diameter && dist > 0.001) {
        // Normalised collision axis
        const nx = dx / dist;
        const ny = dy / dist;

        // Elastic collision (equal mass)
        const dvx = a.velocity.x - b.velocity.x;
        const dvy = a.velocity.y - b.velocity.y;
        const dot = dvx * nx + dvy * ny;

        if (dot > 0) {
          // Stones moving toward each other
          result[i].velocity = {
            x: a.velocity.x - dot * nx,
            y: a.velocity.y - dot * ny,
          };
          result[j].velocity = {
            x: b.velocity.x + dot * nx,
            y: b.velocity.y + dot * ny,
          };

          // Separate overlapping stones
          const overlap = (diameter - dist) / 2;
          result[i].position = {
            x: a.position.x - overlap * nx,
            y: a.position.y - overlap * ny,
          };
          result[j].position = {
            x: b.position.x + overlap * nx,
            y: b.position.y + overlap * ny,
          };

          // Reactivate stones that were knocked back into play (past hog line)
          if (!result[j].active && result[j].position.y <= HOG_LINE_Y) {
            result[j].active = true;
          }
          if (!result[i].active && result[i].position.y <= HOG_LINE_Y) {
            result[i].active = true;
          }
        }
      }
    }
  }

  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function magnitude(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function distanceBetween(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Returns true when all stones have stopped moving */
export function allStopped(stones: Stone[]): boolean {
  return stones.every((s) => {
    if (!s.active) return true;
    return magnitude(s.velocity) < MIN_SPEED;
  });
}
