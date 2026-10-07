import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import ModuleDetailsClient from './ModuleDetailsClient';
import { DEMO_MODE_COOKIE } from "@/lib/demoMode";

const MODULE_MISSIONS: Record<string, { id: string; title: string; desc: string; tag?: string; subtitle?: string }[]> = {
  moon: [
    { 
      id: "moon-1", 
      title: "Level 1: Stellar Beginnings", 
      desc: "Welcome to NETStart! Team up with your trusty assistant, Nova, to learn how to guide your rover safely to the goal.",
      tag: "Basic Syntax"
    },
    { 
      id: "moon-2", 
      title: "Level 2: Resource Classification", 
      desc: "Nova needs your help packing the ship! Use your new sensors and repeat blocks to scan the assembly line. Figure out what's fuel and what's junk so we can get flying!", 
      tag: "LOOPS & LOGIC" 
    },
    { 
      id: "moon-3", 
      title: "Level 3: The Starship Protocol", 
      desc: "Get the starship ready for launch! Guide air through the vents with If/Else, mix rocket fuel with loops, and survive the automated flight simulation.", 
      tag: "LOOPS & CONDITIONALS" 
    },
  ],
  mars: [
    { 
      id: "mars-1", 
      title: "Level 1: The Blank Billboard", 
      desc: "Help Director Mark build a fun space billboard for the colony. Pick a theme, add your title and text, and style your words to get a 5-star review.", 
      tag: "Text Hierarchy & Structure" 
    },
    { 
      id: "mars-2", 
      title: "Level 2: Picture Perfect", 
      desc: "Emma and Penny's screens show boring placeholder boxes. Read the little clues, find the matching pictures from your toolbox, and link them up to brighten their day.", 
      tag: "Images & Captions" 
    },
    { 
      id: "mars-3", 
      title: "Level 3: The Big Space Message", 
      desc: "Say hello to your space neighbors. Assemble text boxes and buttons to build a friendly message form and reach out to Mercury and Venus.", 
      tag: "Forms & Interactive Elements" 
    },
  ],
  venus: [
    { id: "venus-1", title: "Level 1: Color It In", desc: "Professor Spectrum's lab lost all its colors. Drop in some furniture, splash your favorite colors and borders, and style the banner to make the room feel lively again.", tag: "Basic Styling & Colors" },
    { id: "venus-2", title: "Level 2: Formatting the Prototype", desc: "We have the pieces, but the layout is a mess! We must align them properly so the structure holds before we can plug it into the planet's main machinery.", tag: "Layout & Alignment" },
    { id: "venus-3", title: "Level 3: Restoring the Dead Zones", desc: "The AstroLink is powered on, but parts of the planet are still stuck in black and white. We need to link our new CSS prototype to the main HTML network to fix these dead zones and bring the color back.", tag: "CSS Linking" },
  ],
  mercury: [
    { id: "mercury-1", title: "Level 1: Saving the Biodome", desc: "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.", tag: "FINDING ELEMENTS" },
    { id: "mercury-2", title: "Level 2: The Conveyor Belt", desc: "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!", tag: "Functions & Events" },
    { id: "mercury-3", title: "Level 3: The Missing Interface", desc: "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!", tag: "Web Development" },
  ],
  jupiter: [
    { id: "jupiter-1", title: "Level 1: Unlock the Gate", desc: "The Jupiter space station thinks you are an intruder and locked the blast doors!  Teach the system exactly what kind of data you are sending to unlock the heavy security gates.", tag: "Data Types & Variables" },
    { id: "jupiter-2", title: "Level 2: Try and Catch This!", desc: "Rescue Technician Io by building a Try/Catch safety net to intercept corrupted data blocks before they reach the server core!", tag: "TRY/CATCH" },
    { id: "jupiter-3", title: "Level 3: The AI Core Lockdown", desc: "The Main Vault is on strict lockdown! The AI Core won't let anyone through. Can you build a custom ID blueprint and forge an object to sneak past the security scanner?", tag: "Classes & Objects" },
  ],
  saturn: [
    { id: "saturn-1", title: "Saturn Level 1: Surprise Diagnostics", desc: "The station's sensors are scrambling data! Build the correct pipeline to catch the data, calculate the power, and route it to the main grid.", tag: "Variables" },
    { id: "saturn-2", title: "Level 2: Jumpstarting the Rings", desc: "Saturn's rings are completely jammed with floating space debris! Use your ship's tractor beam to automatically sort the ice, rock, and metal into the correct disposal chutes so the rings can spin again.", tag: "SWITCH-CASES" },
    {
      id: "saturn-3",
      title: "Level 3: A Leak in the System!",
      desc: "Oh no, Engineer Titan's mainframe is hogging all the energy cores and refusing to give them back! Whatever you take, you MUST return before the station goes boom!",
      tag: "Pointers and Power"
    },
  ],
  earth: [
    { id: "earth-1", title: "Level 1: Fix the Master Ledger!", desc: "The Master Ledger is scrambled! Use Python slicing and string tools to cut away the junk and restore each entry.", tag: "Text Processing" },
    { id: "earth-2", title: "Level 2: The Planetary Archive", desc: "A solar storm scrambled the Master Ledger! Sort the loose data into digital folders to reconnect the solar system.", tag: "Dictionaries & Lists" },
    { id: "earth-3", title: "Level 3: The Master Reboot", desc: "The Architect has one final program to bring together every repair you've made across the solar system, but he needs your help to run it. Use Python functions and modules to unify the network and bring the solar system online at once!", tag: "PYTHON, MODULES, +500 XP" },
  ],
};

