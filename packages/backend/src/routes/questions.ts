import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { questions } from "../db/schema.js";

const router = Router();

// ─── PUT /api/questions/:id ──────────────────────────────────────────────────
// Updates question text, answer text, and optional media.
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { questionText, answerText, mediaUrl, mediaType } = req.body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (questionText !== undefined) updateData.questionText = questionText;
    if (answerText !== undefined) updateData.answerText = answerText;
    if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl;
    if (mediaType !== undefined) updateData.mediaType = mediaType;

    const [updated] = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Failed to update question" });
  }
});

// ─── PUT /api/questions/:id/reveal ───────────────────────────────────────────
// Toggles the revealed state of a question.
router.put("/:id/reveal", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Fetch current state
    const existing = await db.query.questions.findFirst({
      where: eq(questions.id, id),
    });

    if (!existing) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const [updated] = await db
      .update(questions)
      .set({
        isRevealed: !existing.isRevealed,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error toggling reveal:", error);
    res.status(500).json({ error: "Failed to toggle reveal" });
  }
});

export default router;
