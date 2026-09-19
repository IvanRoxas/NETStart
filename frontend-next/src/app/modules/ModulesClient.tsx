"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Rocket, Award, Settings, Zap, Brain } from 'lucide-react';
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
  hasTakenAptitudeTest?: boolean;
  liveStats: LiveStats;
  completedMissions: CompletedMission[];
}

export default function ModulesClient({ isVerified, hasTakenAptitudeTest = false, liveStats, completedMissions }: ModulesClientProps) {
  const searchParams = useSearchParams();
  const fromCutscene = searchParams ? searchParams.get('fromCutscene') === 'true' : false;
  // Container logic for blurring unverified/untested users
  const containerClass = `absolute inset-0 w-full h-full transition-all duration-500 overflow-hidden ${
    (!isVerified || !hasTakenAptitudeTest) ? 'blur-sm pointer-events-none opacity-40' : ''
  }`;

  // Winding learning path configuration - spread across 130vh canvas
  const pathNodes = [
    { id: "html", name: "HTML", subtitle: "HyperText Markup", top: "24%", left: "22%", sizeClass: "w-48 h-48", src: "/Planet 7.svg", imgScale: 0.82, rotationSpeed: 30, reverse: true, totalMissions: 5 },
    { id: "css", name: "CSS", subtitle: "Cascading Style Sheets", top: "42%", left: "76%", sizeClass: "w-40 h-40", src: "/Planet 4.svg", imgScale: 0.82, rotationSpeed: 18, reverse: false, totalMissions: 5 },
    { id: "javascript", name: "JavaScript", subtitle: "Dynamic Scripting", top: "60%", left: "48%", sizeClass: "w-64 h-64", src: "/Planet 2.svg", imgScale: 0.82, rotationSpeed: 40, reverse: false, totalMissions: 8 },
    { id: "react", name: "React", subtitle: "Frontend Components", top: "80%", left: "24%", sizeClass: "w-56 h-56", src: "/Planet 1.svg", imgScale: 0.72, rotationSpeed: 28, reverse: false, totalMissions: 10 }
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

    return 'LOCKED';
  };

  const [revealOverlay, setRevealOverlay] = useState(fromCutscene);
  const [fadeOverlay, setFadeOverlay] = useState(false);

  useEffect(() => {
    if (fromCutscene) {
      // Hold the solid black screen for a moment to ensure loading transitions have finished
      const fadeTimer = setTimeout(() => setFadeOverlay(true), 800);
      
      // Completely remove the overlay from the DOM after the long fade transition completes
      const removeTimer = setTimeout(() => setRevealOverlay(false), 4000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [fromCutscene]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#180729] overflow-y-auto">
      
      {/* Reveal Overlay (Only shown when coming from cutscene) */}
      {revealOverlay && (
        <div 
          className={`fixed inset-0 bg-black z-[9999] pointer-events-none transition-opacity duration-[3000ms] ease-in-out ${
            fadeOverlay ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
      
      {/* Background Mission Orbit Canvas */}
      <div className={containerClass}>
        
        {/* Constellation Orbit Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <line 
            x1="22%" y1="24%" 
            x2="76%" y2="42%" 
            stroke="rgba(255, 145, 45, 0.4)" 
            strokeWidth="3" 
            strokeDasharray="8 8" 
          />
          <line 
            x1="76%" y1="42%" 
            x2="48%" y2="60%" 
            stroke="rgba(255, 145, 45, 0.4)" 
            strokeWidth="3" 
            strokeDasharray="8 8" 
          />
          <line 
            x1="48%" y1="60%" 
            x2="24%" y2="80%" 
            stroke="rgba(255, 145, 45, 0.4)" 
            strokeWidth="3" 
            strokeDasharray="8 8" 
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

      {/* Condition 1: Email Verification Gate Modal */}
      {!isVerified && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e0a2d]/90 backdrop-blur-xl border border-[#ff912d]/30 p-8 sm:p-10 rounded-3xl max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#ff912d]/10 rounded-full flex items-center justify-center border border-[#ff912d]/20">
              <Lock className="w-10 h-10 text-[#ff912d]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Access Locked</h2>
              <p className="text-gray-300 text-sm">
                You must verify your email address to embark on missions and access learning modules.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Rocket size={18} />
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Condition 2: Aptitude Diagnostic Required Gate Modal */}
      {isVerified && !hasTakenAptitudeTest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-[#1e0a2d]/95 backdrop-blur-xl border-2 border-[#ff912d]/60 p-8 sm:p-12 rounded-3xl max-w-xl sm:max-w-2xl w-full text-center shadow-[0_0_50px_rgba(255,145,45,0.35)] flex flex-col items-center gap-6 relative overflow-hidden">
            
            <div className="w-20 h-20 bg-[#ff912d]/15 rounded-full flex items-center justify-center border-2 border-[#ff912d]/40 shadow-[0_0_25px_rgba(255,145,45,0.4)] animate-pulse">
              <Brain className="w-10 h-10 text-[#ff912d]" />
            </div>

            <div className="space-y-3 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff912d]/10 border border-[#ff912d]/30 text-[#ff912d] font-mono text-xs font-bold uppercase tracking-wider">
                Diagnostic Pending
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider">
                Aptitude Diagnostic Required
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Complete your initial Aptitude Diagnostic to calibrate your skill baseline and unlock the mission sectors.
              </p>
            </div>

            <Link
              href="/aptitude-test?openModal=true"
              className="mt-2 w-full max-w-md py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,145,45,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Brain size={18} />
              Take Assessment Now
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