// Aliases for legacy URLs
MODULE_MISSIONS['html'] = MODULE_MISSIONS['mars'];
MODULE_MISSIONS['css'] = MODULE_MISSIONS['venus'];
MODULE_MISSIONS['javascript'] = MODULE_MISSIONS['mercury'];
MODULE_MISSIONS['js'] = MODULE_MISSIONS['mercury'];
MODULE_MISSIONS['java'] = MODULE_MISSIONS['jupiter'];
MODULE_MISSIONS['cpp'] = MODULE_MISSIONS['saturn'];
MODULE_MISSIONS['python'] = MODULE_MISSIONS['earth'];

const MODULE_META: Record<string, { title: string; category: string; desc: string }> = {
  moon: { title: "The Moon (Tutorial)", category: "Tutorial", desc: "Calibrate your rover algorithms and master orientation puzzles on the lunar surface." },
  mars: { title: "Mars (HTML)", category: "Hypertext Markup Language (HTML)", desc: "Construct semantic habitats and environmental sensors across the red Martian landscape." },
  venus: { title: "Venus (CSS)", category: "Atmospheric Styling Track", desc: "Shield against the intense Venusian atmosphere with responsive stylesheets and grid layouts." },
  mercury: { title: "Mercury (JavaScript)", category: "Dynamic Scripting Track", desc: "Harness rapid orbital mechanics with variables, conditional loops, and DOM manipulation." },
  jupiter: { title: "Jupiter (Java)", category: "Object-Oriented Architecture Track", desc: "Navigate the colossal gravity of Jupiter by building robust classes, inheritance hierarchies, and interfaces." },
  saturn: { title: "Saturn (C++)", category: "High-Performance Systems Track", desc: "Traverse Saturn's icy ring system using memory pointers, memory management, and high-performance algorithms." },
  earth: { title: "Earth (Python)", category: "Python Track", desc: "Return to Earth Mission Control to analyze space telemetry, automate satellite relays, and run data pipelines." },
};

// Meta Aliases
MODULE_META['html'] = MODULE_META['mars'];
MODULE_META['css'] = MODULE_META['venus'];
MODULE_META['javascript'] = MODULE_META['mercury'];
MODULE_META['js'] = MODULE_META['mercury'];
MODULE_META['java'] = MODULE_META['jupiter'];
MODULE_META['cpp'] = MODULE_META['saturn'];
MODULE_META['python'] = MODULE_META['earth'];

interface Params {
  id: string;
}

