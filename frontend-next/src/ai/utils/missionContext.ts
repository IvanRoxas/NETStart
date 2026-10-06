export interface MissionContext {
  missionId: string;
  title: string;
  goal: string;
  allowedConcepts: string[];
  expectedBehavior: string;
}

const MISSION_CONTEXTS: Record<string, MissionContext> = {
  "moon-1": {
    missionId: "moon-1",
    title: "Tutorial 1: The Assessment",
    goal: "Move the lunar rover from the landing pod to the target landing marker.",
    allowedConcepts: ["moveForward()", "turnRight()", "turnLeft()"],
    expectedBehavior: "The rover executes directional turns and forward moves to reach the destination marker without colliding with rocks.",
  },
  "moon-2": {
    missionId: "moon-2",
    title: "Tutorial 2: Mini Sorting Game",
    goal: "Sort gathered equipment items into their designated mission crates.",
    allowedConcepts: ["item categorization", "conditions", "containers"],
    expectedBehavior: "Every equipment item in the airlock is categorized and placed in the matching container crate.",
  },
  "moon-3": {
    missionId: "moon-3",
    title: "Tutorial 3: Reboot the Spaceship",
    goal: "Reboot the spaceship subsystems in the prescribed operational sequence.",
    allowedConcepts: ["boot sequence", "subsystem initialization", "prerequisites"],
    expectedBehavior: "Subsystems power on sequentially: power grid first, then navigation, fuel calibration, and engine ignition.",
  },
  "mars-1": {
    missionId: "mars-1",
    title: "Mini-Game 1A: Fix Name Billboard",
    goal: "Format billboard header and description using standard HTML tags.",
    allowedConcepts: ["<h1> through <h6>", "<p>", "closing tags"],
    expectedBehavior: "Main billboard title is formatted with <h1> and descriptive subtitle is wrapped in <p>.",
  },
  "mars-1-part2": {
    missionId: "mars-1-part2",
    title: "Mini-Game 1B: Fix Container Billboard",
    goal: "Enclose billboard elements inside a structured container.",
    allowedConcepts: ["<div>", "container grouping", "tag nesting"],
    expectedBehavior: "Heading and paragraph elements are cleanly wrapped inside an opening and closing <div> container.",
  },
  "mars-2": {
    missionId: "mars-2",
    title: "Mini-Game 2A: Fix Images Billboard",
    goal: "Display a promotional Martian landscape billboard image.",
    allowedConcepts: ["<img>", "src attribute", "alt attribute", "void element"],
    expectedBehavior: "The image is rendered via <img src='...' alt='...'> without a closing </img> tag.",
  },
  "mars-3": {
    missionId: "mars-3",
    title: "Mini-Game 3A: Final AstroLink Repair",
    goal: "Restore AstroLink communication hyperlink navigation.",
    allowedConcepts: ["<a>", "href attribute", "link text"],
    expectedBehavior: "The anchor tag is formed with <a href='...'>Link Text</a> to establish navigation.",
  },
};

export function getMissionContext(missionId: string): MissionContext {
  if (MISSION_CONTEXTS[missionId]) {
    return MISSION_CONTEXTS[missionId];
  }

  return {
    missionId,
    title: `Mission ${missionId}`,
    goal: "Complete the coding challenge according to level instructions.",
    allowedConcepts: ["programming basics"],
    expectedBehavior: "The code runs and achieves the level goal.",
  };
}
