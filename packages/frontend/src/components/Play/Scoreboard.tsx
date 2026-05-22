// =============================================
// Scoreboard – displays team scores during play mode
// =============================================

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { Team } from '../../types';

interface ScoreboardProps {
  teams: Team[];
}

export default function Scoreboard({ teams }: ScoreboardProps) {
  if (teams.length === 0) return null;

  // Determine the leading team (highest score)
  const maxScore = Math.max(...teams.map((t) => t.score));
  const sortedTeams = [...teams].sort((a, b) => a.position - b.position);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 justify-center">
        {sortedTeams.map((team, index) => {
          const isLeading = team.score === maxScore && team.score > 0;

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative flex flex-col items-center gap-1
                px-4 py-3 sm:px-6 sm:py-4 rounded-xl
                glass-card min-w-[100px] sm:min-w-[120px]
                transition-all duration-500
                ${isLeading ? 'ring-2 ring-gold-400/50 shadow-glow-gold' : ''}
              `}
            >
              {/* Leading indicator */}
              {isLeading && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2.5 -right-2.5"
                >
                  <Trophy className="w-5 h-5 text-gold-400 drop-shadow-lg" />
                </motion.div>
              )}

              {/* Team color dot */}
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${team.color}cc, ${team.color})`,
                }}
              />

              {/* Team name */}
              <p className="text-[10px] sm:text-xs font-medium text-white/60
                            uppercase tracking-wider truncate max-w-[80px] sm:max-w-[100px]">
                {team.name}
              </p>

              {/* Score */}
              <motion.p
                key={team.score} // Re-mount to trigger animation on change
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className={`
                  text-lg sm:text-2xl font-extrabold tabular-nums
                  ${team.score >= 0 ? 'text-gold-300' : 'text-neon-red'}
                  ${isLeading ? 'text-gold-200' : ''}
                `}
              >
                {team.score.toLocaleString()}
              </motion.p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
