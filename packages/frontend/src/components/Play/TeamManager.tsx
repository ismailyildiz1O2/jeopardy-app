// =============================================
// TeamManager – add, remove, reorder teams and adjust scores
// =============================================
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  UserPlus,
  ChevronUp,
  ChevronDown,
  Users,
} from 'lucide-react';
import { TEAM_COLORS } from '../../types';
import type { Team } from '../../types';

interface TeamManagerProps {
  teams: Team[];
  gameId: string;
  onAddTeam: (name: string, color: string) => void;
  onRemoveTeam: (teamId: string) => void;
  onUpdateScore: (teamId: string, newScore: number) => void;
}

export default function TeamManager({
  teams,
  onAddTeam,
  onRemoveTeam,
  onUpdateScore,
}: TeamManagerProps) {
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(TEAM_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [customScore, setCustomScore] = useState<Record<string, string>>({});

  // Find first unused color
  const usedColors = new Set(teams.map((t) => t.color));
  const availableColors = TEAM_COLORS.filter((c) => !usedColors.has(c));

  const handleAdd = useCallback(() => {
    const name = newTeamName.trim();
    if (!name) return;
    onAddTeam(name, selectedColor);
    setNewTeamName('');
    setIsAdding(false);
    // Pick next available color
    const nextColor = availableColors.find((c) => c !== selectedColor);
    if (nextColor) setSelectedColor(nextColor);
  }, [newTeamName, selectedColor, onAddTeam, availableColors]);

  const handleScoreAdjust = useCallback(
    (team: Team, delta: number) => {
      onUpdateScore(team.id, team.score + delta);
    },
    [onUpdateScore]
  );

  const handleCustomScore = useCallback(
    (team: Team) => {
      const val = customScore[team.id];
      if (val !== undefined && val !== '') {
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          onUpdateScore(team.id, team.score + num);
        }
      }
      setCustomScore((prev) => ({ ...prev, [team.id]: '' }));
    },
    [customScore, onUpdateScore]
  );

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider
                        flex items-center gap-2">
          <Users className="w-4 h-4" />
          Takımlar
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 rounded-lg bg-neon-green/10 hover:bg-neon-green/20
                       text-neon-green transition-colors"
            title="Takım ekle"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Add team form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="space-y-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Takım adı..."
                className="input-dark text-sm"
                autoFocus
                maxLength={20}
              />

              {/* Color picker */}
              <div className="flex flex-wrap gap-2">
                {TEAM_COLORS.map((color) => {
                  const isUsed = usedColors.has(color);
                  return (
                    <button
                      key={color}
                      onClick={() => !isUsed && setSelectedColor(color)}
                      disabled={isUsed}
                      className={`
                        w-7 h-7 rounded-full transition-all duration-200
                        ${isUsed ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}
                        ${selectedColor === color && !isUsed
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-jeopardy-navy scale-110'
                          : ''
                        }
                      `}
                      style={{ background: color }}
                    />
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newTeamName.trim()}
                  className="btn-primary flex-1 text-xs py-2"
                >
                  Ekle
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewTeamName('');
                  }}
                  className="btn-ghost text-xs py-2"
                >
                  İptal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team list */}
      <div className="space-y-2">
        <AnimatePresence>
          {teams
            .sort((a, b) => a.position - b.position)
            .map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                layout
                className="flex items-center gap-2 p-2.5 rounded-lg
                           bg-white/[0.03] border border-white/5
                           hover:bg-white/[0.06] transition-colors group"
              >
                {/* Color indicator */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: team.color }}
                />

                {/* Name and score */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/80 truncate">
                    {team.name}
                  </p>
                  <p className={`text-sm font-bold tabular-nums
                    ${team.score >= 0 ? 'text-gold-400' : 'text-neon-red'}`}>
                    {team.score.toLocaleString()} puan
                  </p>
                </div>

                {/* Quick score buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleScoreAdjust(team, -100)}
                    className="p-1 rounded bg-neon-red/10 hover:bg-neon-red/20
                               text-neon-red transition-colors opacity-0
                               group-hover:opacity-100"
                    title="-100"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleScoreAdjust(team, 100)}
                    className="p-1 rounded bg-neon-green/10 hover:bg-neon-green/20
                               text-neon-green transition-colors opacity-0
                               group-hover:opacity-100"
                    title="+100"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                </div>

                {/* Custom score input */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                                transition-opacity">
                  <input
                    type="number"
                    value={customScore[team.id] || ''}
                    onChange={(e) =>
                      setCustomScore((prev) => ({
                        ...prev,
                        [team.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomScore(team)}
                    placeholder="±"
                    className="w-14 px-1.5 py-0.5 rounded bg-white/5 border border-white/10
                               text-white text-xs text-center focus:outline-none
                               focus:border-neon-blue/30"
                  />
                  <button
                    onClick={() => handleCustomScore(team)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10
                               text-white/60 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onRemoveTeam(team.id)}
                  className="p-1 rounded bg-neon-red/10 hover:bg-neon-red/20
                             text-neon-red transition-colors opacity-0
                             group-hover:opacity-100"
                  title="Takımı sil"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>

        {teams.length === 0 && (
          <p className="text-center text-xs text-white/20 py-4">
            Henüz takım eklenmedi
          </p>
        )}
      </div>
    </div>
  );
}
