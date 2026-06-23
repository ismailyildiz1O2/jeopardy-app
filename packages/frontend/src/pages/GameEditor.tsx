// =============================================
// GameEditor – edit mode page for creating game content
// =============================================
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BoardGrid from '../components/Board/BoardGrid';
import EditPanel from '../components/Edit/EditPanel';
import SettingsSidebar from '../components/Edit/SettingsSidebar';
import Header from '../components/Layout/Header';
import { useGameContext } from '../context/GameContext';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import * as api from '../lib/api';
import type { Question, GameMode, UpdateQuestionPayload } from '../types';

export default function GameEditor() {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { game, loading, error } = useGame({ gameId });
  const { dispatch } = useGameContext();
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
  const [showSidebar, setShowSidebar] = useState(false);

  // Auth check for edit mode
  useEffect(() => {
    if (game && game.game.hasPassword) {
      const isAuthed = sessionStorage.getItem(`jeopardy_auth_${gameId}`);
      if (!isAuthed) {
        toast.error('Password required to edit. Redirected to play mode.');
        navigate(`/game/${gameId}/play`);
      }
    }
  }, [game, gameId, navigate]);

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
        const updatedCategory = await api.updateCategory(categoryId, { name });
        dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
        emitCategoryUpdate(categoryId, { name });
      } catch {
        toast.error('Failed to update category');
      }
    },
    [emitCategoryUpdate, dispatch]
  );

  /** Save question update via API and broadcast */
  const handleQuestionSave = useCallback(
    async (questionId: string, data: UpdateQuestionPayload) => {
      try {
        const updatedQuestion = await api.updateQuestion(questionId, data);
        dispatch({ type: 'UPDATE_QUESTION', payload: updatedQuestion });
        emitQuestionUpdate(questionId, data);
      } catch {
        toast.error('Failed to update question');
      }
    },
    [emitQuestionUpdate, dispatch]
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
        toast.error('Failed to change mode');
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
        toast.success('Title updated');
      } catch {
        toast.error('Failed to update title');
      }
    },
    [gameId]
  );

  const handlePublicChange = useCallback(
    (newIsPublic: boolean) => {
      // Just update local state representation if needed, 
      // Header relies on game.game.isPublic but we can let refetch handle it or just rely on API.
      // Alternatively, we dispatch an update or mutate game context.
      if (gameId) {
        dispatch({
          type: 'UPDATE_GAME_SETTINGS',
          payload: { isPublic: newIsPublic },
        });
      }
    },
    [dispatch, gameId]
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
          <p className="text-sm text-white/40">Loading game...</p>
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
            Game Not Found
          </h2>
          <p className="text-sm text-white/40 mb-4">
            {error || 'This game does not exist or has been deleted.'}
          </p>
          <a href="/" className="btn-primary inline-block">
            Go Home
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
        isPublic={game.game.isPublic}
        onPublicChange={handlePublicChange}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 px-2 sm:px-4 lg:px-6 pb-4 pt-4">
        {/* Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
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

        {/* Settings Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full lg:w-72 xl:w-80 space-y-4"
        >
          {/* Mobile toggle for sidebar */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden w-full btn-ghost text-xs flex items-center justify-center gap-2"
          >
            {showSidebar ? 'Ayarları Gizle' : 'Ayarlar'}
          </button>

          <div
            className={`h-full ${showSidebar ? 'block' : 'hidden lg:block'}`}
          >
            <SettingsSidebar
              gameId={game.game.id}
              initialIsPublic={game.game.isPublic ?? true}
              onUpdate={handlePublicChange}
            />
          </div>
        </motion.div>
      </div>

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
