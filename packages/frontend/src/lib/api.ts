// =============================================
// API Client – handles all HTTP requests to the backend
// =============================================
import type {
  FullGame,
  CreateGamePayload,
  UpdateGamePayload,
  UpdateCategoryPayload,
  UpdateQuestionPayload,
  AddTeamPayload,
  Category,
  Question,
  Team,
  Game,
} from '../types';

export interface VerifyPasswordResponse {
  success: boolean;
}

/**
 * Base URL for API requests.
 * In development, Vite proxy forwards /api to localhost:3001.
 * In production, set VITE_API_URL to the backend origin.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '';

/** Generic fetch wrapper with error handling */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API Error ${response.status}: ${errorBody || response.statusText}`
    );
  }

  // Handle 204 No Content (e.g., DELETE responses)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── Game Endpoints ──────────────────────────────────

/** Create a new game with default 7×6 grid */
export function createGame(data?: CreateGamePayload): Promise<FullGame> {
  return request<FullGame>('/api/games', {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

/** Get full game data by ID */
export function getGame(id: string): Promise<FullGame> {
  return request<FullGame>(`/api/games/${id}`);
}

/** Look up a game by its share code */
export function getGameByCode(code: string): Promise<FullGame> {
  return request<FullGame>(`/api/games/code/${code}`);
}

/** Update game metadata (title, mode, settings) */
export function updateGame(
  id: string,
  data: UpdateGamePayload
): Promise<Game> {
  return request<Game>(`/api/games/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Delete a game and all associated data */
export function deleteGame(id: string): Promise<void> {
  return request<void>(`/api/games/${id}`, {
    method: 'DELETE',
  });
}

/** Verify edit password for a game */
export function verifyPassword(id: string, password: string): Promise<VerifyPasswordResponse> {
  return request<VerifyPasswordResponse>(`/api/games/${id}/verify-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

// ─── Category Endpoints ──────────────────────────────

/** Update a category name or color */
export function updateCategory(
  id: string,
  data: UpdateCategoryPayload
): Promise<Category> {
  return request<Category>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Question Endpoints ──────────────────────────────

/** Update question content, media, or reveal status */
export function updateQuestion(
  id: string,
  data: UpdateQuestionPayload
): Promise<Question> {
  return request<Question>(`/api/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Team Endpoints ──────────────────────────────────

/** Add a team to a game */
export function addTeam(
  gameId: string,
  data: AddTeamPayload
): Promise<Team> {
  return request<Team>(`/api/games/${gameId}/teams`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Update a team's score */
export function updateTeamScore(
  id: string,
  score: number
): Promise<Team> {
  return request<Team>(`/api/teams/${id}/score`, {
    method: 'PUT',
    body: JSON.stringify({ score }),
  });
}

/** Remove a team from the game */
export function deleteTeam(id: string): Promise<void> {
  return request<void>(`/api/teams/${id}`, {
    method: 'DELETE',
  });
}
