/**
 * Scoring logic for curling.
 *
 * Only stones inside or touching the 12-ft ring score.
 * The team with the stone closest to the centre scores
 * 1 point for each of their stones that is closer than
 * the nearest opposition stone.
 */

import type { Stone, Team, EndScore } from '@/types/game';
import { distanceBetween } from './physics';
import { HOUSE_CENTER, RING_RADII, STONE_RADIUS } from './constants';

const SCORING_RADIUS = RING_RADII[0] + STONE_RADIUS; // stone must overlap the house

/**
 * Calculate scoring for the current end.
 * Returns { player, ai, scorer } point counts.
 */
export function calculateEndScore(
  stones: Stone[],
  endNumber: number
): EndScore {
  const inPlay = stones.filter((s) => s.active);

  // Measure distance of every stone from the centre button
  const distances = inPlay
    .filter((s) => distanceBetween(s.position, HOUSE_CENTER) <= SCORING_RADIUS)
    .map((s) => ({
      team: s.team,
      dist: distanceBetween(s.position, HOUSE_CENTER),
    }))
    .sort((a, b) => a.dist - b.dist);

  if (distances.length === 0) {
    return { end: endNumber, player: 0, ai: 0, scorer: 'blank' };
  }

  const closestTeam = distances[0].team;
  const opposingTeam: Team = closestTeam === 'player' ? 'ai' : 'player';

  // Find distance of closest opposing stone
  const closestOpponent = distances.find((d) => d.team === opposingTeam);
  const opponentDist = closestOpponent ? closestOpponent.dist : Infinity;

  // Count scoring team's stones closer than the nearest opponent
  const points = distances.filter(
    (d) => d.team === closestTeam && d.dist < opponentDist
  ).length;

  return {
    end: endNumber,
    player: closestTeam === 'player' ? points : 0,
    ai: closestTeam === 'ai' ? points : 0,
    scorer: closestTeam,
  };
}

/**
 * Return a sorted array of { team, dist } for all stones in the house,
 * useful for UI highlighting.
 */
export function getStonesInHouse(stones: Stone[]) {
  return stones
    .filter(
      (s) =>
        s.active &&
        distanceBetween(s.position, HOUSE_CENTER) <= SCORING_RADIUS
    )
    .map((s) => ({
      id: s.id,
      team: s.team,
      dist: distanceBetween(s.position, HOUSE_CENTER),
    }))
    .sort((a, b) => a.dist - b.dist);
}
