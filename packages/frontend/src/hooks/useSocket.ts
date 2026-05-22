// =============================================
// useSocket – convenience hook for socket operations
// =============================================
import { useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import type {
  UpdateCategoryPayload,
  UpdateQuestionPayload,
  GameState,
} from '../types';

/**
 * Provides the socket instance and typed helper functions
 * for emitting game-related events.
 */
export function useSocket() {
  const { socket, isConnected, onlineCount, joinGame, leaveGame } =
    useSocketContext();

  /** Emit a category update to all connected clients */
  const emitCategoryUpdate = useCallback(
    (categoryId: string, data: UpdateCategoryPayload) => {
      socket.emit('update-category', { categoryId, data });
    },
    [socket]
  );

  /** Emit a question update to all connected clients */
  const emitQuestionUpdate = useCallback(
    (questionId: string, data: UpdateQuestionPayload) => {
      socket.emit('update-question', { questionId, data });
    },
    [socket]
  );

  /** Lock a question (claim editing) */
  const emitLockQuestion = useCallback(
    (questionId: string, gameId: string) => {
      socket.emit('lock-question', { questionId, gameId });
    },
    [socket]
  );

  /** Unlock a question (release editing) */
  const emitUnlockQuestion = useCallback(
    (questionId: string, gameId: string) => {
      socket.emit('unlock-question', { questionId, gameId });
    },
    [socket]
  );

  /** Reveal a question (mark as answered) */
  const emitRevealQuestion = useCallback(
    (questionId: string, gameId: string) => {
      socket.emit('reveal-question', { questionId, gameId });
    },
    [socket]
  );

  /** Update a team's score */
  const emitScoreUpdate = useCallback(
    (teamId: string, score: number) => {
      socket.emit('update-score', { teamId, score });
    },
    [socket]
  );

  /** Update the game session state */
  const emitGameStateUpdate = useCallback(
    (gameId: string, state: Partial<GameState>) => {
      socket.emit('update-game-state', { gameId, state });
    },
    [socket]
  );

  return {
    socket,
    isConnected,
    onlineCount,
    joinGame,
    leaveGame,
    emitCategoryUpdate,
    emitQuestionUpdate,
    emitLockQuestion,
    emitUnlockQuestion,
    emitRevealQuestion,
    emitScoreUpdate,
    emitGameStateUpdate,
  };
}

export default useSocket;
