// =============================================
// AnswerReveal – flip card animation for Q&A display
// =============================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import type { Category } from '../../types';

interface AnswerRevealProps {
  questionText: string;
  answerText: string;
  category: Category;
  points: number;
}

export default function AnswerReveal({
  questionText,
  answerText,
  category,
  points,
}: AnswerRevealProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative w-full min-h-[200px] cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front: Question */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center
                     justify-center text-center border border-white/10"
          style={{
            backfaceVisibility: 'hidden',
            background: `linear-gradient(135deg, ${category.color}30, ${category.color}10)`,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
            Question • {points} Points
          </p>
          <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {questionText || (
              <span className="text-white/30 italic">Question yok</span>
            )}
          </p>
          <p className="mt-4 text-[10px] text-white/20 flex items-center gap-1">
            <RotateCw className="w-3 h-3" />
            Çevirmek için týklayýn
          </p>
        </div>

        {/* Back: Answer */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center
                     justify-center text-center border border-gold-400/20"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${category.color}20, rgba(245,158,11,0.1))`,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-400/60 mb-1">
            Answer
          </p>
          <p className="text-lg sm:text-xl font-bold text-gold-300 leading-relaxed">
            {answerText || (
              <span className="text-white/30 italic">No answer</span>
            )}
          </p>
          <p className="mt-4 text-[10px] text-white/20 flex items-center gap-1">
            <RotateCw className="w-3 h-3" />
            Click to return to question
          </p>
        </div>
      </motion.div>
    </div>
  );
}
