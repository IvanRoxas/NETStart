import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, Check, Lock, Rocket, Award, Zap, Settings } from 'lucide-react';

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
    <div className="min-h-screen w-full bg-[#1e0a2d] text-white flex flex-col relative overflow-hidden">
      {/* Background image elements */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: "url('/Landing Page BG.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Main layout frame */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-12 flex-grow flex flex-col gap-10">
        
        {/* Navigation / Header Area */}
        <div className="flex flex-col gap-6">
          <Link 
            href="/modules"
            className="flex items-center gap-2 font-mono text-sm text-white/60 hover:text-white transition-colors w-max group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Mission Map
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#ff912d] bg-[#ff912d]/10 px-3 py-1 rounded-full border border-[#ff912d]/20">
                {meta.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-black text-white">{meta.title}</h1>
              <p className="text-gray-400 text-sm md:text-base max-w-xl">{meta.desc}</p>
            </div>
            
            <div className="text-sm font-bold text-gray-400 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <Check className="text-emerald-500" size={16} />
              <span>
                Completed: <strong className="text-white">{getCompletedCount(moduleId)}</strong> / {missions.length} Missions
              </span>
            </div>
          </div>
        </div>

        {/* Level List */}
        <div className="flex flex-col gap-4">
          {missions.map((mission, index) => {
            const isCompleted = completedMissions.some(m => m.missionId.toLowerCase() === mission.id.toLowerCase());
            
            return (
              <div 
                key={mission.id}
                className={`bg-[#270d3c]/50 backdrop-blur-md border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:bg-[#270d3c]/70 hover:-translate-y-0.5 hover:-translate-x-0.5 shadow-lg ${
                  isCompleted 
                    ? 'border-emerald-500/30 shadow-emerald-500/5' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Visual progression details */}
                <div className="flex items-start gap-4 flex-1">
                  <span className={`font-display font-black text-2xl tracking-tight leading-none pt-0.5 select-none ${
                    isCompleted ? 'text-emerald-500' : 'text-white/20'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                      {mission.title}
                      {isCompleted && (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border border-emerald-500/20">
                          Complete
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{mission.desc}</p>
                    
                    {/* Rewards indicators */}
                    <div className="flex items-center gap-4 pt-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 font-mono">
                        <Zap size={11} className="text-yellow-400" /> +100 XP
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 font-mono">
                        <Settings size={11} className="text-[#a855f7]" /> +20 GEARS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Trigger */}
                <Link
                  href={`/sandbox?missionId=${mission.id}`}
                  className={`w-full md:w-max py-3 px-6 rounded-xl font-sans font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-center ${
                    isCompleted 
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-[#ff912d] hover:bg-orange-400 text-black shadow-lg shadow-[#ff912d]/10'
                  }`}
                >
                  <Rocket size={16} />
                  {isCompleted ? 'Revisit Orbit' : 'Enter Lab'}
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
