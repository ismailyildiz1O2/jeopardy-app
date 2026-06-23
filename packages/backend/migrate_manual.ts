import "dotenv/config";
import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running manual migration...");
  try {
    await db.execute(sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;`);
    await db.execute(sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS edit_password VARCHAR(255);`);
    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
  process.exit(0);
}

main();
