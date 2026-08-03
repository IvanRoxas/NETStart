"use client";

import React from 'react';
import Link from 'next/link';
import { Lock, Rocket, Award, Settings, Zap } from 'lucide-react';
import PlanetNode from '@/components/PlanetNode';

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

  // Winding learning path configuration - original coordinates layout
  const pathNodes = [
    { id: "html", name: "HTML", subtitle: "HyperText Markup", top: "75%", left: "22%", sizeClass: "w-48 h-48", src: "/Planet 7.svg", imgScale: 0.82, rotationSpeed: 30, reverse: true, totalMissions: 5 },
    { id: "css", name: "CSS", subtitle: "Cascading Style Sheets", top: "72%", left: "76%", sizeClass: "w-40 h-40", src: "/Planet 4.svg", imgScale: 0.82, rotationSpeed: 18, reverse: false, totalMissions: 5 },
    { id: "javascript", name: "JavaScript", subtitle: "Dynamic Scripting", top: "45%", left: "48%", sizeClass: "w-64 h-64", src: "/Planet 2.svg", imgScale: 0.82, rotationSpeed: 40, reverse: false, totalMissions: 8 },
    { id: "react", name: "React", subtitle: "Frontend Components", top: "24%", left: "18%", sizeClass: "w-56 h-56", src: "/Planet 1.svg", imgScale: 0.72, rotationSpeed: 28, reverse: false, totalMissions: 10 },
    { id: "node", name: "Node", subtitle: "Backend Server", top: "18%", left: "82%", sizeClass: "w-44 h-44", src: "/Planet 3.svg", imgScale: 0.85, rotationSpeed: 22, reverse: true, totalMissions: 6 }
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
          {/* Level and XP Consolidated Capsule */}
          <div className="flex items-center bg-black/40 rounded-full pr-4 py-1 border border-white/10">
            {/* Circular Level overlapping badge */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a082c] border-2 border-[#ff912d] shadow-[0_0_10px_#ff912d]/50 z-10 -ml-1">
              <span className="text-white font-black text-sm">{liveStats.level}</span>
            </div>
            {/* XP progress bar and percentage */}
            <div className="w-32 ml-3 flex items-center gap-3">
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ff912d] rounded-full shadow-[0_0_10px_#ff912d]" 
                  style={{ width: `${liveStats.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-bold">{Math.round(liveStats.progress)}%</span>
            </div>
          </div>

          {/* Minimal Gears Currency Capsule */}
          <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2 border border-white/10">
            <Settings className="text-[#b259ff] w-5 h-5 animate-spin-slow" />
            <span className="text-white font-black text-base tracking-wide">{liveStats.gears}</span>
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
            d="M 22 75 L 76 72 L 48 45 L 18 24 L 82 18"
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

    </div>
  );
}
