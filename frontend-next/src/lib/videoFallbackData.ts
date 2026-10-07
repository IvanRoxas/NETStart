/**
 * Video Fallback Registry & YouTube Integration
 * 
 * Provides curated educational tutorial videos for each mission/planet concept.
 * Used when students encounter 5 failed attempts on a challenge, and as an
 * automatic fallback when the YouTube Data API key is missing or quota is exhausted.
 */

export interface EducationalVideoInfo {
  missionId: string;
  planet: string;
  title: string;
  concept: string;
  description: string;
  searchQuery: string;
  youtubeVideoId: string;
  embedUrl: string;
  keyTips: string[];
}

export const CURATED_VIDEO_REGISTRY: Record<string, EducationalVideoInfo> = {
  

  // ==========================================
  // Mars (HTML Fundamentals)
  // ==========================================
  "mars-1": {
    missionId: "mars-1",
    planet: "Mars",
    title: "Learn HTML text formatting in 3 minutes! 💬",
    concept: "HTML Structure, Headings & Text Formatting",
    description: "Learn the foundational building blocks of the web: semantic HTML headings (h1-h6), paragraphs, and structuring content on screen.",
    searchQuery: "html headings and paragraphs beginner tutorial",
    youtubeVideoId: "urT4pdM3sr4",
    embedUrl: "https://www.youtube.com/embed/urT4pdM3sr4",
    keyTips: [
      "Use <h1> for your main billboard headline and <p> for descriptive body text.",
      "Ensure all opening tags have matching closing tags (e.g. <h1>...</h1>).",
      "Nest your text blocks neatly inside the main container."
    ]
  },
  "mars-2": {
    missionId: "mars-2",
    planet: "Mars",
    title: "Learn HTML images in 6 minutes! 🖼️",
    concept: "Images & Attribute Configuration",
    description: "Understand how HTML elements use attributes like 'src' and 'alt' to embed visual media, and 'href' to link pages together.",
    searchQuery: "html images and links tutorial beginners",
    youtubeVideoId: "sm5hTFzSs5Y",
    embedUrl: "https://www.youtube.com/embed/sm5hTFzSs5Y",
    keyTips: [
      "The <img> tag uses the 'src' attribute to define the image source location.",
      "Always supply descriptive 'alt' text for accessibility.",
      "Verify that attribute values are properly quoted."
    ]
  },
  "mars-3": {
    missionId: "mars-3",
    planet: "Mars",
    title: "Learn HTML buttons in 5 minutes! 🔘",
    concept: "Interactive HTML Forms & User Input",
    description: "Build interactive web interfaces with forms, text input boxes, dropdown selectors, and submission buttons.",
    searchQuery: "html forms and inputs tutorial beginners",
    youtubeVideoId: "tDqTXipQmBU",
    embedUrl: "https://www.youtube.com/embed/tDqTXipQmBU",
    keyTips: [
      "Wrap interactive fields inside a <form> container element.",
      "Use <input type='text'> for typing and <select> for dropdown options.",
      "Add a clickable <button> so users can send or submit their messages."
    ]
  },

  // ==========================================
  // Venus (CSS Styling & Layouts)
  // ==========================================
  "venus-1": {
    missionId: "venus-1",
    planet: "Venus",
    title: "Learn CSS colors in 4 minutes! 🖌️",
    concept: "CSS Styling & Selectors",
    description: "Discover how CSS brings color and life to HTML elements using class selectors, background colors, borders, and typography.",
    searchQuery: "css basics selectors colors borders tutorial",
    youtubeVideoId: "LwbKb2J8iy8",
    embedUrl: "https://www.youtube.com/embed/LwbKb2J8iy8",
    keyTips: [
      "Target elements accurately with selectors (tags, classes, or IDs).",
      "Apply vibrant background colors and contrasting text colors.",
      "Use border and border-radius properties to give UI elements polished edges."
    ]
  },
  "venus-2": {
    missionId: "venus-2",
    planet: "Venus",
    title: "Learn CSS margins in 5 minutes! ↔️",
    concept: "Flexbox Layouts & Alignment",
    description: "Learn how CSS Flexbox easily aligns, centers, and spaces items across rows and columns without messy floats or margins.",
    searchQuery: "css flexbox alignment tutorial fireship",
    youtubeVideoId: "rBWA_t-KnKk",
    embedUrl: "https://www.youtube.com/embed/rBWA_t-KnKk",
    keyTips: [
      "Set 'display: flex' on the container to enable flexible box formatting.",
      "Use 'justify-content' to control alignment along the main axis.",
      "Use 'align-items' to center or align items along the cross axis."
    ]
  },
  "venus-3": {
    missionId: "venus-3",
    planet: "Venus",
    title: "HTML & CSS Full Course for free 🌎",
    concept: "Responsive CSS & Modular Themes",
    description: "Understand how to link CSS stylesheets, structure multi-sector design themes, and create cohesive visual palettes across complex pages.",
    searchQuery: "responsive web design css layouts tutorial",
    youtubeVideoId: "HGTJBPNC-Gw",
    embedUrl: "https://www.youtube.com/embed/HGTJBPNC-Gw",
    keyTips: [
      "Link your external stylesheet to the HTML document head.",
      "Apply consistent sector color variables across all panels.",
      "Ensure container widths and margins adapt cleanly without overflow."
    ]
  },

  // ==========================================
  // Mercury (JavaScript Programming)
  // ==========================================
  "mercury-1": {
    missionId: "mercury-1",
    planet: "Mercury",
    title: "The JavaScript DOM explained in 5 minutes! 🌳",
    concept: "JavaScript Variables & Types",
    description: "Explore the core fundamentals of JavaScript: declaring variables with let/const, working with Numbers, Strings, and Booleans, and performing arithmetic.",
    searchQuery: "javascript variables and data types beginners bro code",
    youtubeVideoId: "NO5kUNxGIu0",
    embedUrl: "https://www.youtube.com/embed/NO5kUNxGIu0",
    keyTips: [
      "Use 'let' for values that change and 'const' for constants.",
      "Remember that numbers are numeric (e.g. 25) while strings have quotes ('25').",
      "Double check variable names for exact spelling and casing (camelCase)."
    ]
  },
  "mercury-2": {
    missionId: "mercury-2",
    planet: "Mercury",
    title: "If statements in JavaScript are easy 🤔",
    concept: "Functions & Conditional Logic",
    description: "Learn how to write reusable JavaScript functions, pass parameters, return values, and route items using if-else logic trees.",
    searchQuery: "javascript functions tutorial beginners web dev simplified",
    youtubeVideoId: "PgUXiprlg1k",
    embedUrl: "https://www.youtube.com/embed/PgUXiprlg1k",
    keyTips: [
      "Functions wrap repeatable instructions so you can call them anywhere.",
      "Use parameters to accept inputs and 'return' to output results.",
      "Test each branch of your if/else statement to ensure all cases are handled."
    ]
  },
  "mercury-3": {
    missionId: "mercury-3",
    planet: "Mercury",
    title: "JavaScript DOM Manipulation – Full Course for Beginners",
    concept: "DOM Manipulation & Event Listeners",
    description: "Master interactive web development! See how JavaScript listens for click events, reads user input from the DOM, and updates page content dynamically.",
    searchQuery: "javascript dom manipulation crash course freecodecamp",
    youtubeVideoId: "5fb2aPlgoys",
    embedUrl: "https://www.youtube.com/embed/5fb2aPlgoys",
    keyTips: [
      "Use document.querySelector or getElementById to select page elements.",
      "Attach 'addEventListener' to listen for user clicks or keystrokes.",
      "Update textContent or innerHTML to reflect changes immediately on screen."
    ]
  },

  // ==========================================
  // Jupiter (Java Programming)
  // ==========================================
  "jupiter-1": {
    missionId: "jupiter-1",
    planet: "Jupiter",
    title: "Java variables are easy! ❎",
    concept: "Java Syntax & Strongly-Typed Variables",
    description: "Get started with Java: understand static typing (int, double, String, boolean), declaring variables, and writing logic control expressions.",
    searchQuery: "java tutorial for beginners programming with mosh",
    youtubeVideoId: "TGVLmr194DI",
    embedUrl: "https://www.youtube.com/embed/TGVLmr194DI",
    keyTips: [
      "Every variable in Java must have an explicit type (e.g. int, String, boolean).",
      "Always end Java code statements with a semicolon (;).",
      "Use comparison operators (==, !=, >, <) for checking security clearance."
    ]
  },
  "jupiter-2": {
    missionId: "jupiter-2",
    planet: "Jupiter",
    title: "Learn EXCEPTION HANDLING in 8 minutes! ⚠️",
    concept: "Exception Handling with Try-Catch",
    description: "Learn how Java intercepts runtime errors using try-catch blocks to keep critical space defense servers from crashing.",
    searchQuery: "java exceptions try catch tutorial bro code",
    youtubeVideoId: "u1PROb-aRUI",
    embedUrl: "https://www.youtube.com/embed/u1PROb-aRUI",
    keyTips: [
      "Place code that might crash inside the 'try { ... }' block.",
      "Catch errors in 'catch (Exception e) { ... }' to handle the threat safely.",
      "Ensure an action block is inside the catch block to intercept the corruption."
    ]
  },
  "jupiter-3": {
    missionId: "jupiter-3",
    planet: "Jupiter",
    title: "Learn Java Object Oriented Programming in 10 minutes! 🧱",
    concept: "Classes, Objects & Encapsulation",
    description: "Master Object-Oriented Programming! Learn how blueprints (Classes) define attributes and methods, and how 'new' creates concrete Object instances.",
    searchQuery: "java object oriented programming oop bro code",
    youtubeVideoId: "DYbi93vuSaU",
    embedUrl: "https://www.youtube.com/embed/DYbi93vuSaU",
    keyTips: [
      "A Class acts as a blueprint for objects (e.g. SecurityBadge).",
      "Instantiate objects with the 'new' keyword before accessing their methods.",
      "Encapsulate private fields with public getter and setter methods."
    ]
  },

  // ==========================================
  // Saturn (C++ Programming)
  // ==========================================
  "saturn-1": {
    missionId: "saturn-1",
    planet: "Saturn",
    title: "How to accept user input in C++? ⌨️",
    concept: "C++ Standard I/O & Pipeline Streaming",
    description: "Understand C++ data streaming using std::cout and std::cin, formatting streams, and calculating system telemetry values.",
    searchQuery: "c++ tutorial for beginners freecodecamp cin cout",
    youtubeVideoId: "imiIhu9u670",
    embedUrl: "https://www.youtube.com/embed/imiIhu9u670",
    keyTips: [
      "Use 'std::cout <<' to send data to the terminal or diagnostic output.",
      "Use 'std::cin >>' to read incoming sensor data streams.",
      "Include <iostream> and ensure correct namespace scoping."
    ]
  },
  "saturn-2": {
    missionId: "saturn-2",
    planet: "Saturn",
    title: "What is a switch? 🔀",
    concept: "Loops, Arrays & Iteration Control",
    description: "Learn how C++ loops iterate over data collections, sort asteroid debris, and automate ring tractor beam systems.",
    searchQuery: "c++ loops while for loops caleb curry tutorial",
    youtubeVideoId: "Bx9b12FCF5o",
    embedUrl: "https://www.youtube.com/embed/Bx9b12FCF5o",
    keyTips: [
      "Use a 'for' loop when the exact count of debris items is known.",
      "Use a 'while' loop to continue processing until the ring is cleared.",
      "Ensure loop increment statements execute to prevent infinite loops."
    ]
  },
  "saturn-3": {
    missionId: "saturn-3",
    planet: "Saturn",
    title: "C++ pointers explained easy 👈",
    concept: "Pointers, References & Memory Deallocation",
    description: "Demystify C++ pointers! Understand memory addresses, dereferencing with *, allocating with 'new', and avoiding memory leaks with 'delete'.",
    searchQuery: "pointers in c++ the cherno memory tutorial",
    youtubeVideoId: "slzcWKWCMBg",
    embedUrl: "https://www.youtube.com/embed/slzcWKWCMBg",
    keyTips: [
      "Pointers store memory addresses using the address-of operator (&).",
      "Dereference pointers with '*' to read or modify the pointed-to value.",
      "Crucial rule: Every allocated 'new' MUST be paired with 'delete' to prevent leaks!"
    ]
  },

  // ==========================================
  // Earth (Python Programming)
  // ==========================================
  "earth-1": {
    missionId: "earth-1",
    planet: "Earth",
    title: "String methods in Python are easy! 〰️",
    concept: "Python Syntax & String Manipulation",
    description: "Learn Python's clean syntax, whitespace indentation rules, and powerful string slicing tools to restore scrambled data records.",
    searchQuery: "python for beginners programming with mosh string slicing",
    youtubeVideoId: "tb6EYiHtcXU",
    embedUrl: "https://www.youtube.com/embed/tb6EYiHtcXU",
    keyTips: [
      "Python relies on strict 4-space indentation instead of curly braces.",
      "Use slice notation string[start:stop] to extract clean words.",
      "Use string methods like .strip() and .upper() to sanitize messy inputs."
    ]
  },
  "earth-2": {
    missionId: "earth-2",
    planet: "Earth",
    title: "Python lists, sets, and tuples explained 🍍",
    concept: "Lists, Dictionaries & Collections",
    description: "Master Python data structures! Store ordered lists of planetary data, map key-value pairs with dictionaries, and sort loose files.",
    searchQuery: "python dictionaries and lists tutorial corey schafer",
    youtubeVideoId: "gOMW_n2-2Mw",
    embedUrl: "https://www.youtube.com/embed/gOMW_n2-2Mw",
    keyTips: [
      "Use square brackets [] for ordered Lists and curly braces {} for Dictionaries.",
      "Access dictionary records by key: record['planet'] or record.get('name').",
      "Iterate through collections cleanly using 'for item in dataset:'."
    ]
  },
  "earth-3": {
    missionId: "earth-3",
    planet: "Earth",
    title: "Python Functions, Modules & System Integration",
    concept: "Functions, Modules & Modular Architecture",
    description: "Bring everything together! Learn how to define Python functions (def), import external modules, and execute the final solar system master reboot.",
    searchQuery: "python functions how to define and call corey schafer",
    youtubeVideoId: "9Os0o3wzS_I",
    embedUrl: "https://www.youtube.com/embed/9Os0o3wzS_I",
    keyTips: [
      "Define modular functions with 'def function_name(params):'.",
      "Import modules at the top of your program before calling their subroutines.",
      "Nest your pipeline routines inside the master_reboot() controller."
    ]
  }
};

