import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, Check, Lock, Rocket, Award, Zap, Settings, HelpCircle } from 'lucide-react';

const MODULE_MISSIONS: Record<string, { id: string; title: string; desc: string }[]> = {
  html: [
    { id: "html-1", title: "HTML Level 1: Core Tags", desc: "Embark on learning fundamental HTML tags like headings, paragraphs, and list components." },
    { id: "html-2", title: "HTML Level 2: Structured Forms", desc: "Build input fields, select elements, textareas, and master form attributes." },
    { id: "html-3", title: "HTML Level 3: Tables and Frames", desc: "Master the structure of rows, headers, cells, and embed framing details." },
    { id: "html-4", title: "HTML Level 4: Layout Schemas", desc: "Create semantic webpage hierarchies using nav, footer, sections, and articles." },
    { id: "html-5", title: "HTML Level 5: Media Embeds", desc: "Embed audios, videos, images, and configure frame overrides." },
  ],
  css: [
    { id: "css-1", title: "CSS Level 1: Style Selectors", desc: "Master targeting classes, ids, properties, and the cascade tree." },
    { id: "css-2", title: "CSS Level 2: Box Model Schemas", desc: "Style border widths, margins, padding constraints, and display blocks." },
    { id: "css-3", title: "CSS Level 3: Flexbox Systems", desc: "Master flex-direction, justify-content, align-items, and alignment layouts." },
    { id: "css-4", title: "CSS Level 4: Grid Architectures", desc: "Design structured column-row layouts, grid-areas, and alignments." },
    { id: "css-5", title: "CSS Level 5: Transits & Keyframes", desc: "Implement active transforms, smooth animations, and transitions." },
  ],
  javascript: [
    { id: "javascript-1", title: "JS Level 1: Core Bindings", desc: "Learn variables, let, const, primitive types, and math routines." },
    { id: "javascript-2", title: "JS Level 2: Control Logic", desc: "Master branching structures (if-else), switch cases, and loops." },
    { id: "javascript-3", title: "JS Level 3: Function Declarations", desc: "Implement reusable function expressions, closures, and scoping." },
    { id: "javascript-4", title: "JS Level 4: Array Iterators", desc: "Master maps, filters, reductions, and sorting loops." },
    { id: "javascript-5", title: "JS Level 5: DOM Injections", desc: "Query elements, inject styles, dynamic texts, and event listeners." },
  ],
  react: [
    { id: "react-1", title: "React Level 1: JSX Injections", desc: "Master building functional components using declarative JSX tags." },
    { id: "react-2", title: "React Level 2: State Hooks", desc: "Master React state hooks, inputs, re-renders, and lifecycle binds." },
    { id: "react-3", title: "React Level 3: Prop Transits", desc: "Pass data down parent components, configure defaults, and handle callbacks." },
    { id: "react-4", title: "React Level 4: Context Providers", desc: "Share states globally across subtrees using Context wrappers." },
    { id: "react-5", title: "React Level 5: Hooks Customizer", desc: "Build reusable hooks encapsulating state routines." },
  ],
  node: [
    { id: "node-1", title: "Node Level 1: File Actions", desc: "Read and write local configuration assets using fs bindings." },
    { id: "node-2", title: "Node Level 2: HTTP Hosts", desc: "Spin up HTTP servers listening to custom ports." },
    { id: "node-3", title: "Node Level 3: Express Routing", desc: "Design route controllers handling GET and POST payloads." },
    { id: "node-4", title: "Node Level 4: DB Bindings", desc: "Integrate queries connecting schema layouts." },
    { id: "node-5", title: "Node Level 5: Middlewares", desc: "Build pipeline controllers filtering inbound requests." },
  ],
};

const MODULE_META: Record<string, { title: string; category: string; desc: string }> = {
  html: { title: "HTML Basics", category: "HyperText Markup", desc: "Embark on creating your first structured webpage schemas with clean layouts." },
  css: { title: "Cascading Styles", category: "Style & Layout", desc: "Elevate your visuals with custom themes, colors, and layout flex grids." },
  javascript: { title: "JavaScript Logic", category: "Core Dynamic Scripting", desc: "Infuse your apps with branching loops, operations, and dynamic API events." },
  react: { title: "React Components", category: "Modern SPA Framework", desc: "Architect component structures using states, hook bindings, and transit props." },
  node: { title: "Node Backend", category: "Server Side Operations", desc: "Build REST route microservices, http hosts, and database schema layers." },
};

