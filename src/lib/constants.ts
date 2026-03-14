// ─── Sheet dimensions (logical pixels, scaled to canvas) ───────────────────
export const SHEET_WIDTH = 480;
export const SHEET_HEIGHT = 900;

// ─── House (target rings) ────────────────────────────────────────────────────
/** Centre of the house in sheet coordinates */
export const HOUSE_CENTER: { x: number; y: number } = {
  x: SHEET_WIDTH / 2,
  y: 180, // near the top of the visible sheet
};
export const RING_RADII = [72, 54, 36, 18] as const; // 12-ft, 8-ft, 4-ft, button
export const BUTTON_RADIUS = 18; // innermost ring

// ─── Hog line & hack ────────────────────────────────────────────────────────
/** Stones must reach the hog line or they are removed */
export const HOG_LINE_Y = 360; // y-position on sheet
/** Where the player releases the stone from */
export const HACK_Y = SHEET_HEIGHT - 80;

// ─── Stone ──────────────────────────────────────────────────────────────────
export const STONE_RADIUS = 20;

// ─── Physics ────────────────────────────────────────────────────────────────
/**
 * Constant deceleration per frame (px/frame).
 * Calibrated so 70% power lands near house centre (640 px from hack):
 *   distance = v² / (2 * FRICTION)  →  FRICTION = (0.7*MAX_SPEED)² / (2*640) ≈ 0.185
 */
export const FRICTION = 0.185;
/** Maximum initial speed when power = 1 */
export const MAX_SPEED = 22;
/** Minimum speed to consider stone stopped */
export const MIN_SPEED = 0.15;
/**
 * Curl force scale.
 * Total curl ≈ 0.4 * CURL_FACTOR * v² / (2*FRICTION) ≈ 26 px at 70% power.
 */
export const CURL_FACTOR = 0.1;

// ─── Game rules ─────────────────────────────────────────────────────────────
export const TOTAL_ENDS = 8;
export const STONES_PER_TEAM = 8;

// ─── Scoring colours ────────────────────────────────────────────────────────
export const PLAYER_COLOR = '#22d3ee'; // cyan-400
export const AI_COLOR = '#f43f5e'; // rose-500
