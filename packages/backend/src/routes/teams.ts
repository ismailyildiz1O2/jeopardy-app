import { Router, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { teams } from "../db/schema.js";

const router = Router();

// ─── POST /api/games/:gameId/teams ───────────────────────────────────────────
// Adds a new team to a game.
router.post(
  "/games/:gameId/teams",
  async (req: Request, res: Response) => {
    try {
      const gameId = req.params.gameId as string;
      const { name, color } = req.body;

      if (!name || !color) {
        res.status(400).json({ error: "Team name and color are required" });
        return;
      }

      // Determine position based on existing teams
      const existingTeams = await db.query.teams.findMany({
        where: eq(teams.gameId, gameId),
      });

      const position = existingTeams.length;

      const [team] = await db
        .insert(teams)
        .values({
          gameId,
          name,
          color,
          position,
        })
        .returning();

      res.status(201).json(team);
    } catch (error) {
      console.error("Error adding team:", error);
      res.status(500).json({ error: "Failed to add team" });
    }
  }
);

// ─── PUT /api/teams/:id ──────────────────────────────────────────────────────
// Updates team name and/or color.
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, color } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [updated] = await db
      .update(teams)
      .set(updateData)
      .where(eq(teams.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Failed to update team" });
  }
});

// ─── PUT /api/teams/:id/score ────────────────────────────────────────────────
// Updates team score. Accepts { score } for absolute or { delta } for relative.
router.put("/:id/score", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { score, delta } = req.body;

    let newScore: number;

    if (score !== undefined) {
      // Absolute score set
      newScore = score;
    } else if (delta !== undefined) {
      // Relative score change (add or subtract)
      const existing = await db.query.teams.findFirst({
        where: eq(teams.id, id),
      });

      if (!existing) {
        res.status(404).json({ error: "Team not found" });
        return;
      }

      newScore = (existing.score ?? 0) + delta;
    } else {
      res
        .status(400)
        .json({ error: "Provide either 'score' or 'delta'" });
      return;
    }

    const [updated] = await db
      .update(teams)
      .set({ score: newScore })
      .where(eq(teams.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ error: "Failed to update score" });
  }
});

// ─── DELETE /api/teams/:id ───────────────────────────────────────────────────
// Removes a team from the game.
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const [deleted] = await db
      .delete(teams)
      .where(eq(teams.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ error: "Failed to delete team" });
  }
});

export default router;
