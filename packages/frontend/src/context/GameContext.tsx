// =============================================
// Game Context – stores full game state and provides
// update functions synced with the backend via socket
// =============================================
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react';
import type {
  FullGame,
  Game,
  Category,
  Question,
  Team,
  GameState,
} from '../types';
import { useSocketContext } from './SocketContext';

// ─── State shape ─────────────────────────────────────

interface GameContextState {
  /** Full game data (null until loaded) */
  data: FullGame | null;
  /** Whether the initial fetch is in progress */
  loading: boolean;
  /** Error message if fetch/update failed */
  error: string | null;
}

// ─── Actions ─────────────────────────────────────────

type GameAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_GAME'; payload: FullGame }
  | { type: 'UPDATE_GAME'; payload: Partial<Game> }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'UPDATE_QUESTION'; payload: Question }
  | { type: 'LOCK_QUESTION'; payload: { questionId: string; editingBy: string } }
  | { type: 'UNLOCK_QUESTION'; payload: { questionId: string } }
  | { type: 'REVEAL_QUESTION'; payload: { questionId: string } }
  | { type: 'UPDATE_SCORE'; payload: { teamId: string; score: number } }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'REMOVE_TEAM'; payload: { teamId: string } }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameState> };

// ─── Reducer ─────────────────────────────────────────

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };

    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'SET_GAME':
      return { data: action.payload, loading: false, error: null };

    case 'UPDATE_GAME':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          game: { ...state.data.game, ...action.payload },
        },
      };

    case 'UPDATE_CATEGORY':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          categories: state.data.categories.map((c) =>
            c.id === action.payload.id ? action.payload : c
          ),
        },
      };

    case 'UPDATE_QUESTION':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          questions: state.data.questions.map((q) =>
            q.id === action.payload.id ? action.payload : q
          ),
        },
      };

    case 'LOCK_QUESTION':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          questions: state.data.questions.map((q) =>
            q.id === action.payload.questionId
              ? { ...q, editingBy: action.payload.editingBy }
              : q
          ),
        },
      };

    case 'UNLOCK_QUESTION':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          questions: state.data.questions.map((q) =>
            q.id === action.payload.questionId
              ? { ...q, editingBy: null }
              : q
          ),
        },
      };

    case 'REVEAL_QUESTION':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          questions: state.data.questions.map((q) =>
            q.id === action.payload.questionId
              ? { ...q, isRevealed: true }
              : q
          ),
          gameState: {
            ...state.data.gameState,
            revealedQuestions: [
              ...state.data.gameState.revealedQuestions,
              action.payload.questionId,
            ],
          },
        },
      };

    case 'UPDATE_SCORE':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          teams: state.data.teams.map((t) =>
            t.id === action.payload.teamId
              ? { ...t, score: action.payload.score }
              : t
          ),
        },
      };

    case 'ADD_TEAM':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          teams: [...state.data.teams, action.payload],
        },
      };

    case 'REMOVE_TEAM':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          teams: state.data.teams.filter((t) => t.id !== action.payload.teamId),
        },
      };

    case 'UPDATE_GAME_STATE':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          gameState: { ...state.data.gameState, ...action.payload },
        },
      };

    default:
      return state;
  }
}

// ─── Context value ───────────────────────────────────

interface GameContextValue {
  state: GameContextState;
  dispatch: Dispatch<GameAction>;
  /** Set full game data (after fetch) */
  setGame: (game: FullGame) => void;
  /** Get a question by its ID */
  getQuestion: (id: string) => Question | undefined;
  /** Get a category by its ID */
  getCategory: (id: string) => Category | undefined;
  /** Get questions for a specific category sorted by row */
  getQuestionsForCategory: (categoryId: string) => Question[];
}

const GameContext = createContext<GameContextValue | null>(null);

const initialState: GameContextState = {
  data: null,
  loading: false,
  error: null,
};

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { socket } = useSocketContext();

  // ─── Listen for socket events ────────────────────────

  useEffect(() => {
    function handleGameUpdated(data: FullGame) {
      dispatch({ type: 'SET_GAME', payload: data });
    }

    function handleCategoryUpdated(data: Category) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: data });
    }

    function handleQuestionUpdated(data: Question) {
      dispatch({ type: 'UPDATE_QUESTION', payload: data });
    }

    function handleQuestionLocked(data: { questionId: string; editingBy: string }) {
      dispatch({ type: 'LOCK_QUESTION', payload: data });
    }

    function handleQuestionUnlocked(data: { questionId: string }) {
      dispatch({ type: 'UNLOCK_QUESTION', payload: data });
    }

    function handleQuestionRevealed(data: { questionId: string }) {
      dispatch({ type: 'REVEAL_QUESTION', payload: data });
    }

    function handleScoreUpdated(data: { teamId: string; score: number }) {
      dispatch({ type: 'UPDATE_SCORE', payload: data });
    }

    function handleTeamAdded(data: Team) {
      dispatch({ type: 'ADD_TEAM', payload: data });
    }

    function handleTeamRemoved(data: { teamId: string }) {
      dispatch({ type: 'REMOVE_TEAM', payload: data });
    }

    function handleGameStateUpdated(data: Partial<GameState>) {
      dispatch({ type: 'UPDATE_GAME_STATE', payload: data });
    }

    socket.on('game-updated', handleGameUpdated);
    socket.on('category-updated', handleCategoryUpdated);
    socket.on('question-updated', handleQuestionUpdated);
    socket.on('question-locked', handleQuestionLocked);
    socket.on('question-unlocked', handleQuestionUnlocked);
    socket.on('question-revealed', handleQuestionRevealed);
    socket.on('score-updated', handleScoreUpdated);
    socket.on('team-added', handleTeamAdded);
    socket.on('team-removed', handleTeamRemoved);
    socket.on('game-state-updated', handleGameStateUpdated);

    return () => {
      socket.off('game-updated', handleGameUpdated);
      socket.off('category-updated', handleCategoryUpdated);
      socket.off('question-updated', handleQuestionUpdated);
      socket.off('question-locked', handleQuestionLocked);
      socket.off('question-unlocked', handleQuestionUnlocked);
      socket.off('question-revealed', handleQuestionRevealed);
      socket.off('score-updated', handleScoreUpdated);
      socket.off('team-added', handleTeamAdded);
      socket.off('team-removed', handleTeamRemoved);
      socket.off('game-state-updated', handleGameStateUpdated);
    };
  }, [socket]);

  // ─── Helper functions ────────────────────────────────

  const setGame = useCallback((game: FullGame) => {
    dispatch({ type: 'SET_GAME', payload: game });
  }, []);

  const getQuestion = useCallback(
    (id: string) => state.data?.questions.find((q) => q.id === id),
    [state.data]
  );

  const getCategory = useCallback(
    (id: string) => state.data?.categories.find((c) => c.id === id),
    [state.data]
  );

  const getQuestionsForCategory = useCallback(
    (categoryId: string) =>
      (state.data?.questions || [])
        .filter((q) => q.categoryId === categoryId)
        .sort((a, b) => a.rowIndex - b.rowIndex),
    [state.data]
  );

  const value: GameContextValue = {
    state,
    dispatch,
    setGame,
    getQuestion,
    getCategory,
    getQuestionsForCategory,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

/** Hook to access game context – throws if used outside provider */
export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
