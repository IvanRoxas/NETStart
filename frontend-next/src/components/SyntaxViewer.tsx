"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Check, Copy, Code2, Sparkles, HelpCircle } from 'lucide-react';

export interface SyntaxExplanation {
  title: string;
  tagOrCommand: string;
  category: 'Structure' | 'Content' | 'Styling' | 'Action' | 'Logic' | 'Loop' | 'General' | 'String Operation' | 'Security' | 'Warning' | 'Behavior' | 'Instantiation' | 'Memory' | 'Allocation' | 'Deallocation';
  description: string;
  functionPurpose: string;
}

interface SyntaxViewerProps {
  code: string;
  mode?: 'html' | 'css' | 'pseudocode' | 'javascript' | 'java' | 'cpp' | 'python' | 'auto';
  missionId?: string;
}

// Beginner-Friendly Explanations (Jargon-Free) with Real-World Scenarios
export function getSyntaxExplanation(lineText: string, isHtml: boolean, isCss: boolean = false, languageMode?: string): SyntaxExplanation {
  const trimmed = lineText.trim();
  const lower = trimmed.toLowerCase();

  // If in Python mode or line matches Python patterns:
  const isPythonTarget =
    languageMode === 'python' ||
    (!isHtml &&
      !isCss &&
      (trimmed.startsWith('#') ||
        trimmed.startsWith('data') ||
        trimmed.includes('.replace(') ||
        trimmed.includes('.split(') ||
        (trimmed.includes('[') && trimmed.includes(':')) ||
        trimmed.startsWith('print(') ||
        trimmed.startsWith('Archive') ||
        trimmed.startsWith('Planet') ||
        /^(?:Mercury|Venus|Earth|Mars|Jupiter|Saturn)\s*=/.test(trimmed) ||
        trimmed.startsWith('import ') ||
        trimmed.startsWith('def ') ||
        trimmed.startsWith('system.synchronize') ||
        trimmed.includes('.load_') ||
        trimmed.includes('"type":') ||
        trimmed.includes('"features":') ||
        trimmed.includes('"description":') ||
        trimmed === '}'));

  // =========================================================================
  // PYTHON STRING MANIPULATION & REBOOT ARCHITECTURE (Earth Levels 1, 2, 3)
  // =========================================================================
  if (isPythonTarget) {
    if (trimmed.startsWith('import ')) {
      const mod = trimmed.replace('import ', '').trim();
      const capMod = mod.charAt(0).toUpperCase() + mod.slice(1);
      return {
        title: `Import Module (import ${mod})`,
        tagOrCommand: `import ${mod}`,
        category: 'Structure',
        description: `Brings in an outside tool or library so you can use its features in your code.`,
        functionPurpose: `Connects ${capMod}'s system to your code so you can run its reboot tools.`,
      };
    }

    if (trimmed.startsWith('def master_reboot():') || trimmed.startsWith('def ')) {
      return {
        title: 'Define Function (def master_reboot():)',
        tagOrCommand: 'def master_reboot():',
        category: 'Structure',
        description: 'Creates a reusable command (a function) that groups multiple actions together under one name.',
        functionPurpose: 'Bundles all planetary repair steps into one master checklist routine.',
      };
    }

    if (trimmed.includes('.load_')) {
      const modName = trimmed.split('.')[0];
      const capMod = modName.charAt(0).toUpperCase() + modName.slice(1);
      return {
        title: `Call Module Method (${capMod}.${trimmed.split('(')[0].split('.')[1]}())`,
        tagOrCommand: trimmed,
        category: 'Action',
        description: `Runs a specific action that belongs to that imported tool.`,
        functionPurpose: `Powers up ${capMod}'s system and brings its controls back online.`,
      };
    }

    if (trimmed.startsWith('system.synchronize')) {
      return {
        title: 'Callback Execution (system.synchronize())',
        tagOrCommand: 'system.synchronize(master_reboot)',
        category: 'Action',
        description: 'Tells the main system to run your master reboot program.',
        functionPurpose: 'Fires up the Astrolink to activate all connected planets at once!',
      };
    }

    if (trimmed.startsWith('#')) {
      if (lower.includes('master ledger') || lower.includes('earth')) {
        return {
          title: 'Program Comment (#)',
          tagOrCommand: '# Earth Master Ledger Program',
          category: 'General',
          description: 'A comment note for humans to read. The computer skips it when running the code.',
          functionPurpose: 'Titles your script and explains the steps for human readers.',
        };
      }
      return {
        title: 'Developer Comment (#)',
        tagOrCommand: trimmed.length > 25 ? trimmed.slice(0, 25) + '...' : trimmed,
        category: 'General',
        description: 'A helpful note in the code for humans. The computer ignores it when running.',
        functionPurpose: 'Explains what this step is doing in plain words.',
      };
    }

    if (trimmed.includes('[') && trimmed.includes(':') && trimmed.includes(']')) {
      return {
        title: 'String Slicing ([start:stop])',
        tagOrCommand: 'data = data[start:stop]',
        category: 'String Operation',
        description: 'Cuts out a piece of the text, keeping only the letters between two positions.',
        functionPurpose: 'Snips off messy symbols at the edges to save the real message.',
      };
    }

    if (trimmed.includes('.replace(')) {
      return {
        title: 'String Replacement (.replace())',
        tagOrCommand: 'data = data.replace(old, new)',
        category: 'String Operation',
        description: 'Swaps out old letters or words for new ones across your text.',
        functionPurpose: 'Finds scrambled numbers or symbols and fixes them with the right letters.',
      };
    }

    if (trimmed.includes('.split(')) {
      return {
        title: 'String Splitting (.split())',
        tagOrCommand: 'data = data.split(delimiter)',
        category: 'String Operation',
        description: 'Chops a long sentence into a list of separate, individual words.',
        functionPurpose: 'Breaks up the joined transmission text into clean individual words.',
      };
    }

    if (trimmed.startsWith('print(') || trimmed.includes('print(')) {
      return {
        title: 'Console Output (print())',
        tagOrCommand: 'print(data)',
        category: 'Action',
        description: 'Shows text or answers on the screen so you can see what happened.',
        functionPurpose: 'Displays your clean data on the console to check your work.',
      };
    }

    if ((trimmed.startsWith('data =') || trimmed.startsWith('data=')) && !trimmed.includes('[') && !trimmed.includes('.replace') && !trimmed.includes('.split')) {
      return {
        title: 'Variable Assignment (data = ...)',
        tagOrCommand: 'data = "..."',
        category: 'Structure',
        description: 'Saves text into a named storage box (a variable) to use in later steps.',
        functionPurpose: 'Holds the scrambled message in memory so you can start cleaning it.',
      };
    }

    if (trimmed.includes('Archive.append(')) {
      return {
        title: 'List Append (.append())',
        tagOrCommand: 'Archive.append(planet)',
        category: 'Action',
        description: 'Adds a new item to the very end of your list.',
        functionPurpose: 'Saves this verified planet record into the station archive.',
      };
    }

    if (trimmed.includes('Archive[') && trimmed.includes(']')) {
      return {
        title: 'Zero-Based Indexing (Archive[0])',
        tagOrCommand: 'Archive[0]',
        category: 'Structure',
        description: 'Grabs the very first item from your list (Python starts counting at 0!).',
        functionPurpose: 'Pulls up the first saved planet record from your archive.',
      };
    }

    if (trimmed.startsWith('Archive =') || trimmed.startsWith('Archive=')) {
      return {
        title: 'List Initialization (Archive = [])',
        tagOrCommand: 'Archive = []',
        category: 'Structure',
        description: 'Creates a fresh, empty list ready to collect and hold items.',
        functionPurpose: 'Sets up an empty collection list to hold all verified planet records.',
      };
    }

    // -----------------------------------------------------------------------
    // Section 1: Planet Profile Dictionary (Informative, simple, friendly)
    // -----------------------------------------------------------------------
    if (/(?:Mercury|Venus|Earth|Mars|Jupiter|Saturn|Planet)\s*=\s*\{/.test(trimmed)) {
      const match = trimmed.match(/(Mercury|Venus|Earth|Mars|Jupiter|Saturn|Planet)/);
      const planetName = match ? match[1] : 'Planet';
      return {
        title: `Dictionary Object (${planetName} = {)`,
        tagOrCommand: `${planetName} = {`,
        category: 'Structure',
        description: 'Creates a dictionary to store facts with neat labels, like a profile card.',
        functionPurpose: `Packages all facts about ${planetName} into one neat record.`,
      };
    }

    if (trimmed.includes('"type":')) {
      return {
        title: 'Key-Value Attribute ("type")',
        tagOrCommand: '"type": "..."',
        category: 'Content',
        description: 'A label on the profile card that stores what kind of planet it is.',
        functionPurpose: 'Saves the planetary classification (like Rocky or Gas Giant).',
      };
    }

    if (trimmed.includes('"features":') || trimmed.includes('"known_for":')) {
      return {
        title: 'Key-Value Attribute ("features")',
        tagOrCommand: '"features": "..."',
        category: 'Content',
        description: 'A label on the profile card that stores what makes this planet special.',
        functionPurpose: 'Saves the standout features, like rings or giant storms.',
      };
    }

    if (trimmed.includes('"description":')) {
      return {
        title: 'Key-Value Attribute ("description")',
        tagOrCommand: '"description": "..."',
        category: 'Content',
        description: 'A label on the profile card that stores a short summary sentence.',
        functionPurpose: 'Saves the decoded description sentence for the record.',
      };
    }

    if (trimmed === '}' || trimmed === '},') {
      return {
        title: 'Close Dictionary Scope (})',
        tagOrCommand: '}',
        category: 'Structure',
        description: 'Closes the dictionary, showing that this profile card is complete.',
        functionPurpose: 'Marks the end of this planet\'s data record.',
      };
    }
  }

  // =========================================================================
  // COMMENTS (C++, JS, Java)
  // =========================================================================
  if (trimmed.startsWith('//')) {
    if (lower.includes('saturn ring debris') || lower.includes('hazard defense')) {
      return {
        title: 'Mission Blueprint Header (//)',
        tagOrCommand: '// Saturn Ring Debris & Hazard Defense',
        category: 'General',
        description: 'A comment line describing the Saturn Level 2 material routing and hazard defense program.',
        functionPurpose: 'Documents the mission purpose for human flight engineers reviewing your C++ code.',
      };
    }
    if (lower.includes('incoming space objects') || lower.includes('hazards')) {
      return {
        title: 'Sensor Scanner Note (//)',
        tagOrCommand: '// Listen for incoming space objects & hazards',
        category: 'General',
        description: 'A comment line reminding the developer that the radar scanner is constantly watching for space items.',
        functionPurpose: 'Explains what the switch-case statement is listening for.',
      };
    }
    return {
      title: 'Code Comment',
      tagOrCommand: '// note',
      category: 'General',
      description: 'A developer note that the computer ignores when running.',
      functionPurpose: 'Explains what the code does for human readability.',
    };
  }

  // =========================================================================
  // JAVA CLASSES & OBJECTS (Jupiter Level 3: The AI Core Lockdown)
  // =========================================================================
  if (trimmed.match(/public\s+class\s+(AdminProfile|TechProfile|SecurityProfile|VisitorProfile|UserProfile|\w+Profile)/) || trimmed.startsWith('public class')) {
    const match = trimmed.match(/class\s+(\w+)/);
    const cName = match ? match[1] : 'Profile';
    return {
      title: `Class Blueprint (${cName})`,
      tagOrCommand: `public class ${cName} {`,
      category: 'Structure',
      description: `A template for creating a ${cName} badge.`,
      functionPurpose: 'Defines the private security data, public role, and actions for this profile.',
    };
  }

  if (trimmed.includes('private ') && (trimmed.includes('clearanceLevel') || trimmed.includes('role') || trimmed.includes('int ') || trimmed.includes('String '))) {
    return {
      title: 'Private Data (private)',
      tagOrCommand: trimmed.replace(/;$/, ''),
      category: 'Security',
      description: 'Secret data stored inside the badge that cannot be seen or altered from outside.',
      functionPurpose: 'Protects sensitive credentials like clearance level from unauthorized scans.',
    };
  }

  if (trimmed.includes('public ') && (trimmed.includes('role') || trimmed.includes('clearanceLevel') || (trimmed.includes('String ') && !trimmed.includes('(')))) {
    return {
      title: 'Public Data (public)',
      tagOrCommand: trimmed.replace(/;$/, ''),
      category: 'Structure',
      description: 'Open data that security scanners can inspect directly.',
      functionPurpose: 'Broadcasts the profile role (like Admin or Visitor) to identification checkpoints.',
    };
  }

  if (trimmed.includes('void ') || /public\s+void\s+\w+\s*\(/.test(trimmed)) {
    const match = trimmed.match(/void\s+(\w+)/);
    const mName = match ? `${match[1]}()` : 'action()';
    return {
      title: `Action Method (${mName})`,
      tagOrCommand: `public void ${mName} {`,
      category: 'Behavior',
      description: `An action this profile can perform when triggered.`,
      functionPurpose: `Executes the profile's specialized task during the scan sequence.`,
    };
  }

  if (trimmed.includes('new ') && /=\s*new\s+\w+\s*\(/.test(trimmed)) {
    const match = trimmed.match(/new\s+(\w+)/);
    const cName = match ? match[1] : 'Profile';
    return {
      title: `Badge Creation (new ${cName})`,
      tagOrCommand: trimmed.replace(/;$/, ''),
      category: 'Instantiation',
      description: `Creates a physical badge object in memory using the blueprint.`,
      functionPurpose: `Produces the credential card needed for the holographic scanner slot.`,
    };
  }

  // =========================================================================
  // JAVA TRY/CATCH DEFENSE GRID (Jupiter Level 2) — Kid-Friendly Explanations
  // =========================================================================
  if (trimmed.startsWith('public class CloudGridArchive')) {
    return {
      title: 'Cloud Grid Archive (class)',
      tagOrCommand: 'public class CloudGridArchive {',
      category: 'Structure',
      description: 'The master program container for Jupiter\'s Cloud Grid Archive network.',
      functionPurpose: 'Holds all the executable code, defense turrets, and safety shields protecting the server core.',
    };
  }

  if (trimmed.startsWith('public static void main')) {
    return {
      title: 'Main System Engine (main)',
      tagOrCommand: 'public static void main(String[] args) {',
      category: 'Structure',
      description: 'The primary ignition switch where Java begins running all station programs.',
      functionPurpose: 'Starts the data flow and activates your safety dome and error handling defense turrets.',
    };
  }

  if (trimmed.startsWith('try {') || trimmed === 'try {') {
    return {
      title: 'Try Safety Dome (try)',
      tagOrCommand: 'try { ... }',
      category: 'Logic',
      description: 'A protective safety shield around incoming data. If an error occurs inside, the dome catches it instead of crashing the server!',
      functionPurpose: 'Watches the marching data packets and safely routes any detected errors to your catch turrets.',
    };
  }

  if (trimmed.includes('startDataStream()') || trimmed.includes('scanDataStream()')) {
    return {
      title: 'Start Data Stream (startDataStream)',
      tagOrCommand: 'startDataStream();',
      category: 'Action',
      description: 'Opens the intake conduits to let incoming data blocks march down the transmission track toward the core.',
      functionPurpose: 'Feeds data blocks into the try dome so corrupted packets can be intercepted before reaching the server.',
    };
  }

  // --- EXCEPTIONS (THREATS) ---
  if (trimmed.includes('NullPointerException')) {
    return {
      title: 'Missing Value Threat (NullPointerException)',
      tagOrCommand: 'catch (NullPointerException e)',
      category: 'Logic',
      description: 'Catches empty ghost blocks where critical data is completely missing (null), threatening to crash the reader.',
      functionPurpose: 'Directs the threat to The Wall turret to drop an impenetrable quarantine barrier across the track.',
    };
  }

  if (trimmed.includes('NumberFormatException')) {
    return {
      title: 'Invalid Number Threat (NumberFormatException)',
      tagOrCommand: 'catch (NumberFormatException e)',
      category: 'Logic',
      description: 'Catches corrupted blocks containing scrambled letters or symbols where a clean number was required.',
      functionPurpose: 'Directs the threat to The Gun Turret to fire rapid recalibration plasma and restore it into valid data.',
    };
  }

  if (trimmed.includes('ArrayIndexOutOfBoundsException')) {
    return {
      title: 'Out of Bounds Threat (ArrayIndexOutOfBoundsException)',
      tagOrCommand: 'catch (ArrayIndexOutOfBoundsException e)',
      category: 'Logic',
      description: 'Catches oversized data packets trying to access an address beyond the allocated track memory limit.',
      functionPurpose: 'Directs the threat to The Buffer Clamp melee scissor turret to snip off the overflow and protect memory.',
    };
  }

  if (trimmed.includes('ArithmeticException')) {
    return {
      title: 'Divide by Zero Threat (ArithmeticException)',
      tagOrCommand: 'catch (ArithmeticException e)',
      category: 'Logic',
      description: 'Catches unstable mathematical vortexes caused by dividing by zero, which threatens to implode the conduit!',
      functionPurpose: 'Directs the threat to The Bomber turret to launch heavy explosive shells and purge the vortex.',
    };
  }

  if (trimmed.includes('ClassCastException')) {
    return {
      title: 'Wrong Data Type Threat (ClassCastException)',
      tagOrCommand: 'catch (ClassCastException e)',
      category: 'Logic',
      description: 'Catches blocks that pretend to be one data type but are secretly a completely different, incompatible type inside.',
      functionPurpose: 'Directs the threat to The Type Filter turret to scan and remove the mismatched data block.',
    };
  }

  if (trimmed.includes('catch (Exception e)') || trimmed.includes('catch (Exception') || trimmed.includes('catch(Exception')) {
    return {
      title: 'Generalist Catch (catch Exception)',
      tagOrCommand: 'catch (Exception e)',
      category: 'Logic',
      description: 'A versatile universal backup turret that catches ANY corrupted block type. Because it is a generalist, it reacts more slowly.',
      functionPurpose: 'Acts as a reliable safety net catch for any unrecognized or unhandled error blocks.',
    };
  }

  if (trimmed.startsWith('catch (') || trimmed.startsWith('catch(')) {
    return {
      title: 'Catch Defense Rule (catch)',
      tagOrCommand: 'catch (Exception e) { ... }',
      category: 'Logic',
      description: 'Listens for a specific error to occur inside the try dome, preventing crashes by routing it to an action.',
      functionPurpose: 'Intercepts the named error type and executes your mounted turret defense payoff.',
    };
  }

  // --- TURRET DEFENSE ACTIONS ---
  if (trimmed.includes('quarantine(') || trimmed.includes('quarantine()')) {
    return {
      title: 'The Wall: Quarantine Action (quarantine)',
      tagOrCommand: 'quarantine(e);',
      category: 'Action',
      description: 'Deploys an impenetrable high-voltage energy barricade across the track, halting the corrupted packet dead in its tracks.',
      functionPurpose: 'Safely isolates Missing Value (NullPointerException) threats so they cannot breach the server core.',
    };
  }

  if (trimmed.includes('purge(') || trimmed.includes('overload(') || trimmed.includes('purge()') || trimmed.includes('overload()')) {
    return {
      title: 'The Bomber: Purge Action (purge)',
      tagOrCommand: 'purge(e);',
      category: 'Action',
      description: 'Launches a heavy ballistic artillery mortar shell that detonates on impact with a fiery shockwave.',
      functionPurpose: 'Completely vaporizes dangerous Divide by Zero (ArithmeticException) vortexes in a single explosive blast.',
    };
  }

  if (trimmed.includes('recalibrate(') || trimmed.includes('recalibrate()')) {
    return {
      title: 'The Gun Turret: Recalibrate Action (recalibrate)',
      tagOrCommand: 'recalibrate(e);',
      category: 'Action',
      description: 'Fires high-speed precision kinetic plasma bursts that heal corrupted text symbols and restore clean numerical values!',
      functionPurpose: 'Cures Invalid Number (NumberFormatException) corruptions, turning them into clean green data blocks.',
    };
  }

  if (trimmed.includes('clamp(') || trimmed.includes('clamp()')) {
    return {
      title: 'The Buffer Clamp: Melee Scissor Trim (clamp)',
      tagOrCommand: 'clamp(e);',
      category: 'Action',
      description: 'Snaps dual razor-sharp titanium melee scissor shears inward across the block to cut away the buffer overflow.',
      functionPurpose: 'Instantly trims Out of Bounds (ArrayIndexOutOfBoundsException) index overflows with close-quarters mechanical precision.',
    };
  }

  if (trimmed.includes('filter(') || trimmed.includes('filter()')) {
    return {
      title: 'The Type Filter: Prism Filter Action (filter)',
      tagOrCommand: 'filter(e);',
      category: 'Action',
      description: 'Beams a multi-spectral holographic scanner fan that separates and traps incompatible data types.',
      functionPurpose: 'Safely isolates Wrong Data Type (ClassCastException) packets and disposes of mismatched corruptions.',
    };
  }

  // --- FINALLY & TRAPS ---
  if (trimmed.includes('acceptCleanData()')) {
    return {
      title: 'Accept Clean Data (acceptCleanData)',
      tagOrCommand: 'acceptCleanData();',
      category: 'Action',
      description: 'The final intake gatekeeper that verifies and welcomes clean, healthy data packets into the server core archive.',
      functionPurpose: 'Runs to ensure uncorrupted data and healed blocks are safely preserved in station memory.',
    };
  }

  if (trimmed.startsWith('finally') || trimmed.includes('activateCoreShield')) {
    return {
      title: 'Finally Failsafe Block (finally)',
      tagOrCommand: 'finally { acceptCleanData(); }',
      category: 'Structure',
      description: 'Guarantees execution no matter what happened! Runs every time, whether an error occurred, was caught, or all data was clean.',
      functionPurpose: 'Executes cleanup and final data reception routines regardless of preceding exceptions.',
    };
  }

  if (trimmed.includes('throw new') || trimmed.includes('SecurityBreachException')) {
    return {
      title: 'Emergency Trap Trigger (throw new)',
      tagOrCommand: 'throw new SecurityBreachException();',
      category: 'Action',
      description: 'Deliberately creates and raises an exception in code to trip an emergency security trap along the conduit.',
      functionPurpose: 'Throws an exception that stops and quarantines unauthorized intruders attempting to bypass standard checks.',
    };
  }

  if (trimmed.includes('Action slot incomplete')) {
    return {
      title: 'Incomplete Action Slot (//)',
      tagOrCommand: '// Action slot incomplete',
      category: 'General',
      description: 'A rule block has been connected, but no defense action pill has been snapped into its action socket yet.',
      functionPurpose: 'Reminds you to snap an action block (like Quarantine, Purge, Recalibrate, Clamp, or Filter) into the rule.',
    };
  }

  if (trimmed === '}' && languageMode === 'java') {
    return {
      title: 'Closing Block (})',
      tagOrCommand: '}',
      category: 'Structure',
      description: 'The closing curly brace that marks the end of a class, method, try block, or catch block.',
      functionPurpose: 'Signals to the Java compiler that the instructions within this code block are finished.',
    };
  }

  // =========================================================================
  // C++ STREAMS & DATA PIPELINE (Saturn Level 1 & 2) — Real-Life Coding Concepts
  // =========================================================================
  if (trimmed.startsWith('void routeToOrbit')) {
    return {
      title: 'Function Declaration (void routeToOrbit)',
      tagOrCommand: trimmed,
      category: 'Structure',
      description: 'Declares a reusable action named routeToOrbit. "void" means it performs a task but does not send back any result.',
      functionPurpose: 'Groups reusable logic into a function so you can call it anywhere without repeating your code.',
    };
  }

  if (trimmed.startsWith('void activateShield') || trimmed.startsWith('void enableShield')) {
    return {
      title: 'Function Declaration (void activateShield)',
      tagOrCommand: trimmed,
      category: 'Structure',
      description: 'Declares a reusable function that activates the shield system. "void" means it does a task without returning a result.',
      functionPurpose: 'Groups shield activation steps into one clean command so you can call it wherever needed.',
    };
  }

  if (trimmed.startsWith('#include <iostream>')) {
    return {
      title: 'I/O Stream Header (#include <iostream>)',
      tagOrCommand: '#include <iostream>',
      category: 'Structure',
      description: 'Loads the input/output tools so your program can read keyboard input and print text to the screen.',
      functionPurpose: 'Required whenever you use cin (read input) or cout (print output) in C++.',
    };
  }

  if (trimmed.startsWith('#include <string>')) {
    return {
      title: 'String Library (#include <string>)',
      tagOrCommand: '#include <string>',
      category: 'Structure',
      description: 'Adds text-handling tools so your program can store and work with words and sentences.',
      functionPurpose: 'Required to use the string type for storing text, names, and messages.',
    };
  }

  if (trimmed.startsWith('using namespace std;')) {
    return {
      title: 'Namespace Import (using namespace std;)',
      tagOrCommand: 'using namespace std;',
      category: 'Structure',
      description: 'Lets you use built-in C++ commands like cout and cin directly without any extra typing.',
      functionPurpose: 'Without this, you would have to type "std::cout" and "std::cin" everywhere in your code.',
    };
  }

  if (trimmed.startsWith('int main')) {
    return {
      title: 'Main Entry Point (int main)',
      tagOrCommand: 'int main() {',
      category: 'Structure',
      description: 'Where your C++ program starts running. Every C++ program must have this as its starting point.',
      functionPurpose: 'All the instructions inside this function run in order when you launch the program.',
    };
  }

  if (trimmed.startsWith('return 0;') || trimmed === 'return 0;') {
    return {
      title: 'Exit Code (return 0;)',
      tagOrCommand: 'return 0;',
      category: 'Action',
      description: 'Signals that the program finished successfully with no errors.',
      functionPurpose: 'Tells the computer the program is done and everything went as expected.',
    };
  }

  // =========================================================================
  // C++ POINTERS & MEMORY MANAGEMENT (Saturn Level 3: A Leak in the System!)
  // =========================================================================
  if (trimmed.includes('new Core') || trimmed.includes('= new Core')) {
    const isShield = trimmed.includes('shield');
    const isDebris = trimmed.includes('debris');
    const amount = isShield ? 2 : isDebris ? 3 : 2;
    const ptrName = isShield ? 'shieldPtr' : isDebris ? 'debrisPtr' : 'sensorPtr';
    const taskName = isShield ? 'Shields' : isDebris ? 'Debris' : 'Sensors';
    return {
      title: `Dynamic Allocation (new Core)`,
      tagOrCommand: `Task* ${ptrName} = new Core(${amount});`,
      category: 'Allocation',
      description: `Creates a new object in memory at runtime and stores a reference to it in a pointer variable.`,
      functionPurpose: `Used for objects whose size or lifespan isn't known at the start — like game entities or incoming data buffers.`,
    };
  }

  if (trimmed.startsWith('delete ') || trimmed.includes('delete sensorPtr') || trimmed.includes('delete debrisPtr') || trimmed.includes('delete shieldPtr')) {
    const isShield = trimmed.includes('shield');
    const isDebris = trimmed.includes('debris');
    const ptrName = isShield ? 'shieldPtr' : isDebris ? 'debrisPtr' : 'sensorPtr';
    const taskName = isShield ? 'Shields' : isDebris ? 'Debris' : 'Sensors';
    return {
      title: `Memory Deallocation (delete)`,
      tagOrCommand: `delete ${ptrName};`,
      category: 'Deallocation',
      description: `Removes the object from memory when you are done with it, freeing up space for other tasks.`,
      functionPurpose: `Prevents memory leaks — a bug where programs slowly eat up all available RAM until they crash.`,
    };
  }

  if (trimmed.includes('Task*') || trimmed.includes('*sensorPtr') || trimmed.includes('*debrisPtr') || trimmed.includes('*shieldPtr')) {
    const isShield = trimmed.includes('shield');
    const isDebris = trimmed.includes('debris');
    const ptrName = isShield ? 'shieldPtr' : isDebris ? 'debrisPtr' : 'sensorPtr';
    return {
      title: `Pointer Declaration (Task* ${ptrName})`,
      tagOrCommand: `Task* ${ptrName} = nullptr;`,
      category: 'Memory',
      description: `Creates a pointer — a special variable that stores the location of another object in memory rather than data directly.`,
      functionPurpose: `Lets programs share and update large objects without slow copying, and tracks dynamically created items.`,
    };
  }

  if (trimmed.includes('nullptr')) {
    return {
      title: 'Null Pointer (nullptr)',
      tagOrCommand: 'ptr = nullptr;',
      category: 'Memory',
      description: 'Means this pointer is empty and not pointing to anything yet. A safe empty value for pointers.',
      functionPurpose: 'Set after deleting an object to prevent the pointer from accidentally accessing old, freed memory.',
    };
  }

  if (trimmed.includes('runSensors()')) {
    return {
      title: 'Function Call (runSensors)',
      tagOrCommand: 'runSensors();',
      category: 'Action',
      description: 'Pauses main(), jumps the CPU to execute the sensor scanning instructions, and returns when done.',
      functionPurpose: 'Breaks software into reusable, isolated tasks—like reading hardware sensors or monitoring network data.',
    };
  }

  if (trimmed.includes('runDebris()')) {
    return {
      title: 'Function Call (runDebris)',
      tagOrCommand: 'runDebris();',
      category: 'Action',
      description: 'Executes the debris pulverizer subroutine in memory and returns back to the caller upon completion.',
      functionPurpose: 'In real coding, functions allow different parts of an application to be tested and updated independently.',
    };
  }

  if (trimmed.includes('runShields()')) {
    return {
      title: 'Function Call (runShields)',
      tagOrCommand: 'runShields();',
      category: 'Action',
      description: 'Transfers CPU execution to the deflector shield subroutine and runs its protective operations.',
      functionPurpose: 'Used in real-world systems to package critical hardware safety procedures into a single command call.',
    };
  }

  if (trimmed.includes('ramPressure')) {
    return {
      title: 'Conditional Guard (if)',
      tagOrCommand: 'if (ramPressure >= 75) { ... }',
      category: 'Logic',
      description: 'Checks live memory pressure at runtime and only runs the code inside if the condition evaluates to true.',
      functionPurpose: 'Used in real systems to monitor resource limits (like RAM or CPU heat) and trigger safety cleanup before a crash.',
    };
  }

  if (trimmed.startsWith('switch (') || trimmed.startsWith('switch(')) {
    return {
      title: 'Switch Statement (switch)',
      tagOrCommand: 'switch (detectedObject)',
      category: 'Logic',
      description: 'Checks a value once and jumps directly to the matching case. Cleaner than writing many if-else blocks.',
      functionPurpose: 'Used when you have many possible values to check, like different item types or input commands.',
    };
  }

  if (trimmed.includes('ObjectType::ICE')) {
    return {
      title: 'Enum Case Branch (case ObjectType::ICE:)',
      tagOrCommand: 'case ObjectType::ICE:',
      category: 'Logic',
      description: 'A case branch matching the strongly-typed enum constant ObjectType::ICE.',
      functionPurpose: 'Enums represent distinct states or categories in a type-safe, readable way instead of using raw numbers.',
    };
  }

  if (trimmed.includes('ObjectType::ROCK')) {
    return {
      title: 'Enum Case Branch (case ObjectType::ROCK:)',
      tagOrCommand: 'case ObjectType::ROCK:',
      category: 'Logic',
      description: 'A case branch matching the enum constant ObjectType::ROCK for processing rock materials.',
      functionPurpose: 'Prevents invalid state bugs by ensuring only recognized, predefined categories can be handled.',
    };
  }

  if (trimmed.includes('ObjectType::MINERAL')) {
    return {
      title: 'Enum Case Branch (case ObjectType::MINERAL:)',
      tagOrCommand: 'case ObjectType::MINERAL:',
      category: 'Logic',
      description: 'A case branch matching the enum constant ObjectType::MINERAL to route mineral debris.',
      functionPurpose: 'Used in simulation software and games to route different entity types to their specialized handlers.',
    };
  }

  if (trimmed.includes('ObjectType::CRYSTAL')) {
    return {
      title: 'Enum Case Branch (case ObjectType::CRYSTAL:)',
      tagOrCommand: 'case ObjectType::CRYSTAL:',
      category: 'Logic',
      description: 'A case branch matching the rare crystal enum constant for high-priority routing.',
      functionPurpose: 'Demonstrates priority routing where specific categorized inputs receive specialized processing.',
    };
  }

  if (trimmed.includes('ObjectType::BIG_ASTEROID')) {
    return {
      title: 'Emergency Case Branch (case ObjectType::BIG_ASTEROID:)',
      tagOrCommand: 'case ObjectType::BIG_ASTEROID:',
      category: 'Logic',
      description: 'An emergency case branch that bypasses standard processing and triggers defensive routines.',
      functionPurpose: 'In real software, emergency branches handle critical alerts, sensor faults, or hardware interrupts.',
    };
  }

  if (trimmed.startsWith('case ') || trimmed.startsWith('case:')) {
    return {
      title: 'Case Branch Label (case)',
      tagOrCommand: trimmed.replace(':', '') + ':',
      category: 'Logic',
      description: 'Specifies a constant value to test against the switch expression.',
      functionPurpose: 'Pairs specific input values (like keypresses or status codes) with their dedicated response logic.',
    };
  }

  if (trimmed.startsWith('default:') || trimmed === 'default:') {
    return {
      title: 'Default Fallback (default:)',
      tagOrCommand: 'default:',
      category: 'Logic',
      description: 'The fallback branch that executes when none of the preceding case options match.',
      functionPurpose: 'A defensive coding standard ensuring your program has safe, predictable behavior for unexpected inputs.',
    };
  }

  if (trimmed.startsWith('break;') || trimmed === 'break;') {
    return {
      title: 'Break Statement (break;)',
      tagOrCommand: 'break;',
      category: 'Logic',
      description: 'Immediately terminates execution and exits the switch block or loop.',
      functionPurpose: 'Prevents code from accidentally "falling through" and running the next case by mistake.',
    };
  }

  if (trimmed.includes('routeToOrbit(')) {
    return {
      title: 'Function Invocation (routeToOrbit)',
      tagOrCommand: trimmed.includes(';') ? trimmed : 'routeToOrbit(orbitNumber);',
      category: 'Action',
      description: 'Calls routeToOrbit, passing the target orbit number as an argument.',
      functionPurpose: 'Demonstrates passing parameters into functions to control external devices or calculations.',
    };
  }

  if (trimmed.includes('activateShield(') || trimmed.includes('enableShield(')) {
    return {
      title: 'Function Invocation (activateShield)',
      tagOrCommand: trimmed.includes(';') ? trimmed : 'activateShield();',
      category: 'Action',
      description: 'Calls activateShield to trigger emergency defensive forcefields.',
      functionPurpose: 'Encapsulates multi-step safety procedures into a single, clean command call.',
    };
  }

  if (trimmed.includes('greetUFO(')) {
    return {
      title: 'Function Invocation (greetUFO)',
      tagOrCommand: 'greetUFO();',
      category: 'Action',
      description: 'Executes a communication routine to establish contact with external entities.',
      functionPurpose: 'Demonstrates event handling where specific triggers invoke dedicated communication protocols.',
    };
  }

  if (trimmed.startsWith('while (') || trimmed.startsWith('while(')) {
    return {
      title: 'While Loop (while)',
      tagOrCommand: 'while (cin >> input)',
      category: 'Loop',
      description: 'Repeats a block of code continuously as long as its condition evaluates to true.',
      functionPurpose: 'Powers game loops, event listeners, and data readers that process streams until stopped.',
    };
  }

  if (trimmed.startsWith('cin >>') || trimmed.includes('cin >>')) {
    return {
      title: 'Stream Input (std::cin >>)',
      tagOrCommand: 'cin >> variable;',
      category: 'Action',
      description: 'Reads data typed by the user from the terminal and stores it in a variable.',
      functionPurpose: 'Allows interactive command-line software to accept user commands and values.',
    };
  }

  if (trimmed.includes('<< endl') || trimmed.includes('endl;')) {
    return {
      title: 'Newline & Flush (std::endl)',
      tagOrCommand: '<< endl;',
      category: 'Action',
      description: 'Inserts a newline and immediately flushes the terminal display buffer.',
      functionPurpose: 'Ensures console messages appear on screen right away without delay.',
    };
  }

  if (trimmed.startsWith('cout <<') || trimmed.includes('cout <<')) {
    return {
      title: 'Stream Output (std::cout <<)',
      tagOrCommand: 'cout << message << endl;',
      category: 'Action',
      description: 'Prints text, variables, and numbers out to the terminal screen.',
      functionPurpose: 'The standard way C++ programs output messages, results, and diagnostic logs to users.',
    };
  }

  if (trimmed.startsWith('string ') || trimmed.startsWith('string\t')) {
    return {
      title: 'String Variable (std::string)',
      tagOrCommand: 'string textWord;',
      category: 'Structure',
      description: 'Declares a variable that stores text — like a word, sentence, or file path.',
      functionPurpose: 'Used for names, text messages, and data that contains letters or symbols.',
    };
  }

  if (trimmed.startsWith('bool ') || trimmed.startsWith('bool\t')) {
    return {
      title: 'Boolean Variable (bool)',
      tagOrCommand: 'bool answerChoice;',
      category: 'Logic',
      description: 'Declares a yes/no variable that can only be true or false.',
      functionPurpose: 'Used for on/off switches, condition checks, and feature toggles.',
    };
  }

  if (trimmed.startsWith('int ') || trimmed.startsWith('int\t')) {
    return {
      title: 'Integer Variable (int)',
      tagOrCommand: 'int numberVal;',
      category: 'Structure',
      description: 'Declares a whole number variable. No decimals allowed — for counting and math.',
      functionPurpose: 'Used for counters, scores, array indexes, and any calculation without fractions.',
    };
  }

  if (trimmed === '{') {
    return {
      title: 'Block Scope Open ({)',
      tagOrCommand: '{',
      category: 'Structure',
      description: 'Begins a code block and opens a local variable scope in memory.',
      functionPurpose: 'Variables created inside this block are automatically deleted from RAM when it closes.',
    };
  }

  if (trimmed === '}') {
    return {
      title: 'Block Scope Close (})',
      tagOrCommand: '}',
      category: 'Structure',
      description: 'Ends the code block and frees all local variables created inside it.',
      functionPurpose: 'Marks where a function, loop, or conditional block ends.',
    };
  }


  // =========================================================================
  // JAVA STRONG TYPING & PROGRAM EXPLANATIONS (Jupiter Level 1)
  // =========================================================================
  if (trimmed.startsWith('public class ') || trimmed.includes('class AirlockControl')) {
    return {
      title: 'Java Class Declaration',
      tagOrCommand: 'public class AirlockControl { ... }',
      category: 'Structure',
      description: 'In Java, all executable code must live inside a class. "public" makes it accessible, and "class" defines the program blueprint.',
      functionPurpose: 'Packages your credential variables and hardware transmission methods into a structured, runnable Java program.',
    };
  }

  // =========================================================================
  // JAVA TRY/CATCH SAFETY NET (Jupiter Level 2)
  // =========================================================================
  if (trimmed.includes('class CloudGridArchive')) {
    return {
      title: 'Cloud Grid Archive Class',
      tagOrCommand: 'public class CloudGridArchive',
      category: 'Structure',
      description: 'The master container class that houses the space station\'s cloud defense routines.',
      functionPurpose: 'Defines the digital archive environment where data blocks are scanned and filtered.',
    };
  }

  if (trimmed.startsWith('try {') || trimmed === 'try') {
    return {
      title: 'Try Safety Net Block (try { ... })',
      tagOrCommand: 'try { ... }',
      category: 'Structure',
      description: 'A protective wrapper around risky code that monitors for unexpected errors without crashing.',
      functionPurpose: 'Acts as the main radar dome to scan incoming data blocks before they reach the server core.',
    };
  }

  if (trimmed.includes('scanDataStream()')) {
    return {
      title: 'Scan Data Stream (scanDataStream())',
      tagOrCommand: 'scanDataStream();',
      category: 'Action',
      description: 'Reads data packets traveling down the pipeline into the archive station.',
      functionPurpose: 'Processes the incoming queue of clean and corrupted data blocks.',
    };
  }

  if (trimmed.includes('catch (NullPointerException')) {
    return {
      title: 'Catch NullPointerException',
      tagOrCommand: 'catch (NullPointerException e)',
      category: 'Logic',
      description: 'Intercepts hollow, uninitialized data blocks with missing memory references.',
      functionPurpose: 'Locks onto hollow blocks so your turret can fill the void or dispose of them.',
    };
  }

  if (trimmed.includes('catch (NumberFormatException')) {
    return {
      title: 'Catch NumberFormatException',
      tagOrCommand: 'catch (NumberFormatException e)',
      category: 'Logic',
      description: 'Catches scrambled data blocks containing chaotic text symbols instead of clean numbers.',
      functionPurpose: 'Targets scrambled data packets before they confuse the system calculation pipelines.',
    };
  }

  if (trimmed.includes('catch (ArrayIndexOutOfBoundsException')) {
    return {
      title: 'Catch ArrayIndexOutOfBoundsException',
      tagOrCommand: 'catch (ArrayIndexOutOfBoundsException e)',
      category: 'Logic',
      description: 'Intercepts oversized data blocks that exceed buffer memory array limits.',
      functionPurpose: 'Stops bloated blocks that try to push data into non-existent array positions.',
    };
  }

  if (trimmed.includes('catch (ArithmeticException')) {
    return {
      title: 'Catch ArithmeticException',
      tagOrCommand: 'catch (ArithmeticException e)',
      category: 'Logic',
      description: 'Catches swirling mathematical vortex errors caused by invalid math like dividing by zero (/ 0).',
      functionPurpose: 'Prevents mathematical singularities from destabilizing the station archive.',
    };
  }

  if (trimmed.startsWith('catch (')) {
    return {
      title: 'Catch Block Handler (catch)',
      tagOrCommand: trimmed,
      category: 'Logic',
      description: 'Intercepts specific error types thrown within the try block and applies defense logic.',
      functionPurpose: 'Binds an error-handling turret to a matching corrupted data block.',
    };
  }

  if (trimmed.includes('quarantine()')) {
    return {
      title: 'Quarantine Resolution (quarantine())',
      tagOrCommand: 'quarantine();',
      category: 'Action',
      description: 'Deploys a mechanical claw arm to pick up the corrupted block and toss it into a disposal bin.',
      functionPurpose: 'Safely removes corrupted blocks without risking the server core.',
    };
  }

  if (trimmed.includes('overload()')) {
    return {
      title: 'Overload Resolution (overload())',
      tagOrCommand: 'overload();',
      category: 'Action',
      description: 'Fires a high-powered laser beam that detonates the target in an area-of-effect explosion.',
      functionPurpose: 'Quickly wipes out clustered corrupted blocks, but beware of clean data collateral damage.',
    };
  }

  if (trimmed.includes('recalibrate()')) {
    return {
      title: 'Recalibrate Resolution (recalibrate())',
      tagOrCommand: 'recalibrate();',
      category: 'Action',
      description: 'Activates specialized machine recalibration beams to repair corrupted data blocks.',
      functionPurpose: 'Scrubs corrupted blocks into clean green data so they can safely enter the core.',
    };
  }

  if (trimmed.includes('public static void main')) {
    return {
      title: 'Main Entry Method',
      tagOrCommand: 'public static void main(String[] args)',
      category: 'Structure',
      description: 'The universal starting point for any Java program. The Java Virtual Machine (JVM) calls this method to start execution.',
      functionPurpose: 'Executes your instructions in order from top to bottom, commanding data transmission to the station locks.',
    };
  }

  if (trimmed.startsWith('String ') || trimmed.startsWith('String\t') || trimmed === 'String') {
    return {
      title: 'String (Text Variable)',
      tagOrCommand: trimmed.includes('=') ? trimmed.replace(/;$/, '') + ';' : 'String password = "text";',
      category: 'Structure',
      description: 'A text variable in Java. Use double quotes around the value, like "hello" or "password123".',
      functionPurpose: 'Stores the security password as text to send to the optical scanner.',
    };
  }

  if (trimmed.startsWith('int ') || trimmed.startsWith('int\t') || trimmed === 'int') {
    return {
      title: 'int (Whole Number Variable)',
      tagOrCommand: trimmed.includes('=') ? trimmed.replace(/;$/, '') + ';' : 'int pin = 1234;',
      category: 'Structure',
      description: 'A whole number variable in Java. No quotes needed — just write the number, like 1234.',
      functionPurpose: 'Stores the numeric PIN code needed to unlock the digital keypad deadbolt.',
    };
  }

  if (trimmed.startsWith('boolean ') || trimmed.startsWith('boolean\t') || trimmed === 'boolean') {
    return {
      title: 'boolean (True/False Variable)',
      tagOrCommand: trimmed.includes('=') ? trimmed.replace(/;$/, '') + ';' : 'boolean override = true;',
      category: 'Logic',
      description: 'A true/false variable in Java. It can only hold true or false — no quotes or numbers.',
      functionPurpose: 'Sets the emergency override switch so the breaker knows whether to engage.',
    };
  }

  if (trimmed.includes('OpticalScanner.enterCode')) {
    return {
      title: 'OpticalScanner Method Call',
      tagOrCommand: 'OpticalScanner.enterCode(password);',
      category: 'Action',
      description: 'Calls the optical scanner and passes your password variable to check.',
      functionPurpose: 'Transmits the text password to the scanner to disengage Deadbolt #1.',
    };
  }

  if (trimmed.includes('Pinpad.enterPin')) {
    return {
      title: 'Pinpad Method Call',
      tagOrCommand: 'Pinpad.enterPin(pin);',
      category: 'Action',
      description: 'Calls the keypad and passes it your PIN number to verify.',
      functionPurpose: 'Sends the numeric PIN to the digital keypad to disengage Deadbolt #2.',
    };
  }

  if (trimmed.includes('Breaker.setOverride')) {
    return {
      title: 'Breaker Method Call',
      tagOrCommand: 'Breaker.setOverride(override);',
      category: 'Action',
      description: 'Calls the circuit breaker and sends it your true/false switch signal.',
      functionPurpose: 'Flips the electrical breaker based on your override value to disengage Deadbolt #3.',
    };
  }

  if (trimmed.includes('Airlock.unlockDoors')) {
    return {
      title: 'Airlock Unlock Command',
      tagOrCommand: 'Airlock.unlockDoors();',
      category: 'Action',
      description: 'Triggers the airlock release once all 3 deadbolts are cleared, opening the blast doors.',
      functionPurpose: 'Confirms all security checks passed, switches the marquee to ACCESS GRANTED, and parts the doors.',
    };
  }

  // =========================================================================
  // JAVASCRIPT ASTROLINK TERMINAL (Mercury Level 3)
  // =========================================================================
  if (lower.includes('transmitastrolink(')) {
    return {
      title: 'Relay Transmission (transmitAstroLink)',
      tagOrCommand: 'transmitAstroLink(dest, msg);',
      category: 'Action',
      description: 'Invokes the AstroLink bridge to beam your message payload to the chosen planet.',
      functionPurpose: 'Transmits destination and text data across deep space to complete the planetary link.',
    };
  }

  if (lower.includes("addeventlistener('click'") || lower.includes('addeventlistener("click"')) {
    const isSubmit = lower.includes('submit') || lower.includes('send');
    const isClear = lower.includes('clear') || lower.includes('reset');
    const btnTitle = isSubmit ? 'Send Button' : isClear ? 'Reset Button' : 'Button';
    return {
      title: `Click Event Listener (${btnTitle})`,
      tagOrCommand: trimmed.includes('{') ? trimmed : `${trimmed} { ... });`,
      category: 'Action',
      description: `Binds a click event listener to the ${btnTitle} element.`,
      functionPurpose: `Executes the ${isSubmit ? 'transmission' : isClear ? 'text erase' : 'button'} action the instant the cadet clicks.`,
    };
  }

  if (lower.includes('planetdropdown') && (lower.includes('.value') || lower.includes('getelementbyid'))) {
    return {
      title: 'Read Destination Planet (.value)',
      tagOrCommand: "(document.getElementById('planetDropdown') ? document.getElementById('planetDropdown').value : '')",
      category: 'Content',
      description: 'Extracts the planet destination choice currently active in the dropdown menu.',
      functionPurpose: 'Supplies the target planet name (Mars, Venus, etc.) to the transmission bridge.',
    };
  }

  if (lower.includes('messageinput') && (lower.includes(".value = ''") || lower.includes('.value=""') || lower.includes('.value = ""'))) {
    return {
      title: 'Erase Message Box (.value = "")',
      tagOrCommand: "inputEl.value = '';",
      category: 'Action',
      description: 'Sets the value property of the message input to an empty string ("").',
      functionPurpose: 'Wipes the input field clean when the reset button is clicked.',
    };
  }

  if (lower.includes('messageinput') && (lower.includes('.value') || lower.includes('getelementbyid'))) {
    return {
      title: 'Read Typed Message (.value)',
      tagOrCommand: "(document.getElementById('messageInput') ? document.getElementById('messageInput').value : '')",
      category: 'Content',
      description: 'Extracts the live text string typed inside the message area.',
      functionPurpose: 'Supplies the message text payload to beam across the AstroLink network.',
    };
  }

  if (lower.includes('submitbtn') && lower.includes('getelementbyid')) {
    return {
      title: 'Find Send Button (getElementById)',
      tagOrCommand: "document.getElementById('submitBtn')",
      category: 'Structure',
      description: 'Locates the Send Button on the screen by its unique ID.',
      functionPurpose: 'Enables attaching the click listener so the button can transmit.',
    };
  }

  if (lower.includes('clearbtn') && lower.includes('getelementbyid')) {
    return {
      title: 'Find Reset Button (getElementById)',
      tagOrCommand: "document.getElementById('clearBtn')",
      category: 'Structure',
      description: 'Locates the Reset Button on the screen by its unique ID.',
      functionPurpose: 'Enables attaching the click listener so the button can clear the text.',
    };
  }

  if (trimmed.startsWith('if (btn_') || trimmed.startsWith('if (inputel') || trimmed.startsWith('if (target_')) {
    return {
      title: 'Element Safety Check (if)',
      tagOrCommand: trimmed.includes('{') ? trimmed : `${trimmed} { ... }`,
      category: 'Logic',
      description: 'Verifies the DOM element exists before running instructions on it.',
      functionPurpose: 'Prevents null reference errors in the browser console.',
    };
  }

  if (trimmed === '});') {
    return {
      title: 'Close Event Listener (});)',
      tagOrCommand: '});',
      category: 'Structure',
      description: 'Marks the end of the click event listener callback function.',
      functionPurpose: 'Signals to the JavaScript engine that the click handler instructions are complete.',
    };
  }

  // =========================================================================
  // JAVASCRIPT DOM SYNTAX EXPLANATIONS (Mercury Level 1)
  // =========================================================================
  if (lower.includes('document.getelementbyid')) {
    const idMatch = lineText.match(/getElementById\(\s*['"`]([^'"`]*)['"`]\s*\)/i);
    const targetId = idMatch && idMatch[1] ? idMatch[1].trim() : '';

    let tagOrCommand = "document.getElementById('...')";
    let functionPurpose = "Finds a single element using its unique ID so you can perform an action on it.";

    if (targetId === 'star-flower') {
      tagOrCommand = "document.getElementById('star-flower')";
      functionPurpose = "The Star Flower is the victory indicator—restore the vents, shrubs, and flowers to revive it!";
    } else if (targetId === 'shrub' || targetId === 'potted-shrub') {
      tagOrCommand = `document.getElementById('${targetId}')`;
      functionPurpose = "Target not found! Remember, you are looking for a unique ID, but you typed a Class.";
    } else if (/^flower(-[1-5])?$/i.test(targetId)) {
      tagOrCommand = `document.getElementById('${targetId}')`;
      functionPurpose = `Selects #${targetId} by its unique ID so you can water it.`;
    } else if (targetId === 'vent') {
      tagOrCommand = "document.getElementById('vent')";
      functionPurpose = "Target not found! Remember, you are looking for a unique ID, but you typed a Tag.";
    } else if (targetId) {
      tagOrCommand = `document.getElementById('${targetId}')`;
      functionPurpose = `Selects #${targetId} by its unique ID so you can care for it.`;
    }

    return {
      title: 'Find Element by ID',
      tagOrCommand,
      category: 'Structure',
      description: "Finds a single element using its unique ID.",
      functionPurpose,
    };
  }

  if (lower.includes('document.getelementsbytagname')) {
    const tagMatch = lineText.match(/getElementsByTagName\(\s*['"`]([^'"`]*)['"`]\s*\)/i);
    const rawTag = tagMatch && tagMatch[1] ? tagMatch[1].trim() : '';
    const cleanTag = rawTag.replace(/^<|>$/g, '').toLowerCase();

    let tagOrCommand = "document.getElementsByTagName('tag')";
    let functionPurpose = "Finds all elements that share the same tag name.";

    if (cleanTag === 'vent') {
      tagOrCommand = "document.getElementsByTagName('vent')";
      functionPurpose = "Selects all ceiling vents so they can be opened.";
    } else if (cleanTag === 'star-flower') {
      tagOrCommand = "document.getElementsByTagName('star-flower')";
      functionPurpose = "Target not found! Remember, you are looking for a Tag, but you typed an ID.";
    } else if (cleanTag === 'shrub' || cleanTag === 'flower' || cleanTag === 'potted-shrub') {
      tagOrCommand = `document.getElementsByTagName('${cleanTag}')`;
      functionPurpose = "Target not found! Remember, you are looking for a Tag, but you typed a Class.";
    } else if (cleanTag) {
      tagOrCommand = `document.getElementsByTagName('${cleanTag}')`;
      functionPurpose = `Selects all <${cleanTag}> elements on the page.`;
    }

    return {
      title: 'Find Elements by Tag',
      tagOrCommand,
      category: 'Structure',
      description: "Finds all elements that share the same tag name.",
      functionPurpose,
    };
  }

  if (lower.includes('document.queryselectorall')) {
    const classMatch = lineText.match(/querySelectorAll\(\s*['"`]([^'"`]*)['"`]\s*\)/i);
    const rawClass = classMatch && classMatch[1] ? classMatch[1].trim() : '';
    const cleanClass = rawClass.replace(/^\./, '').trim().toLowerCase();

    let tagOrCommand = "document.querySelectorAll('.class')";
    let functionPurpose = "Finds every element that shares the specified class name.";

    if (cleanClass === 'shrub' || cleanClass === 'potted-shrub') {
      tagOrCommand = `document.querySelectorAll('.${cleanClass}')`;
      functionPurpose = "Selects all shrubs on the rack so you can fertilize each one.";
    } else if (cleanClass === 'flower' || cleanClass === 'potted-flower' || cleanClass === 'blooming-flower') {
      tagOrCommand = `document.querySelectorAll('.${cleanClass}')`;
      functionPurpose = "Selects all flowers on the rack so you can water each one.";
    } else if (cleanClass === 'star-flower') {
      tagOrCommand = "document.querySelectorAll('.star-flower')";
      functionPurpose = "Target not found! Remember, you are looking for a Class, but you typed an ID.";
    } else if (cleanClass === 'vent') {
      tagOrCommand = "document.querySelectorAll('.vent')";
      functionPurpose = "Target not found! Remember, you are looking for a Class, but you typed a Tag.";
    } else if (cleanClass) {
      tagOrCommand = `document.querySelectorAll('.${cleanClass}')`;
      functionPurpose = `Selects all elements with class .${cleanClass} on the page.`;
    }

    return {
      title: 'Select All Elements by Class',
      tagOrCommand,
      category: 'Structure',
      description: "Finds every element that shares the specified class name.",
      functionPurpose,
    };
  }

  if (lower.includes('document.queryselector')) {
    return {
      title: 'Select First Element Only',
      tagOrCommand: "document.querySelector(...)",
      category: 'Action',
      description: "Selects only the first matching item and stops.",
      functionPurpose: "An ID only targets one item. Use a class loop to target all items on the rack.",
    };
  }

  if (lower.includes('for (let') || lower.includes('for (var') || (lower.includes('for (') && lower.includes('.length'))) {
    return {
      title: 'For Loop',
      tagOrCommand: "for (let i = 0; i < elements.length; i++)",
      category: 'Loop',
      description: "Repeats code for each item in a list from start to finish.",
      functionPurpose: "Turns on every ceiling vent one by one.",
    };
  }

  if (lower.includes('.foreach(') || lower.includes('foreach(')) {
    return {
      title: 'Loop Through Items',
      tagOrCommand: "items.forEach(item => ...)",
      category: 'Loop',
      description: "Runs your action once for every item in the group.",
      functionPurpose: "Applies care to each plant on the rack.",
    };
  }

  if (lower.includes('if (el)') || lower.startsWith('if (el')) {
    return {
      title: 'Safety Check',
      tagOrCommand: "if (el) { ... }",
      category: 'Logic',
      description: "Checks that the element exists before running code on it.",
      functionPurpose: "Prevents errors if the target element is missing.",
    };
  }

  if (lower.includes('fertilized')) {
    return {
      title: 'Fertilize Plant',
      tagOrCommand: "el.className = 'fertilized'",
      category: 'Action',
      description: "Changes the element class to fertilized.",
      functionPurpose: "Feeds the plant nutrients so it can grow.",
    };
  }

  if (lower.includes('hydrated')) {
    return {
      title: 'Water Plant',
      tagOrCommand: "el.className = 'hydrated'",
      category: 'Action',
      description: "Changes the element class to hydrated.",
      functionPurpose: "Gives the plant water so it stays healthy.",
    };
  }

  if (lower.includes('open') && (lower.includes('.classname') || lower.includes('='))) {
    return {
      title: 'Turn On Vent',
      tagOrCommand: "el.className = 'open'",
      category: 'Action',
      description: "Changes the vent class to open.",
      functionPurpose: "Starts the fan to blow cool air into the room.",
    };
  }

  if (lower.includes('.classname =') || lower.includes('.classname=')) {
    return {
      title: 'Update Element Class',
      tagOrCommand: "element.className = '...'",
      category: 'Styling',
      description: "Updates the class on an element to change its state.",
      functionPurpose: "Applies new styles and animations to the item.",
    };
  }

  if (trimmed === '}' || trimmed === '});') {
    return {
      title: 'Close Code Block',
      tagOrCommand: trimmed,
      category: 'Structure',
      description: "Marks where this group of instructions ends.",
      functionPurpose: "Closes the block of code so the computer knows it is complete.",
    };
  }

  // =========================================================================
  // JAVASCRIPT CONVEYOR BELT SORTING (Mercury Level 2)
  // =========================================================================
  if (lower.includes('let cargo = scanner.read()') || lower.includes('let cargo=scanner.read()')) {
    return {
      title: 'Variable Declaration (let cargo)',
      tagOrCommand: 'let cargo = scanner.read();',
      category: 'Structure',
      description: 'Creates a variable called "cargo" and saves the scanner result inside it.',
      functionPurpose: 'Stores what the X-Ray scanner found so you can check it with If/Else rules.',
    };
  }

  if (lower.includes('scanner.read()')) {
    return {
      title: 'Read Scanner (scanner.read())',
      tagOrCommand: 'scanner.read()',
      category: 'Action',
      description: 'Reads the X-Ray scanner to find out what material is inside the current crate.',
      functionPurpose: 'Gets the crate type (Equipment, Organics, or Energy) so you can sort it.',
    };
  }

  if (lower.includes('routetobelt(')) {
    const destMatch = trimmed.match(/routeToBelt\(["']([^"']+)["']\)/i);
    const dest = destMatch ? destMatch[1] : 'destination';
    return {
      title: `Route Crate (routeToBelt)`,
      tagOrCommand: `routeToBelt("${dest}");`,
      category: 'Action',
      description: `Tells the sorting claw to deliver the current crate to the ${dest} belt.`,
      functionPurpose: 'Sends each scanned crate to the correct conveyor belt based on your rules.',
    };
  }

  if ((lower.includes('for (let') || lower.includes('for (var')) && lower.includes('i++')) {
    const timesMatch = trimmed.match(/i\s*<\s*(\d+)/);
    const times = timesMatch ? timesMatch[1] : 'N';
    return {
      title: `For Loop (repeat ${times} times)`,
      tagOrCommand: `for (let i = 0; i < ${times}; i++)`,
      category: 'Loop',
      description: `Repeats the code inside ${times} times, once for each crate on the belt.`,
      functionPurpose: 'Processes every crate arriving on the conveyor belt one by one.',
    };
  }

  if (trimmed.startsWith('let ')) {
    const varMatch = trimmed.match(/let\s+(\w+)/);
    const varName = varMatch ? varMatch[1] : 'variable';
    return {
      title: `Variable Declaration (let ${varName})`,
      tagOrCommand: trimmed.replace(/;$/, ''),
      category: 'Structure',
      description: `Creates a new variable called "${varName}" to store data you can use later.`,
      functionPurpose: 'Saves a value in memory so your program can refer back to it.',
    };
  }

  if (trimmed.startsWith('const ') && !lower.includes('document.')) {
    const varMatch = trimmed.match(/const\s+(\w+)/);
    const varName = varMatch ? varMatch[1] : 'variable';
    return {
      title: `Constant Declaration (const ${varName})`,
      tagOrCommand: trimmed.replace(/;$/, ''),
      category: 'Structure',
      description: `Creates a constant called "${varName}" that cannot be changed after it is set.`,
      functionPurpose: 'Locks in a value so it stays the same throughout your program.',
    };
  }

  if (lower.startsWith('if (') && lower.includes('===')) {
    const condMatch = trimmed.match(/if\s*\(\s*(\w+)\s*===\s*["']([^"']+)["']/);
    const varName = condMatch ? condMatch[1] : 'value';
    const checkVal = condMatch ? condMatch[2] : '...';
    return {
      title: `If Check (${varName} === "${checkVal}")`,
      tagOrCommand: `if (${varName} === "${checkVal}")`,
      category: 'Logic',
      description: `Checks if ${varName} is exactly equal to "${checkVal}" before running the code inside.`,
      functionPurpose: 'Decides which belt to send the crate to based on what the scanner found.',
    };
  }

  if (lower.startsWith('else if (') && lower.includes('===')) {
    const condMatch = trimmed.match(/else\s+if\s*\(\s*(\w+)\s*===\s*["']([^"']+)["']/);
    const varName = condMatch ? condMatch[1] : 'value';
    const checkVal = condMatch ? condMatch[2] : '...';
    return {
      title: `Else If Check (${varName} === "${checkVal}")`,
      tagOrCommand: `else if (${varName} === "${checkVal}")`,
      category: 'Logic',
      description: `If the first check didn't match, checks if ${varName} is "${checkVal}" instead.`,
      functionPurpose: 'Adds another sorting rule for a different crate type.',
    };
  }

  if (lower.startsWith('else {') || trimmed === 'else {') {
    return {
      title: 'Else Fallback (else)',
      tagOrCommand: 'else { ... }',
      category: 'Logic',
      description: 'Runs when none of the earlier checks matched.',
      functionPurpose: 'Catches any remaining crates that did not match previous rules.',
    };
  }

  // =========================================================================
  // CSS SYNTAX EXPLANATIONS
  // =========================================================================
  if (
    isCss ||
    lower.includes('background-color') ||
    lower.includes('fill:') ||
    lower.includes('border:') ||
    lower.startsWith('#computer') ||
    lower.startsWith('#chair') ||
    lower.startsWith('#desk') ||
    lower.startsWith('#panel') ||
    lower.startsWith('#sky') ||
    lower.startsWith('#clouds') ||
    lower.startsWith('#tower') ||
    lower.startsWith('#airships') ||
    lower.startsWith('#cave') ||
    lower.startsWith('#stalact') ||
    lower.startsWith('#stalagm') ||
    lower.startsWith('#river') ||
    lower.startsWith('#crystal') ||
    lower.startsWith('#plant') ||
    lower.startsWith('#mountain') ||
    lower.startsWith('#plateau') ||
    lower.startsWith('#rock-') ||
    lower.startsWith('#crater') ||
    lower.startsWith('#pond') ||
    lower.startsWith('#oasis') ||
    lower.includes('display:') ||
    lower.includes('justify-content:') ||
    lower.includes('align-items:')
  ) {
    if (lower.includes('background-color')) {
      return {
        title: 'Background Color',
        tagOrCommand: 'background-color: #...',
        category: 'Styling',
        description: 'Sets the background surface color of the selected element using a hex color code.',
        functionPurpose: 'Used to add vibrant colors to UI items, lab equipment, buttons, and backgrounds.',
      };
    }

    if (lower.includes('fill:')) {
      return {
        title: 'Fill Color Property',
        tagOrCommand: 'fill: #...',
        category: 'Styling',
        description: 'Specifies the interior color of SVG vector graphics and shapes using a hex color code. In vector illustrations, "fill" serves the exact same role as background-color in standard HTML.',
        functionPurpose: 'Sets base colors for planetary sectors. Dynamic highlights, midtones, and shadow gradients are automatically calculated to bring sectors to life.',
      };
    }

    if (lower.includes('border:')) {
      return {
        title: 'Border Edge Property',
        tagOrCommand: 'border: [thickness]px [style] [color];',
        category: 'Styling',
        description: 'Defines the outline boundary around an element by setting its pixel thickness (px), line style (solid, dashed, dotted), and stroke color.',
        functionPurpose: 'Adds structural outlines and defined edge boundaries to planetary architecture and sector zones.',
      };
    }

    if (lower.startsWith('#computer')) {
      return {
        title: 'Main Computer Selector',
        tagOrCommand: '#computer',
        category: 'Structure',
        description: 'Targets the main laboratory computer element. In CSS, the hashtag (#) designates an ID selector, telling the browser to match the element with id="computer".',
        functionPurpose: 'Applies CSS styles directly to the mainframe computer monitor and console using its unique ID.',
      };
    }

    if (lower.startsWith('#chair')) {
      return {
        title: 'Office Chair Selector',
        tagOrCommand: '#chair',
        category: 'Structure',
        description: 'Targets the lab chair element. The hashtag (#) prefix specifies an ID selector, indicating to the browser to match id="chair".',
        functionPurpose: 'Applies CSS styles directly to the professor\'s lab chair seat and cushion.',
      };
    }

    if (lower.startsWith('#desk')) {
      return {
        title: 'Work Desk Selector',
        tagOrCommand: '#desk',
        category: 'Structure',
        description: 'Targets the lab desk element. The hashtag (#) prefix specifies an ID selector, matching the unique element with id="desk".',
        functionPurpose: 'Applies CSS styles directly to the research work table surface.',
      };
    }

    // =========================================================================
    // VENUS LEVEL 3 SECTOR SELECTORS
    // =========================================================================
    // Sector 1: Skies of Venus (alpha.css)
    if (lower.startsWith('#sky') && !lower.includes('#mountains')) {
      return {
        title: 'Sky & Atmosphere Selector',
        tagOrCommand: '#sky { ... }',
        category: 'Structure',
        description: 'Targets the upper Venusian sky and atmospheric backdrop. The hashtag (#) signifies a unique ID selector matching id="sky".',
        functionPurpose: 'Colors the ambient Venusian sky with altitude brightness gradients.',
      };
    }

    if (lower.startsWith('#clouds')) {
      return {
        title: 'Atmospheric Clouds Selector',
        tagOrCommand: '#clouds { ... }',
        category: 'Structure',
        description: 'Targets the billowing cloud banks drifting across the upper Venusian atmosphere using the unique ID selector #clouds.',
        functionPurpose: 'Styles and shades sulfuric cloud layers with dynamic under-shading highlights.',
      };
    }

    if (lower.startsWith('#tower-roof')) {
      return {
        title: 'Observatory Cupola Roof Selector',
        tagOrCommand: '#tower-roof { ... }',
        category: 'Structure',
        description: 'Targets the hemispherical observatory dome and cupola atop the relay station using the unique ID selector #tower-roof.',
        functionPurpose: 'Colors the observatory cupola with high-metallic peak reflections.',
      };
    }

    if (lower.startsWith('#tower')) {
      return {
        title: 'Relay Spire Selector',
        tagOrCommand: '#tower { ... }',
        category: 'Structure',
        description: 'Targets the AstroLink relay station spire and transmission mast via the unique ID selector #tower.',
        functionPurpose: 'Applies base colors, edge shadows, and sun-facing highlights to the transmission tower structure.',
      };
    }

    if (lower.startsWith('#airships')) {
      return {
        title: 'Dirigible Airship Fleet Selector',
        tagOrCommand: '#airships { ... }',
        category: 'Structure',
        description: 'Targets the fleet of high-altitude dirigibles and explorer craft using the unique ID selector #airships.',
        functionPurpose: 'Colors the dirigible hulls, engine nacelle pylons, rudders, and navigation stripes.',
      };
    }

    // Sector 2: Subterranean Caverns (beta.css)
    if (lower.includes('#stalactites') && lower.includes('#stalagmites')) {
      return {
        title: 'Combined Rock Formations Multi-Selector',
        tagOrCommand: '#stalactites, #stalagmites { ... }',
        category: 'Structure',
        description: 'A grouped CSS selector using a comma (,) to apply identical styling rules to both hanging stalactites and rising stalagmites in a single unified rule block.',
        functionPurpose: 'Simultaneously colors and harmonizes all cave rock formations without writing duplicate CSS code.',
      };
    }

    if (lower.startsWith('#cave-walls')) {
      return {
        title: 'Cavern Walls Selector',
        tagOrCommand: '#cave-walls { ... }',
        category: 'Structure',
        description: 'Targets the subterranean cavern bedrock and rock walls using the unique ID selector #cave-walls.',
        functionPurpose: 'Sets foundational deep cavern rock colors with crevice shadows.',
      };
    }

    if (lower.startsWith('#stalactites')) {
      return {
        title: 'Hanging Stalactites Selector',
        tagOrCommand: '#stalactites { ... }',
        category: 'Structure',
        description: 'Targets mineral formations hanging down from the cavern ceiling using the unique ID selector #stalactites.',
        functionPurpose: 'Colors ceiling mineral spears with downward highlights and shadows.',
      };
    }

    if (lower.startsWith('#stalagmites')) {
      return {
        title: 'Rising Stalagmites Selector',
        tagOrCommand: '#stalagmites { ... }',
        category: 'Structure',
        description: 'Targets mineral columns and pillars rising up from the cavern floor using the unique ID selector #stalagmites.',
        functionPurpose: 'Colors ground-level rock pillars with upward floor-shading.',
      };
    }

    if (lower.startsWith('#river')) {
      return {
        title: 'Subterranean River Selector',
        tagOrCommand: '#river { ... }',
        category: 'Structure',
        description: 'Targets the luminous underground waterway flowing through the cavern basin using the unique ID selector #river.',
        functionPurpose: 'Applies fluid water colors, deep channel currents, and shoreline ripple effects.',
      };
    }

    if (lower.startsWith('#crystal-gems')) {
      return {
        title: 'Luminescent Crystals Selector',
        tagOrCommand: '#crystal-gems { ... }',
        category: 'Structure',
        description: 'Targets geometric mineral clusters and glowing geodes embedded in the cave using the unique ID selector #crystal-gems.',
        functionPurpose: 'Applies vibrant colors and radiant luminescence to cavern crystal clusters.',
      };
    }

    if (lower.startsWith('#plants')) {
      return {
        title: 'Bioluminescent Flora Selector',
        tagOrCommand: '#plants { ... }',
        category: 'Structure',
        description: 'Targets subterranean vegetation, luminous mushroom caps, and fern fronds using the unique ID selector #plants.',
        functionPurpose: 'Colors cave mushrooms, spore fronds, and glowing droplet nodes with organic hues.',
      };
    }

    // Sector 3: Venusian Oasis Basin (gamma.css)
    if (lower.includes('#mountains') && lower.includes('#plateaus')) {
      return {
        title: 'Combined Desert Terrain Multi-Selector',
        tagOrCommand: '#mountains, #plateaus { ... }',
        category: 'Structure',
        description: 'A grouped CSS selector using a comma (,) to apply identical styling rules to both distant mountains and stepped plateaus in a single unified rule block.',
        functionPurpose: 'Harmonizes colors across all elevated desert terrain features simultaneously without duplicated CSS.',
      };
    }

    if (lower.startsWith('#mountains, #plateaus')) {
      return {
        title: 'Desert Terrain (Mountains & Plateaus) Selector',
        tagOrCommand: '#mountains, #plateaus { ... }',
        category: 'Structure',
        description: 'Targets both distant rolling volcanic mountain ranges and stepped flat-topped mesas/plateaus simultaneously using grouped selectors.',
        functionPurpose: 'Colors background volcanic peaks and stepped canyon plateaus together.',
      };
    }

    if (lower.startsWith('#mountains')) {
      return {
        title: 'Distant Mountains Selector',
        tagOrCommand: '#mountains { ... }',
        category: 'Structure',
        description: 'Targets distant rolling mountain ranges encircling the desert basin using the unique ID selector #mountains.',
        functionPurpose: 'Applies atmospheric silhouette colors and depth opacity to the distant peaks.',
      };
    }

    if (lower.startsWith('#plateaus')) {
      return {
        title: 'Stepped Plateaus Selector',
        tagOrCommand: '#plateaus { ... }',
        category: 'Structure',
        description: 'Targets tiered desert mesa and plateau rock formations using the unique ID selector #plateaus.',
        functionPurpose: 'Colors stepped sandstone terraces with sunlit summit rims.',
      };
    }

    if (lower.startsWith('#rock-formations')) {
      return {
        title: 'Hoodoo Rock Formations Selector',
        tagOrCommand: '#rock-formations { ... }',
        category: 'Structure',
        description: 'Targets standing hoodoo pillars and weathered oasis stones using the unique ID selector #rock-formations.',
        functionPurpose: 'Colors towering stone hoodoos with geological contact shadows.',
      };
    }

    if (lower.startsWith('#craters')) {
      return {
        title: 'Impact Crater Basin Selector',
        tagOrCommand: '#craters { ... }',
        category: 'Structure',
        description: 'Targets meteorite impact depressions and crater basin rims using the unique ID selector #craters.',
        functionPurpose: 'Applies crater basin depth shading and rim elevation contrast.',
      };
    }

    if (lower.startsWith('#pond')) {
      return {
        title: 'Oasis Water Basin Selector',
        tagOrCommand: '#pond { ... }',
        category: 'Structure',
        description: 'Targets the central desert oasis water spring and pond using the unique ID selector #pond.',
        functionPurpose: 'Colors the oasis spring with surface ripple reflections and water clarity.',
      };
    }

    if (lower.startsWith('#oasis-vegetation')) {
      return {
        title: 'Oasis Palms & Vegetation Selector',
        tagOrCommand: '#oasis-vegetation { ... }',
        category: 'Structure',
        description: 'Targets desert date palms, succulent fronds, and oasis shrubbery using the unique ID selector #oasis-vegetation.',
        functionPurpose: 'Colors palm canopies, fronds, and vegetation surrounding the oasis basin.',
      };
    }

    // =========================================================================
    // MERCURY LEVEL 3 TERMINAL CSS SELECTORS & PROPERTIES
    // =========================================================================
    if (lower.startsWith('#mainform')) {
      return {
        title: 'Main Terminal Card (#mainForm)',
        tagOrCommand: '#mainForm { ... }',
        category: 'Structure',
        description: 'Targets the main console card using its unique ID selector.',
        functionPurpose: 'Applies flex layout, border glow, and spacing to the AstroLink terminal.',
      };
    }

    if (lower.startsWith('#submitbtn')) {
      return {
        title: 'Send Button Selector (#submitBtn)',
        tagOrCommand: '#submitBtn { ... }',
        category: 'Structure',
        description: 'Targets the Send Button using its unique ID selector.',
        functionPurpose: 'Styles the primary transmit button with pastel orange brand coloring and padding.',
      };
    }

    if (lower.startsWith('#clearbtn')) {
      return {
        title: 'Reset Button Selector (#clearBtn)',
        tagOrCommand: '#clearBtn { ... }',
        category: 'Structure',
        description: 'Targets the Clear Button using its unique ID selector.',
        functionPurpose: 'Styles the secondary reset button with contrasting colors and rounded edges.',
      };
    }

    if (lower.startsWith('#messageinput')) {
      return {
        title: 'Message Input Selector (#messageInput)',
        tagOrCommand: '#messageInput { ... }',
        category: 'Structure',
        description: 'Targets the text input area using its unique ID selector.',
        functionPurpose: 'Configures width, background transparency, and typography for message typing.',
      };
    }

    if (lower.startsWith('#planetdropdown')) {
      return {
        title: 'Planet Menu Selector (#planetDropdown)',
        tagOrCommand: '#planetDropdown { ... }',
        category: 'Structure',
        description: 'Targets the destination dropdown menu using its unique ID selector.',
        functionPurpose: 'Configures menu width, background color, and padding.',
      };
    }

    if (lower.includes('flex-direction')) {
      const isCol = lower.includes('column');
      return {
        title: `Arrange Direction (${isCol ? 'Vertical' : 'Horizontal'})`,
        tagOrCommand: `flex-direction: ${isCol ? 'column' : 'row'};`,
        category: 'Styling',
        description: `Arranges child elements to flow in a ${isCol ? 'vertical stack from top to bottom' : 'horizontal row side-by-side'}.`,
        functionPurpose: `${isCol ? 'Stacks the title, dropdown, input, and buttons neatly in a column.' : 'Lays out controls horizontally.'}`,
      };
    }

    if (lower.includes('gap:')) {
      return {
        title: 'Item Spacing (gap)',
        tagOrCommand: trimmed.replace(/;$/, '') + ';',
        category: 'Styling',
        description: 'Adds consistent breathing room between all elements inside the flex container.',
        functionPurpose: 'Prevents the title, choice menu, message input, and buttons from overlapping.',
      };
    }

    if (lower.includes('border:') && (lower.includes('rgba(255') || lower.includes('rgba(168') || lower.includes('255, 179'))) {
      return {
        title: 'Glassmorphic Border (border)',
        tagOrCommand: 'border: 1px solid rgba(255, 179, 71, 0.3);',
        category: 'Styling',
        description: 'Applies a translucent neon amber border to the card container.',
        functionPurpose: 'Produces a glowing glassmorphism border around the #mainForm terminal card.',
      };
    }

    if (lower.includes('#ffb347') || lower.includes('255, 179, 71') || (lower.includes('background-color') && (lower.includes('#ffa') || lower.includes('orange')))) {
      return {
        title: 'Pastel Orange Fill (background-color)',
        tagOrCommand: 'background-color: #ffb347;',
        category: 'Styling',
        description: 'Sets the element background to official AstroLink Pastel Orange.',
        functionPurpose: 'Applies brand color to #submitBtn so the button stands out on the terminal.',
      };
    }

    if (lower.includes('border-radius:')) {
      return {
        title: 'Rounded Corners (border-radius)',
        tagOrCommand: trimmed.replace(/;$/, '') + ';',
        category: 'Styling',
        description: 'Curves the outer corners of an element boundary box.',
        functionPurpose: 'Softens sharp card edges and rounds the interactive buttons.',
      };
    }

    if (lower.includes('padding:') && !lower.includes('padding-')) {
      return {
        title: 'Internal Padding (padding)',
        tagOrCommand: trimmed.replace(/;$/, '') + ';',
        category: 'Styling',
        description: 'Creates comfortable spacing between an element\'s content and its border.',
        functionPurpose: 'Gives the terminal card and buttons adequate internal breathing room.',
      };
    }

    if (lower.includes('font-size:') || lower.includes('font-family:') || lower.includes('font-weight:')) {
      return {
        title: 'Typography Styling (font)',
        tagOrCommand: trimmed.replace(/;$/, '') + ';',
        category: 'Styling',
        description: 'Configures font size, typeface family, or weight for text elements.',
        functionPurpose: 'Ensures terminal labels and instructions are crisp and readable.',
      };
    }

    if (lower.startsWith('#')) {
      const match = trimmed.match(/^#([a-zA-Z0-9_-]+)/);
      const idName = match ? match[1] : 'id';
      return {
        title: 'CSS ID Selector',
        tagOrCommand: `#${idName} { ... }`,
        category: 'Structure',
        description:
          'Targets a single unique element on the webpage matching this exact ID name. The hashtag (#) is used in CSS because it serves as the designated ID selector symbol, telling the browser to match the element with id="' + idName + '" rather than a class or tag.',
        functionPurpose:
          'In CSS syntax, the hashtag (#) is reserved exclusively for IDs because an ID must be unique to one element on the page. The hashtag instantly signals to the browser engine to target that unique element without confusing it with reusable classes (which use a dot ".") or HTML tags (which use no prefix).',
      };
    }

    if (lower.includes('display: flex') || (lower.includes('display:') && lower.includes('flex'))) {
      return {
        title: 'Side-by-Side (Flex)',
        tagOrCommand: 'display: flex;',
        category: 'Structure',
        description:
          'Places items side-by-side in a row and unlocks easy left, right, up, and down alignment controls.',
        functionPurpose:
          'Turns on flexible layout mode so you can move and position items anywhere inside the container.',
      };
    }

    if (lower.includes('display: block') || (lower.includes('display:') && lower.includes('block'))) {
      return {
        title: 'Stacked (Block)',
        tagOrCommand: 'display: block;',
        category: 'Structure',
        description:
          'Stacks items one on top of another from top to bottom, like a tower of building blocks.',
        functionPurpose:
          'Used for standard vertical stacks and columns where each item gets its own new line.',
      };
    }

    // Specific Horizontal Justify-Content Values
    if (lower.includes('justify-content:') && lower.includes('space-evenly')) {
      return {
        title: 'Space Evenly (Horizontal)',
        tagOrCommand: 'justify-content: space-evenly;',
        category: 'Styling',
        description:
          'Spreads out items across the screen so that each item has the exact same amount of space around it.',
        functionPurpose:
          'Keeps items neatly balanced across the row so they do not bunch up together.',
      };
    }

    if (lower.includes('justify-content:') && lower.includes('center')) {
      return {
        title: 'Center Horizontally',
        tagOrCommand: 'justify-content: center;',
        category: 'Styling',
        description:
          'Pulls all items together into the middle of the screen from left to right.',
        functionPurpose:
          'Positions items right in the center horizontally.',
      };
    }

    if (lower.includes('justify-content:') && (lower.includes('flex-start') || lower.includes('start'))) {
      return {
        title: 'Group Left',
        tagOrCommand: 'justify-content: flex-start;',
        category: 'Styling',
        description:
          'Pushes all items to the left side of the container, packed together.',
        functionPurpose:
          'Starts items on the left side of the row, leaving any empty space on the right.',
      };
    }

    if (lower.includes('justify-content')) {
      return {
        title: 'Horizontal Alignment',
        tagOrCommand: 'justify-content: ...;',
        category: 'Styling',
        description:
          'Decides where items go from left to right across the screen (like left, center, or spread out evenly).',
        functionPurpose:
          'Positions items left-to-right across the container width.',
      };
    }

    // Specific Vertical Align-Items Values
    if (lower.includes('align-items:') && (lower.includes('flex-start') || lower.includes('start'))) {
      return {
        title: 'Align to Top',
        tagOrCommand: 'align-items: flex-start;',
        category: 'Styling',
        description:
          'Snaps items up to the very top edge of the container.',
        functionPurpose:
          'Lifts items so they sit neatly against the upper ceiling of the screen or box.',
      };
    }

    if (lower.includes('align-items:') && lower.includes('center')) {
      return {
        title: 'Center Vertically',
        tagOrCommand: 'align-items: center;',
        category: 'Styling',
        description:
          'Places items directly in the middle between the top and bottom of the container.',
        functionPurpose:
          'Keeps items balanced vertically so they do not touch the top ceiling or bottom floor.',
      };
    }

    if (lower.includes('align-items:') && (lower.includes('flex-end') || lower.includes('end'))) {
      return {
        title: 'Align to Bottom',
        tagOrCommand: 'align-items: flex-end;',
        category: 'Styling',
        description:
          'Drops items down to the bottom floor of the container.',
        functionPurpose:
          'Pins items to the bottom edge of the box or screen.',
      };
    }

    if (lower.includes('align-items')) {
      return {
        title: 'Vertical Alignment',
        tagOrCommand: 'align-items: ...;',
        category: 'Styling',
        description:
          'Decides where items sit from top to bottom (like the top edge, middle, or bottom edge).',
        functionPurpose:
          'Moves items up and down to match your target layout.',
      };
    }

    if (trimmed === '{' || trimmed === '}') {
      return {
        title: 'CSS Rule Block',
        tagOrCommand: '{ ... }',
        category: 'Structure',
        description: 'Curly brackets that enclose all styling rules and properties for the selected element.',
        functionPurpose: 'Groups styling properties like background-color, border, and width together.',
      };
    }
  }

  // =========================================================================
  // 1. HTML SYNTAX EXPLANATIONS (Prioritizing inline styling & links first)
  // =========================================================================
  if (isHtml) {
    // Comments
    if (lower.startsWith('<!--')) {
      return {
        title: 'Developer Note',
        tagOrCommand: '<!-- Comment -->',
        category: 'Structure',
        description: 'A private note written in the code. Browsers completely ignore it, so visitors never see it on the screen.',
        functionPurpose: 'Used by developers to leave reminders, explain how parts of a page work, or temporarily turn off code while testing.',
      };
    }

    // HTML Head and Link Tags (for linking stylesheets and document metadata)
    if (lower.startsWith('<head>') || lower === '<head>') {
      return {
        title: 'Page Header Container',
        tagOrCommand: '<head> ... </head>',
        category: 'Structure',
        description: 'The header section of an HTML document that stores essential metadata, resource links, and configuration settings before page content is displayed.',
        functionPurpose: 'Serves as the central container holding external stylesheet link tags (<link rel="stylesheet">) that connect your CSS styling prototypes (alpha.css, beta.css, gamma.css) to the AstroLink network.',
      };
    }

    if (lower.startsWith('</head>') || lower === '</head>') {
      return {
        title: 'Closing Header Tag',
        tagOrCommand: '</head>',
        category: 'Structure',
        description: 'Marks the end of the HTML header section, signaling to the browser engine that all metadata and stylesheet links have been loaded.',
        functionPurpose: 'Forms the matching partner tag with <head>, cleanly enclosing all connected sector stylesheets before the page content.',
      };
    }

    // =========================================================================
    // MERCURY LEVEL 3 TERMINAL HTML STRUCTURE
    // =========================================================================
    if (lower.includes('<script') || lower.startsWith('<script')) {
      return {
        title: 'Attach Logic Script (<script>)',
        tagOrCommand: '<script src="logic.js"></script>',
        category: 'Structure',
        description: 'Loads an external JavaScript file into your HTML document.',
        functionPurpose: 'Activates AstroLink terminal circuits and enables button click events.',
      };
    }

    if (lower.includes('style.css') || (lower.includes('<link') && lower.includes('stylesheet'))) {
      return {
        title: 'Attach Stylesheet (<link>)',
        tagOrCommand: '<link rel="stylesheet" href="style.css">',
        category: 'Structure',
        description: 'Connects your external CSS styling sheet to the HTML document.',
        functionPurpose: 'Applies your colors, card borders, and layout styling to the AstroLink terminal.',
      };
    }

    if (lower.includes('id="mainform"') || lower.includes("id='mainform'")) {
      return {
        title: 'Main Screen Box (#mainForm)',
        tagOrCommand: '<form id="mainForm"> ... </form>',
        category: 'Structure',
        description: 'The master container card grouping all interactive controls together.',
        functionPurpose: 'Hosts the title, planet dropdown, text input, and transmission buttons in one terminal screen.',
      };
    }

    if (lower.includes('id="title"') || (lower.startsWith('<h1') && lower.includes('astrolink'))) {
      return {
        title: 'Main Station Title (<h1>)',
        tagOrCommand: '<h1 id="title">AstroLink Comms</h1>',
        category: 'Content',
        description: 'The top-level heading displaying the relay terminal name.',
        functionPurpose: 'Identifies the communications terminal at the head of the console.',
      };
    }

    if (lower.includes('id="subtitle"') || (lower.startsWith('<p') && lower.includes('quantum relay'))) {
      return {
        title: 'Terminal Subtitle (<p>)',
        tagOrCommand: '<p id="subtitle">Quantum Relay Terminal</p>',
        category: 'Content',
        description: 'Secondary status label situated directly below the station title.',
        functionPurpose: 'Clarifies terminal station role and operational frequency.',
      };
    }

    if (lower.includes('id="planetdropdown"') || lower.startsWith('<select')) {
      return {
        title: 'Planet Choice Menu (<select>)',
        tagOrCommand: '<select id="planetDropdown"> ... </select>',
        category: 'Content',
        description: 'A dropdown menu allowing cadets to pick a destination from nested choices.',
        functionPurpose: 'Provides selectable planetary relay nodes (Mars, Venus, Jupiter, Saturn, Earth).',
      };
    }

    if (lower.startsWith('<option') || lower.includes('<option')) {
      const pMatch = trimmed.match(/value="([^"]+)"/i);
      const planet = pMatch ? pMatch[1] : 'Planet';
      return {
        title: `Destination Option (${planet})`,
        tagOrCommand: `<option value="${planet}">${planet}</option>`,
        category: 'Content',
        description: `Defines ${planet} as an available planetary destination node.`,
        functionPurpose: 'Supplies destination telemetry when transmitting across the AstroLink relay.',
      };
    }

    if (lower.includes('id="messageinput"') || (lower.startsWith('<input') && lower.includes('message'))) {
      return {
        title: 'Text Input Area (<input>)',
        tagOrCommand: '<input id="messageInput" type="text" placeholder="..." />',
        category: 'Content',
        description: 'A single-line input field where cadets type their transmission message.',
        functionPurpose: 'Captures the live message text to beam to the chosen planetary station.',
      };
    }

    if (lower.includes('id="submitbtn"') || (lower.startsWith('<button') && lower.includes('transmit'))) {
      return {
        title: 'Send Button (<button>)',
        tagOrCommand: '<button id="submitBtn">Transmit</button>',
        category: 'Action',
        description: 'The primary action button on the relay terminal.',
        functionPurpose: 'Triggers the AstroLink signal transmission when pressed.',
      };
    }

    if (lower.includes('id="clearbtn"') || (lower.startsWith('<button') && lower.includes('clear'))) {
      return {
        title: 'Reset Button (<button>)',
        tagOrCommand: '<button id="clearBtn">Clear</button>',
        category: 'Action',
        description: 'A secondary action button used to reset the console.',
        functionPurpose: 'Wipes the message input area clean so a new transmission can be composed.',
      };
    }

    if (lower.includes('<link') || lower.startsWith('<link')) {
      return {
        title: 'External Stylesheet Link',
        tagOrCommand: '<link rel="stylesheet" href="...">',
        category: 'Structure',
        description: 'Connects an external CSS stylesheet to the HTML page. The "rel" attribute specifies it as a stylesheet, while "href" specifies the filename to link.',
        functionPurpose: 'Attaches sector CSS files (alpha.css, beta.css, gamma.css) to transmit visual styling rules and restore color to Venus.',
      };
    }

    // Inline elements with custom IDs (Venus Level 3 Hub & Spire)
    if (lower.includes('id="astrolink-tower"')) {
      return {
        title: 'AstroLink Tower Container',
        tagOrCommand: '<div id="astrolink-tower" style="...">',
        category: 'Structure',
        description: 'Defines the transmission spire and relay structure element on the page, using an inline style attribute to directly configure its background color.',
        functionPurpose: 'Represents the central AstroLink communication tower that broadcasts visual restorative signals across Venus.',
      };
    }

    if (lower.includes('id="hub-background"')) {
      return {
        title: 'Central Hub Background Container',
        tagOrCommand: '<div id="hub-background" style="...">',
        category: 'Structure',
        description: 'Defines the central planetary command hub backdrop element, using an inline style attribute to directly set its background color.',
        functionPurpose: 'Represents the planetary operations center and base platform grounding the transmission tower.',
      };
    }

    if (lower.includes('style="') || lower.includes('style=')) {
      return {
        title: 'Inline Style Attribute',
        tagOrCommand: 'style="background-color: #..."',
        category: 'Styling',
        description: 'Applies CSS styling rules directly within an HTML tag using the style attribute, overriding external stylesheets with immediate visual properties.',
        functionPurpose: 'Directly styles the AstroLink Tower and Central Hub elements right inside index.html.',
      };
    }

    // 1. Inline Styling & Formatting (checked first so they are not hidden by parent containers/headings)
    if (lower.includes('<u') || lower.includes('</u')) {
      return {
        title: 'Underline',
        tagOrCommand: '<u> ... </u>',
        category: 'Styling',
        description: 'Draws a neat line directly under words to help them stand out from the rest of the text.',
        functionPurpose: 'Used to point out spelling errors, book or article titles, and special notes in text.',
      };
    }

    if (lower.includes('<b') || lower.includes('</b')) {
      return {
        title: 'Bold Text',
        tagOrCommand: '<b> ... </b>',
        category: 'Styling',
        description: 'Makes words thicker and darker so they immediately catch the reader\'s attention.',
        functionPurpose: 'Used to highlight important keywords, key product details, numbers, and warnings.',
      };
    }

    if (lower.includes('<mark') || lower.includes('</mark')) {
      return {
        title: 'Highlight',
        tagOrCommand: '<mark> ... </mark>',
        category: 'Styling',
        description: 'Places a bright colored background behind words, like marking text with a highlighter pen.',
        functionPurpose: 'Used on search result pages to highlight the words you searched for, or to mark important study notes.',
      };
    }

    if (lower.includes('<del') || lower.includes('</del')) {
      return {
        title: 'Strikethrough',
        tagOrCommand: '<del> ... </del>',
        category: 'Styling',
        description: 'Draws a horizontal line straight through words to show they have been deleted or changed.',
        functionPurpose: 'Used on shopping websites to show old prices on sale items (such as $50 crossed out next to $25) or finished to-do items.',
      };
    }

    // 2. Hyperlinks & Actions
    if (lower.includes('<a') || lower.includes('</a')) {
      return {
        title: 'Clickable Link',
        tagOrCommand: '<a href="..."> ... </a>',
        category: 'Action',
        description: 'Turns words or pictures into a clickable link that sends the user to another page or website when clicked.',
        functionPurpose: 'Used for website navigation menus, "Learn More" buttons, social media links, and jumping to different sections of a webpage.',
      };
    }

    // 3. Media & Captions
    if (lower.includes('<img')) {
      return {
        title: 'Image',
        tagOrCommand: '<img src="..." />',
        category: 'Content',
        description: 'Places a picture on the page using the file name or web address listed in the src setting.',
        functionPurpose: 'Used to display website logos, user profile photos, banner graphics, and photo galleries.',
      };
    }

    if (lower.includes('<figcaption') || lower.includes('</figcaption')) {
      return {
        title: 'Image Caption',
        tagOrCommand: '<figcaption> ... </figcaption>',
        category: 'Content',
        description: 'Adds an explanatory description or title directly below a picture or diagram.',
        functionPurpose: 'Used for photographer credits, chart descriptions, and captions under pictures in news articles.',
      };
    }

    // 4. Headings & Typography
    if (lower.startsWith('<h1') || lower.startsWith('</h1')) {
      return {
        title: 'Main Heading',
        tagOrCommand: '<h1> ... </h1>',
        category: 'Content',
        description: 'The main, largest title on a webpage. It tells visitors what the entire page is about.',
        functionPurpose: 'Used at the very top of a webpage for the main article title or website headline. Best practice is to use only one per page.',
      };
    }

    if (lower.startsWith('<h2') || lower.startsWith('</h2')) {
      return {
        title: 'Form Heading',
        tagOrCommand: '<h2> ... </h2>',
        category: 'Content',
        description: 'A clear title for a major section or form, helping visitors identify what controls or information are inside.',
        functionPurpose: 'Used for form titles, dashboard headers, and major section banners.',
      };
    }

    if (lower.startsWith('<h3') || lower.startsWith('</h3')) {
      return {
        title: 'Subheading',
        tagOrCommand: '<h3> ... </h3>',
        category: 'Content',
        description: 'A medium-sized heading used to label smaller topics and sections under a main title.',
        functionPurpose: 'Used for section titles on a page, titles on individual cards or boxes, and sidebar widgets.',
      };
    }

    if (lower.startsWith('<p') || lower.startsWith('</p')) {
      return {
        title: 'Paragraph',
        tagOrCommand: '<p> ... </p>',
        category: 'Content',
        description: 'Groups standard reading text into a paragraph, automatically adding spacing above and below it.',
        functionPurpose: 'Used for story text, blog posts, product reviews, and any regular reading material on the internet.',
      };
    }

    // 5. Forms & Interactive Controls
    if (lower.startsWith('<form') || lower.startsWith('</form')) {
      return {
        title: 'Form Container',
        tagOrCommand: '<form> ... </form>',
        category: 'Structure',
        description: 'A parent container that packages interactive controls, selections, and inputs into a single submission unit.',
        functionPurpose: 'Used for messaging dashboards, search bars, login screens, and survey submissions.',
      };
    }

    if (lower.startsWith('<select') || lower.startsWith('</select')) {
      return {
        title: 'Dropdown Menu',
        tagOrCommand: '<select> ... </select>',
        category: 'Content',
        description: 'Creates a collapsible menu that lets users choose one item from a list of nested options.',
        functionPurpose: 'Used for picking destination planets, selecting countries, choosing payment methods, and category filters.',
      };
    }

    if (lower.startsWith('<option') || lower.startsWith('</option')) {
      return {
        title: 'Dropdown Option',
        tagOrCommand: '<option> ... </option>',
        category: 'Content',
        description: 'Defines an individual selectable choice nested inside a dropdown menu.',
        functionPurpose: 'Provides the specific choices inside a <select> menu, such as Mercury, Venus, or Earth.',
      };
    }

    if (lower.startsWith('<input') || lower.includes('<input')) {
      return {
        title: 'Message Input',
        tagOrCommand: '<input type="text" />',
        category: 'Content',
        description: 'A single-line typing field where users can enter custom text, commands, or data.',
        functionPurpose: 'Used for typing transmission messages, search queries, usernames, and passwords.',
      };
    }

    if (lower.startsWith('<button') || lower.startsWith('</button')) {
      return {
        title: 'Send Button',
        tagOrCommand: '<button type="submit"> ... </button>',
        category: 'Action',
        description: 'A clickable button that sends the assembled form data or triggers an action when pressed.',
        functionPurpose: 'Used to send messages, submit forms, confirm selections, and fire actions.',
      };
    }

    // 6. Containers & Styling
    if (lower.startsWith('<div') || lower.startsWith('</div')) {
      return {
        title: 'Container Box',
        tagOrCommand: '<div> ... </div>',
        category: 'Structure',
        description: 'An invisible box that groups text, pictures, and other items together so they can be positioned or styled as a single unit.',
        functionPurpose: 'Used to build individual sections of a website, such as profile cards, navigation bars, and pop-up windows.',
      };
    }

    if (lower.includes('<style') || lower.includes('</style')) {
      return {
        title: 'Style Block',
        tagOrCommand: '<style> ... </style>',
        category: 'Styling',
        description: 'Holds design instructions (CSS) that control colors, fonts, sizes, and spacing across the page.',
        functionPurpose: 'Used to customize how a website looks, like choosing page background colors, card borders, and button hover effects.',
      };
    }

    // 7. Structural Breaks
    if (lower.includes('<hr')) {
      return {
        title: 'Divider Line',
        tagOrCommand: '<hr>',
        category: 'Structure',
        description: 'Draws a horizontal divider line across the screen to clearly mark where one section ends and another begins.',
        functionPurpose: 'Used to separate chapters in long articles, divide form steps, or split page content from the footer.',
      };
    }

    if (lower.includes('<br')) {
      return {
        title: 'Line Break',
        tagOrCommand: '<br>',
        category: 'Structure',
        description: 'Jumps text down to the very next line without starting a whole new paragraph.',
        functionPurpose: 'Used when writing mailing addresses, song lyrics, poems, and short contact info lists.',
      };
    }

    // 7. Fallback: Plain Text Content
    return {
      title: 'Text Content',
      tagOrCommand: 'Text',
      category: 'Content',
      description: 'The readable words and sentences placed inside your HTML tags.',
      functionPurpose: 'Delivers the actual messages, instructions, button labels, and stories that visitors read.',
    };
  }

  // =========================================================================
  // 2. PSEUDOCODE / CS LOGIC EXPLANATIONS
  // =========================================================================
  if (lower.includes('start') || lower.includes('when the program runs')) {
    return {
      title: 'Start of Program',
      tagOrCommand: 'Start',
      category: 'General',
      description: 'Where your instructions begin running from top to bottom when you start the program.',
      functionPurpose: 'Present in every program to set up initial settings and launch the app as soon as it opens.',
    };
  }

  if (lower.includes('end the program') || lower === 'end') {
    return {
      title: 'End of Program',
      tagOrCommand: 'End',
      category: 'General',
      description: 'The final step where your instructions stop running after completing the task.',
      functionPurpose: 'Used to cleanly stop the program or close a window once all required work is finished.',
    };
  }

  if (lower.includes('move the rover') || lower.includes('moveforward') || lower.includes('movebackward') || lower.includes('move_forward')) {
    return {
      title: 'Move Forward',
      tagOrCommand: 'rover.move()',
      category: 'Action',
      description: 'Takes one step forward in whichever direction the character is currently facing.',
      functionPurpose: 'Used in video games, robotics, and mapping apps to walk a character or vehicle along a path.',
    };
  }

  if (lower.includes('turn the rover') || lower.includes('turnleft') || lower.includes('turnright') || lower.includes('turn_left') || lower.includes('turn_right')) {
    const isLeft = lower.includes('left');
    return {
      title: `Turn ${isLeft ? 'Left' : 'Right'}`,
      tagOrCommand: isLeft ? 'rover.turnLeft()' : 'rover.turnRight()',
      category: 'Action',
      description: `Turns the character 90 degrees to face to its ${isLeft ? 'left' : 'right'}.`,
      functionPurpose: 'Used in game controls and autonomous steering to turn corners and avoid obstacles.',
    };
  }

  if (lower.includes('repeat') || lower.includes('for ') || lower.includes('times:')) {
    return {
      title: 'Repeat (Fixed Count)',
      tagOrCommand: 'repeat(number)',
      category: 'Loop',
      description: 'Repeats the instructions inside it a specific number of times before moving forward.',
      functionPurpose: 'Used when you know the exact count in advance, like loading 10 items in a list or jumping 3 times.',
    };
  }

  if (lower.includes('until') || lower.includes('while') || lower.includes('reaches the goal')) {
    return {
      title: 'Repeat While / Until',
      tagOrCommand: 'while (condition)',
      category: 'Loop',
      description: 'Keeps repeating instructions as long as a certain condition is true (or until a goal is reached).',
      functionPurpose: 'Used when you don\'t know the count ahead of time, such as waiting for a player to press a key or driving until an obstacle is reached.',
    };
  }

  if (lower.includes('if ') || lower.includes('path') || lower.includes('then:')) {
    return {
      title: 'Check Condition (If)',
      tagOrCommand: 'if (condition)',
      category: 'Logic',
      description: 'Checks if something is true before deciding whether to run the instructions inside it.',
      functionPurpose: 'Used to make decisions in code, like checking if a password is correct, checking for wall collisions, or choosing which screen to show.',
    };
  }

  // =========================================================================
  // FINAL FALLBACK: SEMICOLON STATEMENT TERMINATOR (Catch-all, must be last)
  // =========================================================================
  if (trimmed === ';') {
    return {
      title: 'Statement Terminator (;)',
      tagOrCommand: ';',
      category: 'General',
      description: 'Marks the end of a single command, like a period ends a sentence.',
      functionPurpose: 'Tells the computer that one instruction is finished so it can read the next.',
    };
  }

  return {
    title: 'Instruction Step',
    tagOrCommand: trimmed.slice(0, 20),
    category: 'General',
    description: 'A single command that the computer executes as part of your program.',
    functionPurpose: 'Carries out a specific task step by step in the order it was written.',
  };
}

export default function SyntaxViewer({ code, mode = 'auto' }: SyntaxViewerProps) {
  const [copied, setCopied] = useState(false);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const isHtml = mode === 'html' || (mode === 'auto' && (code.includes('<') || code.includes('</')));
  const isCss = mode === 'css' || (mode === 'auto' && !isHtml && (code.includes('background-color') || code.includes('#computer') || code.includes('#chair') || code.includes('#desk') || code.includes('#panel') || code.includes('display:') || code.includes('justify-content:') || code.includes('align-items:') || code.includes('#mainForm') || code.includes('#submitBtn') || code.includes('#clearBtn') || code.includes('flex-direction:')));
  const isCpp = mode === 'cpp' || (mode === 'auto' && !isHtml && !isCss && (code.includes('#include') || code.includes('cin >>') || code.includes('cout <<') || code.includes('using namespace std;') || code.includes('new Core') || code.includes('delete ') || code.includes('*sensorPtr') || code.includes('*debrisPtr') || code.includes('Task*')));
  const isJava = mode === 'java' || (mode === 'auto' && !isCpp && !isHtml && !isCss && (code.includes('String ') || code.includes('int ') || code.includes('boolean ') || code.includes('CloudGridArchive') || code.includes('startDataStream') || code.includes('catch (') || code.includes('class ') || code.includes('Profile') || code.includes('public void ')));
  const isJs = mode === 'javascript' || (mode === 'auto' && !isJava && !isCpp && !isHtml && !isCss && (code.includes('document.') || code.includes('const ') || code.includes('.className') || code.includes('for (let') || code.includes('transmitAstroLink') || code.includes('addEventListener')));
  const isPython = mode === 'python' || (mode === 'auto' && !isJava && !isCpp && !isJs && !isHtml && !isCss && (code.includes('data =') || code.includes('.replace(') || code.includes('.split(') || code.includes('data[') || code.includes('Archive') || code.includes('Planet =')));

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTagColor = (tagName: string) => {
    const name = tagName.toLowerCase();
    if (name === 'head') return 'text-amber-400';
    if (name === 'link') return 'text-sky-400';
    if (name.startsWith('h')) return 'text-orange-400';
    if (name === 'p') return 'text-sky-400';
    if (name === 'div') return 'text-purple-400';
    if (name === 'a') return 'text-emerald-400';
    if (name === 'img') return 'text-cyan-400';
    if (name === 'b') return 'text-rose-400';
    if (name === 'u') return 'text-teal-400';
    if (name === 'mark') return 'text-yellow-400';
    if (name === 'del') return 'text-pink-400';
    if (name === 'figcaption') return 'text-indigo-400';
    if (name === 'style') return 'text-fuchsia-400';
    if (name === 'hr' || name === 'br') return 'text-amber-300';
    return 'text-amber-400';
  };

  const lines = useMemo(() => {
    if (!code) return [];
    return code.split('\n').filter((l, idx, arr) => !(idx === arr.length - 1 && l.trim() === ''));
  }, [code]);

  const hasContent = lines.length > 0 && code.trim() !== '';

  // Calculate Partner Pairs (ONLY true matching open/close pairs across lines)
  const partnerMap = useMemo(() => {
    const map: Record<number, number[]> = {};

    const linkPair = (idxA: number, idxB: number) => {
      if (idxA === idxB || idxA < 0 || idxB < 0) return;
      if (!map[idxA]) map[idxA] = [];
      if (!map[idxB]) map[idxB] = [];
      if (!map[idxA].includes(idxB)) map[idxA].push(idxB);
      if (!map[idxB].includes(idxA)) map[idxB].push(idxA);
    };

    if (isHtml) {
      const stack: { tag: string; lineIndex: number }[] = [];

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Comments are never partner lines - ignore completely
        if (trimmed.startsWith('<!--')) return;

        const tagMatches = Array.from(trimmed.matchAll(/<(\/?)([a-zA-Z0-9]+)(?:[\s\S]*?)(\/?)>/g));

        tagMatches.forEach((m) => {
          const isClosing = m[1] === '/';
          const tagName = m[2].toLowerCase();
          const isSelfClosing = m[3] === '/' || ['hr', 'br', 'img', 'input', 'meta', 'link'].includes(tagName);

          if (isSelfClosing) return;

          if (!isClosing) {
            stack.push({ tag: tagName, lineIndex: idx });
          } else {
            for (let sIdx = stack.length - 1; sIdx >= 0; sIdx--) {
              if (stack[sIdx].tag === tagName) {
                const matched = stack.splice(sIdx, 1)[0];
                const openIdx = matched.lineIndex;
                const closeIdx = idx;

                linkPair(openIdx, closeIdx);
                break;
              }
            }
          }
        });
      });
    } else {
      const loopStack: number[] = [];
      const braceStack: number[] = [];
      let startIdx: number | null = null;
      let endIdx: number | null = null;

      lines.forEach((line, idx) => {
        const trimmed = line.trim().toLowerCase();

        if (trimmed.startsWith('when the program runs') || trimmed.startsWith('start')) {
          startIdx = idx;
        } else if (trimmed.startsWith('end the program') || trimmed === 'end') {
          endIdx = idx;
        }

        if (trimmed.startsWith('repeat') || trimmed.startsWith('while') || trimmed.startsWith('for') || trimmed.startsWith('if')) {
          loopStack.push(idx);
        } else if (
          trimmed.startsWith('end repeat') ||
          trimmed.startsWith('end loop') ||
          trimmed.startsWith('end if') ||
          trimmed === 'end'
        ) {
          if (loopStack.length > 0) {
            const openIdx = loopStack.pop()!;
            linkPair(openIdx, idx);
          }
        }

        if (trimmed.includes('{')) braceStack.push(idx);
        if (trimmed.includes('}') && braceStack.length > 0) {
          const openIdx = braceStack.pop()!;
          linkPair(openIdx, idx);
        }
      });

      if (startIdx !== null && endIdx !== null) {
        linkPair(startIdx, endIdx);
      }
    }

    return map;
  }, [lines, isHtml]);

  const [hoveredTokenInfo, setHoveredTokenInfo] = useState<{
    token: string;
    lineIndex: number;
    title: string;
    whatItDoes: string;
    why: string;
  } | null>(null);

  // Active line for inspector: Hover takes precedence, otherwise Selected/Clicked line
  const activeLineIndex = hoveredLineIndex !== null ? hoveredLineIndex : selectedLineIndex;

  const activeExplanation = activeLineIndex !== null && lines[activeLineIndex]
    ? getSyntaxExplanation(lines[activeLineIndex], isHtml, isCss, isPython ? 'python' : isJava ? 'java' : isCpp ? 'cpp' : isJs ? 'javascript' : undefined)
    : null;

  // Click on a line selects or deselects it
  const handleLineClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setHoveredTokenInfo(null);
    if (selectedLineIndex === idx) {
      setSelectedLineIndex(null);
    } else {
      setSelectedLineIndex(idx);
    }
  };

  // Click on blank / empty background deselects the line
  const handleBlankAreaClick = () => {
    setHoveredTokenInfo(null);
    if (selectedLineIndex !== null) {
      setSelectedLineIndex(null);
    }
  };

  const getHtmlTokenDetail = (
    tokenStr: string,
    tagName: string,
    isClosing: boolean,
    attrKey?: string,
    attrVal?: string
  ): { title: string; whatItDoes: string; why: string } | null => {
    const lowerTag = tagName.toLowerCase();

    if (attrKey) {
      const lowerAttr = attrKey.toLowerCase().trim();
      if (lowerAttr === 'src') {
        return {
          title: 'Image Source Attribute (src)',
          whatItDoes: 'Specifies the image file path or URL that the browser downloads and renders.',
          why: 'Points to the Mars rover photograph, terrain scan, or station diagram to display on screen.',
        };
      }
      if (lowerAttr === 'href') {
        return {
          title: 'Hyperlink Destination (href)',
          whatItDoes: 'Specifies the web URL or document section that opens when clicked.',
          why: 'Enables astronauts to navigate to mission logs, equipment manuals, or communication channels.',
        };
      }
      if (lowerAttr === 'alt') {
        return {
          title: 'Alternative Description (alt)',
          whatItDoes: 'Provides text describing the image if it fails to load or for screen readers.',
          why: 'Ensures mission data remains accessible and readable even under low-bandwidth telemetry.',
        };
      }
      if (lowerAttr === 'id') {
        return {
          title: 'Unique Element Identifier (id)',
          whatItDoes: 'Gives this exact element a unique name on the entire webpage.',
          why: 'Allows specific mission styling or interactive scripts to target this exact element.',
        };
      }
      if (lowerAttr === 'class') {
        return {
          title: 'Style Class Group (class)',
          whatItDoes: 'Assigns one or more reusable styling categories to the element.',
          why: 'Shares unified visual designs across multiple buttons, alerts, or status cards.',
        };
      }
      if (lowerAttr === 'style') {
        return {
          title: 'Inline CSS Style (style)',
          whatItDoes: 'Applies visual styling rules directly to this element.',
          why: 'Allows quick overrides for background color, text size, or margins without external files.',
        };
      }
      return {
        title: `Element Attribute (${attrKey})`,
        whatItDoes: `Configures properties or behavior for the <${tagName}> element.`,
        why: `Customizes how the browser interprets and renders this part of the webpage.`,
      };
    }

    if (isClosing) {
      return {
        title: `Closing Tag (</${tagName}>)`,
        whatItDoes: `Marks the termination boundary of the <${tagName}> element.`,
        why: `Informs the browser rendering engine that content for this section has finished so layout remains orderly.`,
      };
    }

    if (lowerTag.startsWith('h') && /^h[1-6]$/.test(lowerTag)) {
      return {
        title: `${tagName.toUpperCase()} Heading Tag`,
        whatItDoes: `Defines a prominent level-${lowerTag.slice(1)} header block with bold styling.`,
        why: `Establishes visual structure so explorers immediately recognize mission titles and sector headings.`,
      };
    }

    if (lowerTag === 'p') {
      return {
        title: 'Paragraph Tag (<p>)',
        whatItDoes: 'Formats text into a clean paragraph block with automatic top and bottom spacing.',
        why: 'Organizes transmission readouts and mission logs into comfortable, readable text bodies.',
      };
    }

    if (lowerTag === 'img') {
      return {
        title: 'Image Element (<img>)',
        whatItDoes: 'Embeds a visual graphic or photo directly onto the page.',
        why: 'Renders Mars terrain captures, rover schematics, and satellite imagery for visual briefing.',
      };
    }

    if (lowerTag === 'button') {
      return {
        title: 'Interactive Button (<button>)',
        whatItDoes: 'Creates a clickable interactive push button.',
        why: 'Triggers actions such as deploying the Mars rover, rebooting sensors, or transmitting telemetry.',
      };
    }

    if (lowerTag === 'a') {
      return {
        title: 'Anchor Link (<a>)',
        whatItDoes: 'Creates a clickable hyperlink to another page or sector.',
        why: 'Connects different planetary research modules and communication databases together.',
      };
    }

    if (lowerTag === 'div') {
      return {
        title: 'Layout Division (<div>)',
        whatItDoes: 'Creates a block container used to group related elements together.',
        why: 'Structures the mission dashboard layout into organized cards, panels, and sections.',
      };
    }

    if (lowerTag === 'span') {
      return {
        title: 'Inline Container (<span>)',
        whatItDoes: 'Wraps a small section of text inline without breaking to a new line.',
        why: 'Enables styling or highlighting specific alert words inside a transmission paragraph.',
      };
    }

    if (lowerTag === 'ul' || lowerTag === 'ol' || lowerTag === 'li') {
      return {
        title: `List Element (<${tagName}>)`,
        whatItDoes: 'Defines bulleted items, numbered lists, or individual list entries.',
        why: 'Displays mission checklists, rover diagnostics, and payload items in clear order.',
      };
    }

    if (['b', 'strong', 'i', 'em', 'u', 'mark', 'del'].includes(lowerTag)) {
      return {
        title: `Text Formatting Tag (<${tagName}>)`,
        whatItDoes: 'Applies inline typographic emphasis (bold, italic, underline, or highlight).',
        why: 'Draws immediate focus to critical alert codes, status notes, and coordinates.',
      };
    }

    if (lowerTag === 'hr' || lowerTag === 'br') {
      return {
        title: lowerTag === 'hr' ? 'Horizontal Rule (<hr>)' : 'Line Break (<br>)',
        whatItDoes: lowerTag === 'hr' ? 'Draws a dividing line across the page.' : 'Forces text onto a new line.',
        why: 'Separates distinct mission sections or formats multi-line readouts cleanly.',
      };
    }

    return {
      title: `HTML Element (<${tagName}>)`,
      whatItDoes: `Builds a structural component on the webpage.`,
      why: 'Constructs the building blocks of the Mars mission user interface.',
    };
  };

  const renderHtmlLineTokens = (line: string, isRowSelected: boolean = false, lineIndex: number = 0) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
      return <span className="text-gray-400 italic font-mono">{trimmed}</span>;
    }

    const tokens = trimmed.split(/(<\/?[\w-]+(?:(?:\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?)?>)/g);

    return (
      <span className="flex items-center flex-wrap gap-x-0.5">
        {tokens.map((token, tIdx) => {
          if (!token) return null;

          const tagMatch = token.match(/^<(\/?)([\w-]+)([\s\S]*?)(\/?)>$/);
          if (tagMatch) {
            const isClosing = tagMatch[1] === '/';
            const tagName = tagMatch[2];
            const attributesStr = tagMatch[3];
            const isSelfClosing = tagMatch[4] === '/';
            const colorClass = getTagColor(tagName);
            const tagLabel = `<${isClosing ? '/' : ''}${tagName}${isSelfClosing ? ' /' : ''}>`;

            const tagDetail = isRowSelected ? getHtmlTokenDetail(tagLabel, tagName, isClosing) : null;

            return (
              <span key={tIdx} className="inline-flex items-center flex-wrap gap-x-1">
                {/* Main Tag Badge */}
                <span
                  onMouseEnter={() => {
                    if (isRowSelected && tagDetail) {
                      setHoveredTokenInfo({
                        token: tagLabel,
                        lineIndex,
                        title: tagDetail.title,
                        whatItDoes: tagDetail.whatItDoes,
                        why: tagDetail.why,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    if (isRowSelected) setHoveredTokenInfo(null);
                  }}
                  className={`font-bold transition-all ${
                    isRowSelected
                      ? 'inline-flex items-center px-1.5 py-0.5 rounded bg-sky-950/90 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)] text-sky-100 cursor-help scale-105'
                      : ''
                  }`}
                >
                  <span className={isRowSelected ? 'text-sky-200' : colorClass}>
                    &lt;{isClosing ? '/' : ''}{tagName}
                  </span>
                  {!attributesStr && (
                    <span className={isRowSelected ? 'text-sky-200' : colorClass}>
                      {isSelfClosing ? ' /' : ''}&gt;
                    </span>
                  )}
                </span>

                {/* Attributes */}
                {attributesStr && (
                  <span className="inline-flex items-center flex-wrap gap-x-1 font-normal">
                    {attributesStr.split(/(\s*[\w-]+="[^"]*")/g).map((attr, aIdx) => {
                      if (!attr.trim()) return null;
                      if (attr.includes('=')) {
                        const [k, v] = attr.split(/=(.+)/);
                        const cleanK = k.trim();
                        const attrDetail = isRowSelected ? getHtmlTokenDetail(attr.trim(), tagName, false, cleanK, v) : null;
                        return (
                          <span
                            key={aIdx}
                            onMouseEnter={() => {
                              if (isRowSelected && attrDetail) {
                                setHoveredTokenInfo({
                                  token: attr.trim(),
                                  lineIndex,
                                  title: attrDetail.title,
                                  whatItDoes: attrDetail.whatItDoes,
                                  why: attrDetail.why,
                                });
                              }
                            }}
                            onMouseLeave={() => {
                              if (isRowSelected) setHoveredTokenInfo(null);
                            }}
                            className={`transition-all ${
                              isRowSelected
                                ? 'inline-flex items-center px-1 py-0.2 rounded bg-amber-950/90 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.7)] font-bold cursor-help scale-105'
                                : ''
                            }`}
                          >
                            <span className={isRowSelected ? 'text-amber-200' : 'text-sky-300'}>{cleanK}</span>
                            <span className="text-gray-300">=</span>
                            <span className={isRowSelected ? 'text-amber-100' : 'text-amber-300'}>{v}</span>
                          </span>
                        );
                      }
                      return <span key={aIdx} className="text-purple-300">{attr}</span>;
                    })}
                    <span
                      onMouseEnter={() => {
                        if (isRowSelected && tagDetail) {
                          setHoveredTokenInfo({
                            token: tagLabel,
                            lineIndex,
                            title: tagDetail.title,
                            whatItDoes: tagDetail.whatItDoes,
                            why: tagDetail.why,
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        if (isRowSelected) setHoveredTokenInfo(null);
                      }}
                      className={`font-bold ${isRowSelected ? 'text-sky-200' : colorClass}`}
                    >
                      {isSelfClosing ? ' /' : ''}&gt;
                    </span>
                  </span>
                )}
              </span>
            );
          }

          return (
            <span
              key={tIdx}
              className={`transition-all ${
                isRowSelected
                  ? 'text-white font-semibold px-1 py-0.2 rounded bg-white/10'
                  : 'text-gray-100 font-medium'
              }`}
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  const renderPseudocodeLineTokens = (line: string) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('Start') || trimmed.startsWith('When the program')) {
      return <span className="text-emerald-400 font-bold">{trimmed}</span>;
    }
    if (trimmed.startsWith('End') || trimmed === 'End') {
      return <span className="text-rose-400 font-bold">{trimmed}</span>;
    }
    if (trimmed.startsWith('Move the rover')) {
      return (
        <span>
          <span className="text-sky-300 font-semibold">Move the rover </span>
          <span className="text-amber-300 font-bold">{trimmed.replace('Move the rover ', '').replace(' 1 space.', '')} </span>
          <span className="text-emerald-300 font-medium">1 space.</span>
        </span>
      );
    }
    if (trimmed.startsWith('Turn the rover')) {
      return (
        <span>
          <span className="text-sky-300 font-semibold">Turn the rover to the </span>
          <span className="text-amber-300 font-bold">{trimmed.replace('Turn the rover to the ', '').replace('.', '')}</span>
          <span className="text-gray-400">.</span>
        </span>
      );
    }
    if (trimmed.startsWith('Repeat') || trimmed.startsWith('while') || trimmed.startsWith('for')) {
      return <span className="text-purple-300 font-bold">{trimmed}</span>;
    }
    if (trimmed.startsWith('If')) {
      return <span className="text-orange-400 font-bold">{trimmed}</span>;
    }

    return <span className="text-gray-200">{trimmed}</span>;
  };

  const renderCssLineTokens = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      const parts = trimmed.split(/(\{)/);
      return (
        <span>
          <span className="text-yellow-400 font-bold">{parts[0]}</span>
          {parts[1] && <span className="text-gray-300 font-bold">{parts[1]}</span>}
        </span>
      );
    }
    if (trimmed.startsWith('background-color:')) {
      const [prop, val] = trimmed.split(':');
      return (
        <span className="pl-4">
          <span className="text-sky-300 font-medium">{prop}:</span>
          <span className="text-emerald-400 font-semibold">{val}</span>
        </span>
      );
    }
    if (trimmed === '}') {
      return <span className="text-gray-300 font-bold">{'}'}</span>;
    }
    return <span className="text-gray-200">{trimmed}</span>;
  };

  const renderJsLineTokens = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      return <span className="text-gray-400 italic">{trimmed}</span>;
    }
    const tokenRegex = /(\/\/.*$|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\b(?:const|let|var|if|else|for|function|return)\b|\b(?:document|window|console)\b|\b(?:getElementById|getElementsByTagName|querySelectorAll|querySelector|forEach|length)\b|\.className|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|[{}();=><+\-*\/.]|\s+)/g;
    const tokens = trimmed.match(tokenRegex) || [trimmed];

    return (
      <span>
        {tokens.map((token, tIdx) => {
          if (/^(\/\/.*$)/.test(token)) {
            return <span key={tIdx} className="text-gray-400 italic">{token}</span>;
          }
          if (/^('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")$/.test(token)) {
            return <span key={tIdx} className="text-emerald-300 font-semibold">{token}</span>;
          }
          if (/^\b(const|let|var|if|else|for|function|return)\b$/.test(token)) {
            return <span key={tIdx} className="text-purple-400 font-bold">{token}</span>;
          }
          if (/^\b(document|window|console)\b$/.test(token)) {
            return <span key={tIdx} className="text-cyan-400 font-bold">{token}</span>;
          }
          if (/^\b(getElementById|getElementsByTagName|querySelectorAll|querySelector|forEach)\b$/.test(token)) {
            return <span key={tIdx} className="text-sky-300 font-semibold">{token}</span>;
          }
          if (token === '.className') {
            return <span key={tIdx} className="text-amber-300 font-semibold">{token}</span>;
          }
          if (/^[{}();]$/.test(token)) {
            return <span key={tIdx} className="text-gray-400 font-bold">{token}</span>;
          }
          if (/^[=><+\-*\/]$/.test(token)) {
            return <span key={tIdx} className="text-pink-400 font-bold">{token}</span>;
          }
          return <span key={tIdx} className="text-gray-200">{token}</span>;
        })}
      </span>
    );
  };

  const renderJavaLineTokens = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      return <span className="text-gray-400 italic">{trimmed}</span>;
    }
    const tokenRegex = /(\/\/.*$|"(?:[^"\\]|\\.)*"|\b(?:String|int|boolean)\b|\b(?:true|false)\b|\b\d+\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|[;=+\-*\/()]|\s+)/g;
    const tokens = trimmed.match(tokenRegex) || [trimmed];

    return (
      <span>
        {tokens.map((token, tIdx) => {
          if (/^(\/\/.*$)/.test(token)) {
            return <span key={tIdx} className="text-gray-400 italic">{token}</span>;
          }
          if (/^"(?:[^"\\]|\\.)*"$/.test(token)) {
            return <span key={tIdx} className="text-emerald-300 font-semibold">{token}</span>;
          }
          if (token === 'String') {
            return <span key={tIdx} className="text-sky-400 font-bold">{token}</span>;
          }
          if (token === 'int') {
            return <span key={tIdx} className="text-emerald-400 font-bold">{token}</span>;
          }
          if (token === 'boolean') {
            return <span key={tIdx} className="text-amber-400 font-bold">{token}</span>;
          }
          if (/^(true|false)$/.test(token)) {
            return <span key={tIdx} className="text-yellow-300 font-bold">{token}</span>;
          }
          if (/^\d+$/.test(token)) {
            return <span key={tIdx} className="text-teal-300 font-bold">{token}</span>;
          }
          if (token === ';') {
            return <span key={tIdx} className="text-gray-400 font-bold">{token}</span>;
          }
          if (token === '=') {
            return <span key={tIdx} className="text-pink-400 font-bold">{token}</span>;
          }
          if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token)) {
            return <span key={tIdx} className="text-purple-200 font-medium">{token}</span>;
          }
          return <span key={tIdx} className="text-gray-100">{token}</span>;
        })}
      </span>
    );
  };

  const renderCppLineTokens = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      return <span className="text-gray-400 italic">{trimmed}</span>;
    }
    const tokenRegex = /(\/\/.*$|"(?:[^"\\]|\\.)*"|#(?:include)\b|<[a-zA-Z0-9_]+>|\b(?:using|namespace|int|string|bool|cin|cout|endl|return)\b|\b(?:true|false)\b|\b\d+\b|>>|<<|[;=+\-*\/(){}]|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|\s+)/g;
    const tokens = trimmed.match(tokenRegex) || [trimmed];

    return (
      <span>
        {tokens.map((token, tIdx) => {
          if (/^(\/\/.*$)/.test(token)) {
            return <span key={tIdx} className="text-gray-400 italic">{token}</span>;
          }
          if (/^"(?:[^"\\]|\\.)*"$/.test(token)) {
            return <span key={tIdx} className="text-emerald-300 font-semibold">{token}</span>;
          }
          if (/^<[a-zA-Z0-9_]+>$/.test(token)) {
            return <span key={tIdx} className="text-amber-300 font-semibold">{token}</span>;
          }
          if (token === '#include' || token === 'using' || token === 'namespace' || token === 'return') {
            return <span key={tIdx} className="text-purple-400 font-bold">{token}</span>;
          }
          if (token === 'main') {
            return <span key={tIdx} className="text-yellow-400 font-bold">{token}</span>;
          }
          if (token === 'runSensors' || token === 'runDebris') {
            return <span key={tIdx} className="text-sky-300 font-semibold">{token}</span>;
          }
          if (token === '*') {
            return <span key={tIdx} className="text-amber-400 font-bold">{token}</span>;
          }
          if (token === '=') {
            return <span key={tIdx} className="text-pink-400 font-bold">{token}</span>;
          }
          if (token === 'string' || token === 'bool' || token === 'int' || token === 'Task' || token === 'Core') {
            return <span key={tIdx} className="text-cyan-400 font-bold">{token}</span>;
          }
          if (token === 'new' || token === 'delete' || token === 'nullptr') {
            return <span key={tIdx} className="text-rose-400 font-bold">{token}</span>;
          }
          if (token === 'sensorPtr' || token === 'debrisPtr') {
            return <span key={tIdx} className="text-amber-300 font-mono font-semibold">{token}</span>;
          }
          if (token === 'cin' || token === 'cout') {
            return <span key={tIdx} className="text-amber-400 font-bold">{token}</span>;
          }
          if (token === '>>' || token === '<<') {
            return <span key={tIdx} className="text-rose-400 font-extrabold">{token}</span>;
          }
          if (token === 'endl') {
            return <span key={tIdx} className="text-red-400 font-semibold">{token}</span>;
          }
          if (/^\b(true|false|\d+)\b$/.test(token)) {
            return <span key={tIdx} className="text-yellow-300 font-mono">{token}</span>;
          }
          if (/^[;(){}]$/.test(token)) {
            return <span key={tIdx} className="text-gray-400 font-bold">{token}</span>;
          }
          return <span key={tIdx} className="text-gray-200">{token}</span>;
        })}
      </span>
    );
  };

  const getPythonTokenDetail = (token: string, line: string): { title: string; whatItDoes: string; why: string } | null => {
    const trimmed = line.trim();
    const hasSlice = trimmed.includes('[') && trimmed.includes(':') && trimmed.includes(']');
    const hasReplace = trimmed.includes('.replace(');
    const hasSplit = trimmed.includes('.split(');
    const hasAssign = trimmed.includes('data =') && !hasSlice && !hasReplace && !hasSplit;

    if (token === 'import') {
      return {
        title: 'Module Import (import)',
        whatItDoes: 'Brings in an outside tool or library.',
        why: 'Lets you use tools and functions from another module without writing them from scratch.',
      };
    }

    if (token === 'def') {
      return {
        title: 'Define Function (def)',
        whatItDoes: 'Creates a new custom command (function).',
        why: 'Bundles multiple steps together so you can run them anytime with one name.',
      };
    }

    if (token === 'master_reboot') {
      return {
        title: 'Function Name (master_reboot)',
        whatItDoes: 'The name of your custom reboot command.',
        why: 'Gives your group of actions a clear name so you can call it.',
      };
    }

    if (token === 'system') {
      return {
        title: 'System Controller (system)',
        whatItDoes: 'The main system controller object.',
        why: 'Gives you access to the main station tools and controls.',
      };
    }

    if (token === 'synchronize') {
      return {
        title: 'Synchronize (.synchronize())',
        whatItDoes: 'Runs your reboot sequence across everything.',
        why: 'Tells the system to start your reboot program so all planets connect together.',
      };
    }

    if (token.startsWith('load_')) {
      return {
        title: `Power Up (${token}())`,
        whatItDoes: `Turns on this planet's system.`,
        why: `Runs the specific power-up steps for this planet.`,
      };
    }

    if (/^\[\d+:\d+\]$/.test(token)) {
      const match = token.match(/\[(\d+):(\d+)\]/);
      const start = match ? match[1] : 'start';
      const stop = match ? match[2] : 'stop';
      return {
        title: `String Slicing ${token}`,
        whatItDoes: `Cuts out letters from position ${start} up to ${stop}.`,
        why: 'Keeps only the useful part of the text and leaves the junk symbols behind.',
      };
    }

    if (token === 'replace') {
      return {
        title: 'Replace Method (.replace())',
        whatItDoes: 'Swaps old letters for new letters.',
        why: 'Quickly fixes typos or swaps out unwanted symbols across your text.',
      };
    }

    if (token === 'split') {
      return {
        title: 'Split Method (.split())',
        whatItDoes: 'Chops text into a list of words.',
        why: 'Breaks up one long sentence into separate, easy-to-read words.',
      };
    }

    if (token === 'Archive') {
      return {
        title: 'Archive List (Archive)',
        whatItDoes: 'A list that stores your saved records.',
        why: 'Holds multiple items in order in one place.',
      };
    }

    if (token === 'append') {
      return {
        title: 'Append Method (.append())',
        whatItDoes: 'Adds a new item to the end of the list.',
        why: 'Grows your list as you save new items into it.',
      };
    }

    if (/^["']/.test(token)) {
      if (hasReplace) {
        const match = trimmed.match(/\.replace\((["'][^"']*["'])\s*,\s*(["'][^"']*["'])\)/);
        if (match && token === match[1]) {
          return {
            title: `Search Text ${token}`,
            whatItDoes: 'The text you want to find and remove.',
            why: 'Tells Python exactly which letters to search for.',
          };
        }
        return {
          title: `Replacement Text ${token}`,
          whatItDoes: 'The new text you want to put in.',
          why: 'Tells Python what to put in place of the old letters.',
        };
      }
      if (hasSplit) {
        return {
          title: `Delimiter Symbol ${token}`,
          whatItDoes: 'The symbol where text gets chopped.',
          why: 'Tells Python where each word starts and ends.',
        };
      }
      if (hasAssign) {
        return {
          title: 'Text String',
          whatItDoes: 'A piece of text inside quotes.',
          why: 'Quotes tell Python this is text data, not code commands.',
        };
      }
    }

    if (token === 'print') {
      return {
        title: 'Print Command (print())',
        whatItDoes: 'Shows text or answers on your screen.',
        why: 'Helps you check your results and see what happened.',
      };
    }

    if (token === 'data') {
      return {
        title: 'Variable Box (data)',
        whatItDoes: 'A named storage box for information.',
        why: 'Keeps your text safe so each step can work with it.',
      };
    }

    if (['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Planet'].includes(token)) {
      return {
        title: `${token} Profile Card`,
        whatItDoes: `A box holding all facts about ${token}.`,
        why: 'Keeps all details about this planet organized together.',
      };
    }

    if (token === '"type"' || token === "'type'") {
      return {
        title: 'Category Label ("type")',
        whatItDoes: 'Labels what kind of planet it is.',
        why: 'Lets you look up whether the planet is Rocky or a Gas Giant.',
      };
    }

    if (token === '"features"' || token === "'features'") {
      return {
        title: 'Features Label ("features")',
        whatItDoes: 'Labels what makes this planet special.',
        why: 'Lets you look up special traits like rings or storms.',
      };
    }

    if (token === '"description"' || token === "'description'") {
      return {
        title: 'Description Label ("description")',
        whatItDoes: 'Labels the summary sentence.',
        why: 'Lets you look up the decoded overview of the planet.',
      };
    }

    if (token === '{' || token === '}') {
      return {
        title: 'Curly Braces ({ })',
        whatItDoes: 'The start and end of a profile card.',
        why: 'Packages all the labeled facts together into one neat record.',
      };
    }

    return null;
  };

  const renderPythonLineTokens = (line: string, isRowSelected: boolean = false, lineIndex: number = 0) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      return <span className="text-gray-400 italic font-mono">{trimmed}</span>;
    }
    const tokenRegex = /(#.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\[\d+:\d+\]|\b(?:import|def|master_reboot|system|synchronize|load_\w+|data|replace|split|print|Archive|append|Planet|Mercury|Venus|Earth|Mars|Jupiter|Saturn|name|type|features|description|known_for|True|False)\b|\b\d+\b|[=.,:[\]{}()]|\s+)/g;
    const tokens = trimmed.match(tokenRegex) || [trimmed];

    const hasSlice = trimmed.includes('[') && trimmed.includes(':') && trimmed.includes(']');
    const hasReplace = trimmed.includes('.replace(');
    const hasSplit = trimmed.includes('.split(');
    const hasAssign = trimmed.includes('data =') && !hasSlice && !hasReplace && !hasSplit;

    return (
      <span className="flex items-center flex-wrap gap-x-0.5">
        {tokens.map((token, tIdx) => {
          if (/^#/.test(token)) {
            return <span key={tIdx} className="text-gray-400 italic font-mono">{token}</span>;
          }

          // String literals
          if (/^["']/.test(token)) {
            const isDictKey = token === '"type"' || token === '"features"' || token === '"description"' || token === '"name"' || token === '"known_for"';
            const isTargetParam = isRowSelected && (hasReplace || hasSplit || hasAssign || isDictKey);
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isTargetParam
                    ? isDictKey
                      ? 'text-sky-200 bg-sky-950/90 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)] px-1.5 py-0.2 rounded font-black cursor-help'
                      : hasReplace
                      ? 'text-amber-100 bg-amber-950/90 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)] px-1 py-0.2 rounded font-black scale-105 cursor-help'
                      : hasSplit
                      ? 'text-emerald-100 bg-emerald-950/90 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)] px-1 py-0.2 rounded font-black scale-105 cursor-help'
                      : 'text-purple-100 bg-purple-950/90 border border-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.7)] px-1 py-0.2 rounded font-black scale-105 cursor-help'
                    : isDictKey
                    ? 'text-sky-300 font-semibold'
                    : 'text-emerald-300 font-semibold'
                }`}
              >
                {token}
              </span>
            );
          }

          // planet variable identifiers
          if (['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Planet'].includes(token)) {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`transition-all ${
                  isRowSelected
                    ? 'text-cyan-200 bg-cyan-950/80 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.5)] px-1.5 rounded font-bold cursor-help'
                    : 'text-cyan-300 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // import keyword
          if (token === 'import') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-purple-200 bg-purple-950/90 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-purple-400 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // def keyword
          if (token === 'def') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-blue-200 bg-blue-950/90 border border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-blue-400 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // master_reboot function
          if (token === 'master_reboot') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-amber-200 bg-amber-950/90 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-amber-300 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // system controller
          if (token === 'system') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-cyan-200 bg-cyan-950/90 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-cyan-300 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // synchronize method
          if (token === 'synchronize') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-emerald-200 bg-emerald-950/90 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-emerald-400 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // load_* module methods
          if (token.startsWith('load_')) {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-orange-200 bg-orange-950/90 border border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-orange-300 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // Archive variable
          if (token === 'Archive') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`transition-all ${
                  isRowSelected
                    ? 'text-purple-200 bg-purple-950/80 border border-purple-400/60 shadow-[0_0_10px_rgba(139,92,246,0.5)] px-1.5 rounded font-bold cursor-help'
                    : 'text-purple-300 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // append method
          if (token === 'append') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-pink-200 bg-pink-950/90 border border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-pink-400 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // data identifier
          if (token === 'data') {
            const isTargetVar = isRowSelected && (hasAssign || hasSlice || hasReplace || hasSplit);
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`transition-all ${
                  isTargetVar
                    ? 'text-purple-200 bg-purple-950/80 border border-purple-400/60 shadow-[0_0_10px_rgba(139,92,246,0.5)] px-1 rounded font-bold cursor-help'
                    : 'text-purple-300 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // replace method
          if (token === 'replace') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-amber-200 bg-amber-950/90 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-amber-400 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // split method
          if (token === 'split') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-emerald-200 bg-emerald-950/90 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-emerald-400 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // slice token [start:stop]
          if (/^\[\d+:\d+\]$/.test(token)) {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-red-100 bg-red-950/95 border-2 border-red-500 shadow-[0_0_15px_#ef4444] px-2 py-0.5 rounded font-mono font-black scale-110 inline-block cursor-help'
                    : 'text-amber-300 font-mono font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // print statement
          if (token === 'print') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`relative transition-all ${
                  isRowSelected
                    ? 'text-cyan-200 bg-cyan-950/90 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] px-1.5 py-0.2 rounded font-black cursor-help'
                    : 'text-cyan-400 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          // dictionary curly braces
          if (token === '{' || token === '}') {
            const detail = isRowSelected ? getPythonTokenDetail(token, line) : null;
            return (
              <span
                key={tIdx}
                onMouseEnter={() => {
                  if (isRowSelected && detail) {
                    setHoveredTokenInfo({
                      token,
                      lineIndex,
                      title: detail.title,
                      whatItDoes: detail.whatItDoes,
                      why: detail.why,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (isRowSelected) setHoveredTokenInfo(null);
                }}
                className={`transition-all ${
                  isRowSelected
                    ? 'text-yellow-200 bg-yellow-950/80 border border-yellow-400/60 shadow-[0_0_8px_rgba(234,179,8,0.5)] px-1 rounded font-bold cursor-help'
                    : 'text-yellow-400 font-bold'
                }`}
              >
                {token}
              </span>
            );
          }

          if (token === '=') {
            return <span key={tIdx} className="text-pink-400 font-bold">{token}</span>;
          }
          if (/^[.,:[\]()]$/.test(token)) {
            return <span key={tIdx} className="text-gray-400 font-bold">{token}</span>;
          }
          return <span key={tIdx} className="text-gray-200">{token}</span>;
        })}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      onClick={handleBlankAreaClick}
      className="w-full h-full flex flex-col bg-[#0e031a] p-4 sm:p-5 overflow-hidden select-none"
    >
      {/* Top Header */}
      <div
        onClick={handleBlankAreaClick}
        className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff912d] shadow-[0_0_8px_#ff912d]" />
          <h3 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Code2 size={17} className="text-[#ff912d]" />
            What does this code do?
          </h3>
        </div>

        <button
          onClick={handleCopy}
          disabled={!hasContent}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Copy Code"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Main Container: Code Lines Area + Dynamic Inspector Card */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Code Canvas (clicking blank space deselects) */}
        <div
          onClick={handleBlankAreaClick}
          className="flex-1 min-h-[80px] bg-black/60 border border-white/10 rounded-xl p-3 sm:p-4 overflow-auto font-mono text-xs sm:text-sm leading-relaxed custom-syntax-scroll cursor-default"
        >
          {hasContent ? (
            <div className="space-y-0.5">
              {lines.map((line, idx) => {
                const indentMatch = line.match(/^(\s*)/);
                const leadingSpaces = indentMatch ? indentMatch[1].length : 0;
                const isSelectedDirect = selectedLineIndex === idx;
                const isSelectedPartner = selectedLineIndex !== null && (partnerMap[selectedLineIndex] || []).includes(idx);
                const isHoveredDirect = hoveredLineIndex === idx;
                const isHoveredPartner = hoveredLineIndex !== null && (partnerMap[hoveredLineIndex] || []).includes(idx);

                const isSelectedGroup = isSelectedDirect || isSelectedPartner;
                const isHoveredGroup = !selectedLineIndex && (isHoveredDirect || isHoveredPartner);
                const isLineActive = isSelectedGroup || isHoveredGroup;

                return (
                  <div
                    key={idx}
                    onClick={(e) => handleLineClick(e, idx)}
                    onMouseEnter={() => setHoveredLineIndex(idx)}
                    onMouseLeave={() => setHoveredLineIndex(null)}
                    className={`flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      isSelectedDirect
                        ? 'bg-[#ff912d]/30 border-l-4 border-[#ff912d] shadow-[0_0_18px_rgba(255,145,45,0.4)] ring-1 ring-[#ff912d]/80 text-white font-medium'
                        : isSelectedPartner
                        ? 'bg-[#ff912d]/20 border-l-4 border-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.3)] ring-1 ring-[#ff912d]/60 text-white font-medium'
                        : isHoveredDirect
                        ? 'bg-purple-600/35 border-l-4 border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/60 text-white'
                        : isHoveredPartner
                        ? 'bg-purple-600/25 border-l-4 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/40 text-white'
                        : 'hover:bg-white/5 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Line Number & Selection Arrow Indicator */}
                      <div className="w-8 flex items-center justify-end gap-1 font-mono text-xs select-none shrink-0">
                        {isSelectedDirect ? (
                          <span className="text-[#ff912d] text-[10px] font-black animate-pulse">▶</span>
                        ) : null}
                        <span className={`${
                          isSelectedGroup ? 'text-amber-300 font-bold' : isHoveredGroup ? 'text-purple-300 font-bold' : 'text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </div>

                      {/* Code Line Tokens */}
                      <div
                        style={{ paddingLeft: `${leadingSpaces * 10}px` }}
                        className="flex-1 flex items-center flex-wrap leading-relaxed font-mono text-xs sm:text-sm"
                      >
                        {isHtml ? renderHtmlLineTokens(line, isSelectedDirect, idx) : isCss ? renderCssLineTokens(line) : isCpp ? renderCppLineTokens(line) : isJava ? renderJavaLineTokens(line) : isJs ? renderJsLineTokens(line) : isPython ? renderPythonLineTokens(line, isSelectedDirect, idx) : renderPseudocodeLineTokens(line)}
                      </div>
                    </div>

                    {/* Partner Line Status Badge (ONLY displayed for the exact partner line) */}
                    {isSelectedPartner ? (
                      <span className="shrink-0 text-[10px] font-mono font-bold bg-[#ff912d]/25 border border-[#ff912d]/60 text-amber-200 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-in fade-in duration-200">
                        <span>⟷</span>
                        <span>Partner Line</span>
                      </span>
                    ) : isHoveredPartner ? (
                      <span className="shrink-0 text-[10px] font-mono font-bold bg-purple-950/90 border border-purple-400/60 text-purple-200 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-in fade-in duration-200">
                        <span>⟷</span>
                        <span>Partner Line</span>
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500 font-mono text-xs sm:text-sm">
              <Code2 size={24} className="mb-2 text-gray-600" />
              <p>Connect blocks on the canvas to inspect your live code syntax and explanations here.</p>
            </div>
          )}
        </div>

        {/* Static Section Divider */}
        <div className="h-px my-2 w-full bg-white/10" />

        {/* Description & Function Explanation Card */}
        <div className="h-[145px] shrink-0 overflow-y-auto">
          {hoveredTokenInfo ? (
            <div className="h-full bg-[#180a32]/98 border border-amber-500/50 rounded-xl p-3 sm:p-3.5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-pulse" />
                  <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wider">
                    {hoveredTokenInfo.title}
                  </span>
                  <span className="font-mono text-xs bg-amber-950/90 border border-amber-400/50 text-amber-200 px-2 py-0.5 rounded font-bold">
                    {hoveredTokenInfo.token}
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950/70 border border-cyan-500/40 px-2.5 py-0.5 rounded">
                  Active Block Focus
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-y-auto">
                <div className="bg-black/50 border border-white/10 rounded-lg p-2.5 flex flex-col justify-start">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-400 shrink-0" />
                    What It Does
                  </span>
                  <p className="text-gray-100 text-xs sm:text-sm leading-relaxed font-sans">
                    {hoveredTokenInfo.whatItDoes}
                  </p>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-2.5 flex flex-col justify-start">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <Code2 size={13} className="text-amber-400 shrink-0" />
                    Real-World Use (IRL)
                  </span>
                  <p className="text-amber-100 font-medium text-xs sm:text-sm leading-relaxed font-sans">
                    {hoveredTokenInfo.why}
                  </p>
                </div>
              </div>
            </div>
          ) : activeExplanation ? (
            <div className="h-full bg-[#160a28]/98 border border-purple-500/40 rounded-xl p-3 sm:p-3.5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wider">
                    {activeExplanation.title}
                  </span>
                  <span className="font-mono text-xs bg-purple-950/90 border border-purple-400/50 text-purple-200 px-2 py-0.5 rounded font-bold">
                    {activeExplanation.tagOrCommand}
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-300 font-bold bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded">
                  {activeExplanation.category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-y-auto">
                <div className="bg-black/50 border border-white/10 rounded-lg p-2.5 flex flex-col justify-start">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <Code2 size={13} className="text-cyan-400 shrink-0" />
                    Real-World Use (IRL)
                  </span>
                  <p className="text-gray-100 text-xs sm:text-sm leading-relaxed font-sans">
                    {activeExplanation.description}
                  </p>
                </div>

                <div className="bg-orange-950/40 border border-orange-500/40 rounded-lg p-2.5 flex flex-col justify-start">
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-orange-400 shrink-0" />
                    Mission Function
                  </span>
                  <p className="text-orange-100 font-medium text-xs sm:text-sm leading-relaxed font-sans">
                    {activeExplanation.functionPurpose}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#120722]/90 border border-white/10 rounded-xl p-3 flex items-center text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-[#ff912d] shrink-0" />
                <span>Click on any code line to select it and inspect its active blocks. Hover over highlighted blocks to see what they do and why.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
