// =============================================
// GameEditor – edit mode page for creating game content
// =============================================
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BoardGrid from '../components/Board/BoardGrid';
import EditPanel from '../components/Edit/EditPanel';
import Header from '../components/Layout/Header';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import * as api from '../lib/api';
import type { Question, GameMode, UpdateQuestionPayload } from '../types';

export default function GameEditor() {
  const { id: gameId } = useParams<{ id: string }>();
  const { game, loading, error } = useGame({ gameId });
  const {
    socket,
    isConnected,
    onlineCount,
    emitCategoryUpdate,
    emitQuestionUpdate,
    emitLockQuestion,
    emitUnlockQuestion,
  } = useSocket();

  // Edit panel state
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  // ─── Handlers ────────────────────────────────────────

  /** Handle clicking a cell – open the edit panel */
  const handleCellClick = useCallback((question: Question) => {
    setSelectedQuestion(question);
    setIsEditPanelOpen(true);
  }, []);

  /** Save category name update via API and broadcast */
  const handleCategoryUpdate = useCallback(
    async (categoryId: string, name: string) => {
      try {
        await api.updateCategory(categoryId, { name });
        emitCategoryUpdate(categoryId, { name });
      } catch {
        toast.error('Kategori güncellenemedi');
      }
    },
    [emitCategoryUpdate]
  );

  /** Save question update via API and broadcast */
  const handleQuestionSave = useCallback(
    async (questionId: string, data: UpdateQuestionPayload) => {
      try {
        await api.updateQuestion(questionId, data);
        emitQuestionUpdate(questionId, data);
      } catch {
        toast.error('Soru güncellenemedi');
      }
    },
    [emitQuestionUpdate]
  );

  /** Lock a question for editing */
  const handleLock = useCallback(
    (questionId: string) => {
      if (gameId) {
        emitLockQuestion(questionId, gameId);
      }
    },
    [gameId, emitLockQuestion]
  );

  /** Unlock a question */
  const handleUnlock = useCallback(
    (questionId: string) => {
      if (gameId) {
        emitUnlockQuestion(questionId, gameId);
      }
    },
    [gameId, emitUnlockQuestion]
  );

  /** Handle mode change */
  const handleModeChange = useCallback(
    async (mode: GameMode) => {
      if (!gameId) return;
      try {
        await api.updateGame(gameId, { mode });
      } catch {
        toast.error('Mod değiştirilemedi');
      }
    },
    [gameId]
  );

  /** Handle title change */
  const handleTitleChange = useCallback(
    async (title: string) => {
      if (!gameId) return;
      try {
        await api.updateGame(gameId, { title });
        toast.success('Başlık güncellendi');
      } catch {
        toast.error('Başlık güncellenemedi');
      }
    },
    [gameId]
  );

  // ─── Loading & Error States ──────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
          <p className="text-sm text-white/40">Oyun yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center max-w-md"
        >
          <p className="text-4xl mb-4">😕</p>
          <h2 className="text-lg font-bold text-white mb-2">
            Oyun Bulunamadı
          </h2>
          <p className="text-sm text-white/40 mb-4">
            {error || 'Bu oyun mevcut değil veya silinmiş olabilir.'}
          </p>
          <a href="/" className="btn-primary inline-block">
            Ana Sayfaya Dön
          </a>
        </motion.div>
      </div>
    );
  }

  // Get the selected question's category
  const selectedCategory = selectedQuestion
    ? game.categories.find((c) => c.id === selectedQuestion.categoryId)
    : null;

  const isLockedByOther =
    selectedQuestion?.editingBy !== null &&
    selectedQuestion?.editingBy !== socket.id;

  return (
    <div className="min-h-screen flex flex-col bg-jeopardy-navy">
      {/* Header */}
      <Header
        title={game.game.title}
        shareCode={game.game.shareCode}
        mode="edit"
        gameId={game.game.id}
        isConnected={isConnected}
        onlineCount={onlineCount}
        onModeChange={handleModeChange}
        onTitleChange={handleTitleChange}
      />

      {/* Board */}
      <main className="flex-1 px-2 sm:px-4 lg:px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-[1600px] mx-auto"
        >
          <BoardGrid
            mode="edit"
            categories={game.categories}
            questions={game.questions}
            onCategoryUpdate={handleCategoryUpdate}
            onCellClick={handleCellClick}
            currentUserId={socket.id}
          />
        </motion.div>
      </main>

      {/* Edit Panel */}
      {selectedQuestion && selectedCategory && (
        <EditPanel
          question={selectedQuestion}
          category={selectedCategory}
          isOpen={isEditPanelOpen}
          onClose={() => {
            setIsEditPanelOpen(false);
            setSelectedQuestion(null);
          }}
          onSave={handleQuestionSave}
          onLock={handleLock}
          onUnlock={handleUnlock}
          isLockedByOther={!!isLockedByOther}
          currentUserId={socket.id}
        />
      )}
    </div>
  );
}
