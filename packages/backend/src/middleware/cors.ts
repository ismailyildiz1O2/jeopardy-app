import cors from "cors";
import type { RequestHandler } from "express";

/**
 * CORS middleware configured for the frontend origin.
 * Falls back to localhost:5173 if FRONTEND_URL is not set.
 */
export const corsMiddleware: RequestHandler = cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});
