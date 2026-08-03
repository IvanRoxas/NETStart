"use client";

import React from 'react';
import Link from 'next/link';
import { Lock, Rocket } from 'lucide-react';
import PlanetNode from '@/components/PlanetNode';

export default function ModulesClient({ isVerified }: { isVerified: boolean }) {
  // Container logic for blurring unverified users
  const containerClass = `absolute inset-0 w-full h-full transition-all duration-500 overflow-hidden ${!isVerified ? 'blur-md pointer-events-none opacity-50' : ''
    }`;

  return (
    <div className="relative w-full h-full overflow-hidden">

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

        {/* Spontaneously sized scattered planets with distinct positions and organic rotation configurations */}
        <PlanetNode id="react" name="React" top="24%" left="18%" sizeClass="w-56 h-56" src="/Planet 1.svg" imgScale={0.72} rotationSpeed={28} reverse={false} />
        <PlanetNode id="html" name="HTML" top="75%" left="22%" sizeClass="w-48 h-48" src="/Planet 7.svg" imgScale={0.82} rotationSpeed={30} reverse={true} />
        <PlanetNode id="javascript" name="JavaScript" top="45%" left="48%" sizeClass="w-64 h-64" src="/Planet 2.svg" imgScale={0.82} rotationSpeed={40} reverse={false} />
        <PlanetNode id="node" name="Node" top="18%" left="82%" sizeClass="w-44 h-44" src="/Planet 3.svg" imgScale={0.85} rotationSpeed={22} reverse={true} />
        <PlanetNode id="css" name="CSS" top="72%" left="76%" sizeClass="w-40 h-40" src="/Planet 4.svg" imgScale={0.82} rotationSpeed={18} reverse={false} />

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
