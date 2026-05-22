// =============================================
// useGame – fetches game data and manages lifecycle
// =============================================
import { useEffect, useCallback, useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { useSocket } from './useSocket';
import * as api from '../lib/api';
import type { FullGame } from '../types';

interface UseGameOptions {
  /** Game ID to fetch */
  gameId?: string;
  /** Share code to look up */
  shareCode?: string;
}

interface UseGameReturn {
  /** Full game data */
  game: FullGame | null;
  /** Whether the game is being loaded */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Re-fetch game data */
  refetch: () => Promise<void>;
}

/**
 * Fetches game data on mount, joins the socket room,
 * and stores the data in GameContext.
 */
export function useGame({ gameId, shareCode }: UseGameOptions): UseGameReturn {
  const { state, setGame, dispatch } = useGameContext();
  const { joinGame, leaveGame } = useSocket();
  const [localLoading, setLocalLoading] = useState(false);

  const fetchGame = useCallback(async () => {
    if (!gameId && !shareCode) return;

    setLocalLoading(true);
    dispatch({ type: 'SET_LOADING' });

    try {
      let data: FullGame;

      if (shareCode) {
        data = await api.getGameByCode(shareCode);
      } else {
        data = await api.getGame(gameId!);
      }

      setGame(data);

      // Join the socket room for this game
      joinGame(data.game.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Oyun yüklenemedi';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      setLocalLoading(false);
    }
  }, [gameId, shareCode, setGame, joinGame, dispatch]);

  // Fetch on mount and when IDs change
  useEffect(() => {
    fetchGame();

    // Leave the socket room on unmount
    return () => {
      if (state.data?.game.id) {
        leaveGame(state.data.game.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, shareCode]);

  return {
    game: state.data,
    loading: state.loading || localLoading,
    error: state.error,
    refetch: fetchGame,
  };
}

export default useGame;
