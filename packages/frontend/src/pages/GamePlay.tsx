// =============================================
// GamePlay – play mode page with scoring, timer, and modals
// =============================================
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BoardGrid from '../components/Board/BoardGrid';
import QuestionModal from '../components/Board/QuestionModal';
import Scoreboard from '../components/Play/Scoreboard';
import TeamManager from '../components/Play/TeamManager';
import Timer from '../components/Play/Timer';
import Header from '../components/Layout/Header';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import * as api from '../lib/api';
import type { Question, GameMode } from '../types';

export default function GamePlay() {
  const { id: gameId } = useParams<{ id: string }>();
  const { game, loading, error, refetch } = useGame({ gameId });
  const {
    socket,
    isConnected,
    onlineCount,
    emitRevealQuestion,
    emitScoreUpdate,
  } = useSocket();

  // Modal state
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sidebar toggle for mobile
  const [showSidebar, setShowSidebar] = useState(false);

  // ─── Handlers ────────────────────────────────────────

  /** Open question modal when a cell is clicked */
  const handleCellClick = useCallback((question: Question) => {
    if (question.isRevealed) return;
    setActiveQuestion(question);
    setIsModalOpen(true);
  }, []);

  /** Reveal a question (mark as answered) */
  const handleRevealQuestion = useCallback(
    (questionId: string) => {
      if (gameId) {
        emitRevealQuestion(questionId, gameId);
        // Also update via API for persistence
        api.updateQuestion(questionId, { isRevealed: true }).catch(() => {
          // Silent fail – socket event already handled it
        });
      }
    },
    [gameId, emitRevealQuestion]
  );

  /** Award/deduct points to a team */
  const handleAwardPoints = useCallback(
    (teamId: string, points: number) => {
      const team = game?.teams.find((t) => t.id === teamId);
      if (!team) return;

      const newScore = team.score + points;
      emitScoreUpdate(teamId, newScore);

      api.updateTeamScore(teamId, newScore).catch(() => {
        toast.error('Puan güncellenemedi');
      });

      toast.success(
        `${team.name}: ${points > 0 ? '+' : ''}${points} puan`,
        {
          icon: points > 0 ? '🎉' : '😔',
          style: {
            background: '#181842',
            color: '#fff',
            border: `1px solid ${team.color}40`,
          },
        }
      );
    },
    [game, emitScoreUpdate]
  );

  /** Add a team */
  const handleAddTeam = useCallback(
    async (name: string, color: string) => {
      if (!gameId) return;
      try {
        await api.addTeam(gameId, { name, color });
        refetch();
        toast.success(`${name} takımı eklendi!`);
      } catch {
        toast.error('Takım eklenemedi');
      }
    },
    [gameId, refetch]
  );

  /** Remove a team */
  const handleRemoveTeam = useCallback(
    async (teamId: string) => {
      try {
        await api.deleteTeam(teamId);
        refetch();
        toast.success('Takım silindi');
      } catch {
        toast.error('Takım silinemedi');
      }
    },
    [refetch]
  );

  /** Update team score directly */
  const handleUpdateScore = useCallback(
    (teamId: string, newScore: number) => {
      emitScoreUpdate(teamId, newScore);
      api.updateTeamScore(teamId, newScore).catch(() => {
        toast.error('Puan güncellenemedi');
      });
    },
    [emitScoreUpdate]
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

  // Get category for the active question
  const activeCategory = activeQuestion
    ? game.categories.find((c) => c.id === activeQuestion.categoryId)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-jeopardy-navy">
      {/* Header */}
      <Header
        title={game.game.title}
        shareCode={game.game.shareCode}
        mode="play"
        gameId={game.game.id}
        isConnected={isConnected}
        onlineCount={onlineCount}
        onModeChange={handleModeChange}
      />

      {/* Scoreboard */}
      <div className="px-3 sm:px-6 py-3">
        <Scoreboard teams={game.teams} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 px-2 sm:px-4 lg:px-6 pb-4">
        {/* Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <BoardGrid
            mode="play"
            categories={game.categories}
            questions={game.questions}
            onCategoryUpdate={() => {}} // No editing in play mode
            onCellClick={handleCellClick}
            currentUserId={socket.id}
          />
        </motion.div>

        {/* Sidebar: Timer + Team Manager */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full lg:w-72 xl:w-80 space-y-4"
        >
          {/* Mobile toggle for sidebar */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden w-full btn-ghost text-xs flex items-center
                       justify-center gap-2"
          >
            {showSidebar ? 'Paneli Gizle' : 'Takımlar & Zamanlayıcı'}
          </button>

          <div
            className={`space-y-4 ${
              showSidebar ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Timer */}
            <div className="glass-card p-4 flex justify-center">
              <Timer
                duration={game.game.settings?.timerSeconds || 30}
              />
            </div>

            {/* Team Manager */}
            <TeamManager
              teams={game.teams}
              gameId={game.game.id}
              onAddTeam={handleAddTeam}
              onRemoveTeam={handleRemoveTeam}
              onUpdateScore={handleUpdateScore}
            />
          </div>
        </motion.div>
      </div>

      {/* Question Modal */}
      {activeQuestion && activeCategory && (
        <QuestionModal
          question={activeQuestion}
          category={activeCategory}
          teams={game.teams}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setActiveQuestion(null);
          }}
          onReveal={handleRevealQuestion}
          onAwardPoints={handleAwardPoints}
        />
      )}
    </div>
  );
}
