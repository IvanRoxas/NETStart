"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Rocket
} from 'lucide-react';
import {
  MoonLevel1Step1Demo,
  MoonLevel1Step2Demo,
  MoonLevel1Step3Demo
} from './level-guides/MoonLevel1Demos';
import {
  MoonLevel2Step1Demo,
  MoonLevel2Step2Demo,
  MoonLevel2Step3Demo,
  MoonLevel2Step4Demo
} from './level-guides/MoonLevel2Demos';
import {
  MoonLevel3Sec1Step1Demo,
  MoonLevel3Sec1Step2Demo,
  MoonLevel3Sec1Step3Demo,
  MoonLevel3Sec2Step1Demo,
  MoonLevel3Sec2Step2Demo,
  MoonLevel3Sec2Step3Demo,
  MoonLevel3Sec3Step1Demo,
  MoonLevel3Sec3Step2Demo,
  MoonLevel3Sec3Step3Demo,
  MoonLevel3Sec3Step4Demo,
  MoonLevel3Sec3Step5Demo
} from './level-guides/MoonLevel3Demos';
import {
  EarthLevel1Step1Demo,
  EarthLevel1Step2Demo,
  EarthLevel1Step3Demo,
  EarthLevel1Step4Demo
} from './level-guides/EarthLevel1Demos';
import {
  EarthLevel2Step1Demo,
  EarthLevel2Step2Demo,
  EarthLevel2Step3Demo,
} from './level-guides/EarthLevel2Demos';
import {
  EarthLevel3Step1Demo,
  EarthLevel3Step2Demo,
  EarthLevel3Step3Demo,
} from './level-guides/EarthLevel3Demos';
import {
  MarsLevel1Step1Demo,
  MarsLevel1Step2Demo,
  MarsLevel1Step3Demo,
} from './level-guides/MarsLevel1Demos';
import {
  MarsLevel2Step1Demo,
  MarsLevel2Step2Demo,
  MarsLevel2Step3Demo,
  MarsLevel2Step4Demo,
} from './level-guides/MarsLevel2Demos';
import {
  MarsLevel3Step1Demo,
  MarsLevel3Step2Demo,
  MarsLevel3Step3Demo,
  MarsLevel3Step4Demo,
} from './level-guides/MarsLevel3Demos';
import {
  VenusLevel1Step1Demo,
  VenusLevel1Step2Demo,
  VenusLevel1Step3Demo,
  VenusLevel1Step4Demo,
} from './level-guides/VenusLevel1Demos';
import {
  VenusLevel2Step1Demo,
  VenusLevel2Step2Demo,
  VenusLevel2Step3Demo,
  VenusLevel2Step4Demo,
} from './level-guides/VenusLevel2Demos';
import {
  VenusLevel3Step1Demo,
  VenusLevel3Step2Demo,
  VenusLevel3Step3Demo,
  VenusLevel3Step4Demo,
} from './level-guides/VenusLevel3Demos';
import {
  MercuryLevel1Step1Demo,
  MercuryLevel1Step2Demo,
  MercuryLevel1Step3Demo,
  MercuryLevel1Step4Demo,
} from './level-guides/MercuryLevel1Demos';
import {
  MercuryLevel2Step1Demo,
  MercuryLevel2Step2Demo,
  MercuryLevel2Step3Demo,
  MercuryLevel2Step4Demo,
} from './level-guides/MercuryLevel2Demos';
import {
  MercuryLevel3Step1Demo,
  MercuryLevel3Step2Demo,
  MercuryLevel3Step3Demo,
  MercuryLevel3Step4Demo,
} from './level-guides/MercuryLevel3Demos';
import {
  JupiterLevel1Step1Demo,
  JupiterLevel1Step2Demo,
  JupiterLevel1Step3Demo,
  JupiterLevel1Step4Demo,
} from './level-guides/JupiterLevel1Demos';
import {
  JupiterLevel2Step1Demo,
  JupiterLevel2Step2Demo,
  JupiterLevel2Step3Demo,
  JupiterLevel2Step4Demo,
} from './level-guides/JupiterLevel2Demos';
import {
  JupiterLevel3Step1Demo,
  JupiterLevel3Step2Demo,
  JupiterLevel3Step3Demo,
  JupiterLevel3Step4Demo,
} from './level-guides/JupiterLevel3Demos';
import {
  SaturnLevel1Step1Demo,
  SaturnLevel1Step2Demo,
  SaturnLevel1Step3Demo,
  SaturnLevel1Step4Demo,
} from './level-guides/SaturnLevel1Demos';
import {
  SaturnLevel2Step1Demo,
  SaturnLevel2Step2Demo,
  SaturnLevel2Step3Demo,
  SaturnLevel2Step4Demo,
} from './level-guides/SaturnLevel2Demos';
import {
  SaturnLevel3Step1Demo,
  SaturnLevel3Step2Demo,
  SaturnLevel3Step3Demo,
  SaturnLevel3Step4Demo,
} from './level-guides/SaturnLevel3Demos';

interface LevelObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId?: string;
  levelTitle?: string;
  sectionSubtag?: string;
  sectionIndex?: number;
  description?: string;
  tip?: string;
  objectives?: { id: number; text: string; completed?: boolean }[];
  planetName?: string;
}

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  imagePlaceholderText: string;
  icon: string;
  customVisual?: React.ReactNode;
}

