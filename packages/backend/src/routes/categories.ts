import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { categories } from "../db/schema.js";

const router = Router();

// ─── PUT /api/categories/:id ─────────────────────────────────────────────────
// Updates category name and/or color.
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
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

export default router;
