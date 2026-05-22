// =============================================
// QuestionModal – full-screen question display in play mode
// =============================================
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Plus, Minus, Award } from 'lucide-react';
import type { Question, Category, Team } from '../../types';

interface QuestionModalProps {
  question: Question;
  category: Category;
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onReveal: (questionId: string) => void;
  onAwardPoints: (teamId: string, points: number) => void;
}

export default function QuestionModal({
  question,
  category,
  teams,
  isOpen,
  onClose,
  onReveal,
  onAwardPoints,
}: QuestionModalProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const handleRevealAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleAward = useCallback(
    (teamId: string, positive: boolean) => {
      const pts = positive ? question.points : -question.points;
      onAwardPoints(teamId, pts);
    },
    [question.points, onAwardPoints]
  );

  const handleClose = useCallback(() => {
    // Mark as revealed when closing
    if (!question.isRevealed) {
      onReveal(question.id);
    }
    setShowAnswer(false);
    setSelectedTeamId(null);
    onClose();
  }, [question, onReveal, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 lg:inset-24 z-50
                       glass-modal flex flex-col overflow-hidden"
          >
            {/* Header bar */}
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10"
              style={{
                background: `linear-gradient(90deg, ${category.color}30, transparent)`,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                  style={{
                    background: `${category.color}40`,
                    color: category.color,
                  }}
                >
                  {category.name}
                </span>
                <span className="text-gold-400 font-extrabold text-lg">
                  {question.points} Puan
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10
                           transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col items-center justify-center
                            px-6 sm:px-10 py-8 overflow-y-auto custom-scrollbar">
              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center max-w-3xl w-full"
              >
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl
                              font-bold text-white leading-relaxed">
                  {question.questionText || (
                    <span className="text-white/30 italic">
                      Soru girilmemiş
                    </span>
                  )}
                </p>

                {/* Media */}
                {question.mediaUrl && question.mediaType === 'image' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex justify-center"
                  >
                    <img
                      src={question.mediaUrl}
                      alt="Soru görseli"
                      className="max-h-60 sm:max-h-80 rounded-xl border border-white/10
                                 shadow-lg object-contain"
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Answer reveal */}
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, rotateX: -90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: 90 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="mt-8 w-full max-w-3xl"
                  >
                    <div
                      className="rounded-xl p-6 text-center border border-white/10"
                      style={{
                        background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
                      }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                        Cevap
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold
                                    text-gold-300 leading-relaxed">
                        {question.answerText || (
                          <span className="text-white/30 italic">
                            Cevap girilmemiş
                          </span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reveal answer button */}
              {!showAnswer && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleRevealAnswer}
                  className="mt-8 btn-gold flex items-center gap-2 text-base"
                >
                  <Eye className="w-5 h-5" />
                  Cevabı Göster
                </motion.button>
              )}
            </div>

            {/* Team scoring footer */}
            {showAnswer && teams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-white/10 px-4 sm:px-6 py-4
                           bg-jeopardy-navy/50"
              >
                <p className="text-xs font-semibold uppercase tracking-wider
                              text-white/40 mb-3 text-center">
                  <Award className="w-3.5 h-3.5 inline mr-1" />
                  Puan Ver
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`
                        flex items-center gap-1.5 rounded-xl px-3 py-2
                        border transition-all duration-200
                        ${
                          selectedTeamId === team.id
                            ? 'border-white/30 bg-white/10 scale-105'
                            : 'border-white/5 bg-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      <button
                        onClick={() => setSelectedTeamId(team.id)}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: team.color }}
                        />
                        <span className="text-sm font-medium text-white/80 max-w-[80px] truncate">
                          {team.name}
                        </span>
                      </button>
                      <div className="flex items-center gap-0.5 ml-1">
                        <button
                          onClick={() => handleAward(team.id, true)}
                          className="p-1 rounded-md bg-neon-green/20 hover:bg-neon-green/30
                                     text-neon-green transition-colors"
                          title={`+${question.points}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAward(team.id, false)}
                          className="p-1 rounded-md bg-neon-red/20 hover:bg-neon-red/30
                                     text-neon-red transition-colors"
                          title={`-${question.points}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Close button */}
            {showAnswer && (
              <div className="px-4 sm:px-6 py-3 border-t border-white/5 flex justify-center">
                <button onClick={handleClose} className="btn-ghost">
                  Kapat
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
