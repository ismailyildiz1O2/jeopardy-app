import { db } from "./src/db/index.js";
import { games } from "./src/db/schema.js";

async function main() {
  console.log("Deleting all games...");
  await db.delete(games);
  console.log("All games deleted!");
  process.exit(0);
}

main().catch(console.error);