// Level-specific instruction guides tailored to each mission's exact mechanics
const MISSION_SLIDES: Record<string, CarouselSlide[]> = {
  'moon-1': [
    {
      id: 1,
      title: "Step 1: Code Controls the Rover",
      subtitle: "The blocks you place in the workspace directly control the rover. Connect movement blocks to guide it step-by-step across the Moon!",
      imagePlaceholderText: "Workspace Guide: Puzzle blocks dictate rover movement",
      icon: "🤖",
      customVisual: <MoonLevel1Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Test with Run Simulation",
      subtitle: "Click the orange 'Run Simulation' button to test your code in real time. If the rover goes off track, tweak your blocks and test again!",
      imagePlaceholderText: "Simulation Test: Watch your algorithm drive the rover live",
      icon: "▶️",
      customVisual: <MoonLevel1Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Don't Forget the 'End' Block",
      subtitle: "Always attach the 'End' block at the bottom of your sequence! Your mission will only complete once the program is properly closed.",
      imagePlaceholderText: "Completion Rule: Snap the 'End' block to finish your program",
      icon: "🛑",
      customVisual: <MoonLevel1Step3Demo />,
    },
  ],
  'moon-2': [
    {
      id: 1,
      title: "Step 1: Sorting One",
      subtitle: "Every item is Cargo! Use a Repeat loop with 'Scan Current Item' and 'Send to Cargo Bay' to automate packing all 10 containers.",
      imagePlaceholderText: "Automated single-item loop sorting",
      icon: "📦",
      customVisual: <MoonLevel2Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Sorting Two",
      subtitle: "Incoming items are mixed. Check 'If item is Cargo' to pack it into the Cargo Bay, else route Space Junk to the Trash Chute!",
      imagePlaceholderText: "Binary sorting with If / Else conditions",
      icon: "🔀",
      customVisual: <MoonLevel2Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Sorting Three",
      subtitle: "Route all three resources: Fuel to the Fuel Bay, Cargo to the Cargo Bay, and Space Junk to the Trash Chute!",
      imagePlaceholderText: "Tri-classification resource routing",
      icon: "⚡",
      customVisual: <MoonLevel2Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Don't Forget the 'End' Block",
      subtitle: "Always attach the 'End' block at the bottom of your program! Your conveyor system will only complete its run once properly closed.",
      imagePlaceholderText: "Completion Rule: Snap the 'End' block to finish your program",
      icon: "🛑",
      customVisual: <MoonLevel2Step4Demo />,
    },
  ],
  'moon-3-sec0': [
    {
      id: 1,
      title: "Step 1: Guide the Airflow",
      subtitle: "Movement blocks guide oxygen airflow through the ventilation pipes. You are free to use loops as well to make your code cleaner and more creative!",
      imagePlaceholderText: "Air Vent Protocol: Route air to cabin",
      icon: "💨",
      customVisual: <MoonLevel3Sec1Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Avoid Red Fan Hazards",
      subtitle: "Steer clear of red broken fans! Driving airflow into a broken fan triggers an explosion and damages the vent.",
      imagePlaceholderText: "Hazard Warning: Red fan explosion risk",
      icon: "⚠️",
      customVisual: <MoonLevel3Sec1Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Reach the Cabin & Snap 'End'",
      subtitle: "Navigate safely to the Cabin goal and attach the 'End' block to complete ventilation. Feel free to use loops to optimize repeated steps!",
      imagePlaceholderText: "Completion Rule: Reach Cabin and snap End",
      icon: "🛑",
      customVisual: <MoonLevel3Sec1Step3Demo />,
    },
  ],
  'moon-3-sec1': [
    {
      id: 1,
      title: "Step 1: Start the Process",
      subtitle: "Pour chemical solution, heat the burner, and repeat mixing 5 times to begin reaction.",
      imagePlaceholderText: "Chemical Synthesis: Start reaction",
      icon: "🧪",
      customVisual: <MoonLevel3Sec2Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Check If Mixture Turns Blue",
      subtitle: "If the mixture turns blue, it is unrefined! Use an 'If' block to increase heat and mix until stabilized.",
      imagePlaceholderText: "Color Conditioning: Refine blue fuel to orange",
      icon: "🔥",
      customVisual: <MoonLevel3Sec2Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Transfer to Fuel Tank & Finish",
      subtitle: "Once fuel stabilizes orange, pump it into the starship tank and snap the 'End' block across all 3 batches!",
      imagePlaceholderText: "Completion Rule: Fill tank and snap End",
      icon: "🛑",
      customVisual: <MoonLevel3Sec2Step3Demo />,
    },
  ],
  'moon-3-sec2': [
    {
      id: 1,
      title: "Scenario 1: Small Asteroids → Fire Lasers",
      subtitle: "When radar detects a small asteroid in your flight path, fire lasers to vaporize it before impact.",
      imagePlaceholderText: "Defense Protocol: Fire lasers at small asteroids",
      icon: "💥",
      customVisual: <MoonLevel3Sec3Step1Demo />,
    },
    {
      id: 2,
      title: "Scenario 2: Big Asteroids → Activate Shield",
      subtitle: "Lasers cannot penetrate massive asteroids! Raise your energy shield to deflect kinetic collisions.",
      imagePlaceholderText: "Defense Protocol: Shield deflects big asteroids",
      icon: "🛡️",
      customVisual: <MoonLevel3Sec3Step2Demo />,
    },
    {
      id: 3,
      title: "Scenario 3: Friendly UFO → Greet Protocol",
      subtitle: "Transmit communication signals to peaceful alien spacecraft to exchange greetings.",
      imagePlaceholderText: "Comms Protocol: Greet friendly UFOs",
      icon: "🛸",
      customVisual: <MoonLevel3Sec3Step3Demo />,
    },
    {
      id: 4,
      title: "Scenario 4: Fuel & Oxygen Replenishment",
      subtitle: "Monitor vital life support! When Fuel or Oxygen drops below 20%, run Refill Fuel Cells and Pump Oxygen immediately.",
      imagePlaceholderText: "Life Support: Refill Fuel & Pump Oxygen",
      icon: "⚡",
      customVisual: <MoonLevel3Sec3Step4Demo />,
    },
    {
      id: 5,
      title: "Scenario 5: Complete Protocol & Snap 'End'",
      subtitle: "Survive every flight scenario and attach the 'End' block to guide your starship safely to Mars!",
      imagePlaceholderText: "Completion Rule: Survive flight and snap End",
      icon: "🛑",
      customVisual: <MoonLevel3Sec3Step5Demo />,
    },
  ],
  'earth-1': [
    {
      id: 1,
      title: "Step 1: Fix the Master Ledger",
      subtitle: "Assemble your blocks in the workspace to load, clean, and output the ledger data.",
      imagePlaceholderText: "Master ledger cleaning pipeline",
      icon: "",
      customVisual: <EarthLevel1Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Cut from START to STOP",
      subtitle: "Use the Cut block to slice away outer corrupted characters with the laser.",
      imagePlaceholderText: "Laser slicing outer characters",
      icon: "",
      customVisual: <EarthLevel1Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Split at DELIMITER",
      subtitle: "Use the Split block to separate your data into clean list items at the delimiter.",
      imagePlaceholderText: "Delimiter splitting into list items",
      icon: "",
      customVisual: <EarthLevel1Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Replace OLD with NEW",
      subtitle: "Use the Replace block to swap corrupted characters before splitting.",
      imagePlaceholderText: "Replacing corrupted characters",
      icon: "",
      customVisual: <EarthLevel1Step4Demo />,
    },
  ],
  'earth-2': [
    {
      id: 1,
      title: "Step 1: The Planetary Archive",
      subtitle: "Verify all 6 planet profiles in Profiles, then unlock Orbits to arrange the solar system.",
      imagePlaceholderText: "Planetary archive overview",
      icon: "",
      customVisual: <EarthLevel2Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Build Planet Profiles",
      subtitle: "Set each planet's type and features in its dictionary so the scanner can verify the record.",
      imagePlaceholderText: "Building planet dictionary profiles",
      icon: "",
      customVisual: <EarthLevel2Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Arrange Planetary Orbits",
      subtitle: "Order all 6 planets in the list from Mercury to Saturn to align orbits around the Sun.",
      imagePlaceholderText: "Ordering planetary orbits in lists",
      icon: "",
      customVisual: <EarthLevel2Step3Demo />,
    },
  ],
  'earth-3': [
    {
      id: 1,
      title: "Step 1: The Master Reboot",
      subtitle: "Connect all 5 planetary systems, nest repairs inside master_reboot, and synchronize the network.",
      imagePlaceholderText: "Master reboot network overview",
      icon: "",
      customVisual: <EarthLevel3Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Connect Planetary Systems",
      subtitle: "Place your connect blocks at the top to establish communication with all 5 planet nodes.",
      imagePlaceholderText: "Connecting planetary systems",
      icon: "",
      customVisual: <EarthLevel3Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Define Reboot & Synchronize",
      subtitle: "Define master_reboot with all planetary repairs nested, then call synchronize at the bottom.",
      imagePlaceholderText: "Master reboot definition and system synchronization",
      icon: "",
      customVisual: <EarthLevel3Step3Demo />,
    },
  ],
  'mars-1': [
    {
      id: 1,
      title: "Step 1: The Blank Billboard",
      subtitle: "Build a colony billboard using heading and paragraph blocks to get the habitat message live.",
      imagePlaceholderText: "Martian billboard layout",
      icon: "",
      customVisual: <MarsLevel1Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Add Headings & Text",
      subtitle: "Snap h1 heading blocks for your main title and p blocks for description text.",
      imagePlaceholderText: "Adding HTML headings and text",
      icon: "",
      customVisual: <MarsLevel1Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Group with Div Containers",
      subtitle: "Nest your billboard content inside a div container to give it a unified frame.",
      imagePlaceholderText: "Grouping elements with div containers",
      icon: "",
      customVisual: <MarsLevel1Step3Demo />,
    },
  ],
  'mars-2': [
    {
      id: 1,
      title: "Step 1: Picture Perfect",
      subtitle: "Click the billboard screen to reveal its hint clue, then link the matching picture block.",
      imagePlaceholderText: "Promotional billboard image linking",
      icon: "",
      customVisual: <MarsLevel2Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Add Billboard Containers",
      subtitle: "Place the billboard container blocks to set the frame for each habitat display.",
      imagePlaceholderText: "Placing billboard container wrappers",
      icon: "",
      customVisual: <MarsLevel2Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Choose Habitat Images",
      subtitle: "Select the correct animal and plant image blocks to display in each habitat.",
      imagePlaceholderText: "Selecting image files for billboards",
      icon: "",
      customVisual: <MarsLevel2Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Add Habitat Captions",
      subtitle: "Attach the caption block below the image to describe each colony feature.",
      imagePlaceholderText: "Attaching figcaption descriptions",
      icon: "",
      customVisual: <MarsLevel2Step4Demo />,
    },
  ],
  'mars-3': [
    {
      id: 1,
      title: "Step 1: Interplanetary Form",
      subtitle: "Assemble the form to beam a space message to neighboring planets.",
      imagePlaceholderText: "Interplanetary messaging form",
      icon: "",
      customVisual: <MarsLevel3Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Form Container",
      subtitle: "Place the Form Container block in your workspace.",
      imagePlaceholderText: "Form container wrapper block",
      icon: "",
      customVisual: <MarsLevel3Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Target Dropdown",
      subtitle: "Snap the Dropdown Menu with planet choices inside the form.",
      imagePlaceholderText: "Adding dropdown and option blocks",
      icon: "",
      customVisual: <MarsLevel3Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Message & Send",
      subtitle: "Add the Message Input and snap the Send Button.",
      imagePlaceholderText: "Attaching message input and send button",
      icon: "",
      customVisual: <MarsLevel3Step4Demo />,
    },
  ],
  'venus-1': [
    {
      id: 1,
      title: "Step 1: Color It In",
      subtitle: "Style Professor Spectrum's lab furniture with vibrant colors and borders to revive the room.",
      imagePlaceholderText: "Spectrum lab color styling",
      icon: "",
      customVisual: <VenusLevel1Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Target Room Elements",
      subtitle: "Target furniture elements like desk, chair, and computer using style containers.",
      imagePlaceholderText: "Selecting furniture targets",
      icon: "",
      customVisual: <VenusLevel1Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Select Background Colors",
      subtitle: "Pick vibrant hex colors from the color palette to brighten each lab fixture.",
      imagePlaceholderText: "Applying background color blocks",
      icon: "",
      customVisual: <VenusLevel1Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Apply Borders & Outlines",
      subtitle: "Add solid borders to frame the furniture and complete Professor Spectrum's lab.",
      imagePlaceholderText: "Adding border style blocks",
      icon: "",
      customVisual: <VenusLevel1Step4Demo />,
    },
  ],
  'venus-2': [
    {
      id: 1,
      title: "Step 1: Formatting the Prototype",
      subtitle: "Use CSS Flexbox to align and space the machinery pieces so the prototype holds.",
      imagePlaceholderText: "CSS Flexbox alignment and spacing",
      icon: "",
      customVisual: <VenusLevel2Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Set Format Side-by-Side",
      subtitle: "Set format to Side-by-Side to arrange screen modules in a horizontal flex row.",
      imagePlaceholderText: "Setting display flex row",
      icon: "",
      customVisual: <VenusLevel2Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Distribute Horizontally",
      subtitle: "Choose Spread Evenly or Center to balance components across the control panel.",
      imagePlaceholderText: "Horizontal justify-content alignment",
      icon: "",
      customVisual: <VenusLevel2Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Align Vertically",
      subtitle: "Set vertical alignment to Center to lock pieces in place on the monitor screen.",
      imagePlaceholderText: "Vertical align-items alignment",
      icon: "",
      customVisual: <VenusLevel2Step4Demo />,
    },
  ],
  'venus-3': [
    {
      id: 1,
      title: "Step 1: Restoring the Dead Zones",
      subtitle: "Link external stylesheets to the atmospheric network to restore color to Venus.",
      imagePlaceholderText: "Linking CSS stylesheets to HTML network",
      icon: "",
      customVisual: <VenusLevel3Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Connect External Stylesheets",
      subtitle: "Place connect blocks in the page header to link alpha.css, beta.css, and gamma.css.",
      imagePlaceholderText: "Connecting stylesheet link blocks",
      icon: "",
      customVisual: <VenusLevel3Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Style Planetary Sectors",
      subtitle: "Switch tabs to style clouds, crystal caverns, and desert basins with theme palettes.",
      imagePlaceholderText: "Sector-specific color styling",
      icon: "",
      customVisual: <VenusLevel3Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Activate AstroLink Hub",
      subtitle: "Paint the transmission tower and atmospheric core to synchronize all three sectors.",
      imagePlaceholderText: "AstroLink transmission hub restoration",
      icon: "",
      customVisual: <VenusLevel3Step4Demo />,
    },
  ],
  'mercury-1': [
    {
      id: 1,
      title: "Step 1: Saving the Biodome",
      subtitle: "Target DOM elements by tag, class, and ID to revive the biodome.",
      imagePlaceholderText: "DOM element selection and biodome irrigation",
      icon: "",
      customVisual: <MercuryLevel1Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Target by Tag",
      subtitle: "Select the vent tags to open ventilation shutters.",
      imagePlaceholderText: "Targeting elements with ID selector",
      icon: "",
      customVisual: <MercuryLevel1Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Loop Class Elements",
      subtitle: "Nest a For Each loop inside Target Class to fertilize all shrubs.",
      imagePlaceholderText: "Iterating element groups with forEach loop",
      icon: "",
      customVisual: <MercuryLevel1Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Target ID & Bloom",
      subtitle: "Target the unique star flower by ID and water it to bloom.",
      imagePlaceholderText: "Applying fertilize and water actions",
      icon: "",
      customVisual: <MercuryLevel1Step4Demo />,
    },
  ],
  'mercury-2': [
    {
      id: 1,
      title: "Step 1: The Conveyor Belt",
      subtitle: "Automate crate sorting by looping through 20 cargo containers.",
      imagePlaceholderText: "Conveyor belt automated sorting overview",
      icon: "",
      customVisual: <MercuryLevel2Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Scan with Variables",
      subtitle: "Use Read X-Ray Scanner inside the loop to identify crate types.",
      imagePlaceholderText: "Variable scanner reading",
      icon: "",
      customVisual: <MercuryLevel2Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Branch with If / Else",
      subtitle: "Create If and Otherwise rules to separate Equipment, Organics, and Energy.",
      imagePlaceholderText: "Multi-branch decision logic",
      icon: "",
      customVisual: <MercuryLevel2Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Route to Belts",
      subtitle: "Send each inspected container to its matching destination belt.",
      imagePlaceholderText: "Routing cargo to destination belts",
      icon: "",
      customVisual: <MercuryLevel2Step4Demo />,
    },
  ],
  'mercury-3': [
    {
      id: 1,
      title: "Step 1: The Missing Interface",
      subtitle: "Rebuild the AstroLink communication relay from scratch across HTML, CSS, and JS tabs.",
      imagePlaceholderText: "Rebuilding full-stack communication interface",
      icon: "",
      customVisual: <MercuryLevel3Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Build HTML Form Structure",
      subtitle: "Assemble main screen box, planet dropdown, message input, and send button.",
      imagePlaceholderText: "HTML terminal structure",
      icon: "",
      customVisual: <MercuryLevel3Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Style with CSS Flexbox",
      subtitle: "Align terminal elements in a column, center content, and style the action button.",
      imagePlaceholderText: "CSS layout and button styling",
      icon: "",
      customVisual: <MercuryLevel3Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Transmit with JavaScript",
      subtitle: "Attach a click listener to the send button and beam your signal across the planets.",
      imagePlaceholderText: "JavaScript event listener and beam signal",
      icon: "",
      customVisual: <MercuryLevel3Step4Demo />,
    },
  ],
  'jupiter-1': [
    {
      id: 1,
      title: "Step 1: Unlock the Gate",
      subtitle: "Declare Java variables, enter codes into locks, and unlock the doors.",
      imagePlaceholderText: "Declaring Java variables to unlock gates",
      icon: "",
      customVisual: <JupiterLevel1Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Declare Variables",
      subtitle: "Create String, int, and boolean variables to hold your codes.",
      imagePlaceholderText: "Matching Java primitive types",
      icon: "",
      customVisual: <JupiterLevel1Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Inject Codes into Locks",
      subtitle: "Snap Enter Code actions to send variables into matching lock sensors.",
      imagePlaceholderText: "Injecting variables into physical locks",
      icon: "",
      customVisual: <JupiterLevel1Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Unlock Blast Doors",
      subtitle: "Attach Unlock Doors to open the heavy airlock gates.",
      imagePlaceholderText: "Disengaging blast gate lock mechanism",
      icon: "",
      customVisual: <JupiterLevel1Step4Demo />,
    },
  ],
  'jupiter-2': [
    {
      id: 1,
      title: "Step 1: Try and Catch This!",
      subtitle: "Deploy Try/Catch safety nets to intercept corrupted data packets before they crash the core.",
      imagePlaceholderText: "Try catch exception handling safety net",
      icon: "",
      customVisual: <JupiterLevel2Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Match Exception Types",
      subtitle: "Identify NullPointer, Arithmetic, and NumberFormat error packets on the conveyor.",
      imagePlaceholderText: "Identifying runtime exception types",
      icon: "",
      customVisual: <JupiterLevel2Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Deploy Defenses",
      subtitle: "Configure catch blocks with barrier walls and defense lasers to intercept packets.",
      imagePlaceholderText: "Deploying defense barriers in catch block",
      icon: "",
      customVisual: <JupiterLevel2Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Secure with Finally",
      subtitle: "Attach the finally block to guarantee clean system shutdown on every stream run.",
      imagePlaceholderText: "Finally block clean shutdown",
      icon: "",
      customVisual: <JupiterLevel2Step4Demo />,
    },
  ],
  'jupiter-3': [
    {
      id: 1,
      title: "Step 1: The AI Core Lockdown",
      subtitle: "Define class blueprints with encapsulated clearance to bypass vault scanners.",
      imagePlaceholderText: "Class definition and object instantiation",
      icon: "",
      customVisual: <JupiterLevel3Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Object Blueprints",
      subtitle: "Understand how class templates structure access permissions before instantiation.",
      imagePlaceholderText: "Class blueprint vs instance",
      icon: "",
      customVisual: <JupiterLevel3Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Encapsulate Clearance",
      subtitle: "Declare private clearance and public role variables to protect security integrity.",
      imagePlaceholderText: "Private and public access encapsulation",
      icon: "",
      customVisual: <JupiterLevel3Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Print Badges with New",
      subtitle: "Instantiate all 4 badges using new AdminProfile(), Tech, Security, and Visitor.",
      imagePlaceholderText: "Instantiating 4 role badges with new",
      icon: "",
      customVisual: <JupiterLevel3Step4Demo />,
    },
  ],
  'saturn-1': [
    {
      id: 1,
      title: "Step 1: Stream Loop Structure",
      subtitle: "Snap the Repeat While Receiving Input stream loop between Start and End.",
      imagePlaceholderText: "C++ stream loop pipeline",
      icon: "",
      customVisual: <SaturnLevel1Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Allocate Typed Storage",
      subtitle: "Place typed storage blocks above the loop to hold incoming telemetry data.",
      imagePlaceholderText: "Declaring typed stream storage before loop",
      icon: "",
      customVisual: <SaturnLevel1Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Read Keyboard Stream (cin >>)",
      subtitle: "Place cin >> inside the stream loop to ingest real-time telemetry inputs.",
      imagePlaceholderText: "Reading keyboard stream with cin >>",
      icon: "",
      customVisual: <SaturnLevel1Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Print Screen Stream (cout <<)",
      subtitle: "Place cout << inside the stream loop to echo outputs, then close with End.",
      imagePlaceholderText: "Printing output stream with cout << and closing with End",
      icon: "",
      customVisual: <SaturnLevel1Step4Demo />,
    },
  ],
  'saturn-2': [
    {
      id: 1,
      title: "Step 1: Declare Prototypes",
      subtitle: "Declare function prototypes before main to initialize the Saturn ring router.",
      imagePlaceholderText: "Function prototypes and program start",
      icon: "",
      customVisual: <SaturnLevel2Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Case Situation Handlers",
      subtitle: "Add Case blocks to match incoming ice, rock, and mineral debris types.",
      imagePlaceholderText: "Matching debris types with switch cases",
      icon: "",
      customVisual: <SaturnLevel2Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Route to Orbit Rings",
      subtitle: "Nest Route blocks inside each Case to guide debris into matching orbital chutes.",
      imagePlaceholderText: "Routing debris to orbit rings",
      icon: "",
      customVisual: <SaturnLevel2Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Defensive Shield & Exit",
      subtitle: "Add an asteroid case with Activate Shield to deflect hazards, then seal with End.",
      imagePlaceholderText: "Deflecting asteroid collisions with shield and closing with End",
      icon: "",
      customVisual: <SaturnLevel2Step4Demo />,
    },
  ],
  'saturn-3': [
    {
      id: 1,
      title: "Step 1: Ready Arm Pointers",
      subtitle: "Snap Ready Arm under Start to initialize pointer channels for your subsystems.",
      imagePlaceholderText: "Initializing arm pointers with Start",
      icon: "",
      customVisual: <SaturnLevel3Step1Demo />,
    },
    {
      id: 2,
      title: "Step 2: Allocate Cores with New",
      subtitle: "Use Grab Cores to dynamically borrow required energy cores from the heap rack.",
      imagePlaceholderText: "Dynamic heap core allocation with new",
      icon: "",
      customVisual: <SaturnLevel3Step2Demo />,
    },
    {
      id: 3,
      title: "Step 3: Run Subsystem Tasks",
      subtitle: "Execute assigned subsystem tasks while energy cores are active in heap memory.",
      imagePlaceholderText: "Executing subsystem tasks with active heap cores",
      icon: "",
      customVisual: <SaturnLevel3Step3Demo />,
    },
    {
      id: 4,
      title: "Step 4: Return Cores with Delete",
      subtitle: "Return borrowed cores with delete and seal with End to ensure zero memory leaks.",
      imagePlaceholderText: "Freeing heap memory with delete and closing program with End",
      icon: "",
      customVisual: <SaturnLevel3Step4Demo />,
    },
  ],
};

