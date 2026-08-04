"use client";

import React from 'react';
import Link from 'next/link';
import { Lock, Rocket, Award, Settings, Zap, X } from 'lucide-react';
import PlanetNode from '@/components/PlanetNode';
import { getXPDetails } from '@/lib/leveling';
import ModuleMissionsClient from './[id]/ModuleMissionsClient';

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

interface LiveStats {
  level: number;
  progress: number;
  xp: number;
  gears: number;
}

interface CompletedMission {
  missionId: string;
}

interface ModulesClientProps {
  isVerified: boolean;
  liveStats: LiveStats;
  completedMissions: CompletedMission[];
}

export default function ModulesClient({ isVerified, liveStats, completedMissions }: ModulesClientProps) {
  // Container logic for blurring unverified users
  const containerClass = `absolute inset-0 w-full h-full transition-all duration-500 overflow-hidden ${
    !isVerified ? 'blur-md pointer-events-none opacity-50' : ''
  }`;

  const [showPopup, setShowPopup] = React.useState(false);
  const [activeModuleId, setActiveModuleId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Winding learning path configuration - shifted downwards to avoid HUD overlaps
  const pathNodes = [
    { id: "html", name: "HTML", subtitle: "HyperText Markup", top: "82%", left: "22%", sizeClass: "w-48 h-48", src: "/Planet 7.svg", imgScale: 0.82, rotationSpeed: 30, reverse: true, totalMissions: 5 },
    { id: "css", name: "CSS", subtitle: "Cascading Style Sheets", top: "79%", left: "76%", sizeClass: "w-40 h-40", src: "/Planet 4.svg", imgScale: 0.82, rotationSpeed: 18, reverse: false, totalMissions: 5 },
    { id: "javascript", name: "JavaScript", subtitle: "Dynamic Scripting", top: "55%", left: "48%", sizeClass: "w-64 h-64", src: "/Planet 2.svg", imgScale: 0.82, rotationSpeed: 40, reverse: false, totalMissions: 8 },
    { id: "react", name: "React", subtitle: "Frontend Components", top: "33%", left: "18%", sizeClass: "w-56 h-56", src: "/Planet 1.svg", imgScale: 0.72, rotationSpeed: 28, reverse: false, totalMissions: 10 },
    { id: "node", name: "Node", subtitle: "Backend Server", top: "26%", left: "82%", sizeClass: "w-44 h-44", src: "/Planet 3.svg", imgScale: 0.85, rotationSpeed: 22, reverse: true, totalMissions: 6 }
  ];

  // Map user completed count per module (matching lowercase startsWith logic)
  const getCompletedMissionsCount = (moduleId: string) => {
    return completedMissions.filter(m => 
      m.missionId.toLowerCase().startsWith(moduleId.toLowerCase())
    ).length;
  };

  // Determine path completion indicators
  const htmlCompleted = getCompletedMissionsCount("html") >= 5;
  const cssCompleted = getCompletedMissionsCount("css") >= 5;
  const jsCompleted = getCompletedMissionsCount("javascript") >= 8 || getCompletedMissionsCount("js") >= 8;
  const reactCompleted = getCompletedMissionsCount("react") >= 10;

  const getStatusForModule = (id: string) => {
    const completed = getCompletedMissionsCount(id);
    const total = pathNodes.find(n => n.id === id)?.totalMissions || 5;

    if (completed >= total) {
      return 'COMPLETED';
    }

    if (id === 'html') {
      return 'CURRENT';
    }
    if (id === 'css') {
      return htmlCompleted ? 'CURRENT' : 'LOCKED';
    }
    if (id === 'javascript') {
      return (htmlCompleted && cssCompleted) ? 'CURRENT' : 'LOCKED';
    }
    if (id === 'react') {
      return (htmlCompleted && cssCompleted && jsCompleted) ? 'CURRENT' : 'LOCKED';
    }
    if (id === 'node') {
      return (htmlCompleted && cssCompleted && jsCompleted && reactCompleted) ? 'CURRENT' : 'LOCKED';
    }
    return 'LOCKED';
  };

  // Compute live gamified progression stats
  const { level, progress, nextThreshold } = getXPDetails(liveStats.xp);
  const xpNeeded = level < 10 ? Math.max(0, nextThreshold - liveStats.xp) : 0;
  const nextLevel = level < 10 ? level + 1 : 10;

  return (
    <div className="relative w-full h-[115vh]">
      
      {/* Sci-Fi Floating HUD Top Bar (Sticky Scroll-Following) */}
      <div className="sticky top-6 mx-auto w-[95%] max-w-7xl z-50 flex items-center justify-between bg-[#1a082c]/80 backdrop-blur-md border border-gray-700 shadow-2xl shadow-[#ff912d]/10 rounded-2xl px-8 py-4">
        <div className="flex items-center gap-3">
          <Rocket className="text-[#ff912d] animate-pulse" size={22} />
          <h2 className="font-display font-black tracking-wider text-white text-base md:text-lg">
            MISSION MAP: <span className="text-[#ff912d]">SECTOR 1</span>
          </h2>
        </div>
        
        {/* Live Stats display with minimal game capsules */}
        <div className="flex items-center gap-4 text-white">
          
          {/* Minimal Gears Currency Capsule (Swapped to Left) */}
          <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2 border border-white/10">
            <Settings className="text-[#b259ff] w-5 h-5 animate-spin-slow" />
            <span className="text-white font-black text-base tracking-wide">{liveStats.gears}</span>
          </div>

          {/* Level and XP Consolidated Capsule (Swapped to Right) */}
          <div className="flex items-center bg-black/40 rounded-full pr-4 py-1 border border-white/10">
            {/* Circular Level overlapping badge */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a082c] border-2 border-[#ff912d] shadow-[0_0_10px_#ff912d]/50 z-10 -ml-1">
              <span className="text-white font-black text-sm">{level}</span>
            </div>
            {/* XP progress details */}
            <div 
              className="w-44 ml-3 flex flex-col gap-1 justify-center"
              title={`${xpNeeded} XP until next level`}
            >
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ff912d] rounded-full shadow-[0_0_10px_#ff912d]" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 font-bold leading-none mt-1 gap-4 whitespace-nowrap">
                <span className="text-gray-300 font-black tracking-wide uppercase">{xpNeeded} XP UNTIL LVL {nextLevel}</span>
                <span className="text-xs text-white font-black">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Starry Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/Landing Page BG.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      {/* The Galaxy Map Container */}
      <div className={containerClass}>

        {/* Winding Flight Path Connections between nodes */}
        <svg 
          className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <path
            d="M 22 82 L 76 79 L 48 55 L 18 33 L 82 26"
            fill="none"
            stroke="#ff912d"
            strokeWidth="0.5"
            strokeDasharray="1.5 1.5"
          />
        </svg>

        {/* Render Planet Nodes dynamically */}
        {pathNodes.map((node) => {
          const completedCount = getCompletedMissionsCount(node.id);
          const status = getStatusForModule(node.id);
          
          return (
            <PlanetNode 
              key={node.id}
              id={node.id} 
              name={node.name} 
              subtitle={node.subtitle}
              top={node.top} 
              left={node.left} 
              sizeClass={node.sizeClass} 
              src={node.src} 
              imgScale={node.imgScale} 
              rotationSpeed={node.rotationSpeed} 
              reverse={node.reverse} 
              status={status}
              completedCount={completedCount}
              totalCount={node.totalMissions}
              onSelect={setActiveModuleId}
            />
          );
        })}

      </div>

      {/* Verification Gate Modal overlay */}
      {!isVerified && (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e0a2d]/90 backdrop-blur-xl border border-[#ff912d]/30 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#ff912d]/10 rounded-full flex items-center justify-center border border-[#ff912d]/20">
              <Lock className="w-10 h-10 text-[#ff912d]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Access Locked</h2>
              <p className="text-gray-400">
                You must verify your email address to embark on missions and access learning modules.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="mt-4 px-8 py-4 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Rocket size={20} />
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
      {/* Active Mission Sliding Popup (Space Banner Vertical Layout, anchors at right-8) */}
      <div className={`fixed bottom-6 right-8 z-40 max-w-sm w-[330px] bg-[#1a082c]/95 backdrop-blur-xl border border-[#ff912d]/20 rounded-2xl shadow-2xl transition-all duration-700 shadow-[#ff912d]/5 flex flex-col overflow-hidden ${
        showPopup ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
      }`}>
        {/* Absolute Close Button */}
        <button 
          onClick={() => setShowPopup(false)} 
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors p-1 bg-black/40 hover:bg-black/60 rounded-full z-50"
        >
          <X size={14} />
        </button>

        {/* Space Banner Graphic Header Area */}
        <div className="relative w-full h-24 overflow-hidden">
          <img 
            src="/Landing Page BG.png" 
            alt="Mission Space Banner" 
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a082c] via-[#1a082c]/30 to-transparent" />
          
          {/* Centered bouncing rocket within banner bounds */}
          <div className="absolute top-1/2 left-8 -translate-y-1/2 animate-bounce" style={{ animationDuration: '3.5s' }}>
            <Rocket className="text-[#ff912d] -rotate-45 drop-shadow-[0_0_8px_#ff912d]" size={26} />
          </div>
        </div>

        {/* Vertical Text Card Contents Area */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-white font-black text-sm tracking-wide">JavaScript Variables</h4>
            <span className="bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/25 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0">
              Active Orbit
            </span>
          </div>

          <p className="text-gray-400 text-[11px] leading-normal text-left">
            Deploy variables to memory banks using custom Blockly components.
          </p>

          <div className="w-full h-px bg-white/5 my-0.5" />

          {/* Action Row containing Rewards and Resume Button */}
          <div className="flex items-center justify-between w-full mt-4">
            <div className="flex flex-col gap-1 text-sm font-bold text-left">
              {/* XP Reward Display with Zap Icon */}
              <div className="flex items-center gap-1.5 text-[#b259ff]">
                <Zap className="w-4 h-4" /> 
                <span>+100</span>
              </div>
              {/* Gears Reward Display with Settings Icon */}
              <div className="flex items-center gap-1.5 text-gray-300">
                <Settings className="w-4 h-4" /> 
                <span>+25</span>
              </div>
            </div>
            <Link 
              href="/modules/javascript_3" 
              className="px-4 py-2.5 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-extrabold text-xs rounded-xl transition-transform hover:scale-105 shadow-md shadow-[#ff912d]/10"
            >
              Resume Orbit
            </Link>
          </div>
        </div>
      </div>

      {activeModuleId && (
        <ModuleMissionsClient
          moduleId={activeModuleId}
          missions={MODULE_MISSIONS[activeModuleId]}
          meta={MODULE_META[activeModuleId]}
          completedMissions={completedMissions}
          isLocked={getStatusForModule(activeModuleId) === 'LOCKED'}
          onClose={() => setActiveModuleId(null)}
        />
      )}

    </div>
  );
}
