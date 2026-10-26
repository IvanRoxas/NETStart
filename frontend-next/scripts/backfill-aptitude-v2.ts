/**
 * Backfill & Upgrade Script: Legacy 15-Question Aptitude Results to 18-Question Schema (v2.2)
 *
 * Usage:
 *   npx tsx scripts/backfill-aptitude-v2.ts --dry-run   (Preview changes without modifying DB)
 *   npx tsx scripts/backfill-aptitude-v2.ts             (Apply updates to DB)
 */

import { PrismaClient } from "@prisma/client";
import {
  computeDeterministicOrbitAndAffinities,
  extractSubcategoriesFromUserOrResult,
  normalizePathOrder,
} from "../src/ai/pathUtils";

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("=================================================================");
  console.log("   NETStart Aptitude Diagnostic v2.2 Database Backfill Script   ");
  console.log(`   Mode: ${isDryRun ? "DRY RUN (Read-Only Preview)" : "LIVE EXECUTION (Database Update)"}`);
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

  let alreadyV2Count = 0;
  let upgradedCount = 0;
  let errorCount = 0;

  for (const user of completedUsers) {
    const apt = (user.aptitudeResult as any) || {};
    const hasSubcategories =
      apt.subcategories &&
      apt.subcategories.pattern_recognition &&
      apt.subcategories.task_decomposition &&
      apt.subcategories.web_dev &&
      apt.subcategories.cpp &&
      apt.subcategories.python &&
      apt.subcategories.java;

    const isAlreadyV2 = apt.totalQuestions === 18 && hasSubcategories;

    if (isAlreadyV2) {
      alreadyV2Count++;
      console.log(`[PASS] ${user.email} (${user.id}): Already on 18-question v2 schema.`);
      continue;
    }

    try {
      // 1. Extract 6 subcategories (0..3 each)
      const subs = extractSubcategoriesFromUserOrResult(user);

      // 2. Compute deterministic orbit, track, and planet affinities
      const deterministic = computeDeterministicOrbitAndAffinities(subs);

      // 3. Calculate totals out of 18
      const totalCorrect =
        subs.patternRecognition +
        subs.taskDecomposition +
        subs.webDev +
        subs.cpp +
        subs.python +
        subs.java;
      const totalPercent = Math.round((totalCorrect / 18) * 100);

      const patPct = Math.round(((subs.patternRecognition + subs.webDev) / 6) * 100);
      const decPct = Math.round((subs.taskDecomposition / 3) * 100);
      const logPct = Math.round(((subs.cpp + subs.python + subs.java) / 9) * 100);

      const cats = [
        { category: "pattern_recognition" as const, name: "Pattern Recognition", percent: patPct },
        { category: "task_decomposition" as const, name: "Task Decomposition", percent: decPct },
        { category: "logical_reasoning" as const, name: "Logical Reasoning", percent: logPct },
      ].sort((a, b) => b.percent - a.percent);

      const defaultPathName =
        deterministic.track === "WEB"
          ? "Fullstack Web & Distributed Systems"
          : deterministic.track === "LOGIC"
          ? "Systems Logic & Algorithmic Architecture"
          : "Balanced Systems & Interactive Web";

      const upgradedResult = {
        totalCorrect,
        totalQuestions: 18,
        totalPercent,
        categories: {
          pattern_recognition: {
            category: "pattern_recognition",
            name: "Pattern Recognition",
            correct: subs.patternRecognition + subs.webDev,
            total: 6,
            percent: patPct,
          },
          task_decomposition: {
            category: "task_decomposition",
            name: "Task Decomposition",
            correct: subs.taskDecomposition,
            total: 3,
            percent: decPct,
          },
          logical_reasoning: {
            category: "logical_reasoning",
            name: "Logical Reasoning",
            correct: subs.cpp + subs.python + subs.java,
            total: 9,
            percent: logPct,
          },
        },
        subcategories: {
          pattern_recognition: {
            id: "pattern_recognition",
            name: "Pattern Recognition",
            correct: subs.patternRecognition,
            total: 3,
            percent: Math.round((subs.patternRecognition / 3) * 100),
          },
          task_decomposition: {
            id: "task_decomposition",
            name: "Task Decomposition",
            correct: subs.taskDecomposition,
            total: 3,
            percent: Math.round((subs.taskDecomposition / 3) * 100),
          },
          web_dev: {
            id: "web_dev",
            name: "Web Development",
            correct: subs.webDev,
            total: 3,
            percent: Math.round((subs.webDev / 3) * 100),
          },
          cpp: {
            id: "cpp",
            name: "C++ Systems",
            correct: subs.cpp,
            total: 3,
            percent: Math.round((subs.cpp / 3) * 100),
          },
          python: {
            id: "python",
            name: "Python Scripting",
            correct: subs.python,
            total: 3,
            percent: Math.round((subs.python / 3) * 100),
          },
          java: {
            id: "java",
            name: "Java Enterprise",
            correct: subs.java,
            total: 3,
            percent: Math.round((subs.java / 3) * 100),
          },
        },
        strongestCategory: apt.strongestCategory || cats[0],
        weakestCategory: apt.weakestCategory || cats[cats.length - 1],
        missed: apt.missed || [],
        recommendedLearningPath: user.recommendedLearningPath || defaultPathName,
        aiInsight: apt.aiInsight || {
          summary: user.aiSummary || "Diagnostic evaluated and mapped to celestial path.",
          advice: "",
          track: deterministic.track,
          planets: deterministic.planets,
          source: "fallback",
        },
        completedAt: apt.completedAt || user.createdAt?.toISOString() || new Date().toISOString(),
      };

      if (!isDryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            aptitudeResult: upgradedResult as any,
            track: deterministic.track,
            pathOrder: normalizePathOrder(deterministic.pathOrder),
            planetReasons: deterministic.planets,
            logicScore: logPct,
            patternRecognitionScore: patPct,
            taskDecompositionScore: decPct,
            recommendedLearningPath: upgradedResult.recommendedLearningPath,
          },
        });
      }

      upgradedCount++;
      console.log(
        `[UPGRADE] ${user.email} (${user.id}):\n` +
          `  Legacy Total: ${apt.totalCorrect ?? "?"}/${apt.totalQuestions ?? 15} -> New Total: ${totalCorrect}/18 (${totalPercent}%)\n` +
          `  Track: ${deterministic.track} | Orbit: ${deterministic.pathOrder.join(" -> ")}\n` +
          `  Subcategories: PR=${subs.patternRecognition}/3, TD=${subs.taskDecomposition}/3, Web=${subs.webDev}/3, CPP=${subs.cpp}/3, PY=${subs.python}/3, Java=${subs.java}/3\n`
      );
    } catch (err: any) {
      errorCount++;
      console.error(`[ERROR] Failed to upgrade user ${user.email} (${user.id}):`, err);
    }
  }

  console.log("\n=================================================================");
  console.log("                       BACKFILL SUMMARY                          ");
  console.log("=================================================================");
  console.log(`Total Completed Users Inspected: ${completedUsers.length}`);
  console.log(`Already v2 (Skipped)           : ${alreadyV2Count}`);
  console.log(`Upgraded to v2.2 Schema        : ${upgradedCount}`);
  console.log(`Errors                         : ${errorCount}`);
  console.log(`Mode                           : ${isDryRun ? "DRY RUN (No DB changes written)" : "LIVE (Updated successfully)"}`);
  console.log("=================================================================\n");
}

main()
  .catch((e) => {
    console.error("Migration fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
