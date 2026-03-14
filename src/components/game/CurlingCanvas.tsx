/**
 * CurlingCanvas — renders the ice sheet, rings, stones, and aim line.
 *
 * All drawing is done in "sheet space" (SHEET_WIDTH × SHEET_HEIGHT) and
 * scaled uniformly to fit the container via CSS transform.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { GameState } from '@/types/game';
import {
  SHEET_WIDTH,
  SHEET_HEIGHT,
  HOUSE_CENTER,
  RING_RADII,
  STONE_RADIUS,
  HACK_Y,
  HOG_LINE_Y,
  PLAYER_COLOR,
  AI_COLOR,
} from '@/lib/constants';

interface Props {
  gameState: GameState;
}

// ─── Colours ──────────────────────────────────────────────────────────────────
const ICE_COLOUR = '#dbeafe'; // blue-100
const SHEET_BG = '#1e3a5f';   // dark blue border
const RING_COLOURS = ['#dc2626', '#ffffff', '#dc2626', '#ffffff'];
const HOG_COLOUR = 'rgba(239,68,68,0.6)';
const CENTRE_LINE_COLOUR = 'rgba(255,255,255,0.15)';
const AIM_LINE_COLOUR = 'rgba(34,211,238,0.7)';
const SWEEP_SHIMMER = 'rgba(200,230,255,0.45)';

export default function CurlingCanvas({ gameState }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { phase, stones, aimAngle, power } = gameState;

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = SHEET_BG;
    ctx.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);

    // ── Ice surface ─────────────────────────────────────────────────────────
    const iceGrad = ctx.createLinearGradient(0, 0, 0, SHEET_HEIGHT);
    iceGrad.addColorStop(0, '#bfdbfe');
    iceGrad.addColorStop(0.5, '#dbeafe');
    iceGrad.addColorStop(1, '#bfdbfe');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(20, 0, SHEET_WIDTH - 40, SHEET_HEIGHT);

    // Ice texture (subtle horizontal lines)
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    for (let y = 0; y < SHEET_HEIGHT; y += 16) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(SHEET_WIDTH - 20, y);
      ctx.stroke();
    }

    // ── Centre line ─────────────────────────────────────────────────────────
    ctx.strokeStyle = CENTRE_LINE_COLOUR;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(SHEET_WIDTH / 2, 0);
    ctx.lineTo(SHEET_WIDTH / 2, SHEET_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Hog line ────────────────────────────────────────────────────────────
    ctx.strokeStyle = HOG_COLOUR;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, HOG_LINE_Y);
    ctx.lineTo(SHEET_WIDTH - 20, HOG_LINE_Y);
    ctx.stroke();

    // Hog line label
    ctx.fillStyle = 'rgba(239,68,68,0.8)';
    ctx.font = '10px monospace';
    ctx.fillText('HOG LINE', SHEET_WIDTH - 90, HOG_LINE_Y - 5);

    // ── Back line ────────────────────────────────────────────────────────────
    const backLineY = HOUSE_CENTER.y + RING_RADII[0] + 10;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, backLineY);
    ctx.lineTo(SHEET_WIDTH - 20, backLineY);
    ctx.stroke();

    // ── Rings (house) ────────────────────────────────────────────────────────
    RING_RADII.forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(HOUSE_CENTER.x, HOUSE_CENTER.y, r, 0, Math.PI * 2);
      ctx.fillStyle = RING_COLOURS[i];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Tee line (horizontal through house centre)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, HOUSE_CENTER.y);
    ctx.lineTo(SHEET_WIDTH - 20, HOUSE_CENTER.y);
    ctx.stroke();

    // ── Aim line ─────────────────────────────────────────────────────────────
    if (phase === 'aiming' || phase === 'power') {
      const hackX = SHEET_WIDTH / 2;
      const len = SHEET_HEIGHT * 0.65;
      const ex = hackX + Math.sin(aimAngle) * len;
      const ey = HACK_Y - Math.cos(aimAngle) * len;

      // Gradient aim line
      const lineGrad = ctx.createLinearGradient(hackX, HACK_Y, ex, ey);
      lineGrad.addColorStop(0, AIM_LINE_COLOUR);
      lineGrad.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(hackX, HACK_Y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      const arrowLen = 14;
      const angle = Math.atan2(ey - HACK_Y, ex - hackX);
      ctx.fillStyle = AIM_LINE_COLOUR;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(
        ex - arrowLen * Math.cos(angle - 0.4),
        ey - arrowLen * Math.sin(angle - 0.4)
      );
      ctx.lineTo(
        ex - arrowLen * Math.cos(angle + 0.4),
        ey - arrowLen * Math.sin(angle + 0.4)
      );
      ctx.closePath();
      ctx.fill();
    }

    // ── Sweeping shimmer (when stone is in flight) ───────────────────────────
    if (phase === 'simulating') {
      const movingStone = stones.find(
        (s) => s.active && (Math.abs(s.velocity.x) > 0.2 || Math.abs(s.velocity.y) > 0.2)
      );
      if (movingStone) {
        // Draw trailing shimmer behind the stone
        const trailGrad = ctx.createRadialGradient(
          movingStone.position.x,
          movingStone.position.y + 30,
          5,
          movingStone.position.x,
          movingStone.position.y + 30,
          50
        );
        trailGrad.addColorStop(0, SWEEP_SHIMMER);
        trailGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = trailGrad;
        ctx.fillRect(
          movingStone.position.x - 60,
          movingStone.position.y,
          120,
          80
        );
      }
    }

    // ── Stones ───────────────────────────────────────────────────────────────
    stones.forEach((stone) => {
      if (!stone.active) return;
      drawStone(ctx, stone.position.x, stone.position.y, stone.team, stone.rotation);
    });

    // ── Hack marker ──────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(SHEET_WIDTH / 2, HACK_Y + 8, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SHEET_WIDTH / 2, HACK_Y, 8, 0, Math.PI * 2);
    ctx.stroke();
  }, [gameState]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={SHEET_WIDTH}
      height={SHEET_HEIGHT}
      className="rounded-xl shadow-2xl"
      style={{ maxHeight: '100%', maxWidth: '100%' }}
    />
  );
}

// ─── Stone drawing helper ─────────────────────────────────────────────────────

function drawStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  team: 'player' | 'ai',
  rotation: number
) {
  const color = team === 'player' ? PLAYER_COLOR : AI_COLOR;
  const darkColor = team === 'player' ? '#0891b2' : '#be123c';

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  // Outer ring (granite)
  ctx.beginPath();
  ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, STONE_RADIUS);
  grad.addColorStop(0, '#e5e7eb');
  grad.addColorStop(0.6, '#9ca3af');
  grad.addColorStop(1, '#4b5563');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Coloured band
  ctx.beginPath();
  ctx.arc(x, y, STONE_RADIUS - 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Inner granite core
  ctx.beginPath();
  ctx.arc(x, y, STONE_RADIUS - 10, 0, Math.PI * 2);
  ctx.fillStyle = darkColor;
  ctx.fill();

  // Handle cross (rotates with stone)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(8, 0);
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 8);
  ctx.stroke();
  ctx.restore();

  // Highlight glint
  ctx.beginPath();
  ctx.arc(x - 5, y - 5, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fill();
}
