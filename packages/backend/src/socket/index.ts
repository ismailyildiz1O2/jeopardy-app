import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { registerEditHandlers } from "./editHandlers.js";
import { registerPlayHandlers } from "./playHandlers.js";

/**
 * Initializes the Socket.io server, attaches it to the HTTP server,
 * and registers all event handlers.
 */
export function initializeSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Register edit-mode handlers
    registerEditHandlers(io, socket);

    // Register play-mode handlers
    registerPlayHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("[Socket] Socket.io initialized");
  return io;
}
