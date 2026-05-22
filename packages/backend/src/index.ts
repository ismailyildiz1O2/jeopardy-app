import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { corsMiddleware } from "./middleware/cors.js";
import { initializeSocket } from "./socket/index.js";
import gamesRouter from "./routes/games.js";
import categoriesRouter from "./routes/categories.js";
import questionsRouter from "./routes/questions.js";
import teamsRouter from "./routes/teams.js";

// ─── Create Express App ──────────────────────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/games", gamesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/questions", questionsRouter);
// Teams router has a nested route under /api/games/:gameId/teams,
// so we mount it at /api to cover both /api/games/:gameId/teams and /api/teams/:id
app.use("/api", teamsRouter);

// ─── HTTP Server & Socket.io ─────────────────────────────────────────────────
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "3001", 10);

httpServer.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║   🎯 Jeopardy Backend Server                 ║
  ║   Running on port ${PORT}                       ║
  ║   Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}  ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
