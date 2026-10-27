/**
 * NETStart Aptitude Diagnostic Schema Version Detection & Backfill Utility
 *
 * Usage:
 *   npx tsx scripts/backfill-aptitude-v2.ts          (Dry-run by default - inspects and reports versions)
 *   npx tsx scripts/backfill-aptitude-v2.ts --live   (Live execution)
 *
 * Note: Keeps idempotent and dry-run by default.
 * Detects version by totalQuestions (15, 18, 22).
 * Does NOT fabricate 22Q data for 15Q/18Q users. Legacy and 18Q users continue working
 * through the runtime compatibility path in pathUtils.ts.
 */

import { PrismaClient } from "@prisma/client";
import {
  computeDeterministicOrbitAndAffinities,
  extractSubcategoriesFromUserOrResult,
} from "../src/ai/pathUtils";

const prisma = new PrismaClient();

async function main() {
  const isLive = process.argv.includes("--live");
  const isDryRun = !isLive;

  console.log("=================================================================");
  console.log("   NETStart Aptitude Diagnostic Schema Version Inspector        ");
  console.log(`   Mode: ${isDryRun ? "DRY RUN (Read-Only Preview by Default)" : "LIVE EXECUTION"}`);
  console.log("=================================================================\n");

  const completedUsers = await prisma.user.findMany({
    where: { hasTakenAptitudeTest: true },
    select: {
      id: true,
      email: true,
      name: true,
      hasTakenAptitudeTest: true,
      logicScore: true,
      patternRecognitionScore: true,
      taskDecompositionScore: true,
      recommendedLearningPath: true,
      track: true,
      pathOrder: true,
      planetReasons: true,
      aiSummary: true,
      aptitudeResult: true,
      createdAt: true,
    },
  });

  console.log(`Found ${completedUsers.length} user(s) with completed aptitude status.\n`);

  let count22Q = 0;
  let count18Q = 0;
  let count15QLegacy = 0;
  let errorCount = 0;

  for (const user of completedUsers) {
    const apt = (user.aptitudeResult as any) || {};

    try {
      // Extract subcategories using non-clamping, backwards-compatible helper
      const subs = extractSubcategoriesFromUserOrResult(user);
      const deterministic = computeDeterministicOrbitAndAffinities(subs);

      // Detect version by totalQuestions (15, 18, 22)
      const totalQ = apt.totalQuestions ?? 15;

      if (totalQ === 22) {
        count22Q++;
        console.log(`[VERSION: 22Q] ${user.email} (${user.id}) | Current 22-question diagnostic schema.`);
      } else if (totalQ === 18) {
        count18Q++;
        console.log(
          `[VERSION: 18Q] ${user.email} (${user.id}) | 18-question v2 schema.\n` +
            `  Preserving stored percentages (${apt.totalCorrect ?? "?"}/18, ${apt.totalPercent ?? "?"}%). No 22Q data fabricated.`
        );
      } else {
        count15QLegacy++;
        console.log(
          `[VERSION: 15Q] ${user.email} (${user.id}) | Legacy 15-question schema.\n` +
            `  Scores: Logic=${user.logicScore ?? 0}%, Pattern=${user.patternRecognitionScore ?? 0}%, Decomp=${user.taskDecompositionScore ?? 0}%.\n` +
            `  Seamlessly supported via runtime compatibility path. No 22Q data fabricated.`
        );
      }
    } catch (err: any) {
      errorCount++;
      console.error(`[ERROR] Failed to inspect user ${user.email} (${user.id}):`, err);
    }
  }

  console.log("\n=================================================================");
  console.log("                    DIAGNOSTIC VERSION SUMMARY                   ");
  console.log("=================================================================");
  console.log(`Total Completed Users Inspected: ${completedUsers.length}`);
  console.log(`22-Question (v2.4) Users       : ${count22Q}`);
  console.log(`18-Question (v2.2) Users       : ${count18Q}`);
  console.log(`15-Question (Legacy) Users     : ${count15QLegacy}`);
  console.log(`Errors                         : ${errorCount}`);
  console.log(`Mode                           : ${isDryRun ? "DRY RUN (No DB changes written)" : "LIVE"}`);
  console.log("=================================================================\n");
}

main()
  .catch((e) => {
    console.error("Diagnostic inspector fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
