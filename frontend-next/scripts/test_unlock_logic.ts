import { computeUnlockStatus } from "../src/lib/unlockLogic";

function runTest(name: string, pathOrder: string[], missions: { missionId: string, status: string }[], expectedStatuses: string[]) {
  console.log(`\n--- Test: ${name} ---`);
  const result = computeUnlockStatus(pathOrder, missions);
  console.log("Expected:", expectedStatuses);
  console.log("Got:     ", result.statuses);
  
  if (JSON.stringify(result.statuses) === JSON.stringify(expectedStatuses)) {
    console.log("✅ PASSED");
  } else {
    console.log("❌ FAILED");
    process.exit(1);
  }
}

const defaultPath = ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"];

// (a) Unlock override with a started planet at the last position
runTest(
  "Unlock override with started planet at the last position",
  defaultPath,
  [
    { missionId: "moon-1", status: "COMPLETED" },
    { missionId: "moon-2", status: "COMPLETED" },
    { missionId: "moon-3", status: "COMPLETED" }, // MOON completed (0) -> unlocks MARS (1)
    { missionId: "python-1", status: "IN_PROGRESS" } // EARTH started (6)
  ],
  ["COMPLETED", "CURRENT", "LOCKED", "LOCKED", "LOCKED", "LOCKED", "CURRENT"]
);

// (b) Completed planet behind an incomplete one stays unlocked
runTest(
  "Completed planet behind an incomplete one stays unlocked (out of sequence completion)",
  defaultPath,
  [
    { missionId: "moon-3", status: "COMPLETED" }, // Unlocks MARS
    { missionId: "venus-1", status: "COMPLETED" }, 
    { missionId: "css-2", status: "COMPLETED" },
    { missionId: "css-3-venus", status: "COMPLETED" } // VENUS completed out of order
  ],
  ["COMPLETED", "CURRENT", "COMPLETED", "LOCKED", "LOCKED", "LOCKED", "LOCKED"]
);

// (c) Both mission ID styles map to the right planet (e.g. mars-1 vs html-3-mars)
runTest(
  "Mission ID styles mapping",
  defaultPath,
  [
    { missionId: "moon-3", status: "COMPLETED" },
    { missionId: "html-3-mars", status: "COMPLETED" }, // MARS final
  ],
  ["COMPLETED", "COMPLETED", "CURRENT", "LOCKED", "LOCKED", "LOCKED", "LOCKED"]
);

// (d) Unmapped mission ID doesn't crash
runTest(
  "Unmapped mission ID",
  defaultPath,
  [
    { missionId: "moon-3", status: "COMPLETED" },
    { missionId: "unknown-mission-99", status: "COMPLETED" }, // ignored
    { missionId: "daily-mission-2", status: "COMPLETED" } // ignored
  ],
  ["COMPLETED", "CURRENT", "LOCKED", "LOCKED", "LOCKED", "LOCKED", "LOCKED"]
);

console.log("\nALL TESTS PASSED.");
