/**
 * ScoreBoard — displays current end, total scores, and per-end history.
 */

'use client';

import { motion } from 'framer-motion';
import type { GameState } from '@/types/game';
import { PLAYER_COLOR, AI_COLOR } from '@/lib/constants';

interface Props {
  gameState: GameState;
}

export default function ScoreBoard({ gameState }: Props) {
  const { currentEnd, totalEnds, totalScore, scores, stonesThrown, stonesPerTeam } = gameState;
  const totalStones = stonesPerTeam * 2;

  return (
    <div className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 opacity-80">
          Scoreboard
        </span>
        <span className="text-xs font-mono text-white/50">
          End {currentEnd}/{totalEnds} · Stone {stonesThrown}/{totalStones}
        </span>
      </div>

      {/* Total score */}
      <div className="flex items-center gap-4 mb-4">
        <TeamScore
          label="You"
          score={totalScore.player}
          color={PLAYER_COLOR}
          isLeading={totalScore.player > totalScore.ai}
        />
        <div className="text-2xl font-bold text-white/40">vs</div>
        <TeamScore
          label="CPU"
          score={totalScore.ai}
          color={AI_COLOR}
          isLeading={totalScore.ai > totalScore.player}
        />
      </div>

      {/* Per-end grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-white/40">
              <th className="text-left py-1 pr-2">END</th>
              {Array.from({ length: totalEnds }, (_, i) => (
                <th key={i} className="text-center w-6 py-1">
                  {i + 1}
                </th>
              ))}
              <th className="text-center px-2 py-1">TOT</th>
            </tr>
          </thead>
          <tbody>
            <EndRow
              label="YOU"
              color={PLAYER_COLOR}
              scores={scores}
              team="player"
              totalEnds={totalEnds}
              currentEnd={currentEnd}
              total={totalScore.player}
            />
            <EndRow
              label="CPU"
              color={AI_COLOR}
              scores={scores}
              team="ai"
              totalEnds={totalEnds}
              currentEnd={currentEnd}
              total={totalScore.ai}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── TeamScore ─────────────────────────────────────────────────────────────────

function TeamScore({
  label,
  score,
  color,
  isLeading,
}: {
  label: string;
  score: number;
  color: string;
  isLeading: boolean;
}) {
  return (
    <div className="flex-1 text-center">
      <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color }}>
        {label}
      </div>
      <motion.div
        key={score}
        initial={{ scale: 1.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-4xl font-bold tabular-nums"
        style={{ color: isLeading ? color : 'rgba(255,255,255,0.5)' }}
      >
        {score}
      </motion.div>
    </div>
  );
}

// ── EndRow ────────────────────────────────────────────────────────────────────

interface EndRowProps {
  label: string;
  color: string;
  scores: GameState['scores'];
  team: 'player' | 'ai';
  totalEnds: number;
  currentEnd: number;
  total: number;
}

function EndRow({ label, color, scores, team, totalEnds, currentEnd, total }: EndRowProps) {
  return (
    <tr>
      <td className="py-1 pr-2 font-semibold" style={{ color }}>
        {label}
      </td>
      {Array.from({ length: totalEnds }, (_, i) => {
        const endNum = i + 1;
        const endScore = scores.find((s) => s.end === endNum);
        const pts = endScore ? endScore[team] : null;
        const isActive = endNum === currentEnd && !endScore;
        return (
          <td key={i} className="text-center w-6 py-1">
            {pts !== null ? (
              <span
                className="font-bold"
                style={{ color: pts > 0 ? color : 'rgba(255,255,255,0.3)' }}
              >
                {pts}
              </span>
            ) : isActive ? (
              <span className="text-white/20 animate-pulse">·</span>
            ) : (
              <span className="text-white/20">–</span>
            )}
          </td>
        );
      })}
      <td className="text-center px-2 py-1 font-bold" style={{ color }}>
        {total}
      </td>
    </tr>
  );
}
