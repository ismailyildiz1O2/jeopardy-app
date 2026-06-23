import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./src/db/index.js";
import { games, categories, questions, gameState } from "./src/db/schema.js";

async function copyGame() {
  const code = "_MVZ4Z";
  
  // 1. Find game
  console.log(`Looking for game with code ${code}...`);
  const existingGame = await db.query.games.findFirst({
    where: eq(games.shareCode, code),
    with: {
      categories: true,
      questions: true,
    }
  });

  if (!existingGame) {
    console.log("Game not found.");
    process.exit(1);
  }

  // Generate new code
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // 2. Insert new game
  console.log(`Found game! Creating copy with new code ${newCode}...`);
  const [newGame] = await db.insert(games).values({
    title: existingGame.title + " (Copy)",
    shareCode: newCode,
    mode: existingGame.mode,
    gridRows: existingGame.gridRows,
    gridCols: existingGame.gridCols,
    settings: existingGame.settings,
  }).returning();

  // Insert initial game state
  await db.insert(gameState).values({
    gameId: newGame.id,
    status: "waiting",
    timerSeconds: 30,
    revealedQuestions: [],
  });

  // 3. Copy categories
  console.log("Copying categories...");
  const newCategories = [];
  for (const cat of existingGame.categories) {
    const [newCat] = await db.insert(categories).values({
      gameId: newGame.id,
      name: cat.name,
      position: cat.position,
      color: cat.color,
    }).returning();
    newCategories.push({ oldId: cat.id, newId: newCat.id });
  }

  // 4. Copy questions
  console.log("Copying questions...");
  for (const q of existingGame.questions) {
    const newCatId = newCategories.find(c => c.oldId === q.categoryId)?.newId;
    if (!newCatId) continue;
    
    await db.insert(questions).values({
      gameId: newGame.id,
      categoryId: newCatId,
      rowIndex: q.rowIndex,
      points: q.points,
      questionText: q.questionText,
      answerText: q.answerText,
      mediaUrl: q.mediaUrl,
      mediaType: q.mediaType,
      isRevealed: false,
    });
  }

  console.log(`Game copied successfully! New code: ${newCode}`);
  process.exit(0);
}

copyGame().catch((e) => {
  console.error("Error copying game:", e);
  process.exit(1);
});
