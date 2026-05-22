// =============================================
// EditPanel – side panel / modal for editing a question
// =============================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Lock, Save, Trash2 } from 'lucide-react';
import type { Question, Category, UpdateQuestionPayload } from '../../types';

interface EditPanelProps {
  question: Question;
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionId: string, data: UpdateQuestionPayload) => void;
  onLock: (questionId: string) => void;
  onUnlock: (questionId: string) => void;
  isLockedByOther: boolean;
  currentUserId?: string;
}

export default function EditPanel({
  question,
  category,
  isOpen,
  onClose,
  onSave,
  onLock,
  onUnlock,
  isLockedByOther,
}: EditPanelProps) {
  const [questionText, setQuestionText] = useState(question.questionText);
  const [answerText, setAnswerText] = useState(question.answerText);
  const [mediaUrl, setMediaUrl] = useState(question.mediaUrl || '');
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    question.mediaType || 'image'
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLockedRef = useRef(false);

  // Sync local state when the question changes externally
  useEffect(() => {
    setQuestionText(question.questionText);
    setAnswerText(question.answerText);
    setMediaUrl(question.mediaUrl || '');
    setMediaType(question.mediaType || 'image');
  }, [question]);

  // Lock the question when panel opens, unlock on close
  useEffect(() => {
    if (isOpen && !isLockedByOther && !hasLockedRef.current) {
      onLock(question.id);
      hasLockedRef.current = true;
    }
    return () => {
      if (hasLockedRef.current) {
        onUnlock(question.id);
        hasLockedRef.current = false;
      }
    };
  }, [isOpen, question.id, onLock, onUnlock, isLockedByOther]);

  /** Debounced auto-save (500ms) */
  const debouncedSave = useCallback(
    (data: UpdateQuestionPayload) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSave(question.id, data);
      }, 500);
    },
    [question.id, onSave]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function handleQuestionChange(value: string) {
    setQuestionText(value);
    debouncedSave({ questionText: value });
  }

  function handleAnswerChange(value: string) {
    setAnswerText(value);
    debouncedSave({ answerText: value });
  }

  function handleMediaUrlChange(value: string) {
    setMediaUrl(value);
    debouncedSave({
      mediaUrl: value || null,
      mediaType: value ? mediaType : null,
    });
  }

  function handleMediaTypeChange(type: 'image' | 'video') {
    setMediaType(type);
    if (mediaUrl) {
      debouncedSave({ mediaType: type });
    }
  }

  function handleClearMedia() {
    setMediaUrl('');
    onSave(question.id, { mediaUrl: null, mediaType: null });
  }

  function handleClose() {
    // Flush any pending save
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      onSave(question.id, {
        questionText,
        answerText,
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? mediaType : null,
      });
    }
    onClose();
  }

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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50
                       w-full sm:w-96 md:w-[420px]
                       glass-modal rounded-l-2xl
                       flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4
                         border-b border-white/10"
              style={{
                background: `linear-gradient(90deg, ${category.color}20, transparent)`,
              }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {category.name}
                </p>
                <p className="text-gold-400 font-extrabold text-lg">
                  {question.points} Points
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10
                           transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Locked by other warning */}
            {isLockedByOther && (
              <div className="mx-5 mt-4 px-4 py-3 rounded-lg bg-neon-orange/10
                              border border-neon-orange/20 flex items-center gap-2">
                <Lock className="w-4 h-4 text-neon-orange flex-shrink-0" />
                <p className="text-xs text-neon-orange">
                  This question is being edited by someone else.
                </p>
              </div>
            )}

            {/* Form */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 space-y-5">
              {/* Question text */}
              <div>
                <label className="block text-xs font-semibold uppercase
                                  tracking-wider text-white/40 mb-2">
                  Soru
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  disabled={isLockedByOther}
                  placeholder="Type your question here..."
                  rows={4}
                  className="textarea-dark"
                />
                <p className="text-[10px] text-white/20 mt-1 text-right">
                  {questionText.length} karakter
                </p>
              </div>

              {/* Answer text */}
              <div>
                <label className="block text-xs font-semibold uppercase
                                  tracking-wider text-white/40 mb-2">
                  Cevap
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  disabled={isLockedByOther}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="textarea-dark"
                />
              </div>

              {/* Media section */}
              <div>
                <label className="block text-xs font-semibold uppercase
                                  tracking-wider text-white/40 mb-2">
                  <Image className="w-3 h-3 inline mr-1" />
                  Media (Optional)
                </label>

                {/* Media type toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleMediaTypeChange('image')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium
                               transition-all ${
                      mediaType === 'image'
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'bg-white/5 text-white/40 border border-white/5'
                    }`}
                  >
                    Görsel
                  </button>
                  <button
                    onClick={() => handleMediaTypeChange('video')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium
                               transition-all ${
                      mediaType === 'video'
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'bg-white/5 text-white/40 border border-white/5'
                    }`}
                  >
                    Video
                  </button>
                </div>

                {/* URL input */}
                <div className="relative">
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => handleMediaUrlChange(e.target.value)}
                    disabled={isLockedByOther}
                    placeholder="https://example.com/image.jpg"
                    className="input-dark pr-10"
                  />
                  {mediaUrl && (
                    <button
                      onClick={handleClearMedia}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-white/30 hover:text-neon-red transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Image preview */}
                {mediaUrl && mediaType === 'image' && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={mediaUrl}
                      alt="Önizleme"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 flex items-center
                            justify-between">
              <p className="text-[10px] text-white/20 flex items-center gap-1">
                <Save className="w-3 h-3" />
                Otomatik kaydedilir
              </p>
              <button onClick={handleClose} className="btn-ghost">
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