export default async function ModuleMissionsPage({ params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const sessionUser = session.user as any;
  const userId = sessionUser?.id;
  const userEmail = sessionUser?.email;

  if (!userId && !userEmail) {
    redirect("/login");
  }

  let dbUser: any = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail },
      select: {
        id: true,
        canUseDemoMode: true,
      }
    });
  } catch (err: any) {
    dbUser = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail },
      select: {
        id: true,
      }
    });
    if (dbUser) {
      try {
        const raw: any = await prisma.$queryRaw`SELECT can_use_demo_mode FROM users WHERE user_id = ${dbUser.id} LIMIT 1`;
        dbUser.canUseDemoMode = Boolean(raw?.[0]?.can_use_demo_mode);
      } catch {
        dbUser.canUseDemoMode = false;
      }
    }
  }

  if (!dbUser) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const canUseDemoMode = dbUser.canUseDemoMode === true;
  const isDemoModeCookie = cookieStore.get(DEMO_MODE_COOKIE)?.value === 'true';
  const isDemoMode = canUseDemoMode && isDemoModeCookie;

  const { id } = await params;
  const moduleId = id.toLowerCase();
  const missions = MODULE_MISSIONS[moduleId];
  const meta = MODULE_META[moduleId];

  // Redirect on unsupported module path
  if (!missions || !meta) {
    redirect("/modules");
  }

  const activeUserId = dbUser.id;

  // Retrieve user completed missions
  const completedMissions = await prisma.missionProgress.findMany({
    where: {
      userId: activeUserId,
      status: "COMPLETED",
    },
    select: {
      missionId: true,
    }
  });

  const getCompletedCount = (modId: string) => {
    return completedMissions.filter(m => {
      const mid = m.missionId.toLowerCase();
      if (modId === 'moon') return mid.startsWith('moon') || mid.startsWith('html-1') || mid.startsWith('html-2') || mid.startsWith('html-3');
      if (modId === 'mars') return mid.startsWith('mars') || (mid.startsWith('html') && !['html-1', 'html-2', 'html-3'].includes(mid));
      if (modId === 'venus') return mid.startsWith('venus') || mid.startsWith('css');
      if (modId === 'mercury') return mid.startsWith('mercury') || mid.startsWith('javascript') || mid.startsWith('js');
      if (modId === 'jupiter') return mid.startsWith('jupiter') || mid.startsWith('java');
      if (modId === 'saturn') return mid.startsWith('saturn') || mid.startsWith('cpp');
      if (modId === 'earth') return mid.startsWith('earth') || mid.startsWith('python');
      return mid.startsWith(modId.toLowerCase());
    }).length;
  };

  // Enforce 7-Planet Progression Chain (3 missions per planet)
  const hasCompletedFinal = (planetId: string) => {
    return completedMissions.some(m => {
      const mid = m.missionId.toLowerCase();
      return mid === `${planetId}-3` || mid === `html-3-${planetId}` || mid === `css-3-${planetId}`;
    });
  };

  const moonCompleted = getCompletedCount("moon") >= 3 || hasCompletedFinal("moon");
  const marsCompleted = getCompletedCount("mars") >= 3 || hasCompletedFinal("mars");
  const venusCompleted = getCompletedCount("venus") >= 3 || hasCompletedFinal("venus");
  const mercuryCompleted = getCompletedCount("mercury") >= 3 || hasCompletedFinal("mercury");
  const jupiterCompleted = getCompletedCount("jupiter") >= 3 || hasCompletedFinal("jupiter");
  const saturnCompleted = getCompletedCount("saturn") >= 3 || hasCompletedFinal("saturn");

  const isModuleLocked = () => {
    if (isDemoMode) return false;
    if (moduleId === "moon") return false;
    if (moduleId === "mars" || moduleId === "html") return !moonCompleted;
    if (moduleId === "venus" || moduleId === "css") return !(moonCompleted && marsCompleted);
    if (moduleId === "mercury" || moduleId === "javascript" || moduleId === "js") return !(moonCompleted && marsCompleted && venusCompleted);
    if (moduleId === "jupiter" || moduleId === "java") return !(moonCompleted && marsCompleted && venusCompleted && mercuryCompleted);
    if (moduleId === "saturn" || moduleId === "cpp") return !(moonCompleted && marsCompleted && venusCompleted && mercuryCompleted && jupiterCompleted);
    if (moduleId === "earth" || moduleId === "python") return !(moonCompleted && marsCompleted && venusCompleted && mercuryCompleted && jupiterCompleted && saturnCompleted);
    return false;
  };

  const isLocked = isModuleLocked();

  return (
    <ModuleDetailsClient
      moduleId={moduleId}
      missions={missions}
      meta={meta}
      completedMissions={completedMissions}
      sessionUser={{
        id: userId,
        name: session?.user?.name || "Cadet (Demo Mode)",
        image: session?.user?.image || null,
      }}
      initialDemoMode={isDemoMode}
      isLocked={isLocked}
      canUseDemoMode={canUseDemoMode}
    />
  );
}
