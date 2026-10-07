"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { VT323 } from 'next/font/google';
import TopHeader from '@/components/TopHeader';
import { Lock, Trophy, CheckCircle, Sparkles, Star, Globe, Rocket } from 'lucide-react';

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

import { specialBadges, planetaryBadges, Badge } from '@/lib/badgesData';
import { getXPDetails } from '@/lib/leveling';
import { getUnlockedAchievements } from '@/app/actions/achievements';
import { triggerDailyTaskCompletion } from '@/lib/dailyTasks';

export default function AchievementsPage() {
  const [showcasedBadges, setShowcasedBadges] = useState<string[]>([]);
  const [unlockedCodes, setUnlockedCodes] = useState<Set<string>>(new Set());
  const [dbAchievements, setDbAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [unlockedDates, setUnlockedDates] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    perfectModulesCount: number;
    planetsExploredCount: number;
    unlockedBadgesCount: number;
  } | null>(null);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const achievementsRes = await getUnlockedAchievements();
        const profileRes = await fetch(`/api/profile?t=${Date.now()}`);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setShowcasedBadges(data.user.showcasedBadges || []);
          setXp(data.user.xp || 0);
          setBanner(data.user.banner || null);
          if (data.stats) {
            setStats(data.stats);
          }
        }

        if (achievementsRes.success) {
          setUnlockedCodes(new Set(achievementsRes.unlockedCodes));
          setDbAchievements(achievementsRes.allDbAchievements || []);
          const datesMap: Record<string, string> = {};
          achievementsRes.userAchievementsDetails?.forEach((ua: any) => {
            if (ua.triggerCode) datesMap[ua.triggerCode.toUpperCase()] = ua.unlockedAt;
            if (ua.achievementId) datesMap[ua.achievementId] = ua.unlockedAt;
          });
          setUnlockedDates(datesMap);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleBadge = async (badgeId: string) => {
    if (loading) return;
    triggerDailyTaskCompletion("task-achieve-3");

    const isAdding = !showcasedBadges.includes(badgeId);
    if (isAdding && showcasedBadges.length >= 6) {
      showToast('Showcase Full! Remove a badge first.');
      return;
    }

    const newBadges = isAdding
      ? [...showcasedBadges, badgeId]
      : showcasedBadges.filter(id => id !== badgeId);

    setShowcasedBadges(newBadges);
    showToast(isAdding ? 'Added to Showcase!' : 'Removed from Showcase!');

    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcasedBadges: newBadges })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const mapBadge = (baseBadge: Badge) => {
    const triggerCode = baseBadge.id.toUpperCase();
    const isUnlocked = unlockedCodes.has(triggerCode) || unlockedCodes.has(baseBadge.id);
    const isShowcased = showcasedBadges.includes(baseBadge.id) || showcasedBadges.includes(triggerCode);
    const dbData = dbAchievements.find(
      a => (a.triggerCode && (a.triggerCode.toUpperCase() === triggerCode || a.triggerCode.toUpperCase() === baseBadge.id.toUpperCase())) ||
           (a.id && (a.id.toLowerCase() === baseBadge.id.toLowerCase() || a.id === baseBadge.id))
    );

    return {
      ...baseBadge,
      name: dbData?.name || baseBadge.name,
      description: dbData?.description || baseBadge.description,
      xpReward: dbData?.xpReward ?? baseBadge.xpReward ?? 0,
      gearsReward: dbData?.gearsReward || 0,
      icon: dbData?.iconUrl || baseBadge.icon,
      image: dbData?.iconUrl || baseBadge.image,
      isUnlocked,
      isShowcased,
      unlockedAt: unlockedDates[triggerCode] || unlockedDates[baseBadge.id] || (dbData?.id ? unlockedDates[dbData.id] : undefined)
    };
  };

  const unifiedSpecialBadges = specialBadges.map(mapBadge);
  const unifiedPlanetaryBadges = planetaryBadges.map(mapBadge);
  const allAchievementsList = [...unifiedSpecialBadges, ...unifiedPlanetaryBadges];

  const unlockedMilestonesCount = allAchievementsList.filter(b => b.isUnlocked).length;
  const totalMilestonesCount = allAchievementsList.length;

  const renderBadgeCard = (badge: ReturnType<typeof mapBadge>) => {
    const isUnlocked = badge.isUnlocked;
    const isShowcased = badge.isShowcased;

    return (
      <div
        key={badge.id}
        onClick={() => triggerDailyTaskCompletion("task-achieve-3")}
        className={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-xl overflow-visible group/badge-card border-2
          ${isUnlocked 
            ? 'bg-[#1b092c] border-[#ff912d]/50 hover:border-[#ff912d] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,145,45,0.25)]' 
            : 'bg-[#140622] border-white/10 hover:border-white/20'
          }
          ${isShowcased ? 'ring-2 ring-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.35)]' : ''}
        `}
      >
        {/* Top Status & Showcase Action Row */}
        <div className="flex items-center justify-between gap-1.5 mb-2 w-full">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
              <CheckCircle size={12} /> Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
              <Lock size={12} /> Locked
            </span>
          )}

          {/* Moved Showcase Toggle Button to where EXP used to be */}
          <div className="flex items-center gap-1.5">
            {badge.gearsReward > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-900/60 text-purple-300 border border-purple-600 shadow-sm">
                +{badge.gearsReward} ⚙
              </span>
            )}

            {isUnlocked && (
              <div className="relative group/tooltip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBadge(badge.id);
                  }}
                  aria-label={isShowcased ? "Remove from Showcase" : "Add to Showcase"}
                  className={`p-1.5 rounded-xl transition-all duration-200 border cursor-pointer active:scale-90 flex items-center justify-center ${
                    isShowcased
                      ? 'bg-[#ff912d] border-[#ff912d] text-black shadow-[0_0_12px_rgba(255,145,45,0.4)] hover:bg-red-500 hover:border-red-500 hover:text-white hover:shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-[#ff912d] hover:border-[#ff912d]/50 hover:bg-[#ff912d]/10 hover:shadow-[0_0_10px_rgba(255,145,45,0.2)]'
                  }`}
                >
                  <Star
                    size={15}
                    className={`transition-transform duration-200 ${
                      isShowcased ? 'fill-current scale-105' : 'hover:scale-110'
                    }`}
                  />
                </button>

                {/* Hover Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2 z-30 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                  <div className="bg-[#0e0419] border border-[#ff912d]/40 text-white text-[11px] font-sans font-semibold px-2.5 py-1 rounded-lg shadow-xl flex items-center gap-1.5 backdrop-blur-md">
                    <span className={`w-1.5 h-1.5 rounded-full ${isShowcased ? 'bg-red-400' : 'bg-[#ff912d]'}`} />
                    {isShowcased ? 'Remove from Showcase' : 'Add to Showcase'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badge Visual Container */}
        <div className="my-3 sm:my-4 flex items-center justify-center">
          <div className={`w-32 h-32 sm:w-36 sm:h-36 rounded-2xl flex items-center justify-center p-3 relative shadow-inner transition-transform duration-300 group-hover/badge-card:scale-105 border-2
            ${isUnlocked 
              ? 'bg-gradient-to-br from-indigo-500/20 via-purple-600/30 to-[#ff912d]/20 border-[#ff912d]/60 shadow-[0_0_25px_rgba(255,145,45,0.3)]' 
              : 'bg-[#0e0419] border-white/10'
            }`}
          >
            {!isUnlocked ? (
              <Lock className="text-white/40 w-12 h-12" />
            ) : badge.image ? (
              <img 
                src={badge.image} 
                alt={badge.name} 
                className="w-full h-full object-contain drop-shadow-md rounded-xl p-0.5" 
              />
            ) : (
              <span className="text-[#ff912d] font-bold text-4xl sm:text-5xl">{badge.icon || '🏆'}</span>
            )}
          </div>
        </div>

        {/* Badge Text & Info */}
        <div className="flex flex-col items-center text-center gap-1.5 mt-1">
          <h3 className={`${vt323.className} text-2xl sm:text-3xl tracking-wide transition-colors ${isUnlocked ? 'text-[#ff912d] drop-shadow-[0_0_8px_rgba(255,145,45,0.4)]' : 'text-white/40'}`}>
            {isUnlocked ? `"${badge.name}"` : '???'}
          </h3>

          <p className="text-white/70 text-xs leading-relaxed line-clamp-2 min-h-[32px] max-w-xs">
            {isUnlocked ? badge.description : 'Keep exploring missions and mastering coding skills to reveal and unlock this milestone.'}
          </p>

          {/* Unlocked Date Note */}
          {isUnlocked && badge.unlockedAt ? (
            <span className="text-white/40 text-[10px] font-mono mt-1">
              Unlocked on {new Date(badge.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          ) : !isUnlocked ? (
            <span className="text-white/30 text-[10px] font-mono mt-1 uppercase tracking-wider">
              Not Yet Earned
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c] relative">
      {/* Background Override Layer */}
      {banner && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transition-all duration-500"
          style={{ backgroundImage: `url("${banner}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/50" />
        </div>
      )}

      <TopHeader title="Badges" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#ff912d] text-black font-bold px-6 py-2 rounded-full shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 pr-10 lg:pr-16 no-scrollbar @container relative z-10">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 pb-12">

          {/* Header Profile Summary (Solid Non-transparent Background) */}
          <div className="bg-[#1b092c] border-2 border-[#ff912d]/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center shadow-[0_0_25px_rgba(255,145,45,0.15)] relative overflow-hidden">
            {/* Decorative Background Icon */}
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none blur-[2px]">
              <Image src="/assets/planets/celestial/Jupiter.svg" alt="Planet" width={300} height={300} />
            </div>

            <div className="relative w-28 h-28 shrink-0 z-10 flex items-center justify-center shadow-[0_0_15px_rgba(255,145,45,0.4)] rounded-full bg-[#1e0a2d]">
              <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#361d57" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="46" fill="none" stroke="#ff912d" strokeWidth="8"
                  strokeDasharray="289" strokeDashoffset={289 - (289 * Math.max(2, getXPDetails(xp).progress)) / 100}
                  strokeLinecap="round" className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="w-24 h-24 bg-[#1e0a2d] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#1e0a2d] z-10 relative shadow-inner">
                <span className={`${vt323.className} text-[#ff912d] text-6xl font-bold mt-1`}>{getXPDetails(xp).level}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 z-10 text-center md:text-left w-full">
              <h1 className={`${vt323.className} text-[#ff912d] text-5xl md:text-6xl uppercase tracking-widest drop-shadow-md`}>
                Badges & Achievements
              </h1>

              {/* Minimalist XP Progress Bar */}
              <div className="w-full max-w-md mx-auto md:mx-0 my-2">
                <div className="flex justify-between text-sm text-white/70 mb-1 font-sans font-bold">
                  <span>{getXPDetails(xp).isMaxLevel ? `${xp.toLocaleString()} XP` : `${getXPDetails(xp).levelCurrentXp} / ${getXPDetails(xp).levelRequiredXp} XP`}</span>
                  <span>{getXPDetails(xp).isMaxLevel ? "Max Level Reached" : `${getXPDetails(xp).xpToNextLevel} XP to Level ${getXPDetails(xp).level + 1}`}</span>
                </div>
                <div className="h-2.5 w-full bg-[#361d57] rounded-full overflow-hidden border border-[#ff912d]/20">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff912d]/50 to-[#ff912d] transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(2, getXPDetails(xp).progress)}%` }}
                  />
                </div>
              </div>

              <p className="text-white/80 font-sans text-base md:text-lg max-w-xl">
                Track your milestones and showcase your badges earned across the NETStart galaxy.
              </p>
              <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                <div className="bg-black/50 border border-white/10 px-5 py-3 rounded-xl text-base shadow-sm">
                  <span className="text-white/60 uppercase tracking-wider text-xs md:text-sm font-bold block mb-1">Total Badges Unlocked</span>
                  <span className="text-[#ffb703] font-black text-2xl">{unlockedMilestonesCount} / {totalMilestonesCount}</span>
                </div>
                <div className="bg-black/50 border border-white/10 px-5 py-3 rounded-xl text-base shadow-sm">
                  <span className="text-white/60 uppercase tracking-wider text-xs md:text-sm font-bold block mb-1">Perfect Modules</span>
                  <span className="text-[#ff912d] font-black text-2xl">
                    {stats?.perfectModulesCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Academic Milestones Header */}
          <div className="bg-[#1f0b36] border-2 border-[#ffb703]/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between shadow-[0_0_30px_rgba(255,183,3,0.15)] relative overflow-hidden">
            <div className="flex items-center gap-5 z-10 w-full md:w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-black/50 rounded-2xl flex items-center justify-center p-3 border-2 border-[#ffb703]/60 relative shadow-[0_0_20px_rgba(255,183,3,0.3)]">
                <div className="absolute -top-2 -right-2 bg-[#ffb703] text-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg font-bold text-xs">
                  ★
                </div>
                <Trophy className="w-10 h-10 md:w-12 md:h-12 text-[#ffb703] drop-shadow-[0_0_12px_rgba(255,183,3,0.7)]" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className={`${vt323.className} text-4xl md:text-5xl text-[#ffb703] tracking-wider drop-shadow-md`}>
                    Academic Milestones
                  </h2>
                </div>
                <p className="text-white/70 text-sm md:text-base">
                  Special honors and milestone achievements earned on your coding journey.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2 shrink-0 z-10 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
              <span className="text-white/60 text-xs uppercase tracking-wider font-bold">
                Milestones Progress
              </span>
              <div className="flex items-center gap-3">
                <div className="w-36 h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ff912d] to-[#ffb703] transition-all duration-1000"
                    style={{ width: `${unifiedSpecialBadges.length > 0 ? (unifiedSpecialBadges.filter(b => b.isUnlocked).length / unifiedSpecialBadges.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[#ffb703] font-mono font-bold text-lg">
                  {unifiedSpecialBadges.filter(b => b.isUnlocked).length}/{unifiedSpecialBadges.length}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Milestones Grid (Solid Non-transparent Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 z-20">
            {unifiedSpecialBadges.map(renderBadgeCard)}
          </div>

          {/* Section 2: Planetary Expeditions Header */}
          <div className="bg-[#1f0b36] border-2 border-[#ff912d]/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between shadow-[0_0_30px_rgba(255,145,45,0.15)] relative overflow-hidden mt-4">
            <div className="flex items-center gap-5 z-10 w-full md:w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-black/50 rounded-2xl flex items-center justify-center p-3 border-2 border-[#ff912d]/60 relative shadow-[0_0_20px_rgba(255,145,45,0.3)]">
                <div className="absolute -top-2 -right-2 bg-[#ff912d] text-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg font-bold text-xs">
                  🪐
                </div>
                <Globe className="w-10 h-10 md:w-12 md:h-12 text-[#ff912d] drop-shadow-[0_0_12px_rgba(255,145,45,0.7)]" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className={`${vt323.className} text-4xl md:text-5xl text-[#ff912d] tracking-wider drop-shadow-md`}>
                    Planetary Expeditions
                  </h2>
                </div>
                <p className="text-white/70 text-sm md:text-base">
                  Prestige badges awarded for conquering planetary missions across the solar system constellation.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2 shrink-0 z-10 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
              <span className="text-white/60 text-xs uppercase tracking-wider font-bold">
                Expedition Progress
              </span>
              <div className="flex items-center gap-3">
                <div className="w-36 h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ff912d] to-amber-300 transition-all duration-1000"
                    style={{ width: `${unifiedPlanetaryBadges.length > 0 ? (unifiedPlanetaryBadges.filter(b => b.isUnlocked).length / unifiedPlanetaryBadges.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[#ff912d] font-mono font-bold text-lg">
                  {unifiedPlanetaryBadges.filter(b => b.isUnlocked).length}/{unifiedPlanetaryBadges.length}
                </span>
              </div>
            </div>
          </div>

          {/* Planetary Expeditions Grid (Solid Non-transparent Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 z-20">
            {unifiedPlanetaryBadges.map(renderBadgeCard)}
          </div>

        </div>
      </div>
    </main>
  );
}
