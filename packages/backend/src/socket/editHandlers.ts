import type { Server, Socket } from "socket.io";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { questions, categories } from "../db/schema.js";

// Track auto-unlock timers: questionId -> timeout handle
const lockTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Auto-unlock delay in ms
const LOCK_TIMEOUT_MS = 30_000;

/**
 * Registers all edit-mode socket event handlers.
 * These handle collaborative editing of the Jeopardy board.
 */
export function registerEditHandlers(io: Server, socket: Socket): void {
  // ─── join:edit ─────────────────────────────────────────────────────
  // Join the edit room for a specific game.
  socket.on("join:edit", (gameId: string) => {
    const room = `edit:${gameId}`;
    socket.join(room);
    console.log(`[Edit] ${socket.id} joined room ${room}`);
  });

  // ─── cell:lock ─────────────────────────────────────────────────────
  // Lock a question cell so others know someone is editing it.
  socket.on(
    "cell:lock",
    async (data: { questionId: string; gameId: string; user: string }) => {
      try {
        const { questionId, gameId, user } = data;

        // Update editingBy in the database
        await db
          .update(questions)
          .set({ editingBy: user })
          .where(eq(questions.id, questionId));

        // Broadcast lock to everyone else in the room
        socket.to(`edit:${gameId}`).emit("cell:locked", {
          questionId,
          user,
        });

        // Clear any existing timer for this cell
        const existingTimer = lockTimers.get(questionId);
        if (existingTimer) clearTimeout(existingTimer);

        // Auto-unlock after 30 seconds of inactivity
        const timer = setTimeout(async () => {
          try {
            await db
              .update(questions)
              .set({ editingBy: null })
              .where(eq(questions.id, questionId));

            io.to(`edit:${gameId}`).emit("cell:unlocked", { questionId });
            lockTimers.delete(questionId);
          } catch (err) {
            console.error("[Edit] Auto-unlock error:", err);
          }
        }, LOCK_TIMEOUT_MS);

        lockTimers.set(questionId, timer);
      } catch (error) {
        console.error("[Edit] cell:lock error:", error);
        socket.emit("error", { message: "Failed to lock cell" });
      }
    }
  );

  // ─── cell:unlock ───────────────────────────────────────────────────
  // Explicitly unlock a cell (user finished editing or navigated away).
  socket.on(
    "cell:unlock",
    async (data: { questionId: string; gameId: string }) => {
      try {
        const { questionId, gameId } = data;

        // Clear editingBy in the database
        await db
          .update(questions)
          .set({ editingBy: null })
          .where(eq(questions.id, questionId));

        // Clear the auto-unlock timer
        const existingTimer = lockTimers.get(questionId);
        if (existingTimer) {
          clearTimeout(existingTimer);
          lockTimers.delete(questionId);
        }

        // Broadcast unlock to the room
        socket.to(`edit:${gameId}`).emit("cell:unlocked", { questionId });
      } catch (error) {
        console.error("[Edit] cell:unlock error:", error);
        socket.emit("error", { message: "Failed to unlock cell" });
      }
    }
  );

  // ─── cell:update ───────────────────────────────────────────────────
  // Save updated cell content and broadcast to other editors.
  socket.on(
    "cell:update",
    async (data: {
      questionId: string;
      gameId: string;
      questionText?: string;
      answerText?: string;
      mediaUrl?: string | null;
      mediaType?: string | null;
    }) => {
      try {
        const { questionId, gameId, questionText, answerText, mediaUrl, mediaType } = data;

        const updateData: Record<string, unknown> = {
          updatedAt: new Date(),
        };
        if (questionText !== undefined) updateData.questionText = questionText;
        if (answerText !== undefined) updateData.answerText = answerText;
        if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl;
        if (mediaType !== undefined) updateData.mediaType = mediaType;

        const [updated] = await db
          .update(questions)
          .set(updateData)
          .where(eq(questions.id, questionId))
          .returning();

        // Broadcast the update to everyone else in the room
        socket.to(`edit:${gameId}`).emit("cell:updated", updated);
      } catch (error) {
        console.error("[Edit] cell:update error:", error);
        socket.emit("error", { message: "Failed to update cell" });
      }
    }
  );

  // ─── category:update ───────────────────────────────────────────────
  // Update category name and broadcast to the room.
  socket.on(
    "category:update",
    async (data: {
      categoryId: string;
      gameId: string;
      name?: string;
      color?: string;
    }) => {
      try {
        const { categoryId, gameId, name, color } = data;

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (color !== undefined) updateData.color = color;

        const [updated] = await db
          .update(categories)
          .set(updateData)
          .where(eq(categories.id, categoryId))
          .returning();

        // Broadcast to everyone else in the room
        socket.to(`edit:${gameId}`).emit("category:updated", updated);
      } catch (error) {
        console.error("[Edit] category:update error:", error);
        socket.emit("error", { message: "Failed to update category" });
      }
    }
  );

  // ─── Cleanup on disconnect ─────────────────────────────────────────
  // When a client disconnects, we don't need to clean up specific locks
  // because the auto-unlock timer will handle it. If we wanted to be
  // more aggressive, we could track which cells each socket locked.
}
