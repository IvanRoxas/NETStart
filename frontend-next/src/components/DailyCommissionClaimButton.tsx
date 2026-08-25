"use client";

import React, { useState } from 'react';
import { Gift, Lock, CheckCircle2, Sparkles, X, Settings, Zap } from 'lucide-react';

interface DailyCommissionClaimButtonProps {
  completedTasksCount: number;
  totalTasksCount?: number;
  bonusGears?: number;
  bonusXP?: number;
}

export default function DailyCommissionClaimButton({
  completedTasksCount,
  totalTasksCount = 4,
  bonusGears = 50,
  bonusXP = 150,
}: DailyCommissionClaimButtonProps) {
  const [isClaimed, setIsClaimed] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const isReadyToClaim = completedTasksCount >= totalTasksCount;

  const handleClaim = () => {
    if (!isReadyToClaim || isClaimed) return;
    setIsClaimed(true);
    setShowRewardModal(true);
  };

  return (
    <>
      <div className="bg-[#1e0a2d]/90 border border-white/15 rounded-2xl p-3 flex flex-col gap-2.5 shadow-inner">
        {/* Row 1: Tasks Completed Label & 4 Genshin-style Diamonds */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/90">Tasks completed</span>
            <span className="text-xs font-black font-display text-[#ff912d] tracking-wider">
              {completedTasksCount}/{totalTasksCount}
            </span>
          </div>

          {/* 4 Genshin-style Diamonds */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rotate-45 rounded-xs transition-all duration-300 ${
                  idx < completedTasksCount
                    ? 'bg-gradient-to-br from-[#ff912d] to-yellow-400 shadow-[0_0_8px_rgba(255,145,45,0.8)]'
                    : 'bg-black/50 border border-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Bonus Rewards Chips & Claim Button */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          {/* Bonus Reward Chips */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-mono font-black bg-[#ff912d]/20 text-[#ff912d] px-2.5 py-1 rounded-lg border border-[#ff912d]/35">
              +{bonusXP} XP
            </span>
            <span className="text-xs font-mono font-black bg-purple-500/20 text-[#a855f7] px-2.5 py-1 rounded-lg border border-purple-500/35">
              +{bonusGears} Gears
            </span>
          </div>

          {/* Action / Claim Button */}
          {isClaimed ? (
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 font-display font-bold text-[11px] uppercase tracking-wider rounded-xl border border-emerald-500/30 flex items-center gap-1 shadow-sm whitespace-nowrap">
              <CheckCircle2 size={13} /> CLAIMED
            </span>
          ) : isReadyToClaim ? (
            <button
              onClick={handleClaim}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-400 via-[#ff912d] to-yellow-500 hover:from-yellow-400 hover:to-[#ff912d] text-black font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,145,45,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse whitespace-nowrap"
            >
              <Gift size={13} className="fill-black" />
              CLAIM
            </button>
          ) : (
            <button
              disabled
              className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white/30 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed opacity-60 whitespace-nowrap"
            >
              <Lock size={12} className="text-white/30" />
              CLAIM
            </button>
          )}
        </div>
      </div>

      {/* Custom UI Reward Claim Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative bg-[#1e0a2d] border-2 border-[#ff912d] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-[0_0_40px_rgba(255,145,45,0.4)] flex flex-col items-center gap-5">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowRewardModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Glowing Icon Header */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff912d] to-yellow-400 flex items-center justify-center shadow-[0_0_30px_rgba(255,145,45,0.7)] animate-bounce">
              <Gift size={38} className="text-black fill-black" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black font-display text-white tracking-wide uppercase">
                Expeditions Cleared!
              </h3>
              <p className="text-xs text-white/70 font-medium">
                You completed all 4 daily tasks today! Here is your official cadet bonus reward:
              </p>
            </div>

            {/* Reward Badges */}
            <div className="flex items-center justify-center gap-3 w-full my-1">
              <div className="flex-1 bg-[#361d57] border border-[#a855f7]/50 rounded-2xl p-3 flex flex-col items-center gap-1 shadow-md">
                <Settings size={22} className="text-[#a855f7] animate-spin-slow" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Bonus Gears</span>
                <span className="text-lg font-black font-display text-[#a855f7]">+{bonusGears}</span>
              </div>
              <div className="flex-1 bg-[#361d57] border border-[#ff912d]/50 rounded-2xl p-3 flex flex-col items-center gap-1 shadow-md">
                <Zap size={22} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Bonus XP</span>
                <span className="text-lg font-black font-display text-white">+{bonusXP}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowRewardModal(false)}
              className="w-full py-3 bg-[#ff912d] hover:bg-orange-400 text-black font-sans font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
            >
              Collect Rewards
            </button>
          </div>
        </div>
      )}
    </>
  );
}
