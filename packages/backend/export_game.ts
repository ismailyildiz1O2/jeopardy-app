import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./src/db/index.js";
import { games } from "./src/db/schema.js";

async function exportGame() {
  const code = "_MVZ4Z";
  
  const game = await db.query.games.findFirst({
    where: eq(games.shareCode, code),
    with: {
      categories: true,
      questions: true,
    }
  });

  if (!game) {
    console.error("Game not found.");
    process.exit(1);
  }

  // Sort categories by position
  game.categories.sort((a, b) => a.position - b.position);

  console.log(JSON.stringify(game, null, 2));
  process.exit(0);
}

exportGame().catch(console.error);