function getSlidesForMission(
  missionId: string = '',
  levelTitle: string = '',
  description?: string,
  tip?: string,
  sectionIndex: number = 0,
  sectionSubtag: string = '',
  planetName: string = ''
): CarouselSlide[] {
  const key = (missionId || '').toLowerCase().trim();
  const title = (levelTitle || '').toLowerCase().trim();
  const desc = (description || '').toLowerCase();
  const subtag = (sectionSubtag || '').toLowerCase();
  const planet = (planetName || '').toLowerCase().trim();

  // ---------------------------------------------------------------------------
  // 1. EARTH MISSIONS (Python)
  // ---------------------------------------------------------------------------
  const isEarth1 =
    key === 'earth-1' ||
    key === 'python-1' ||
    key.includes('earth-1') ||
    key.includes('python-1') ||
    key === 'challenge-earth-ledger' ||
    key === 'earth-challenge' ||
    key === 'challenge-ledger' ||
    key === 'daily-ledger' ||
    key === 'challenge-python-cipher' ||
    title.includes('fix the master ledger') ||
    title.includes('master ledger') ||
    title.includes('ledger cipher') ||
    ((planet === 'earth' || title.includes('earth')) && (title.includes('level 1') || title.includes('1') || title.includes('ledger')));

  if (isEarth1) {
    return MISSION_SLIDES['earth-1'];
  }

  const isEarth2 =
    key === 'earth-2' ||
    key === 'python-2' ||
    key.includes('earth-2') ||
    key.includes('python-2') ||
    title.includes('planetary archive') ||
    title.includes('profiles & orbits') ||
    ((planet === 'earth' || title.includes('earth')) && (title.includes('level 2') || title.includes('2') || title.includes('archive')));

  if (isEarth2) {
    return MISSION_SLIDES['earth-2'];
  }

  const isEarth3 =
    key === 'earth-3' ||
    key === 'python-3' ||
    key.includes('earth-3') ||
    key.includes('python-3') ||
    title.includes('master reboot') ||
    ((planet === 'earth' || title.includes('earth')) && (title.includes('level 3') || title.includes('3') || title.includes('reboot')));

  if (isEarth3) {
    return MISSION_SLIDES['earth-3'];
  }

  // ---------------------------------------------------------------------------
  // 2. MARS MISSIONS (HTML)
  // ---------------------------------------------------------------------------
  const isMars1 =
    key === 'mars-1' || key === 'html-1' || key.includes('mars-1') || key.includes('html-1') ||
    title.includes('the blank billboard') || title.includes('blank billboard') ||
    ((planet === 'mars' || title.includes('mars')) && (title.includes('level 1') || title.includes('1') || title.includes('billboard')));
  if (isMars1) return MISSION_SLIDES['mars-1'];

  const isMars2 =
    key === 'mars-2' || key === 'html-2' || key.includes('mars-2') || key.includes('html-2') ||
    title.includes('picture perfect') ||
    ((planet === 'mars' || title.includes('mars')) && (title.includes('level 2') || title.includes('2') || title.includes('picture')));
  if (isMars2) return MISSION_SLIDES['mars-2'];

  const isMars3 =
    key === 'mars-3' || key === 'html-3' || key.includes('mars-3') || key.includes('html-3') ||
    title.includes('the big space message') || title.includes('big space message') ||
    ((planet === 'mars' || title.includes('mars')) && (title.includes('level 3') || title.includes('3') || title.includes('message')));
  if (isMars3) return MISSION_SLIDES['mars-3'];

  // ---------------------------------------------------------------------------
  // 3. VENUS MISSIONS (CSS)
  // ---------------------------------------------------------------------------
  const isVenus1 =
    key === 'venus-1' || key === 'css-1' || key.includes('venus-1') || key.includes('css-1') ||
    title.includes('color it in') ||
    ((planet === 'venus' || title.includes('venus')) && (title.includes('level 1') || title.includes('1') || title.includes('color')));
  if (isVenus1) return MISSION_SLIDES['venus-1'];

  const isVenus2 =
    key === 'venus-2' || key === 'css-2' || key.includes('venus-2') || key.includes('css-2') ||
    title.includes('formatting the prototype') || title.includes('prototype') ||
    ((planet === 'venus' || title.includes('venus')) && (title.includes('level 2') || title.includes('2') || title.includes('formatting')));
  if (isVenus2) return MISSION_SLIDES['venus-2'];

  const isVenus3 =
    key === 'venus-3' || key === 'css-3' || key.includes('venus-3') || key.includes('css-3') ||
    title.includes('restoring the dead zones') || title.includes('dead zones') ||
    ((planet === 'venus' || title.includes('venus')) && (title.includes('level 3') || title.includes('3') || title.includes('dead zones')));
  if (isVenus3) return MISSION_SLIDES['venus-3'];

  // ---------------------------------------------------------------------------
  // 4. MERCURY MISSIONS (JavaScript)
  // ---------------------------------------------------------------------------
  const isMercury1 =
    key === 'mercury-1' || key === 'js-1' || key === 'javascript-1' || key.includes('mercury-1') || key.includes('js-1') || key.includes('javascript-1') ||
    title.includes('saving the biodome') || title.includes('biodome') ||
    ((planet === 'mercury' || title.includes('mercury')) && (title.includes('level 1') || title.includes('1') || title.includes('biodome')));
  if (isMercury1) return MISSION_SLIDES['mercury-1'];

  const isMercury2 =
    key === 'mercury-2' || key === 'js-2' || key === 'javascript-2' || key.includes('mercury-2') || key.includes('js-2') || key.includes('javascript-2') ||
    title.includes('the conveyor belt') ||
    ((planet === 'mercury' || title.includes('mercury')) && (title.includes('level 2') || title.includes('2') || title.includes('conveyor')));
  if (isMercury2) return MISSION_SLIDES['mercury-2'];

  const isMercury3 =
    key === 'mercury-3' || key === 'js-3' || key === 'javascript-3' || key.includes('mercury-3') || key.includes('js-3') || key.includes('javascript-3') ||
    title.includes('the missing interface') || title.includes('missing interface') ||
    ((planet === 'mercury' || title.includes('mercury')) && (title.includes('level 3') || title.includes('3') || title.includes('interface')));
  if (isMercury3) return MISSION_SLIDES['mercury-3'];

  // ---------------------------------------------------------------------------
  // 5. JUPITER MISSIONS (Java)
  // ---------------------------------------------------------------------------
  const isJupiter1 =
    key === 'jupiter-1' || key === 'java-1' || key.includes('jupiter-1') || key.includes('java-1') ||
    title.includes('unlock the gate') ||
    ((planet === 'jupiter' || title.includes('jupiter')) && (title.includes('level 1') || title.includes('1') || title.includes('gate')));
  if (isJupiter1) return MISSION_SLIDES['jupiter-1'];

  const isJupiter2 =
    key === 'jupiter-2' || key === 'java-2' || key.includes('jupiter-2') || key.includes('java-2') ||
    title.includes('try and catch this') ||
    ((planet === 'jupiter' || title.includes('jupiter')) && (title.includes('level 2') || title.includes('2') || title.includes('catch')));
  if (isJupiter2) return MISSION_SLIDES['jupiter-2'];

  const isJupiter3 =
    key === 'jupiter-3' || key === 'java-3' || key.includes('jupiter-3') || key.includes('java-3') ||
    title.includes('the ai core lockdown') || title.includes('ai core lockdown') ||
    ((planet === 'jupiter' || title.includes('jupiter')) && (title.includes('level 3') || title.includes('3') || title.includes('lockdown')));
  if (isJupiter3) return MISSION_SLIDES['jupiter-3'];

  // ---------------------------------------------------------------------------
  // 6. SATURN MISSIONS (C++)
  // ---------------------------------------------------------------------------
  const isSaturn1 =
    key === 'saturn-1' || key === 'cpp-1' || key.includes('saturn-1') || key.includes('cpp-1') ||
    title.includes('surprise diagnostics') ||
    ((planet === 'saturn' || title.includes('saturn')) && (title.includes('level 1') || title.includes('1') || title.includes('diagnostics')));
  if (isSaturn1) return MISSION_SLIDES['saturn-1'];

  const isSaturn2 =
    key === 'saturn-2' || key === 'cpp-2' || key.includes('saturn-2') || key.includes('cpp-2') ||
    title.includes('jumpstarting the rings') || title.includes('jumpstarting') ||
    ((planet === 'saturn' || title.includes('saturn')) && (title.includes('level 2') || title.includes('2') || title.includes('rings')));
  if (isSaturn2) return MISSION_SLIDES['saturn-2'];

  const isSaturn3 =
    key === 'saturn-3' || key === 'cpp-3' || key.includes('saturn-3') || key.includes('cpp-3') ||
    title.includes('a leak in the system') || title.includes('leak in the system') ||
    ((planet === 'saturn' || title.includes('saturn')) && (title.includes('level 3') || title.includes('3') || title.includes('leak')));
  if (isSaturn3) return MISSION_SLIDES['saturn-3'];

  // ---------------------------------------------------------------------------
  // 7. MOON MISSIONS (Basics)
  // ---------------------------------------------------------------------------
  const isMoon3 =
    key === 'moon-3' ||
    key.includes('moon-3') ||
    title.includes('the starship protocol') ||
    title.includes('starship protocol') ||
    ((planet === 'moon' || title.includes('moon')) && (title.includes('level 3') || title.includes('3')));

  if (isMoon3) {
    if (sectionIndex === 1 || subtag.includes('fuel') || title.includes('fuel') || desc.includes('fuel') || desc.includes('synthesize')) {
      return MISSION_SLIDES['moon-3-sec1'];
    }
    if (sectionIndex === 2 || subtag.includes('flight') || title.includes('flight') || desc.includes('flight') || desc.includes('laser')) {
      return MISSION_SLIDES['moon-3-sec2'];
    }
    return MISSION_SLIDES['moon-3-sec0'];
  }

  const isMoon2 =
    key === 'moon-2' ||
    key.includes('moon-2') ||
    title.includes('resource classification') ||
    ((planet === 'moon' || title.includes('moon')) && (title.includes('level 2') || title.includes('2')));

  if (isMoon2) {
    return MISSION_SLIDES['moon-2'];
  }

  const isMoon1 =
    key === 'moon-1' ||
    key.includes('moon-1') ||
    title.includes('stellar beginnings') ||
    ((planet === 'moon' || title.includes('moon')) && (title.includes('level 1') || title.includes('1')));

  if (isMoon1) {
    return MISSION_SLIDES['moon-1'];
  }

  // Default fallback for generic or unconfigured levels
  return [
    {
      id: 1,
      title: "Step 1: Check Your Objective",
      subtitle: description || "Review what Nova and Mission Control require you to accomplish in this level.",
      imagePlaceholderText: "Placeholder Image 1: Mission Blueprint & Layout",
      icon: "🎯",
    },
    {
      id: 2,
      title: "Step 2: Assemble Your Puzzle Blocks",
      subtitle: tip ? tip.replace(/^Hint:\s*/i, '') : "Drag and snap your code blocks together between the Start and End blocks.",
      imagePlaceholderText: "Placeholder Image 2: Block Snapping & Workspace Guide",
      icon: "🧩",
    },
    {
      id: 3,
      title: "Step 3: Run & Test Your Algorithm",
      subtitle: "Click the Run Code button to test your logic. If you get stuck, check your hints or try again!",
      imagePlaceholderText: "Placeholder Image 3: Execution & Goal Verification",
      icon: "🚀",
    },
  ];
}

