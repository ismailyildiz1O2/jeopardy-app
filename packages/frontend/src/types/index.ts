// =============================================
// TypeScript type definitions for the Jeopardy game
// =============================================

/** Game mode – editing questions or playing the game */
export type GameMode = 'edit' | 'play';

/** Media types supported in questions */
export type MediaType = 'image' | 'video' | null;

/** Game session status during play mode */
export type GameStatus = 'idle' | 'active' | 'paused' | 'finished';

/** A Jeopardy game instance */
export interface Game {
  id: string;
  title: string;
  shareCode: string;
  mode: GameMode;
  gridRows: number;   // default 7 (point rows)
  gridCols: number;   // default 7 (categories)
  settings: GameSettings;
  createdAt: string;
  updatedAt: string;
}

/** Configurable game settings */
export interface GameSettings {
  timerSeconds: number;      // default 30
  pointValues: number[];     // [100, 200, 300, 400, 500, 600, 700]
  allowNegativeScores: boolean;
}

/** A category (column) on the board */
export interface Category {
  id: string;
  gameId: string;
  name: string;
  position: number;  // 0-6 column index
  color: string;     // hex color for the column
}

/** A question cell on the board */
export interface Question {
  id: string;
  categoryId: string;
  gameId: string;
  rowIndex: number;     // 0-5 row index (0 = 100 pts)
  points: number;       // 100, 200, 300, 400, 500, 600
  questionText: string;
  answerText: string;
  mediaUrl: string | null;
  mediaType: MediaType;
  isRevealed: boolean;  // true when answered in play mode
  editingBy: string | null;  // socket ID of user currently editing
}

/** A team participating in the game */
export interface Team {
  id: string;
  gameId: string;
  name: string;
  color: string;
  score: number;
  position: number;  // display order
}

/** Real-time game session state */
export interface GameState {
  id: string;
  gameId: string;
  activeQuestionId: string | null;
  activeTeamId: string | null;
  status: GameStatus;
  timerSeconds: number;
  revealedQuestions: string[];  // array of question IDs
}

/** Complete game data – everything needed to render the board */
export interface FullGame {
  game: Game;
  categories: Category[];
  questions: Question[];
  teams: Team[];
  gameState: GameState;
}

/** Payload for creating a new game */
export interface CreateGamePayload {
  title?: string;
}

/** Payload for updating game metadata */
export interface UpdateGamePayload {
  title?: string;
  mode?: GameMode;
  settings?: Partial<GameSettings>;
}

/** Payload for updating a category */
export interface UpdateCategoryPayload {
  name?: string;
  color?: string;
}

/** Payload for updating a question */
export interface UpdateQuestionPayload {
  questionText?: string;
  answerText?: string;
  mediaUrl?: string | null;
  mediaType?: MediaType;
  isRevealed?: boolean;
  editingBy?: string | null;
}

/** Payload for adding a team */
export interface AddTeamPayload {
  name: string;
  color: string;
}

/** Socket.io event payloads */
export interface SocketEvents {
  // Client -> Server
  'join-game': { gameId: string };
  'leave-game': { gameId: string };
  'update-category': { categoryId: string; data: UpdateCategoryPayload };
  'update-question': { questionId: string; data: UpdateQuestionPayload };
  'lock-question': { questionId: string; gameId: string };
  'unlock-question': { questionId: string; gameId: string };
  'reveal-question': { questionId: string; gameId: string };
  'update-score': { teamId: string; score: number };
  'update-game-state': { gameId: string; state: Partial<GameState> };

  // Server -> Client
  'game-updated': FullGame;
  'category-updated': Category;
  'question-updated': Question;
  'question-locked': { questionId: string; editingBy: string };
  'question-unlocked': { questionId: string };
  'question-revealed': { questionId: string };
  'score-updated': { teamId: string; score: number };
  'team-added': Team;
  'team-removed': { teamId: string };
  'game-state-updated': Partial<GameState>;
  'user-joined': { userId: string; count: number };
  'user-left': { userId: string; count: number };
}

/** Pre-defined team colors */
export const TEAM_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
] as const;

/** Pre-defined category colors */
export const CATEGORY_COLORS = [
  '#3b3bff', // royal blue
  '#7c3aed', // violet
  '#06b6d4', // cyan
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
] as const;

/** Point values for each row */
export const POINT_VALUES = [100, 200, 300, 400, 500, 600, 700] as const;
