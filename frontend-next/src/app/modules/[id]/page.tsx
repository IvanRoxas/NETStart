import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import ModuleDetailsClient from './ModuleDetailsClient';

const MODULE_MISSIONS: Record<string, { id: string; title: string; desc: string; tag?: string }[]> = {
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
    { id: "mars-1", title: "Mars Level 1: Semantic Habitat Tags", desc: "Construct semantic habitat components using header, main, section, and article tags.", tag: "Semantic Tags" },
    { id: "mars-2", title: "Mars Level 2: Environmental Forms & Telemetry", desc: "Build input fields, select elements, textareas, and master telemetry form attributes.", tag: "Forms" },
    { id: "mars-3", title: "Mars Level 3: Mineral Data Tables", desc: "Master the structure of rows, headers, cells, and embed framing details for Martian geology.", tag: "Tables" },
  ],
  venus: [
    { id: "venus-1", title: "Venus Level 1: Thermal Selectors & Cascades", desc: "Master targeting classes, ids, pseudo-selectors, and the CSS cascade tree.", tag: "Selectors" },
    { id: "venus-2", title: "Venus Level 2: Box Model Atmospheric Shields", desc: "Style border widths, margins, padding constraints, and display blocks.", tag: "Box Model" },
    { id: "venus-3", title: "Venus Level 3: Flexbox Gas Flow Alignment", desc: "Master flex-direction, justify-content, align-items, and responsive layouts.", tag: "Flexbox" },
  ],
  mercury: [
    { id: "mercury-1", title: "Mercury Level 1: Variable Orbital Bindings", desc: "Learn variables, let, const, primitive types, and math routines under solar radiation.", tag: "Variables" },
    { id: "mercury-2", title: "Mercury Level 2: Solar Flare Branching Logic", desc: "Master branching structures (if-else), switch cases, and logic loops.", tag: "Logic" },
    { id: "mercury-3", title: "Mercury Level 3: Velocity Function Expressions", desc: "Implement reusable function expressions, closures, and orbital scoping.", tag: "Functions" },
  ],
  jupiter: [
    { id: "jupiter-1", title: "Jupiter Level 1: Class & Object Blueprints", desc: "Design object-oriented classes, instance constructors, and blueprint definitions.", tag: "OOP" },
    { id: "jupiter-2", title: "Jupiter Level 2: Inheritance & Planetary Subclasses", desc: "Implement superclass inheritance, method overriding, and polymorphic behaviors.", tag: "Inheritance" },
    { id: "jupiter-3", title: "Jupiter Level 3: Encapsulation & Atmospheric Modifiers", desc: "Protect telemetry state using access modifiers (private, protected, public) and getters/setters.", tag: "Encapsulation" },
  ],
  saturn: [
    { id: "saturn-1", title: "Saturn Level 1: Ring Pointers & References", desc: "Master direct memory addresses, pointer arithmetic, and reference passing.", tag: "Pointers" },
    { id: "saturn-2", title: "Saturn Level 2: Dynamic Ring Memory Allocation", desc: "Manage heap memory allocations using new/delete and prevent zero-g memory leaks.", tag: "Memory" },
    { id: "saturn-3", title: "Saturn Level 3: Structural Vectors & Ring Buffers", desc: "Build high-speed data structures and contiguous ring buffers using C++ STL vectors.", tag: "Vectors" },
  ],
  earth: [
    { id: "earth-1", title: "Earth Level 1: Telemetry Data Structures", desc: "Master Python lists, dictionaries, tuples, sets, and data slicing at Headquarters.", tag: "Structures" },
    { id: "earth-2", title: "Earth Level 2: Satellite Pipeline Loops & Comprehensions", desc: "Process real-time telemetry streams using list comprehensions and iterative generators.", tag: "Loops" },
    { id: "earth-3", title: "Earth Level 3: Mission Log File Automation", desc: "Automate reading and writing mission logs using Python context managers (with open).", tag: "File I/O" },
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
  earth: { title: "Earth (Headquarters - Python)", category: "Command Headquarters Track", desc: "Return to Earth Mission Control to analyze space telemetry, automate satellite relays, and run data pipelines." },
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

  const { id } = await params;
  const moduleId = id.toLowerCase();
  const missions = MODULE_MISSIONS[moduleId];
  const meta = MODULE_META[moduleId];

  // Redirect on unsupported module path
  if (!missions || !meta) {
    redirect("/modules");
  }

  const userId = (session.user as any).id;

  // Retrieve user completed missions
  const completedMissions = await prisma.missionProgress.findMany({
    where: {
      userId,
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

  // Enforce 7-Planet Progression Chain
  const moonCompleted = getCompletedCount("moon") >= 3;
  const marsCompleted = getCompletedCount("mars") >= 5;
  const venusCompleted = getCompletedCount("venus") >= 5;
  const mercuryCompleted = getCompletedCount("mercury") >= 5;
  const jupiterCompleted = getCompletedCount("jupiter") >= 5;
  const saturnCompleted = getCompletedCount("saturn") >= 5;

  const isModuleLocked = () => {
    if (moduleId === "moon") return false;
    if (moduleId === "mars" || moduleId === "html") return !moonCompleted;
    if (moduleId === "venus" || moduleId === "css") return !(moonCompleted && marsCompleted);
    if (moduleId === "mercury" || moduleId === "javascript" || moduleId === "js") return !(moonCompleted && marsCompleted && venusCompleted);
    if (moduleId === "jupiter" || moduleId === "java") return !(moonCompleted && marsCompleted && venusCompleted && mercuryCompleted);
    if (moduleId === "saturn" || moduleId === "cpp") return !(moonCompleted && marsCompleted && venusCompleted && mercuryCompleted && jupiterCompleted);
    if (moduleId === "earth" || moduleId === "python") return !(moonCompleted && marsCompleted && venusCompleted && mercuryCompleted && jupiterCompleted && saturnCompleted);
    return false;
  };

  if (isModuleLocked()) {
    return (
      <div className="min-h-screen w-full bg-[#1e0a2d] flex items-center justify-center relative overflow-hidden px-6">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: "url('/Landing Page BG.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        <div className="absolute inset-0 bg-black/60 z-0" />
        
        <div className="bg-[#1e0a2d]/90 backdrop-blur-xl border border-[#ff912d]/30 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl relative z-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-[#ff912d]/10 rounded-full flex items-center justify-center border border-[#ff912d]/20 text-[#ff912d]">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Module Locked</h2>
            <p className="text-gray-400">
              You must complete all prior modules along the constellation flight path before entering this system orbit.
            </p>
          </div>

          <Link
            href="/modules"
            className="mt-4 px-8 py-4 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Return to Mission Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ModuleDetailsClient
      moduleId={moduleId}
      missions={missions}
      meta={meta}
      completedMissions={completedMissions}
      sessionUser={{
        name: session.user.name,
        image: session.user.image,
      }}
    />
  );
}
