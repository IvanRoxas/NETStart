import { getAchievementByTrigger, ensureDefaultAchievements } from "../src/app/actions/achievements";
import { prisma } from "../src/lib/auth";

async function run() {
  console.log("=== Testing getAchievementByTrigger Lazy Seeding ===\n");

  // 1. Verify B_COMPLETE_JUPITER can be retrieved
  const achJupiter = await getAchievementByTrigger("B_COMPLETE_JUPITER");
  if (!achJupiter) {
    console.error("FAIL: B_COMPLETE_JUPITER could not be retrieved");
    process.exit(1);
  }
  console.log(`PASS: Retrieved ${achJupiter.triggerCode} -> ${achJupiter.name} (id: ${achJupiter.id})`);

  // 2. Verify B_FIRST_MISSION can be retrieved
  const achFirst = await getAchievementByTrigger("B_FIRST_MISSION");
  if (!achFirst) {
    console.error("FAIL: B_FIRST_MISSION could not be retrieved");
    process.exit(1);
  }
  console.log(`PASS: Retrieved ${achFirst.triggerCode} -> ${achFirst.name}`);

  // 3. Verify B_COMPLETE_ALL_PLANETS can be retrieved
  const achAll = await getAchievementByTrigger("B_COMPLETE_ALL_PLANETS");
  if (!achAll) {
    console.error("FAIL: B_COMPLETE_ALL_PLANETS could not be retrieved");
    process.exit(1);
  }
  console.log(`PASS: Retrieved ${achAll.triggerCode} -> ${achAll.name}`);

  // 4. Test non-existent triggerCode returns null gracefully
  const achNonExistent = await getAchievementByTrigger("B_NON_EXISTENT_TRIGGER_CODE_XYZ");
  if (achNonExistent !== null) {
    console.error("FAIL: Non-existent trigger code should return null");
    process.exit(1);
  }
  console.log("PASS: Non-existent trigger code returns null gracefully");

  console.log("\nAll getAchievementByTrigger tests PASSED successfully!");
}

run()
  .catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
