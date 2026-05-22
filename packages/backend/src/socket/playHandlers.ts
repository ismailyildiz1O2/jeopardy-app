import type { Server, Socket } from "socket.io";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { gameState, questions, teams } from "../db/schema.js";

// Track active timers per game so we can cancel them
const activeTimers = new Map<string, ReturnType<typeof setInterval>>();

// Track buzzer locks: gameId -> first team that buzzed
const buzzerLocks = new Map<string, string>();

/**
 * Registers all play-mode socket event handlers.
 * These control the live game flow: questions, buzzers, scoring, timers.
 */
export function registerPlayHandlers(io: Server, socket: Socket): void {
  // ─── join:play ─────────────────────────────────────────────────────
  // Join the play room for a specific game.
  socket.on("join:play", (gameId: string) => {
    const room = `play:${gameId}`;
    socket.join(room);
    console.log(`[Play] ${socket.id} joined room ${room}`);
  });

  // ─── question:open ─────────────────────────────────────────────────
  // Open a question on all connected screens.
  socket.on(
    "question:open",
    async (data: { gameId: string; questionId: string }) => {
      try {
        const { gameId, questionId } = data;

        // Update game state in DB
        await db
          .update(gameState)
          .set({
            activeQuestionId: questionId,
            status: "question_open",
            updatedAt: new Date(),
          })
          .where(eq(gameState.gameId, gameId));

        // Clear any buzzer lock for this game
        buzzerLocks.delete(gameId);

        // Broadcast to all clients in the play room (including sender)
        io.to(`play:${gameId}`).emit("question:opened", { questionId });
      } catch (error) {
        console.error("[Play] question:open error:", error);
        socket.emit("error", { message: "Failed to open question" });
      }
    }
  );

  // ─── buzzer:press ──────────────────────────────────────────────────
  // Handle buzzer press – first team to press wins.
  socket.on(
    "buzzer:press",
    async (data: { gameId: string; teamId: string }) => {
      try {
        const { gameId, teamId } = data;

        // Check if someone already buzzed in for this question
        if (buzzerLocks.has(gameId)) {
          socket.emit("buzzer:rejected", {
            message: "Another team already buzzed in",
            winningTeamId: buzzerLocks.get(gameId),
          });
          return;
        }

        // First buzz wins
        buzzerLocks.set(gameId, teamId);

        // Update active team in game state
        await db
          .update(gameState)
          .set({
            activeTeamId: teamId,
            updatedAt: new Date(),
          })
          .where(eq(gameState.gameId, gameId));

        // Broadcast to all clients
        io.to(`play:${gameId}`).emit("buzzer:winner", { teamId });
      } catch (error) {
        console.error("[Play] buzzer:press error:", error);
        socket.emit("error", { message: "Failed to process buzzer" });
      }
    }
  );

  // ─── buzzer:reset ──────────────────────────────────────────────────
  // Reset the buzzer so another team can buzz in (wrong answer scenario).
  socket.on("buzzer:reset", (data: { gameId: string }) => {
    const { gameId } = data;
    buzzerLocks.delete(gameId);
    io.to(`play:${gameId}`).emit("buzzer:cleared");
  });

  // ─── answer:reveal ─────────────────────────────────────────────────
  // Reveal the answer to the current question.
  socket.on(
    "answer:reveal",
    async (data: { gameId: string; questionId: string }) => {
      try {
        const { gameId, questionId } = data;

        // Mark question as revealed
        await db
          .update(questions)
          .set({ isRevealed: true, updatedAt: new Date() })
          .where(eq(questions.id, questionId));

        // Update game state
        const state = await db.query.gameState.findFirst({
          where: eq(gameState.gameId, gameId),
        });

        const revealed = (state?.revealedQuestions as string[]) || [];
        if (!revealed.includes(questionId)) {
          revealed.push(questionId);
        }

        await db
          .update(gameState)
          .set({
            status: "answer_reveal",
            revealedQuestions: revealed,
            updatedAt: new Date(),
          })
          .where(eq(gameState.gameId, gameId));

        // Clear buzzer lock
        buzzerLocks.delete(gameId);

        // Broadcast to all
        io.to(`play:${gameId}`).emit("answer:revealed", { questionId });
      } catch (error) {
        console.error("[Play] answer:reveal error:", error);
        socket.emit("error", { message: "Failed to reveal answer" });
      }
    }
  );

  // ─── question:close ────────────────────────────────────────────────
  // Close the current question and return to the board.
  socket.on("question:close", async (data: { gameId: string }) => {
    try {
      const { gameId } = data;

      await db
        .update(gameState)
        .set({
          activeQuestionId: null,
          activeTeamId: null,
          status: "waiting",
          updatedAt: new Date(),
        })
        .where(eq(gameState.gameId, gameId));

      // Clear buzzer and timer
      buzzerLocks.delete(gameId);
      stopTimer(gameId);

      io.to(`play:${gameId}`).emit("question:closed");
    } catch (error) {
      console.error("[Play] question:close error:", error);
      socket.emit("error", { message: "Failed to close question" });
    }
  });

  // ─── score:update ──────────────────────────────────────────────────
  // Update a team's score and broadcast the change.
  socket.on(
    "score:update",
    async (data: {
      gameId: string;
      teamId: string;
      delta?: number;
      score?: number;
    }) => {
      try {
        const { gameId, teamId, delta, score } = data;

        let newScore: number;

        if (score !== undefined) {
          newScore = score;
        } else if (delta !== undefined) {
          const team = await db.query.teams.findFirst({
            where: eq(teams.id, teamId),
          });
          newScore = (team?.score ?? 0) + delta;
        } else {
          socket.emit("error", { message: "Provide score or delta" });
          return;
        }

        const [updated] = await db
          .update(teams)
          .set({ score: newScore })
          .where(eq(teams.id, teamId))
          .returning();

        // Broadcast score change to all clients
        io.to(`play:${gameId}`).emit("score:updated", updated);
      } catch (error) {
        console.error("[Play] score:update error:", error);
        socket.emit("error", { message: "Failed to update score" });
      }
    }
  );

  // ─── timer:start ───────────────────────────────────────────────────
  // Start a countdown timer. Sends tick events every second.
  socket.on(
    "timer:start",
    (data: { gameId: string; seconds?: number }) => {
      const { gameId, seconds = 30 } = data;

      // Stop any existing timer for this game
      stopTimer(gameId);

      let remaining = seconds;

      // Emit the initial value
      io.to(`play:${gameId}`).emit("timer:tick", { remaining });

      const interval = setInterval(() => {
        remaining--;

        io.to(`play:${gameId}`).emit("timer:tick", { remaining });

        if (remaining <= 0) {
          clearInterval(interval);
          activeTimers.delete(gameId);
          io.to(`play:${gameId}`).emit("timer:ended");
        }
      }, 1000);

      activeTimers.set(gameId, interval);
    }
  );

  // ─── timer:stop ────────────────────────────────────────────────────
  // Manually stop the countdown timer.
  socket.on("timer:stop", (data: { gameId: string }) => {
    stopTimer(data.gameId);
    io.to(`play:${data.gameId}`).emit("timer:stopped");
  });

  // ─── game:reset ────────────────────────────────────────────────────
  // Reset all revealed questions and scores for a fresh round.
  socket.on("game:reset", async (data: { gameId: string }) => {
    try {
      const { gameId } = data;

      // Reset all questions to unrevealed
      await db
        .update(questions)
        .set({ isRevealed: false, updatedAt: new Date() })
        .where(eq(questions.gameId, gameId));

      // Reset all team scores
      await db
        .update(teams)
        .set({ score: 0 })
        .where(eq(teams.gameId, gameId));

      // Reset game state
      await db
        .update(gameState)
        .set({
          activeQuestionId: null,
          activeTeamId: null,
          status: "waiting",
          revealedQuestions: [],
          updatedAt: new Date(),
        })
        .where(eq(gameState.gameId, gameId));

      // Clear buzzer and timer
      buzzerLocks.delete(gameId);
      stopTimer(gameId);

      io.to(`play:${gameId}`).emit("game:resetted");
    } catch (error) {
      console.error("[Play] game:reset error:", error);
      socket.emit("error", { message: "Failed to reset game" });
    }
  });
}

/**
 * Stops the active timer for a game, if one exists.
 */
function stopTimer(gameId: string): void {
  const timer = activeTimers.get(gameId);
  if (timer) {
    clearInterval(timer);
    activeTimers.delete(gameId);
  }
}
