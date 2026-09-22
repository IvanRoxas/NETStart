"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function DailyChallengeTimer() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // PHT is UTC+8
      const phtOffsetMs = 8 * 60 * 60 * 1000;
      const nowPHT = new Date(now.getTime() + phtOffsetMs);

      // Next Midnight PHT in UTC terms
      const nextMidnightPHT = new Date(nowPHT);
      nextMidnightPHT.setUTCHours(24, 0, 0, 0);

      const diffMs = Math.max(0, nextMidnightPHT.getTime() - nowPHT.getTime());
      const totalSeconds = Math.floor(diffMs / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 text-[#ff912d] text-xs sm:text-sm font-bold font-mono bg-black/40 px-3 py-1 rounded-full border border-[#ff912d]/30 shadow-inner">
        <Clock size={15} className="text-[#ff912d]" />
        <span>Calculating...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[#ff912d] text-sm sm:text-base font-black font-mono bg-black/50 px-4 py-2 rounded-full border border-[#ff912d]/40 shadow-inner">
      <Clock size={17} className="text-[#ff912d] animate-pulse shrink-0" />
      <span className="tracking-wide">{timeLeft.hours}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s Left</span>
    </div>
  );
}
