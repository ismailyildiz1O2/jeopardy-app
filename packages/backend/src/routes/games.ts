import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { db } from "../db/index.js";
import {
  games,
  categories,
  questions,
  gameState,
  teams,
} from "../db/schema.js";

const router = Router();

// Default category colors – one per column
const DEFAULT_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // emerald
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
];

// Fixed point values per row
const POINTS_PER_ROW = [100, 200, 300, 400, 500, 600, 700];

// ─── POST /api/games ─────────────────────────────────────────────────────────
// Creates a new game with 7 categories, 42 questions, and a game_state record.
router.post("/", async (_req: Request, res: Response) => {
  try {
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
    const shareCode = nanoid();

    // 1. Create the game
    const [game] = await db
      .insert(games)
      .values({ shareCode })
      .returning();

    // 2. Create 7 default categories
    const categoryValues = Array.from({ length: 7 }, (_, i) => ({
      gameId: game.id,
      name: `Category ${i + 1}`,
      position: i,
      color: DEFAULT_COLORS[i],
    }));

    const insertedCategories = await db
      .insert(categories)
      .values(categoryValues)
      .returning();

    // 3. Create 49 questions (7 categories × 7 rows)
    const questionValues = insertedCategories.flatMap((cat) =>
      POINTS_PER_ROW.map((points, rowIdx) => ({
        categoryId: cat.id,
        gameId: game.id,
        rowIndex: rowIdx,
        points,
      }))
    );

    const insertedQuestions = await db
      .insert(questions)
      .values(questionValues)
      .returning();

    // 4. Create game state
    const [state] = await db
      .insert(gameState)
      .values({ gameId: game.id })
      .returning();

    res.status(201).json({
      game,
      categories: insertedCategories,
      questions: insertedQuestions,
      teams: [],
      gameState: state,
    });
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
});

// ─── GET /api/games/:id ──────────────────────────────────────────────────────
// Returns full game with categories, questions, teams, and state.
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const game = await db.query.games.findFirst({
      where: eq(games.id, id),
      with: {
        categories: {
          orderBy: (categories, { asc }) => [asc(categories.position)],
        },
        questions: true,
        teams: {
          orderBy: (teams, { asc }) => [asc(teams.position)],
        },
        gameState: true,
      },
    });

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    // Restructure to match FullGame type
    const { categories: cats, questions: qs, teams: ts, gameState: gs, ...gameData } = game;
    res.json({
      game: gameData,
      categories: cats,
      questions: qs,
      teams: ts,
      gameState: gs,
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// ─── GET /api/games/code/:shareCode ──────────────────────────────────────────
// Finds a game by its share code (used when joining via link/code).
router.get("/code/:shareCode", async (req: Request, res: Response) => {
  try {
    const shareCode = req.params.shareCode as string;

    const game = await db.query.games.findFirst({
      where: eq(games.shareCode, shareCode),
      with: {
        categories: {
          orderBy: (categories, { asc }) => [asc(categories.position)],
        },
        questions: true,
        teams: {
          orderBy: (teams, { asc }) => [asc(teams.position)],
        },
        gameState: true,
      },
    });

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const { categories: cats, questions: qs, teams: ts, gameState: gs, ...gameData } = game;
    res.json({
      game: gameData,
      categories: cats,
      questions: qs,
      teams: ts,
      gameState: gs,
    });
  } catch (error) {
    console.error("Error fetching game by code:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// ─── PUT /api/games/:id ──────────────────────────────────────────────────────
// Updates game title, mode, or settings.
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, mode, settings } = req.body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (mode !== undefined) updateData.mode = mode;
    if (settings !== undefined) updateData.settings = settings;

    const [updated] = await db
      .update(games)
      .set(updateData)
      .where(eq(games.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating game:", error);
    res.status(500).json({ error: "Failed to update game" });
  }
});

// ─── DELETE /api/games/:id ───────────────────────────────────────────────────
// Deletes a game and cascades to all related data.
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const [deleted] = await db
      .delete(games)
      .where(eq(games.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    res.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({ error: "Failed to delete game" });
  }
});

export default router;