/**
 * Normalizes any mission identifier variation into a canonical registry key.
 * Handles aliases such as "html-1-mars", "css-2", "js-3", "cpp-1", etc.
 */
export function normalizeVideoMissionId(missionId: string): string {
  if (!missionId) return "moon-1";
  const id = missionId.toLowerCase().trim();

  // Exact match
  if (CURATED_VIDEO_REGISTRY[id]) return id;

  // Moon aliases
  if (id === "1" || id === "level-1" || id.includes("moon-1") || id === "moon1") return "moon-1";
  if (id === "2" || id === "level-2" || id.includes("moon-2") || id === "moon2") return "moon-2";
  if (id === "3" || id === "level-3" || id.includes("moon-3") || id === "moon3") return "moon-3";

  // Mars aliases
  if (id.includes("mars-1") || id.includes("html-1") || id === "mars1") return "mars-1";
  if (id.includes("mars-2") || id.includes("html-2") || id === "mars2") return "mars-2";
  if (id.includes("mars-3") || id.includes("html-3") || id === "mars3") return "mars-3";

  // Venus aliases
  if (id.includes("venus-1") || id.includes("css-1") || id === "venus1") return "venus-1";
  if (id.includes("venus-2") || id.includes("css-2") || id === "venus2") return "venus-2";
  if (id.includes("venus-3") || id.includes("css-3") || id === "venus3") return "venus-3";

  // Mercury aliases
  if (id.includes("mercury-1") || id.includes("js-1") || id.includes("javascript-1") || id === "mercury1") return "mercury-1";
  if (id.includes("mercury-2") || id.includes("js-2") || id.includes("javascript-2") || id === "mercury2") return "mercury-2";
  if (id.includes("mercury-3") || id.includes("js-3") || id.includes("javascript-3") || id === "mercury3") return "mercury-3";

  // Jupiter aliases
  if (id.includes("jupiter-1") || id.includes("java-1") || id === "jupiter1") return "jupiter-1";
  if (id.includes("jupiter-2") || id.includes("java-2") || id === "jupiter2") return "jupiter-2";
  if (id.includes("jupiter-3") || id.includes("java-3") || id === "jupiter3") return "jupiter-3";

  // Saturn aliases
  if (id.includes("saturn-1") || id.includes("cpp-1") || id === "saturn1") return "saturn-1";
  if (id.includes("saturn-2") || id.includes("cpp-2") || id === "saturn2") return "saturn-2";
  if (id.includes("saturn-3") || id.includes("cpp-3") || id === "saturn3") return "saturn-3";

  // Earth aliases
  if (id.includes("earth-1") || id.includes("python-1") || id === "earth1") return "earth-1";
  if (id.includes("earth-2") || id.includes("python-2") || id === "earth2") return "earth-2";
  if (id.includes("earth-3") || id.includes("python-3") || id === "earth3") return "earth-3";

  // Planet name fallbacks
  if (id.includes("mars")) return "mars-1";
  if (id.includes("venus")) return "venus-1";
  if (id.includes("mercury")) return "mercury-1";
  if (id.includes("jupiter")) return "jupiter-1";
  if (id.includes("saturn")) return "saturn-1";
  if (id.includes("earth")) return "earth-1";
  if (id.includes("moon")) return "moon-1";

  // Daily or generic challenges
  if (id.includes("daily-1") || id.includes("weave")) return "moon-2";
  if (id.includes("daily-2") || id.includes("lane")) return "moon-3";
  if (id.includes("daily-3") || id.includes("hazard")) return "moon-3";
  if (id.includes("daily")) return "moon-2";

  return "moon-1";
}

/**
 * Returns the curated video information for a given mission ID.
 * Always guaranteed to return a valid educational video object.
 */
export function getVideoFallbackForMission(missionId: string): EducationalVideoInfo | null {
  const normKey = normalizeVideoMissionId(missionId);
  return CURATED_VIDEO_REGISTRY[normKey] || null;
}
