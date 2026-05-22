// =============================================
// QuestionCell – individual question tile on the board
// =============================================

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Question, Category, GameMode } from '../../types';

interface QuestionCellProps {
  question: Question;
  category: Category;
  mode: GameMode;
  onClick: () => void;
  /** Current socket user ID, to detect if this user owns the lock */
  currentUserId?: string;
}

export default function QuestionCell({
  question,
  category,
  mode,
  onClick,
  currentUserId,
}: QuestionCellProps) {
  const isRevealed = question.isRevealed;
  const isLocked = !!question.editingBy;
  const isLockedByOther = isLocked && question.editingBy !== currentUserId;
  const hasContent = !!(question.questionText || question.answerText);

  // Opacity ramps up with point value for visual hierarchy
  const intensityMap: Record<number, string> = {
    100: '60',
    200: '70',
    300: '80',
    400: '90',
    500: 'a0',
    600: 'bb',
  };
  const intensity = intensityMap[question.points] || '80';

  function handleClick() {
    if (mode === 'play' && isRevealed) return; // Can't click revealed cells
    if (mode === 'edit' && isLockedByOther) return; // Can't edit locked cells
    onClick();
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: question.rowIndex * 0.03 + 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      onClick={handleClick}
      disabled={mode === 'play' && isRevealed}
      className={`
        board-cell group relative overflow-hidden rounded-lg
        font-bold transition-all duration-300
        ${
          isRevealed
            ? 'opacity-30 cursor-default scale-95'
            : 'hover:scale-[1.03] hover:z-10 active:scale-[0.97]'
        }
        ${isLockedByOther ? 'cursor-not-allowed ring-2 ring-neon-orange/50' : ''}
        ${!isRevealed && !isLockedByOther ? 'cursor-pointer' : ''}
      `}
      style={{
        background: isRevealed
          ? `${category.color}20`
          : `linear-gradient(
              145deg,
              ${category.color}${intensity},
              ${category.color}40
            )`,
      }}
    >
      {/* Hover glow overlay */}
      {!isRevealed && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100
                     transition-opacity duration-300 rounded-lg"
          style={{
            boxShadow: `inset 0 0 20px ${category.color}60, 0 0 15px ${category.color}30`,
          }}
        />
      )}

      {/* Top shine */}
      {!isRevealed && (
        <div
          className="absolute inset-x-0 top-0 h-1/3 opacity-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)',
          }}
        />
      )}

      {/* Point value */}
      <span
        className={`
          relative z-10 text-lg sm:text-xl md:text-2xl lg:text-3xl
          font-extrabold tracking-tight
          ${isRevealed ? 'line-through text-white/30' : 'text-gold-300'}
          transition-all duration-300
          ${!isRevealed ? 'group-hover:text-gold-200 group-hover:drop-shadow-lg' : ''}
        `}
      >
        {question.points}
      </span>

      {/* Edit mode: show content indicator */}
      {mode === 'edit' && hasContent && !isRevealed && (
        <div className="absolute bottom-1 right-1.5">
          <span className="text-[8px] text-white/40">✓</span>
        </div>
      )}

      {/* Edit mode: show empty indicator */}
      {mode === 'edit' && !hasContent && !isRevealed && (
        <div className="absolute bottom-1 right-1.5">
          <span className="text-[8px] text-white/20">○</span>
        </div>
      )}

      {/* Lock indicator when another user is editing */}
      {isLockedByOther && (
        <div className="absolute top-1 right-1">
          <Lock className="w-3 h-3 text-neon-orange" />
        </div>
      )}

      {/* Revealed overlay */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 rounded-lg
                     flex items-center justify-center"
        >
          <span className="text-2xl opacity-20">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}
