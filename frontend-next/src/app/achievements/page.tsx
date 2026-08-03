"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { VT323 } from 'next/font/google';
import TopHeader from '@/components/TopHeader';
import { Lock } from 'lucide-react';

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

import { modulesData, specialBadges } from '@/lib/badgesData';
import { getXPDetails } from '@/lib/leveling';
import { getUnlockedAchievements } from '@/app/actions/achievements';

export default function AchievementsPage() {
  const [showcasedBadges, setShowcasedBadges] = useState<string[]>([]);
  const [unlockedCodes, setUnlockedCodes] = useState<Set<string>>(new Set());
  const [dbAchievements, setDbAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [unlockedDates, setUnlockedDates] = useState<Record<string, string>>({});
  const [viewAllCategory, setViewAllCategory] = useState<{title: string, badges: any[]} | null>(null);
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

  return (
    <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c]">
      <TopHeader title="Achievements" />
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#ff912d] text-black font-bold px-6 py-2 rounded-full shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 pr-10 lg:pr-16 no-scrollbar @container relative">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
          
          {/* Header Profile Summary */}
          <div className="bg-[#1e0a2d]/80 border border-[#ff912d]/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center shadow-[0_0_20px_rgba(255,145,45,0.15)] relative overflow-hidden">
             {/* Decorative Background Icon */}
             <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none blur-[2px]">
               <Image src="/Planet 5.svg" alt="Planet" width={300} height={300} />
             </div>
             
             <div className="relative w-24 h-24 shrink-0 z-10 flex items-center justify-center shadow-[0_0_15px_rgba(255,145,45,0.4)] rounded-full bg-[#1e0a2d]">
               <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="46" fill="none" stroke="#361d57" strokeWidth="8" />
                 <circle 
                   cx="50" cy="50" r="46" fill="none" stroke="#ff912d" strokeWidth="8" 
                   strokeDasharray="289" strokeDashoffset={289 - (289 * Math.max(2, getXPDetails(xp).progress)) / 100}
                   strokeLinecap="round" className="transition-all duration-1000 ease-out" 
                 />
               </svg>
               <div className="w-20 h-20 bg-[#1e0a2d] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#1e0a2d] z-10 relative shadow-inner">
                 <span className={`${vt323.className} text-[#ff912d] text-5xl font-bold mt-1`}>{getXPDetails(xp).level}</span>
               </div>
             </div>
             
             <div className="flex-1 flex flex-col gap-2 z-10 text-center md:text-left w-full">
                <h1 className={`${vt323.className} text-[#ff912d] text-4xl md:text-5xl uppercase tracking-widest drop-shadow-md`}>
                  Badges & Achievements
                </h1>
                
                {/* Minimalist XP Progress Bar */}
                <div className="w-full max-w-md mx-auto md:mx-0 my-2">
                  <div className="flex justify-between text-xs text-white/50 mb-1 font-sans font-bold">
                    <span>{xp} XP</span>
                    <span>Next Level at {getXPDetails(xp).nextThreshold} XP</span>
                  </div>
                  <div className="h-2 w-full bg-[#361d57] rounded-full overflow-hidden border border-[#ff912d]/20">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff912d]/50 to-[#ff912d] transition-all duration-1000 ease-out"
                      style={{ width: `${Math.max(2, getXPDetails(xp).progress)}%` }}
                    />
                  </div>
                </div>

                <p className="text-white/70 font-sans text-sm md:text-base max-w-xl">
                  Track your progress across the NETStart galaxy. Earn badges by completing modules and mastering coding concepts.
                </p>
                <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                  <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-lg text-sm">
                    <span className="text-white/50 uppercase tracking-wider text-xs font-bold block mb-0.5">Unlocked Badges</span>
                    <span className="text-[#ffb703] font-bold text-lg">{unlockedCodes.size}</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-lg text-sm">
                    <span className="text-white/50 uppercase tracking-wider text-xs font-bold block mb-0.5">Perfect Modules</span>
                    <span className="text-[#ff912d] font-bold text-lg">
                      {modulesData.filter(m => m.badges.length > 0 && m.totalAchievements > 0 && m.badges.filter(b => unlockedCodes.has(b.id.toUpperCase())).length === m.totalAchievements).length}
                    </span>
                  </div>
                </div>
             </div>
          </div>

           {/* Academic Milestones */}
           <div className="bg-[#361d57]/40 border border-[#ffb703]/50 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center shadow-inner relative z-20 mt-4">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ffb703]/10 to-transparent pointer-events-none opacity-50 rounded-xl"></div>
              <div className="w-24 h-24 shrink-0 bg-black/40 rounded-xl flex items-center justify-center p-3 border border-white/5 z-10 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                 <div className="absolute -top-2 -right-2 bg-[#ffb703] text-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-20">
                   <span className="font-bold text-xs">★</span>
                 </div>
                 <Image src="/Planet 5.svg" alt="Milestones" width={64} height={64} className="object-contain drop-shadow-[0_0_10px_rgba(255,183,3,0.5)]" />
              </div>
              <div className="flex-1 flex flex-col gap-2 w-full z-10">
                <h3 className={`${vt323.className} text-2xl text-[#ffb703] tracking-widest drop-shadow`}>
                  Academic Milestones
                </h3>
                <p className="text-white/40 text-xs">Milestone achievements you've earned on your journey.</p>
              </div>
              <div className="w-full md:w-48 shrink-0 flex flex-col gap-2 z-10 md:border-l md:border-white/10 md:pl-6">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center">
                  Unlocked 
                  <button 
                    onClick={() => setViewAllCategory({title: 'Academic Milestones', badges: specialBadges})}
                    className="text-[#ff912d] hover:text-[#ffb703] transition-colors cursor-pointer"
                  >
                    See all
                  </button>
                </span>
                <div className="flex flex-wrap gap-2">
                  {specialBadges.map((baseBadge, idx) => {
                    const triggerCode = baseBadge.id.toUpperCase();
                    const isUnlocked = unlockedCodes.has(triggerCode);
                    const isShowcased = showcasedBadges.includes(baseBadge.id);
                    const dbData = dbAchievements.find(a => a.triggerCode === triggerCode || a.triggerCode === baseBadge.id.toUpperCase() || a.id === baseBadge.id);
                    
                    const badge = {
                      ...baseBadge,
                      name: dbData?.name || baseBadge.name,
                      description: dbData?.description || baseBadge.description,
                      xpReward: dbData?.xpReward || baseBadge.xpReward || 100,
                      gearsReward: dbData?.gearsReward || 0,
                      icon: dbData?.iconUrl || baseBadge.icon,
                      image: dbData?.iconUrl || baseBadge.image,
                    };
                    
                    return (
                      <div 
                        key={badge.id} 
                        onClick={() => isUnlocked && setSelectedBadge({ ...badge, isUnlocked, unlockedAt: unlockedDates[triggerCode] || unlockedDates[badge.id] })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center relative group/badge transition-all shadow-sm p-0.5
                          ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                          ${isShowcased ? 'bg-indigo-500/40 border-2 border-[#ff912d] scale-110 shadow-[0_0_10px_rgba(255,145,45,0.4)]' : 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-[#ff912d]/30 hover:border-[#ff912d] hover:bg-[#ff912d]/20'}`}
                      >
                        <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}>
                          {!isUnlocked ? (
                            <Lock className="text-white/50 w-3.5 h-3.5" />
                          ) : badge.image ? (
                            <img src={badge.image} alt={badge.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-[#ff912d] font-bold text-xs">{badge.icon}</span>
                          )}
                        </div>
                        {isShowcased && (
                          <div className="absolute -top-1 -right-1 bg-[#ff912d] text-black rounded-full p-[1px] shadow-md z-10">
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                        )}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black/90 border border-[#ff912d]/50 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-opacity z-[9999] text-center shadow-lg">
                          <strong className="block text-[#ff912d] mb-0.5">{isUnlocked ? `"${badge.name}"` : '???'}</strong>
                          <span className="text-[9px] text-white/60 block uppercase tracking-wider mb-1">{isUnlocked ? 'Click to view details' : 'To be unlocked'}</span>
                          {isUnlocked && (
                            <span className="inline-block bg-[#ff912d]/20 text-[#ff912d] text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                              +{badge.xpReward || 100} EXP
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
           </div>

          {/* Module List (Steam Style) */}
          <div className="flex flex-col gap-4 z-30 relative">
            {modulesData.map((module) => {
              const moduleUnlockedCount = module.badges.filter(b => unlockedCodes.has(b.id.toUpperCase())).length;
              const progressPercentage = module.totalAchievements > 0 ? Math.round((moduleUnlockedCount / module.totalAchievements) * 100) : 0;
              const isCompleted = module.totalAchievements > 0 && moduleUnlockedCount === module.totalAchievements;
              
              return (
                <div 
                  key={module.id} 
                  className={`bg-[#361d57]/40 border ${isCompleted ? 'border-[#ffb703]/50' : 'border-white/10'} rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center transition-all hover:bg-[#361d57]/60 group relative shadow-inner`}
                >
                   {/* Completion Glow */}
                   {isCompleted && (
                     <div className="absolute inset-0 bg-gradient-to-r from-[#ffb703]/10 to-transparent pointer-events-none opacity-50 rounded-xl"></div>
                   )}
                   
                   {/* Left Side: Module Icon */}
                   <div className="w-24 h-24 shrink-0 bg-black/40 rounded-xl flex items-center justify-center p-3 border border-white/5 group-hover:border-[#ff912d]/30 transition-colors z-10 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                     {isCompleted && (
                        <div className="absolute -top-2 -right-2 bg-[#ffb703] text-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-20">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        </div>
                     )}
                     <Image src={module.planet} alt={module.title} width={64} height={64} className={`object-contain ${isCompleted ? 'drop-shadow-[0_0_10px_rgba(255,183,3,0.5)]' : ''}`} />
                   </div>

                   {/* Center: Details & Progress */}
                   <div className="flex-1 flex flex-col gap-2 w-full z-10">
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                       <h3 className={`${vt323.className} text-2xl text-white tracking-widest ${isCompleted ? 'text-[#ffb703]' : ''} drop-shadow`}>
                         {module.title}
                       </h3>
                       <span className="text-white/40 text-xs font-bold uppercase tracking-wider shrink-0">
                         {module.playtime} on record
                       </span>
                     </div>
                     
                     <div className="flex items-center gap-4 mt-2">
                       <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-[#ffb703]' : 'bg-[#ff912d]'}`} 
                           style={{ width: `${progressPercentage}%` }}
                         ></div>
                       </div>
                       <span className={`text-sm font-bold shrink-0 ${isCompleted ? 'text-[#ffb703]' : 'text-[#ff912d]'}`}>
                         {moduleUnlockedCount} / {module.totalAchievements}
                       </span>
                     </div>
                     <span className="text-white/40 text-xs mt-1">
                       {progressPercentage === 0 ? "You haven't earned any achievements yet." : `${progressPercentage}% of achievements earned.`}
                     </span>
                   </div>

                   {/* Right: Badges Showcase */}
                   <div className="w-full md:w-48 shrink-0 flex flex-col gap-2 z-10 md:border-l md:border-white/10 md:pl-6">
                     <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center">
                       Unlocked 
                       <button 
                          onClick={() => {
                            const mergedBadges = module.badges.map(baseBadge => {
                              const dbData = dbAchievements.find(a => a.triggerCode === baseBadge.id.toUpperCase() || a.id === baseBadge.id);
                              return {
                                ...baseBadge,
                                name: dbData?.name || baseBadge.name,
                                description: dbData?.description || baseBadge.description,
                                xpReward: dbData?.xpReward || baseBadge.xpReward || 100,
                                icon: dbData?.iconUrl || baseBadge.icon,
                                image: dbData?.iconUrl || baseBadge.image,
                              };
                            });
                            setViewAllCategory({title: module.title, badges: mergedBadges});
                          }}
                          className="text-[#ff912d] hover:text-[#ffb703] transition-colors cursor-pointer"
                        >
                         See all
                       </button>
                     </span>
                      <div className="flex flex-wrap gap-2">
                       {module.badges.length > 0 ? (
                         module.badges.map((baseBadge, idx) => {
                           const triggerCode = baseBadge.id.toUpperCase();
                           const isUnlocked = unlockedCodes.has(triggerCode);
                           const isShowcased = showcasedBadges.includes(baseBadge.id);
                           
                           // Override base badge with DB data if it exists
                           const dbData = dbAchievements.find(a => a.triggerCode === triggerCode || a.id === baseBadge.id);
                           const badge = {
                             ...baseBadge,
                             name: dbData?.name || baseBadge.name,
                             description: dbData?.description || baseBadge.description,
                             xpReward: dbData?.xpReward || baseBadge.xpReward || 100,
                             gearsReward: dbData?.gearsReward || 0,
                             icon: dbData?.iconUrl || baseBadge.icon,
                             image: dbData?.iconUrl || baseBadge.image,
                           };
                           
                           return (
                             <div 
                               key={badge.id} 
                               onClick={() => isUnlocked && setSelectedBadge({ ...badge, isUnlocked, unlockedAt: unlockedDates[triggerCode] || unlockedDates[badge.id] })}
                               className={`w-8 h-8 rounded-full flex items-center justify-center relative group/badge transition-all shadow-sm p-0.5
                                 ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                                 ${isShowcased ? 'bg-indigo-500/40 border-2 border-[#ff912d] scale-110 shadow-[0_0_10px_rgba(255,145,45,0.4)]' : 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-[#ff912d]/30 hover:border-[#ff912d] hover:bg-[#ff912d]/20'}`}
                             >
                               <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}>
                                 {!isUnlocked ? (
                                   <Lock className="text-white/50 w-3.5 h-3.5" />
                                 ) : badge.image ? (
                                   <img src={badge.image} alt={badge.name} className="w-full h-full object-cover rounded-full" />
                                 ) : (
                                   <span className="text-[#ff912d] font-bold text-xs">{badge.icon}</span>
                                 )}
                               </div>
                               
                               {isShowcased && (
                                 <div className="absolute -top-1 -right-1 bg-[#ff912d] text-black rounded-full p-[1px] shadow-md z-10">
                                   <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                 </div>
                               )}
                               {/* Tooltip */}
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black/90 border border-[#ff912d]/50 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-opacity z-[9999] text-center shadow-lg">
                                 <strong className="block text-[#ff912d] mb-0.5">{isUnlocked ? `"${badge.name}"` : '???'}</strong>
                                 <span className="text-[9px] text-white/60 block uppercase tracking-wider mb-1">{isUnlocked ? 'Click to view details' : 'To be unlocked'}</span>
                                 {isUnlocked && (
                                   <span className="inline-block bg-[#ff912d]/20 text-[#ff912d] text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                     +{badge.xpReward} EXP
                                   </span>
                                 )}
                               </div>
                             </div>
                           );
                         })
                       ) : (
                         <div className="text-white/30 text-xs italic py-2">
                           No badges unlocked yet.
                         </div>
                       )}
                       
                       {/* Overflow indicator if many badges */}
                       {module.badges.length > 8 && (
                          <div className="w-8 h-8 bg-black/40 border border-white/5 rounded flex items-center justify-center text-white/50 text-[10px] font-bold shadow-inner">
                            +{module.badges.length - 8}
                          </div>
                       )}
                     </div>
                   </div>
                </div>
              );
            })}

          </div>

        </div>
      </div>

      {/* See All Category Badges Modal */}
      {viewAllCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e0a2d] border border-[#ffb703]/50 rounded-2xl p-6 max-w-xl w-full relative flex flex-col shadow-[0_0_40px_rgba(255,183,3,0.15)] max-h-[80vh]">
            <div className="mb-6 text-center">
              <h3 className={`${vt323.className} text-[#ffb703] text-4xl tracking-wider drop-shadow-md`}>{viewAllCategory.title}</h3>
              {viewAllCategory.title === 'Academic Milestones' && (
                <p className="text-white/60 text-sm mt-1">Special milestones achieved on your coding journey.</p>
              )}
            </div>
            
            <div className="overflow-y-auto pr-2 no-scrollbar flex-1 mb-6">
              <div className="grid grid-cols-3 gap-4">
                {viewAllCategory.badges.map((baseBadge) => {
                  const triggerCode = baseBadge.id.toUpperCase();
                  const isUnlocked = unlockedCodes.has(triggerCode);
                  const dbData = dbAchievements.find(a => a.triggerCode === triggerCode || a.id === baseBadge.id);
                  const badge = {
                    ...baseBadge,
                    name: dbData?.name || baseBadge.name,
                    description: dbData?.description || baseBadge.description,
                    xpReward: dbData?.xpReward || baseBadge.xpReward || 100,
                    gearsReward: dbData?.gearsReward || 0,
                    icon: dbData?.iconUrl || baseBadge.icon,
                    image: dbData?.iconUrl || baseBadge.image,
                  };
                  
                  return (
                    <div 
                      key={badge.id}
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedBadge({ ...badge, isUnlocked, unlockedAt: unlockedDates[triggerCode] || unlockedDates[badge.id] });
                        }
                      }}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                        isUnlocked 
                          ? 'bg-[#361d57]/40 border-[#ff912d]/30 hover:border-[#ff912d] hover:bg-[#361d57]/60 cursor-pointer shadow-inner' 
                          : 'bg-black/40 border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center relative shadow-sm overflow-hidden p-1 ${!isUnlocked ? 'opacity-30 grayscale' : ''}`}>
                        {!isUnlocked ? (
                          <Lock className="text-white/50 w-6 h-6" />
                        ) : badge.image ? (
                          <img src={badge.image} alt={badge.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <span className="text-[#ff912d] font-bold text-2xl">{badge.icon}</span>
                        )}
                      </div>
                      <div className="text-center w-full">
                        <strong className="block text-white text-xs mb-1 line-clamp-2 leading-tight">
                          {isUnlocked ? badge.name : '???'}
                        </strong>
                        <span className="text-[10px] text-white/50 block">
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                        {isUnlocked && (
                           <div className="mt-1 bg-[#270d3c] border border-[#ff912d]/50 text-[#ff912d] text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                             +{badge.xpReward || 100} EXP
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={() => setViewAllCategory(null)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl uppercase tracking-widest text-sm font-bold transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e0a2d] border border-[#ff912d]/50 rounded-2xl p-8 max-w-2xl w-full relative flex flex-col md:flex-row gap-8 items-center text-center md:text-left shadow-[0_0_40px_rgba(255,145,45,0.2)]">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            {/* Badge Icon */}
            <div className="w-32 h-32 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-2 border-[#ff912d]/50 flex items-center justify-center shadow-lg overflow-hidden p-2">
              {selectedBadge.image ? (
                <img src={selectedBadge.image} alt={selectedBadge.name} className="w-28 h-28 object-contain" />
              ) : (
                <span className="text-[#ff912d] font-bold text-5xl">{selectedBadge.icon}</span>
              )}
            </div>
            
            {/* Content */}
            <div className="flex flex-col flex-1 items-center md:items-start w-full">
              {/* Badge Name */}
              <h3 className={`${vt323.className} text-[#ff912d] text-4xl mb-2 tracking-wider`}>"{selectedBadge.name}"</h3>
              
              <div className="flex items-center gap-3 mb-4 flex-wrap justify-center md:justify-start">
                <div className="bg-[#270d3c] border border-[#ff912d]/50 text-[#ff912d] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  +{selectedBadge.xpReward || 100} EXP
                </div>
                {selectedBadge.gearsReward > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-900 text-purple-200 text-xs font-bold border border-purple-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    +{selectedBadge.gearsReward} GEARS
                  </div>
                )}
                {selectedBadge.unlockedAt && (
                  <div className="bg-black/40 border border-white/10 text-white/60 text-xs px-3 py-1 rounded-full">
                    Unlocked: {new Date(selectedBadge.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
              
              {/* Description */}
              <p className="text-white/60 text-sm mb-6 max-w-md">
                {selectedBadge.description || "Achievement unlocked! You've mastered this skill in the NETStart galaxy."}
              </p>
              
              {/* Action Button */}
              {selectedBadge.isUnlocked ? (
                <button 
                  onClick={() => {
                    handleToggleBadge(selectedBadge.id);
                    setSelectedBadge(null);
                  }}
                  disabled={!showcasedBadges.includes(selectedBadge.id) && showcasedBadges.length >= 6}
                  className={`font-bold py-3 px-8 rounded-full w-full md:w-auto transition-colors active:scale-95 ${
                    !showcasedBadges.includes(selectedBadge.id) && showcasedBadges.length >= 6
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-[#ff912d] hover:bg-[#ff912d]/80 text-black'
                  }`}
                >
                  {showcasedBadges.includes(selectedBadge.id) 
                    ? 'Remove from Showcase' 
                    : !showcasedBadges.includes(selectedBadge.id) && showcasedBadges.length >= 6
                      ? 'Showcase Full'
                      : 'Add to Showcase'}
                </button>
              ) : (
                <div className="bg-white/10 text-white/40 font-bold py-3 px-8 rounded-full w-full md:w-auto flex items-center justify-center gap-2 cursor-not-allowed">
                  <Lock size={16} /> Locked
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
