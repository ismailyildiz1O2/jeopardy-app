import { db } from "./src/db/index.js";
import { games, categories, questions } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const gameId = "39dc7313-acac-4c6f-8396-a753076409d4";
  
  const cats = await db.select().from(categories).where(eq(categories.gameId, gameId));
  const sortedCats = [...cats].sort((a, b) => a.position - b.position);
  
  const qs = await db.select().from(questions).where(eq(questions.gameId, gameId));
  
  console.log("--- QUESTIONS STATUS ---");
  for (let rowIndex = 0; rowIndex < 7; rowIndex++) {
    const points = (rowIndex + 1) * 100;
    console.log(`\nRow ${rowIndex} (${points} pt):`);
    for (const cat of sortedCats) {
      const q = qs.find(x => x.categoryId === cat.id && x.rowIndex === rowIndex);
      const hasContent = !!(q?.questionText || q?.answerText);
      console.log(`  Cat: "${cat.name}" | Edited: ${hasContent} | Q: "${q?.questionText || ''}" | A: "${q?.answerText || ''}"`);
    }
  }
  process.exit(0);
}

main().catch(console.error);
