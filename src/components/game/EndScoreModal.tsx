/**
 * EndScoreModal — shown after each end (when phase === 'scoring').
 * Calculates the end score live from the current stones on the sheet.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '@/types/game';
import { PLAYER_COLOR, AI_COLOR } from '@/lib/constants';
import { calculateEndScore } from '@/lib/scoring';

interface Props {
  gameState: GameState;
  onContinue: () => void;
}

export default function EndScoreModal({ gameState, onContinue }: Props) {
  const isScoring = gameState.phase === 'scoring';
  const endScore = isScoring
    ? calculateEndScore(gameState.stones, gameState.currentEnd)
    : null;

  return (
    <AnimatePresence>
      {isScoring && endScore && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-slate-900/95 border border-white/20 rounded-3xl p-8 w-80 text-center shadow-2xl"
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1">
              End {gameState.currentEnd} Result
            </div>
            <div className="text-2xl font-bold text-white mb-6">
              {endScore.scorer === 'blank'
                ? '🧊 Blank End'
                : endScore.scorer === 'player'
                ? '🎉 You Score!'
                : '🤖 CPU Scores!'}
            </div>

            <div className="flex justify-center gap-10 mb-6">
              <ScorePill
                label="You"
                color={PLAYER_COLOR}
                points={endScore.player}
                total={gameState.totalScore.player + endScore.player}
              />
              <ScorePill
                label="CPU"
                color={AI_COLOR}
                points={endScore.ai}
                total={gameState.totalScore.ai + endScore.ai}
              />
            </div>

            <motion.button
              onClick={onContinue}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-lg transition-all shadow-lg shadow-cyan-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {gameState.currentEnd >= gameState.totalEnds
                ? 'Final Score →'
                : `End ${gameState.currentEnd + 1} →`}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ScorePill({
  label,
  color,
  points,
  total,
}: {
  label: string;
  color: string;
  points: number;
  total: number;
}) {
  return (
    <div className="text-center">
      <div className="text-xs font-mono uppercase mb-1" style={{ color }}>
        {label}
      </div>
      <motion.div
        className="text-5xl font-bold tabular-nums"
        style={{ color: points > 0 ? color : 'rgba(255,255,255,0.2)' }}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        {points}
      </motion.div>
      <div className="text-xs text-white/40 mt-1">Total: {total}</div>
    </div>
  );
}
