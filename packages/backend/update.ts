import { db } from "./src/db/index.js";
import { games } from "./src/db/schema.js";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Updating games to uppercase...");
  await db.execute(sql`UPDATE games SET share_code = UPPER(share_code)`);
  console.log("Updated!");
  process.exit(0);
}

main().catch(console.error);
