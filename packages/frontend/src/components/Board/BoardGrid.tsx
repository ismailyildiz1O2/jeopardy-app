// =============================================
// BoardGrid – the main 7×7 Jeopardy game board
// =============================================
import { useMemo, useCallback } from 'react';
import CategoryHeader from './CategoryHeader';
import QuestionCell from './QuestionCell';
import type { Category, Question, GameMode } from '../../types';
import { POINT_VALUES } from '../../types';

interface BoardGridProps {
  mode: GameMode;
  categories: Category[];
  questions: Question[];
  onCategoryUpdate: (categoryId: string, name: string) => void;
  onCellClick: (question: Question) => void;
  currentUserId?: string;
}

export default function BoardGrid({
  mode,
  categories,
  questions,
  onCategoryUpdate,
  onCellClick,
  currentUserId,
}: BoardGridProps) {
  // Sort categories by position (columns 0-6)
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.position - b.position),
    [categories]
  );

  // Build a lookup map: categoryId -> rowIndex -> Question
  const questionMap = useMemo(() => {
    const map = new Map<string, Map<number, Question>>();
    for (const q of questions) {
      if (!map.has(q.categoryId)) {
        map.set(q.categoryId, new Map());
      }
      map.get(q.categoryId)!.set(q.rowIndex, q);
    }
    return map;
  }, [questions]);

  /** Get the question for a given category + row */
  const getQuestion = useCallback(
    (categoryId: string, rowIndex: number): Question | undefined => {
      return questionMap.get(categoryId)?.get(rowIndex);
    },
    [questionMap]
  );

  return (
    <div className="w-full">
      {/* Scroll container for mobile */}
      <div className="board-scroll-container custom-scrollbar pb-2">
        <div className="board-grid p-1">
          {/* Row 0: Category headers */}
          {sortedCategories.map((cat) => (
            <CategoryHeader
              key={cat.id}
              category={cat}
              mode={mode}
              onUpdate={(name) => onCategoryUpdate(cat.id, name)}
            />
          ))}

          {/* Rows 1-6: Question cells */}
          {POINT_VALUES.map((points, rowIndex) =>
            sortedCategories.map((cat) => {
              const question = getQuestion(cat.id, rowIndex);
              if (!question) {
                // Render an empty placeholder cell
                return (
                  <div
                    key={`empty-${cat.id}-${rowIndex}`}
                    className="board-cell bg-jeopardy-surface/30 rounded-lg
                               border border-white/5"
                  >
                    <span className="text-white/10 text-sm">{points}</span>
                  </div>
                );
              }
              return (
                <QuestionCell
                  key={question.id}
                  question={question}
                  category={cat}
                  mode={mode}
                  onClick={() => onCellClick(question)}
                  currentUserId={currentUserId}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Mobile scroll hint */}
      <div className="flex justify-center mt-2 lg:hidden">
        <p className="text-[10px] text-white/20 flex items-center gap-1">
          <span>←</span> Scroll to see all categories <span>→</span>
        </p>
      </div>
    </div>
  );
}