const getMissionHint = (missionId: string) => {
  const hints: Record<string, string> = {
    "html-1": "Hint: Focus on correct nesting of basic tags like h1, p, and lists.",
    "html-2": "Hint: Remember to specify input type attributes and form label relations.",
    "html-3": "Hint: Use tr for rows, th for headers, and td for standard cells.",
    "html-4": "Hint: Use semantic tags (header, nav, main, section, footer) for document outline.",
    "html-5": "Hint: Configure src, width, height, and controls for video/audio embeds.",
    "css-1": "Hint: Master targeting classes (.name), IDs (#id), and properties.",
    "css-2": "Hint: Remember that padding is inside the border and margin is outside.",
    "css-3": "Hint: Use justify-content for main axis and align-items for cross axis layout.",
    "css-4": "Hint: Define columns using grid-template-columns and gaps with grid-gap.",
    "css-5": "Hint: Match transition properties with keyframes and durations.",
    "javascript-1": "Hint: Use let for mutable variables and const for block-scoped constants.",
    "javascript-2": "Hint: Check conditions carefully inside if-else blocks.",
    "javascript-3": "Hint: Understand function scoping and return values.",
    "javascript-4": "Hint: Use map() to transform, filter() to select, and reduce() to aggregate.",
    "javascript-5": "Hint: Use document.querySelector() and addEventListener() for user inputs.",
    "react-1": "Hint: Always return a single parent element or fragment in JSX.",
    "react-2": "Hint: Call useState() at the top level of your component only.",
    "react-3": "Hint: Props are read-only; use state or callback handlers to pass data up.",
    "react-4": "Hint: Wrap the parent tree in <Context.Provider value={...}> to share state.",
    "react-5": "Hint: Custom hooks must start with the prefix 'use'.",
    "node-1": "Hint: Use fs.readFile() and fs.writeFile() with correct encoding.",
    "node-2": "Hint: Use http.createServer() and specify the listening port.",
    "node-3": "Hint: Define Express GET/POST endpoints with app.get() and app.post().",
    "node-4": "Hint: Execute Prisma queries inside try-catch blocks.",
    "node-5": "Hint: Always call next() in middleware to pass control to next handler."
  };
  return hints[missionId.toLowerCase()] || "Hint: Complete this level to earn 100 XP and unlock rewards!";
};

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
    return completedMissions.filter(m => m.missionId.toLowerCase().startsWith(modId.toLowerCase())).length;
  };

  // Enforce progression checking
  const htmlCompleted = getCompletedCount("html") >= 5;
  const cssCompleted = getCompletedCount("css") >= 5;
  const jsCompleted = getCompletedCount("javascript") >= 8 || getCompletedCount("js") >= 8;
  const reactCompleted = getCompletedCount("react") >= 10;

  const isModuleLocked = () => {
    if (moduleId === "html") return false;
    if (moduleId === "css") return !htmlCompleted;
    if (moduleId === "javascript") return !(htmlCompleted && cssCompleted);
    if (moduleId === "react") return !(htmlCompleted && cssCompleted && jsCompleted);
    if (moduleId === "node") return !(htmlCompleted && cssCompleted && jsCompleted && reactCompleted);
    return true;
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
    <div className="h-full w-full bg-[#130927] text-white flex flex-col relative overflow-y-auto overflow-x-hidden pb-12">
      {/* Background image elements */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none" 
        style={{ 
          backgroundImage: "url('/Landing Page BG.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          opacity: 0.15 
        }} 
      />
      <div className="fixed inset-0 bg-black/50 z-0" />

      {/* Main layout frame */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-12 flex-grow flex flex-col gap-10">
        
        {/* Navigation / Header Area matching 3rd image */}
        <div className="flex items-center justify-between gap-4 mt-2">
          {/* Back Button (Yellow Circle) */}
          <Link 
            href="/modules"
            className="w-12 h-12 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 transition-all flex items-center justify-center shadow-lg hover:scale-105 group"
          >
            <ArrowLeft size={22} className="stroke-[2.5]" />
          </Link>
          
          {/* Welcome Title */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-black text-white uppercase tracking-wider text-center">
            Welcome to {meta.title}
          </h1>

          {/* Profile / Progress Capsule */}
          <div className="flex items-center gap-3 bg-[#1e0a2d]/80 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                className="w-8 h-8 rounded-full border border-[#ff912d]/50" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#ff912d] text-black font-black flex items-center justify-center text-sm uppercase">
                {session.user.name?.[0] || 'U'}
              </div>
            )}
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">Progress</span>
            <span className="text-white font-mono font-black text-sm">
              {Math.round((getCompletedCount(moduleId) / missions.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Level Grid (Grid of Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
          {missions.map((mission, index) => {
            const isCompleted = completedMissions.some(m => m.missionId.toLowerCase() === mission.id.toLowerCase());
            
            // Find the index of the first uncompleted mission
            const firstUncompletedIndex = missions.findIndex(m => !completedMissions.some(cm => cm.missionId.toLowerCase() === m.id.toLowerCase()));
            
            // If completed or it is the first uncompleted mission, it is unlocked/colored.
            // If index is greater than firstUncompletedIndex, it is upcoming (grayscale/opacity).
            const isUnlocked = index <= (firstUncompletedIndex === -1 ? missions.length : firstUncompletedIndex);
            
            const imageUrl = "/login-bg.jpg";

            return (
              <div key={mission.id} className="relative group/card">
                {/* Shaded background depth layer */}
                <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/card:translate-x-3 group-hover/card:translate-y-3" />
                
                {/* Actual Front Card */}
                <div 
                  className={`relative z-10 bg-[#1e0a2d]/45 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 shadow-xl group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[#ff912d]/10 ${
                    isUnlocked ? '' : 'pointer-events-none opacity-50'
                  }`}
                >
                  {/* Visual progression details / Image Header */}
                  <div className="relative aspect-[2.8/1] w-full overflow-hidden bg-black/20">
                    <img 
                      src={imageUrl} 
                      alt={mission.title} 
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        isUnlocked ? '' : 'grayscale opacity-40'
                      }`}
                    />
                    
                    {/* Status Overlay Badges */}
                    {isCompleted ? (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20 flex items-center gap-1 shadow-lg">
                        <Check size={10} className="stroke-[3]" /> Completed
                      </div>
                    ) : !isUnlocked ? (
                      <div className="absolute top-4 right-4 bg-black/60 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10 flex items-center gap-1 shadow-lg">
                        <Lock size={10} /> Locked
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 bg-[#ff912d] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg animate-pulse">
                        <Rocket size={10} /> Active
                      </div>
                    )}
                    
                    {/* Index badge at bottom-left of image */}
                    <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md text-white font-display font-black text-sm px-3 py-1 rounded-lg border border-white/15">
                      LEVEL {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Solid Orange Content Block matching 3rd image */}
                  <div className="bg-[#ff912d] py-3.5 px-5 flex-grow flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      {/* Dark capsule badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#130927] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/5">
                          {meta.category.split(' ')[0]}
                        </span>
                        <span className="bg-[#130927] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1">
                          <Zap size={9} className="text-yellow-400" /> +100 XP
                        </span>
                      </div>

                      <h3 className="text-white text-lg font-display font-black tracking-tight leading-tight group-hover:underline">
                        {mission.title}
                      </h3>
                      
                      <p className="text-white/90 text-xs font-semibold leading-relaxed line-clamp-2">
                        {mission.desc}
                      </p>
                    </div>
                    
                    {/* Action/Enter Lab link indication inside card */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                      <Link
                        href={`/sandbox?missionId=${mission.id}`}
                        className="w-32 hover:w-44 text-white bg-[#130927] font-sans font-black text-[10px] uppercase tracking-widest py-2 rounded-xl shadow-md transition-all duration-300 hover:bg-[#1e0a2d] hover:scale-105 active:scale-95 border border-transparent hover:border-white/10 flex items-center justify-center cursor-pointer text-center"
                      >
                        {isCompleted ? "Revisit" : "Start"}
                      </Link>
                      <div className="relative group/tooltip">
                        <HelpCircle size={16} className="hover:text-white text-white/80 transition-colors cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 bg-[#130927] border border-white/10 rounded-xl text-[10px] text-gray-200 normal-case opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none shadow-2xl z-30 font-semibold leading-relaxed">
                          {getMissionHint(mission.id)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