export default function LevelObjectiveModal({
  isOpen,
  onClose,
  missionId = '',
  levelTitle = 'Level Guide',
  sectionSubtag = '',
  sectionIndex = 0,
  description,
  tip,
  planetName = '',
}: LevelObjectiveModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Dynamic slides tailored to the current level mechanics
  const slides: CarouselSlide[] = getSlidesForMission(
    missionId,
    levelTitle,
    description,
    tip,
    sectionIndex,
    sectionSubtag,
    planetName
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to appropriate slide whenever modal opens or section changes
  useEffect(() => {
    if (isOpen) {
      const isMoon2 = (missionId || '').toLowerCase().includes('moon-2');
      if (isMoon2 && typeof sectionIndex === 'number' && sectionIndex >= 0 && sectionIndex < slides.length) {
        setCurrentSlide(sectionIndex);
      } else {
        setCurrentSlide(0);
      }
    }
  }, [isOpen, sectionIndex, missionId, slides.length]);

  // Lock background scroll
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, mounted]);

  // Handle Escape and Left/Right arrow keys
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mounted, onClose, slides.length]);

  // Dynamic scale factor based on viewport size and browser zoom level so modal never clips
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    const updateScale = () => {
      if (typeof window === 'undefined') return;

      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Target modal height is 610px. Add a buffer for vertical breathing room = 640px.
      const targetH = 640;
      // Target modal width with outside arrows (680px + 2*56px + 2*24px = 840px). Add buffer = 860px.
      const targetW = vw >= 880 ? 860 : 710;

      const scaleH = vh / targetH;
      const scaleW = vw / targetW;

      // Compute fitting scale, clamped between 0.55 and 1
      const fitScale = Math.min(scaleH, scaleW, 1);
      setScale(Math.max(0.55, Math.min(1, fitScale)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const slide = slides[currentSlide];

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200 z-[100000]"
    >
      <style>{`
        @keyframes quirkyFlip {
          0% {
            transform: perspective(900px) rotateY(-65deg) scale(0.88) rotate(-4deg);
            opacity: 0;
          }
          50% {
            transform: perspective(900px) rotateY(16deg) scale(1.04) rotate(2deg);
            opacity: 0.95;
          }
          75% {
            transform: perspective(900px) rotateY(-6deg) scale(0.99) rotate(-1deg);
            opacity: 1;
          }
          100% {
            transform: perspective(900px) rotateY(0deg) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-quirky-flip {
          animation: quirkyFlip 0.5s cubic-bezier(0.34, 1.45, 0.64, 1) forwards;
          transform-origin: center center;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Flex container holding the left arrow, modal card, and right arrow with guaranteed breathing space & dynamic scale */}
      <div
        className="relative flex items-center justify-center gap-4 sm:gap-8 max-w-full origin-center transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale})` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Left Arrow - sits to the left with guaranteed gap */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          disabled={currentSlide === 0}
          className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-200 z-30 ${currentSlide === 0
            ? 'opacity-0 pointer-events-none cursor-default'
            : 'bg-gradient-to-b from-[#250b3d] to-[#140422] border-amber-500/70 text-[#ffaa40] shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(255,170,64,0.2)] hover:bg-gradient-to-br hover:from-[#ff8800] hover:via-[#a824e8] hover:to-[#581c87] hover:border-amber-400 hover:text-white hover:scale-110 active:scale-95 hover:shadow-[0_0_30px_rgba(255,145,45,0.7),0_0_40px_rgba(168,85,247,0.6)] cursor-pointer'
            }`}
          title="Previous slide"
          aria-label="Previous slide"
        >
          <ChevronLeft size={30} strokeWidth={2.5} />
        </button>

        {/* Main Modal Card with 3D Depth & Dimension - strictly locked dimensions across all slides */}
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-modal-title"
          onClick={(e) => e.stopPropagation()}
          className="relative w-[92vw] sm:w-[680px] min-w-[320px] sm:min-w-[680px] max-w-[680px] h-[570px] sm:h-[610px] min-h-[570px] sm:min-h-[610px] shrink-0 bg-gradient-to-b from-[#250d3d] via-[#1a082c] to-[#120420] border-2 border-[#ff912d]/70 border-b-4 border-b-[#c96200] rounded-3xl p-5 sm:px-6 sm:py-5 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(255,145,45,0.25),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-3px_5px_rgba(0,0,0,0.6)] flex flex-col justify-between text-white outline-none animate-in zoom-in-95 duration-200"
        >
          {/* Header: Level Title */}
          <div className="text-center pb-2.5 border-b border-white/10 shrink-0">
            <h2 id="level-modal-title" className="text-xl sm:text-2xl font-black font-display text-white tracking-wide drop-shadow-sm">
              {levelTitle}
            </h2>
          </div>

          {/* Carousel Slide Content */}
          <div className="flex-1 flex flex-col gap-3 py-2 overflow-hidden">
            {/* TALL Image/GIF Viewport - dynamically occupies all available space */}
            <div className="relative w-full flex-1 min-h-[280px] bg-black/60 border-2 border-[#ff9e2c] rounded-2xl flex flex-col items-center justify-center text-center p-4 overflow-hidden shadow-[inset_0_4px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(255,158,44,0.18)]">
              {/* Visual placeholder background graphic */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff912d]/15 via-purple-900/30 to-black/60 pointer-events-none" />

              {/* Visual Demonstration or Placeholder Graphic */}
              {slide.customVisual ? (
                <div
                  key={`visual-${currentSlide}`}
                  className="w-full h-full relative z-10 flex items-center justify-center pb-6"
                >
                  {slide.customVisual}
                </div>
              ) : (
                /* Animated Inner Graphic with Quirky Flip Transition (only image/icon flips) */
                <div
                  key={`graphic-${currentSlide}`}
                  className="animate-quirky-flip flex flex-col items-center justify-center gap-3 relative z-0 px-12"
                >
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl shadow-2xl">
                    {slide.icon}
                  </div>
                  <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-[#ff912d] drop-shadow-sm">
                    <ImageIcon size={20} />
                    <span>{slide.imagePlaceholderText}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-white/50 font-medium">
                    (Visual illustration / tutorial GIF will render here)
                  </span>
                </div>
              )}

              {/* Slide Indicator Dots - positioned INSIDE the image container at bottom center */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2.5 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-xl">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`transition-all rounded-full cursor-pointer ${currentSlide === idx
                      ? 'w-8 h-2.5 bg-[#ff912d] shadow-sm shadow-[#ff912d]/70'
                      : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
                      }`}
                    title={`Go to slide ${idx + 1}`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Slide Description - fixed height with larger, easily readable text */}
            <div className="h-[96px] shrink-0 flex flex-col items-center text-center px-4 justify-center transition-all duration-200">
              <h3 className="font-black text-xl sm:text-2xl text-[#ff912d] font-display tracking-wide drop-shadow-sm">
                {slide.title}
              </h3>
              <p className="text-base sm:text-lg text-slate-100 leading-normal sm:leading-relaxed mt-1.5 max-w-[620px] font-medium">
                {slide.subtitle}
              </p>
            </div>
          </div>

          {/* Footer: Locked identical height across all slides */}
          <div className="h-[60px] flex items-center justify-center pt-2 border-t border-white/10 shrink-0">
            {currentSlide === slides.length - 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-12 py-2.5 rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-white border-b-4 border-b-orange-700 active:border-b-0 active:translate-y-1 shadow-[0_12px_30px_rgba(255,145,45,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 animate-in fade-in zoom-in-95 duration-150"
              >
                <span>Start Level</span>
                <Rocket size={18} />
              </button>
            ) : (
              <div className="h-11" aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Floating Right Arrow - sits to the right with guaranteed gap */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          disabled={currentSlide === slides.length - 1}
          className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-200 z-30 ${currentSlide === slides.length - 1
            ? 'opacity-0 pointer-events-none cursor-default'
            : 'bg-gradient-to-b from-[#250b3d] to-[#140422] border-amber-500/70 text-[#ffaa40] shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(255,170,64,0.2)] hover:bg-gradient-to-br hover:from-[#ff8800] hover:via-[#a824e8] hover:to-[#581c87] hover:border-amber-400 hover:text-white hover:scale-110 active:scale-95 hover:shadow-[0_0_30px_rgba(255,145,45,0.7),0_0_40px_rgba(168,85,247,0.6)] cursor-pointer'
            }`}
          title="Next slide"
          aria-label="Next slide"
        >
          <ChevronRight size={30} strokeWidth={2.5} />
        </button>
      </div>
    </div>,
    document.body
  );
}
