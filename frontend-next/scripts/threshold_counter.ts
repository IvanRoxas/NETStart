function runCounts() {
  let currentWeb = 0, currentLogic = 0, currentBalanced = 0;
  let thresholdWeb = 0, thresholdLogic = 0, thresholdBalanced = 0;

  for (let p = 0; p <= 5; p++) {
    for (let l = 0; l <= 5; l++) {
      for (let d = 0; d <= 5; d++) {
        // Current rule (strict > 0)
        let diff = p - l;
        if (diff > 0) currentWeb++;
        else if (diff < 0) currentLogic++;
        else currentBalanced++; // diff === 0

        // 2-point threshold rule (diff >= 2)
        if (diff >= 2) thresholdWeb++;
        else if (diff <= -2) thresholdLogic++;
        else thresholdBalanced++;
      }
    }
  }

  console.log("Total combinations:", 216);
  console.log("=== CURRENT RULE (>0) ===");
  console.log("WEB:", currentWeb);
  console.log("LOGIC:", currentLogic);
  console.log("BALANCED:", currentBalanced);

  console.log("\n=== 2-POINT THRESHOLD (>=2) ===");
  console.log("WEB:", thresholdWeb);
  console.log("LOGIC:", thresholdLogic);
  console.log("BALANCED:", thresholdBalanced);
}

runCounts();
