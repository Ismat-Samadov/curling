/**
 * RAF-based physics loop.
 *
 * Runs stepPhysics() each animation frame while stones are in motion,
 * calls onStopped() when everything comes to rest, and
 * calls onCollision() when a collision is detected (for sound).
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Stone } from '@/types/game';
import { stepPhysics, allStopped, magnitude } from '@/lib/physics';

interface Options {
  active: boolean; // only run when true
  stones: Stone[];
  onFrame: (stones: Stone[]) => void;
  onStopped: () => void;
  onCollision: () => void;
}

export function usePhysicsLoop({
  active,
  stones,
  onFrame,
  onStopped,
  onCollision,
}: Options) {
  const rafRef = useRef<number | null>(null);
  const stonesRef = useRef<Stone[]>(stones);
  const prevSpeeds = useRef<Record<string, number>>({});

  // Keep stonesRef in sync
  useEffect(() => {
    stonesRef.current = stones;
  }, [stones]);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let stopped = false;

    function tick() {
      if (stopped) return;

      const current = stonesRef.current;
      const next = stepPhysics(current);

      // Collision detection: if a previously-fast stone suddenly slowed
      // while another stone sped up, a collision occurred
      let collisionDetected = false;
      for (const s of next) {
        if (!s.active) continue;
        const prevSpeed = prevSpeeds.current[s.id] ?? 0;
        const newSpeed = magnitude(s.velocity);
        // Significant speed increase from 0 indicates a hit
        if (prevSpeed < 0.5 && newSpeed > 1) collisionDetected = true;
        prevSpeeds.current[s.id] = newSpeed;
      }

      if (collisionDetected) onCollision();

      stonesRef.current = next;
      onFrame(next);

      if (allStopped(next)) {
        stopped = true;
        onStopped();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
