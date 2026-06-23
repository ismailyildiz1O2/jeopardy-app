import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./src/db/index.js";
import { games } from "./src/db/schema.js";
import * as fs from "fs";

async function generateArtifact() {
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

  game.categories.sort((a, b) => a.position - b.position);

  let md = `# Jeopardy Oyun Yedeği - ${game.title} (Kod: ${game.shareCode})\n\n`;
  md += `Bu dosya oyununuzun tüm soru ve cevaplarını içermektedir. Gerektiğinde kopyalayıp yeni bir oyuna aktarabilmeniz için JSON formatı da en altta verilmiştir.\n\n`;
  
  md += `## Kategoriler ve Sorular\n\n`;
  
  for (const cat of game.categories) {
    md += `### 📁 Kategori: ${cat.name}\n`;
    const catQuestions = game.questions.filter(q => q.categoryId === cat.id).sort((a, b) => a.rowIndex - b.rowIndex);
    
    md += `| Puan | Soru | Cevap | Medya |\n`;
    md += `|---|---|---|---|\n`;
    
    for (const q of catQuestions) {
      md += `| ${q.points} | ${q.questionText || "-"} | ${q.answerText || "-"} | ${q.mediaUrl ? `[Link](${q.mediaUrl}) (${q.mediaType})` : "Yok"} |\n`;
    }
    md += `\n`;
  }
  
  md += `## 💾 Raw JSON (Yedek Formatı)\n`;
  md += `Aşağıdaki veriyi kopyalayarak programatik olarak tekrar veritabanına aktarabilirsiniz.\n`;
  md += "```json\n" + JSON.stringify(game, null, 2) + "\n```\n";
  
  const artifactPath = "C:\\Users\\ACER\\.gemini\\antigravity\\brain\\98295f94-90f0-4513-a083-f2e9acc8124d\\game_MVZ4Z_backup.md";
  fs.writeFileSync(artifactPath, md, "utf8");
  console.log("Artifact created at " + artifactPath);
  process.exit(0);
}

generateArtifact().catch(console.error);
