export interface MissionContext {
  missionId: string;
  title: string;
  goal: string;
  allowedConcepts: string[];
  expectedBehavior: string;
}

const MISSION_CONTEXTS: Record<string, MissionContext> = {
  // =========================================================================
  // THE MOON (BASICS)
  // =========================================================================
  "moon-1": {
    missionId: "moon-1",
    title: "Level 1: Stellar Beginnings",
    goal: "Move the lunar rover from the landing pod to the target landing marker.",
    allowedConcepts: ["moveForward()", "turnRight()", "turnLeft()"],
    expectedBehavior: "The rover executes directional turns and forward moves to reach the destination marker without colliding with rocks.",
  },
  "moon-2": {
    missionId: "moon-2",
    title: "Level 2: Resource Classification",
    goal: "Sort gathered equipment items into their designated mission crates.",
    allowedConcepts: ["item categorization", "conditions", "containers"],
    expectedBehavior: "Every equipment item in the airlock is categorized and placed in the matching container crate.",
  },
  "moon-3": {
    missionId: "moon-3",
    title: "Level 3: The Starship Protocol",
    goal: "Reboot the spaceship subsystems in the prescribed operational sequence.",
    allowedConcepts: ["boot sequence", "subsystem initialization", "prerequisites"],
    expectedBehavior: "Subsystems power on sequentially: power grid first, then navigation, fuel calibration, and engine ignition.",
  },

  // =========================================================================
  // MARS (HTML)
  // =========================================================================
  "mars-1": {
    missionId: "mars-1",
    title: "Level 1: The Blank Billboard",
    goal: "Format billboard header and description using standard HTML tags.",
    allowedConcepts: ["<h1> through <h6>", "<p>", "closing tags"],
    expectedBehavior: "Main billboard title is formatted with <h1> and descriptive subtitle is wrapped in <p>.",
  },
  "mars-1-part2": {
    missionId: "mars-1-part2",
    title: "Level 1B: Fix Container Billboard",
    goal: "Enclose billboard elements inside a structured container.",
    allowedConcepts: ["<div>", "container grouping", "tag nesting"],
    expectedBehavior: "Heading and paragraph elements are cleanly wrapped inside an opening and closing <div> container.",
  },
  "mars-2": {
    missionId: "mars-2",
    title: "Level 2: Picture Perfect",
    goal: "Display a promotional Martian landscape billboard image.",
    allowedConcepts: ["<img>", "src attribute", "alt attribute", "void element"],
    expectedBehavior: "The image is rendered via <img src='...' alt='...'> without a closing </img> tag.",
  },
  "mars-3": {
    missionId: "mars-3",
    title: "Level 3: The Big Space Message",
    goal: "Restore AstroLink communication hyperlink navigation.",
    allowedConcepts: ["<a>", "href attribute", "link text"],
    expectedBehavior: "The anchor tag is formed with <a href='...'>Link Text</a> to establish navigation.",
  },

  // =========================================================================
  // VENUS (CSS)
  // =========================================================================
  "venus-1": {
    missionId: "venus-1",
    title: "Level 1: Color It In",
    goal: "Decorate the Venusian research lab by styling furniture items with CSS colors, borders, and styled caption banners.",
    allowedConcepts: ["color", "background-color", "border", "border-radius", "#caption banner"],
    expectedBehavior: "Spawn items are styled with proper background and text colors, rounded borders, and styled header banner.",
  },
  "venus-2": {
    missionId: "venus-2",
    title: "Level 2: Formatting the Prototype",
    goal: "Calibrate and align five prototype sensor display panels using CSS Flexbox layout.",
    allowedConcepts: ["display: flex", "justify-content", "align-items", "gap"],
    expectedBehavior: "All five prototype screens are styled with flexbox properties, aligning sensors with appropriate justification, vertical centering, and gap spacing.",
  },
  "venus-3": {
    missionId: "venus-3",
    title: "Level 3: Restoring the Dead Zones",
    goal: "Restore dead zone environments by linking external CSS stylesheets in the HTML head and styling each sector class.",
    allowedConcepts: ["<link rel='stylesheet'>", "href", "alpha.css", "beta.css", "gamma.css", "class selectors"],
    expectedBehavior: "External stylesheets are linked in the HTML head and class rules for sector-alpha, sector-beta, and sector-gamma restore environmental visuals.",
  },

  // =========================================================================
  // MERCURY (JAVASCRIPT)
  // =========================================================================
  "mercury-1": {
    missionId: "mercury-1",
    title: "Level 1: Saving the Biodome",
    goal: "Revive the Mercurian biodome greenhouse using JavaScript DOM manipulation to activate coolers and sprinklers.",
    allowedConcepts: ["document.querySelector()", "element.style.display", "classList.add()", "fertilizeStarFlower()"],
    expectedBehavior: "Cooler elements are displayed, sprinkler classes are set active, and the Star Flower is fertilized to stabilize the biodome life support.",
  },
  "mercury-2": {
    missionId: "mercury-2",
    title: "Level 2: The Conveyor Belt",
    goal: "Automate crate distribution on the planetary conveyor belt using JavaScript conditional logic.",
    allowedConcepts: ["scanCrate()", "if / else if / else", "routeToReactor()", "routeToSmelter()", "routeToWarehouse()"],
    expectedBehavior: "The scanned crate is checked against core types and routed appropriately to the reactor, smelter, or general storage warehouse.",
  },
  "mercury-3": {
    missionId: "mercury-3",
    title: "Level 3: The Missing Interface",
    goal: "Restore the AstroLink transmission terminal by combining HTML structure, CSS hover styling, and JavaScript click event listeners.",
    allowedConcepts: ["<button id='sendBtn'>", "CSS hover state", "addEventListener('click')", "transmitSignal()"],
    expectedBehavior: "An interactive button is rendered, styled with hover states, and bound to a click event listener that triggers signal transmission.",
  },

  // =========================================================================
  // JUPITER (JAVA)
  // =========================================================================
  "jupiter-1": {
    missionId: "jupiter-1",
    title: "Level 1: Unlock the Gate",
    goal: "Unlock the Jovian blast doors by declaring strongly typed Java variables and invoking the unlock action.",
    allowedConcepts: ["String", "int", "boolean", "variable initialization", "unlockGates()"],
    expectedBehavior: "Security tokens are declared with proper Java types (String code, int clearanceLevel, boolean gateOverride) and passed to unlockGates().",
  },
  "jupiter-2": {
    missionId: "jupiter-2",
    title: "Level 2: Try and Catch This!",
    goal: "Defend Jovian telemetry scanners from exception bursts using Java try/catch exception handling blocks.",
    allowedConcepts: ["try", "catch", "NullPointerException", "ArithmeticException", "NumberFormatException", "ClassCastException", "Exception"],
    expectedBehavior: "The data stream scanner is wrapped in a try block, and specific catch blocks intercept and resolve all incoming exception waves.",
  },
  "jupiter-3": {
    missionId: "jupiter-3",
    title: "Level 3: The AI Core Lockdown",
    goal: "Secure the Jovian AI Core using Java Object-Oriented Programming with encapsulated private fields, constructors, and class instantiation.",
    allowedConcepts: ["public class", "private fields", "constructor", "encapsulation", "new UserProfile()"],
    expectedBehavior: "A UserProfile class blueprint encapsulates private fields, initializes through a constructor, and is instantiated with new UserProfile().",
  },

  // =========================================================================
  // SATURN (C++)
  // =========================================================================
  "saturn-1": {
    missionId: "saturn-1",
    title: "Level 1: Surprise Diagnostics",
    goal: "Process high-speed Saturnian telemetry streams using C++ cin input, cout output, and stream loops.",
    allowedConcepts: ["int main()", "cin >>", "cout <<", "while(cin >> ...)", "return 0;"],
    expectedBehavior: "Storage buffers are declared, incoming packets are read continuously with cin >> within a loop, and diagnostic output is written to cout <<.",
  },
  "saturn-2": {
    missionId: "saturn-2",
    title: "Level 2: Jumpstarting the Rings",
    goal: "Route orbital ring debris fragments into proper processing chutes using a C++ switch-case control structure.",
    allowedConcepts: ["switch (material)", "case 'Ice'", "case 'Rock'", "case 'Metal'", "break", "default"],
    expectedBehavior: "Incoming debris material is evaluated in a switch statement, routing each type to its designated chute or activating orbital shields.",
  },
  "saturn-3": {
    missionId: "saturn-3",
    title: "Level 3: A Leak in the System!",
    goal: "Repair Saturnian reactor power routing through dynamic C++ heap memory allocation and clean deallocation without memory leaks.",
    allowedConcepts: ["EnergyCore* core = new EnergyCore()", "core->transferEnergy()", "delete core", "core = nullptr"],
    expectedBehavior: "An EnergyCore is allocated on the heap, its energy is transferred via pointer dereference, and memory is freed with delete and nullptr.",
  },

  // =========================================================================
  // EARTH (PYTHON)
  // =========================================================================
  "earth-1": {
    missionId: "earth-1",
    title: "Level 1: Fix the Master Ledger!",
    goal: "Sanitize corrupted telemetry records in the Earth Master Ledger using Python string slicing and string manipulation methods.",
    allowedConcepts: ["data[start:stop]", "string slicing", ".replace()", ".split()", "print()"],
    expectedBehavior: "Corrupted headers, noise tokens, and static delimiters are sliced or stripped out, and the clean string is printed to the ledger.",
  },
  "earth-2": {
    missionId: "earth-2",
    title: "Level 2: The Planetary Archive",
    goal: "Construct the planetary database using Python dictionaries for each planet and append them into a unified solar system master list.",
    allowedConcepts: ["dictionary {'name': ..., 'status': ...}", "list = []", "list.append()", "syncMasterArchive()"],
    expectedBehavior: "All 6 planet profile dictionaries are created with name and status in Tab 1, and appended in sequence into the master archive list in Tab 2.",
  },
  "earth-3": {
    missionId: "earth-3",
    title: "Level 3: The Master Reboot",
    goal: "Synchronize the Solar System Master Reboot by importing all planetary modules and calling their reboot procedures within an executive Python function.",
    allowedConcepts: ["import moon, mars, ...", "def reboot_planetary_network():", "module.reboot()", "function invocation"],
    expectedBehavior: "All 6 planetary modules are imported, their reboot calls are encapsulated within a defined master function, and the function is invoked to trigger the reboot.",
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
