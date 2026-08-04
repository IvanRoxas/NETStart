import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Check, Lock, Rocket, Zap, Settings, X } from 'lucide-react';

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

const PLANET_IMAGES: Record<string, string> = {
  html: "/Planet 7.svg",
  css: "/Planet 4.svg",
  javascript: "/Planet 2.svg",
  react: "/Planet 1.svg",
  node: "/Planet 3.svg",
};

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "Javascript",
  react: "React",
  node: "Node.js",
};

interface Params {
  id: string;
}

export default async function ModuleMissionsPage({ params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const moduleId = params.id.toLowerCase();
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

  const displayLangName = MODULE_DISPLAY_NAMES[moduleId] || moduleId.toUpperCase();

  // Immersive locked overlay view
  if (isModuleLocked()) {
    return (
      <div className="relative min-h-screen w-full bg-[#130927] overflow-x-hidden overflow-y-auto">
        {/* Starfield backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 blur-[1px]" style={{ backgroundImage: "url('/Landing Page BG.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* Full-screen Overlay architecture */}
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6">
          <Link 
            href="/modules"
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 z-[110] shadow-lg"
            title="Close"
          >
            <X size={20} />
          </Link>

          <div className="bg-[#1a082c]/95 border border-[#ff912d]/30 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl relative z-10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#ff912d]/10 rounded-full flex items-center justify-center border border-[#ff912d]/20 text-[#ff912d]">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-wider">Module Locked</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                You must complete all prior modules along the constellation flight path before entering this system orbit.
              </p>
            </div>

            <Link
              href="/modules"
              className="mt-2 px-8 py-4 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              Return to Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#130927] overflow-x-hidden overflow-y-auto">
      {/* Starfield backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 blur-[1px]" style={{ backgroundImage: "url('/Landing Page BG.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Immersive Level Browse Fullscreen Overlay */}
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6 overflow-hidden">
        
        {/* Sleek top-right close button (X) */}
        <Link 
          href="/modules"
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2.5 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 z-[110] shadow-lg transition-transform active:scale-95"
          title="Return to Map"
        >
          <X size={20} />
        </Link>

        {/* Outer overlay container */}
        <div className="relative z-10 max-w-5xl w-full flex flex-col items-center gap-4 max-h-[90vh]">
          
          {/* Header Title with Orbiter Status */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-display font-black text-white tracking-widest uppercase">
              ORBITING: <span className="text-[#ff912d]">{moduleId.toUpperCase()}</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-lg mx-auto">
              Select an unlocked module mission to begin deploying custom Blockly code elements.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full overflow-y-auto pr-2 custom-scrollbar p-1 pb-8">
            {missions.map((mission, index) => {
              const isCompleted = completedMissions.some(m => m.missionId.toLowerCase() === mission.id.toLowerCase());
              
              // Progression Lock Check: Level i is unlocked if level i-1 is completed (Level 1 is always unlocked)
              const isUnlocked = index === 0 || completedMissions.some(m => m.missionId.toLowerCase() === missions[index - 1].id.toLowerCase());

              return (
                <Link
                  key={mission.id}
                  href={`/sandbox?missionId=${mission.id}`}
                  onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                  className={`bg-[#1a082c] border border-white/10 rounded-xl overflow-hidden hover:border-[#ff912d]/50 transition-all duration-300 group flex flex-col shadow-xl ${
                    !isUnlocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1'
                  }`}
                >
                  {/* Top Visual Area (Starry backdrop with themed planet image) */}
                  <div className="relative w-full h-32 bg-black/40 overflow-hidden flex items-center justify-center border-b border-white/5 flex-shrink-0">
                    {/* Stars overlay */}
                    <img 
                      src="/Landing Page BG.png" 
                      alt="Stars" 
                      className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-110 transition-transform duration-500" 
                    />
                    
                    {/* Planet Graphic */}
                    <img 
                      src={PLANET_IMAGES[moduleId] || "/Planet 2.svg"} 
                      alt="Planet" 
                      className={`w-14 h-14 object-contain ${
                        !isUnlocked ? 'grayscale opacity-25' : 'animate-spin-slow group-hover:scale-105 transition-all duration-300'
                      }`}
                    />

                    {/* Top-Left Badges */}
                    <div className="absolute top-3 left-3 flex items-center z-10">
                      <span className="bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {displayLangName}
                      </span>
                      <span className="bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase ml-2 tracking-wider">
                        Medium
                      </span>
                    </div>

                    {/* Grayscale/Locked overlays with center lock icon */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <div className="w-9 h-9 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white/70 shadow-lg">
                          <Lock size={14} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Text Area (bg-[#130927] p-5) */}
                  <div className="bg-[#130927] p-5 flex flex-col flex-1 text-left justify-between min-h-[170px]">
                    <div className="space-y-1">
                      <h3 className="text-white font-bold text-base leading-tight flex items-center justify-between gap-3">
                        <span>{mission.title.replace(/^[a-zA-Z]+\s+Level\s+\d+:\s*/, '')}</span>
                        {isCompleted && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-md border border-emerald-500/20 whitespace-nowrap">
                            Complete
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed mt-1">
                        {mission.desc}
                      </p>
                    </div>

                    <div>
                      <div className="w-full h-px bg-white/5 my-3" />
                      <div className="flex items-center justify-between">
                        {/* Game styled rewards icons */}
                        <div className="flex flex-col gap-1 text-[11px] font-mono font-black text-left">
                          <div className="flex items-center gap-1.5 text-[#b259ff]">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" />
                            <span>+100</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Settings className="w-3.5 h-3.5 text-purple-400" />
                            <span>+20</span>
                          </div>
                        </div>

                        {/* CTA button state */}
                        <span 
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all select-none ${
                            !isUnlocked 
                              ? 'bg-white/5 text-gray-500 border border-white/5' 
                              : isCompleted 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white shadow-md shadow-[#ff912d]/10'
                          }`}
                        >
                          {!isUnlocked ? 'Locked' : isCompleted ? 'Revisit' : 'Enter Lab'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
