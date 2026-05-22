import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

// Create the Neon HTTP SQL function
const sql = neon(process.env.DATABASE_URL!);

// Wrap with Drizzle ORM and attach schema for relational queries
export const db = drizzle(sql, { schema });
