import cors from "cors";
import type { RequestHandler } from "express";

/**
 * CORS middleware configured for the frontend origin.
 * Accepts the FRONTEND_URL, any Vercel preview URL for this project,
 * and localhost for development.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
];

export const corsMiddleware: RequestHandler = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check explicit list
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow any Vercel deployment for this project
    if (origin.includes("vercel.app")) return callback(null, true);

    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});
