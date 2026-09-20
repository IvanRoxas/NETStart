"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { VT323 } from 'next/font/google';
import TopHeader from '@/components/TopHeader';
import ImageCropModal from '@/components/ImageCropModal';
import { allBadges } from '@/lib/badgesData';
import { getXPDetails } from '@/lib/leveling';
import { getUnlockedAchievements } from '@/app/actions/achievements';
import SpaceLoader from '@/components/SpaceLoader';
import PassportStatsCard from '@/components/PassportStatsCard';

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

const getMissionDetails = (missionId: string) => {
  const allMissions = {
    // HTML
    "html-1": { title: "HTML Level 1: Core Tags", desc: "Embark on learning fundamental HTML tags like headings, paragraphs, and list components.", module: "HTML", icon: "/Planet 7.svg" },
    "html-2": { title: "HTML Level 2: Structured Forms", desc: "Build input fields, select elements, textareas, and master form attributes.", module: "HTML", icon: "/Planet 7.svg" },
    "html-3": { title: "HTML Level 3: Tables and Frames", desc: "Master the structure of rows, headers, cells, and embed framing details.", module: "HTML", icon: "/Planet 7.svg" },
    "html-4": { title: "HTML Level 4: Layout Schemas", desc: "Create semantic webpage hierarchies using nav, footer, sections, and articles.", module: "HTML", icon: "/Planet 7.svg" },
    "html-5": { title: "HTML Level 5: Media Embeds", desc: "Embed audios, videos, images, and configure frame overrides.", module: "HTML", icon: "/Planet 7.svg" },
    // CSS
    "css-1": { title: "CSS Level 1: Style Selectors", desc: "Master targeting classes, ids, properties, and the cascade tree.", module: "CSS", icon: "/Planet 4.svg" },
    "css-2": { title: "CSS Level 2: Box Model Schemas", desc: "Style border widths, margins, padding constraints, and display blocks.", module: "CSS", icon: "/Planet 4.svg" },
    "css-3": { title: "CSS Level 3: Flexbox Systems", desc: "Master flex-direction, justify-content, align-items, and alignment layouts.", module: "CSS", icon: "/Planet 4.svg" },
    "css-4": { title: "CSS Level 4: Grid Architectures", desc: "Design structured column-row layouts, grid-areas, and alignments.", module: "CSS", icon: "/Planet 4.svg" },
    "css-5": { title: "CSS Level 5: Transits & Keyframes", desc: "Implement active transforms, smooth animations, and transitions.", module: "CSS", icon: "/Planet 4.svg" },
    // JavaScript
    "javascript-1": { title: "JS Level 1: Core Bindings", desc: "Learn variables, let, const, primitive types, and math routines.", module: "JavaScript", icon: "/Planet 2.svg" },
    "javascript-2": { title: "JS Level 2: Control Logic", desc: "Master branching structures (if-else), switch cases, and loops.", module: "JavaScript", icon: "/Planet 2.svg" },
    "javascript-3": { title: "JS Level 3: Function Declarations", desc: "Implement reusable function expressions, closures, and scoping.", module: "JavaScript", icon: "/Planet 2.svg" },
    "javascript-4": { title: "JS Level 4: Array Iterators", desc: "Master maps, filters, reductions, and sorting loops.", module: "JavaScript", icon: "/Planet 2.svg" },
    "javascript-5": { title: "JS Level 5: DOM Injections", desc: "Query elements, inject styles, dynamic texts, and event listeners.", module: "JavaScript", icon: "/Planet 2.svg" },
    // React
    "react-1": { title: "React Level 1: JSX Injections", desc: "Master building functional components using declarative JSX tags.", module: "React", icon: "/Planet 1.svg" },
    "react-2": { title: "React Level 2: State Hooks", desc: "Master React state hooks, inputs, re-renders, and lifecycle binds.", module: "React", icon: "/Planet 1.svg" },
    "react-3": { title: "React Level 3: Prop Transits", desc: "Pass data down parent components, configure defaults, and handle callbacks.", module: "React", icon: "/Planet 1.svg" },
    "react-4": { title: "React Level 4: Context Providers", desc: "Share states globally across subtrees using Context wrappers.", module: "React", icon: "/Planet 1.svg" },
    "react-5": { title: "React Level 5: Hooks Customizer", desc: "Build reusable hooks encapsulating state routines.", module: "React", icon: "/Planet 1.svg" },
    // Node
    "node-1": { title: "Node Level 1: File Actions", desc: "Read and write local configuration assets using fs bindings.", module: "Node Backend", icon: "/Planet 3.svg" },
    "node-2": { title: "Node Level 2: HTTP Hosts", desc: "Spin up HTTP servers listening to custom ports.", module: "Node Backend", icon: "/Planet 3.svg" },
    "node-3": { title: "Node Level 3: Express Routing", desc: "Design route controllers handling GET and POST payloads.", module: "Node Backend", icon: "/Planet 3.svg" },
    "node-4": { title: "Node Level 4: DB Bindings", desc: "Integrate queries connecting schema layouts.", module: "Node Backend", icon: "/Planet 3.svg" },
    "node-5": { title: "Node Level 5: Middlewares", desc: "Build pipeline controllers filtering inbound requests.", module: "Node Backend", icon: "/Planet 3.svg" }
  };
  return allMissions[missionId.toLowerCase() as keyof typeof allMissions] || { title: "Custom Lab Session", desc: "Explore and test custom logic inside the sandbox lab environment.", module: "Sandbox", icon: "/Planet 5.svg" };
};

const getRelativeTimeString = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // State
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbAchievements, setDbAchievements] = useState<any[]>([]);
  const [ongoingMissions, setOngoingMissions] = useState<any[]>([]);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', status: '', bio: '' });
  const [activeTitle, setActiveTitle] = useState('Novice Explorer');
  const [saving, setSaving] = useState(false);

  // Badges & Modal State
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [unlockedDates, setUnlockedDates] = useState<Record<string, string>>({});

  // Avatar Cropping State
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const [statsTab, setStatsTab] = useState<'overview' | 'progress'>('overview');
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile?t=${Date.now()}`);
      const data = await res.json();

      const achievementsRes = await getUnlockedAchievements();

      if (res.ok) {
        setProfile(data.user);
        setXp(data.user.xp || 0);
        setOngoingMissions(data.missionProgress || []);
        setCompletedMissionIds(data.completedMissionIds || []);
        setFormData({
          displayName: data.user.displayName || `Explorer${Math.floor(10000 + Math.random() * 90000)}`,
          status: data.user.status || '',
          bio: data.user.bio || ''
        });
        setActiveTitle(data.user.title || 'Novice Explorer');
      }
      if (achievementsRes.success) {
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleBadge = async (badgeId: string) => {
    if (!profile) return;
    const showcased = profile.showcasedBadges || [];
    const isAdding = !showcased.includes(badgeId);
    if (isAdding && showcased.length >= 6) {
      showToast('Showcase Full! Remove a badge first.');
      return;
    }

    const newBadges = isAdding
      ? [...showcased, badgeId]
      : showcased.filter((id: string) => id !== badgeId);

    setProfile((prev: any) => ({ ...prev, showcasedBadges: newBadges }));
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



  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, title: activeTitle })
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setIsEditing(false);
        await update({ displayName: data.user.displayName });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result?.toString() || '');
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      // reset file input
      e.target.value = '';
    }
  };

  const handleCropSave = async (base64String: string) => {
    // Optimistically update UI
    setProfile((prev: any) => ({ ...prev, image: base64String }));

    // Save to server
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String })
      });
      if (!res.ok) {
        console.error('Failed to save avatar');
      }
    } catch (e) {
      console.error(e);
    }
  };


  if (loading || status === 'loading') {
    return (
      <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c]">
        <TopHeader title="Profile" />
        <div className="flex-1 flex items-center justify-center p-6">
          <SpaceLoader text="...loading profile..." />
        </div>
      </main>
    );
  }

  const joinedDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'UNKNOWN';

  return (
    <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c]">
      <TopHeader title="Profile" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 pr-10 lg:pr-16 no-scrollbar @container">

        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Crop Modal */}
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageSrc={cropImageSrc}
          aspect={1}
          title="Crop your Avatar"
          onSave={handleCropSave}
        />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 @5xl:grid-cols-[1.5fr_1fr] gap-10">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-10 min-w-0">

            {/* IDENTIFICATION CARD */}
            <div className="relative group/id-card">
              {/* Shaded background depth layer */}
              <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/id-card:translate-x-3 group-hover/id-card:translate-y-3" />
              
              <div className="relative z-10 border-2 border-[#ff912d] rounded-3xl p-8 overflow-hidden bg-[#361d57] shadow-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300">
                {/* Background Watermark Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] opacity-5 pointer-events-none z-0">
                  <Image src="/NETStartIcon.png" alt="NETStart Badge" fill className="object-contain" />
                </div>

                <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>Identification Card</h2>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 px-5 text-sm rounded-full cursor-pointer transition-colors border border-white/10 flex items-center gap-2 active:scale-95 whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setIsEditing(false); setFormData({ displayName: profile.displayName || profile.name, status: profile.status, bio: profile.bio }); setActiveTitle(profile.title || 'Novice Explorer'); }}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-1.5 px-5 text-sm rounded-full cursor-pointer transition-colors border border-red-500/30 active:scale-95 whitespace-nowrap"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="bg-[#ff912d] hover:bg-[#ff912d]/80 text-white font-bold py-1.5 px-5 text-sm rounded-full cursor-pointer transition-colors disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col @2xl:flex-row gap-8">
                  {/* Left side: Avatar, Badge */}
                  <div className="flex flex-col w-48 flex-shrink-0 shrink-0 relative group">
                    <div className="w-48 h-56 bg-black/40 border-2 border-[#ff912d]/60 shadow-[0_0_15px_rgba(255,145,45,0.15)] rounded-xl relative overflow-hidden flex items-center justify-center transition-all shrink-0">
                      {/* Placeholder for avatar - when hover show camera icon */}
                      <div className="absolute inset-0 bg-[#1e0a2d] flex items-center justify-center">
                        {profile?.image ? (
                          <Image src={profile.image === '/Planet 1.svg' ? '/Profile.svg' : profile.image} alt="Avatar" fill className="object-cover" />
                        ) : (
                          <Image src="/Profile.svg" alt="Avatar" fill className="object-cover" />
                        )}
                      </div>

                      {isEditing && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-white text-sm font-bold flex flex-col items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Change Image
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Form Fields */}
                  <div className="flex-1 flex flex-col gap-5 mt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={`${vt323.className} font-bold text-white/70 text-lg tracking-[0.1em] uppercase`}>Display Name</label>
                      {isEditing ? (
                        <input type="text" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} className="bg-[#1e0a2d]/80 text-white px-4 py-3 rounded-lg border border-[#ff912d]/50 focus:border-[#ff912d] outline-none font-sans font-bold shadow-inner" />
                      ) : (
                        <div className="bg-black/20 text-white px-4 py-3 rounded-lg border border-white/5 font-sans font-bold">
                          {profile?.displayName || profile?.name || 'Unknown'}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-5 w-full">
                      {/* Top Row: Title and Joined Date */}
                      <div className="grid grid-cols-1 @md:grid-cols-2 gap-5 w-full">
                        <div className="flex flex-col gap-1.5 h-full min-w-0">
                          <label className={`${vt323.className} font-bold text-white/70 text-lg tracking-[0.1em] uppercase truncate`}>Title</label>
                          {isEditing ? (
                            <select
                              value={activeTitle}
                              onChange={(e) => setActiveTitle(e.target.value)}
                              className="bg-[#1e0a2d]/80 text-white px-4 py-3 rounded-lg border border-[#ff912d]/50 focus:border-[#ff912d] outline-none font-sans font-bold shadow-inner appearance-none cursor-pointer w-full"
                              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' }}
                            >
                              <option value="None" className="bg-[#1e0a2d]">None</option>
                              <option value="Novice Explorer" className="bg-[#1e0a2d]">Novice Explorer</option>
                            </select>
                          ) : (
                            <div className="bg-black/20 text-white px-4 py-3 rounded-lg border border-white/5 font-sans font-bold text-[#ffb703] truncate w-full">
                              {profile?.title || 'Novice Explorer'}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 h-full min-w-0">
                          <label className={`${vt323.className} font-bold text-white/70 text-lg tracking-[0.1em] uppercase truncate`}>Joined Date</label>
                          <div className="bg-black/20 text-white/50 px-4 py-3 rounded-lg border border-white/5 font-sans font-bold cursor-not-allowed truncate w-full">
                            {joinedDate}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={`${vt323.className} font-bold text-white/70 text-lg tracking-[0.1em] uppercase`}>Description / Bio</label>
                      {isEditing ? (
                        <textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="bg-[#1e0a2d]/80 text-white px-4 py-3 rounded-lg border border-[#ff912d]/50 focus:border-[#ff912d] outline-none font-sans font-bold shadow-inner resize-none" placeholder="Tell us about yourself..." />
                      ) : (
                        <div className="bg-black/20 text-white px-4 py-3 rounded-lg border border-white/5 font-sans min-h-[5rem] text-white/80">
                          {profile?.bio || 'An aspiring NETStart explorer.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* PASSPORT STATISTICS CARD */}
            <PassportStatsCard profile={profile} completedMissionIds={completedMissionIds} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-10 min-w-0">
            <div className="flex items-center gap-4">
              {/* Dynamic SVG Level Badge */}
              <div className="relative w-16 h-16 shrink-0 z-10 flex items-center justify-center rounded-full bg-[#1e0a2d]">
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#361d57" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="46" fill="none" stroke="#ff912d" strokeWidth="8"
                    strokeDasharray="289" strokeDashoffset={289 - (289 * Math.max(2, getXPDetails(xp).progress)) / 100}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="w-12 h-12 bg-[#1e0a2d] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#1e0a2d] z-10 relative shadow-inner">
                  <span className={`${vt323.className} text-[#ff912d] text-3xl font-bold mt-1`}>{getXPDetails(xp).level}</span>
                </div>
              </div>

              {/* Level Text & XP Bar */}
              <div className="flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-end">
                  <h3 className="text-white text-lg font-bold uppercase tracking-wider">{profile?.title || 'Novice Explorer'}</h3>
                  <span className="text-[#ff912d] text-xs font-bold uppercase">{xp} / {getXPDetails(xp).nextThreshold} XP (Level {getXPDetails(xp).level < 10 ? getXPDetails(xp).level + 1 : 10})</span>
                </div>

                <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-[#ff912d] rounded-full relative transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(2, getXPDetails(xp).progress)}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progressStripes_2s_linear_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACHIEVEMENTS */}
            <div className="relative group/ach-card flex flex-col">
              {/* Shaded background depth layer */}
              <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/ach-card:translate-x-3 group-hover/ach-card:translate-y-3" />
              
              <div className="relative z-10 flex flex-col gap-4 bg-[#361d57] border-2 border-[#ff912d]/50 p-6 rounded-3xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 shadow-xl">
                <div className="flex justify-between items-center border border-[#ff912d]/50 p-3 bg-[#361d57]/60 rounded-xl">
                  <div className="w-24 shrink-0"></div> {/* Spacer for centering */}
                  <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase text-center flex-1`}>Achievements</h2>
                  <div className="w-24 shrink-0 flex justify-end">
                  </div>
                </div>

                <div className="border border-[#ff912d]/30 bg-black/20 rounded-xl p-6 relative flex flex-col gap-4 shadow-inner min-h-[160px]">
                <div className="grid grid-cols-3 place-items-center gap-x-8 gap-y-6 mx-auto">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const badgeId = profile?.showcasedBadges?.[i];
                    const baseBadge = badgeId ? allBadges.find(b => b.id === badgeId) : null;
                    const triggerCode = badgeId ? badgeId.toUpperCase() : '';
                    const dbData = badgeId ? dbAchievements.find(a => a.triggerCode === triggerCode || a.id === badgeId) : null;

                    if (baseBadge || dbData) {
                      const badge = {
                        id: badgeId,
                        name: dbData?.name || baseBadge?.name || 'Achievement',
                        description: dbData?.description || baseBadge?.description || '',
                        xpReward: dbData?.xpReward || baseBadge?.xpReward || 100,
                        gearsReward: dbData?.gearsReward || 0,
                        icon: dbData?.iconUrl || baseBadge?.icon || '🏆',
                        image: dbData?.iconUrl || baseBadge?.image,
                      };

                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedBadge({ ...badge, isUnlocked: true, unlockedAt: unlockedDates[triggerCode] || unlockedDates[badgeId!] })}
                          className="group relative w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-2 border-[#ff912d]/60 shadow-[0_0_12px_rgba(255,145,45,0.25)] rounded-full flex items-center justify-center cursor-pointer hover:border-[#ff912d] hover:bg-[#ff912d]/20 transition-all hover:shadow-[0_0_20px_rgba(255,145,45,0.5)] overflow-visible"
                        >
                          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                            {badge.image ? (
                              <img src={badge.image} alt={badge.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="text-[#ff912d] font-bold text-2xl">{badge.icon}</span>
                            )}
                          </div>
                          <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-[220px] bg-black/90 text-white text-xs p-3 rounded-lg border border-[#ff912d]/50 z-[9999] text-center shadow-2xl pointer-events-none">
                            <strong className="block text-[#ff912d] text-sm mb-1 uppercase tracking-wider">"{badge.name}"</strong>
                            <span className="text-white/70 block mt-1">{badge.description || "Achievement unlocked! You've mastered this skill in the NETStart galaxy."}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={i} className="w-16 h-16 border-2 border-white/10 border-dashed rounded-full flex items-center justify-center bg-white/5 opacity-50 cursor-not-allowed">
                        <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12"></path></svg>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                  <Link href="/achievements" className="text-white/50 hover:text-[#ff912d] text-xs uppercase tracking-widest transition-colors font-bold flex items-center gap-2">
                    View All Badges
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Link>
                </div>
              </div>
            </div>
            </div>
            {/* ONGOING MISSIONS */}
            <div className="relative group/ongoing-card flex flex-col flex-1 h-full">
              {/* Shaded background depth layer */}
              <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/ongoing-card:translate-x-3 group-hover/ongoing-card:translate-y-3" />
              
              <div className="relative z-10 flex flex-col flex-1 h-full justify-between gap-4 bg-[#361d57] border-2 border-[#ff912d]/50 p-6 rounded-3xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 shadow-xl">
                {/* Title Box */}
                <div className="border border-[#ff912d]/50 p-3 bg-[#361d57]/60 text-center rounded-xl shrink-0">
                  <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>Ongoing Missions</h2>
                </div>

                <div className="flex flex-col flex-1 justify-between gap-4">
                  {ongoingMissions.length === 0 ? (
                    <div className="relative group/m-card flex flex-col flex-1 h-full">
                      <div className="absolute inset-0 bg-[#090311]/75 rounded-xl translate-x-2 translate-y-2 z-0" />
                      <div className="relative z-10 border-2 border-dashed border-[#ff912d]/30 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 bg-black/20 min-h-[168px] flex-1 h-full">
                        <p className="text-gray-400 text-sm font-semibold">No ongoing missions found.</p>
                        <Link href="/modules" className="px-6 py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/80 text-black font-bold rounded-lg text-xs transition-all active:scale-95 shadow-md">
                          View Mission Map
                        </Link>
                      </div>
                    </div>
                  ) : (
                    ongoingMissions.map((mission) => {
                      const details = getMissionDetails(mission.missionId);
                      const timeStr = getRelativeTimeString(mission.startedAt);
                      return (
                        <div key={mission.id} className="relative group/m-card flex flex-col flex-1 h-full">
                          {/* Shaded background depth layer */}
                          <div className="absolute inset-0 bg-[#090311]/75 rounded-xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/m-card:translate-x-3 group-hover/m-card:translate-y-3" />
                          
                          <div className="relative z-10 border-2 border-[#ff912d]/50 rounded-xl overflow-hidden shadow-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between bg-black/40 min-h-[168px] flex-1 h-full">
                            <div className="flex-1 min-h-[5rem] bg-black relative border-b border-[#ff912d]/30 overflow-hidden flex items-center justify-center w-full">
                              <Image src="/login-bg-hq.jpg" alt="Mission Background" fill className="object-cover opacity-50 group-hover/m-card:opacity-70 transition-opacity duration-700 group-hover/m-card:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                            </div>

                            <div className="p-4 flex flex-col gap-2 shrink-0 bg-black/40">
                              <div className="flex justify-between items-center w-full">
                                <h3 className="text-white font-bold text-sm leading-tight truncate mr-2">{details.title}</h3>
                                <span className="text-[#ff912d] text-[10px] uppercase font-bold tracking-widest bg-[#ff912d]/10 px-2 py-1 rounded border border-[#ff912d]/20 shrink-0">{timeStr}</span>
                              </div>

                              <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-2">
                                {details.desc}
                              </p>

                              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                  <div className="w-6.5 h-6.5 rounded-full bg-[#1e0a2d] border border-white/20 flex items-center justify-center">
                                    <Image src={details.icon} alt="Icon" width={14} height={14} />
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{details.module}</span>
                                </div>
                                <Link href={`/sandbox?missionId=${mission.missionId}`} className="bg-[#ff912d] text-black font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-[#ff912d]/80 transition-all cursor-pointer shadow-sm active:scale-95 text-center">
                                  Resume
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-[#ff912d] text-black font-bold px-6 py-2 rounded-full shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e0a2d] border border-[#ff912d]/50 rounded-2xl p-8 max-w-2xl w-full relative flex flex-col md:flex-row gap-8 items-center text-center md:text-left shadow-[0_0_40px_rgba(255,145,45,0.2)]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
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

              <div className="flex items-center gap-3 mb-3 flex-wrap justify-center md:justify-start">
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
              <button
                onClick={() => {
                  handleToggleBadge(selectedBadge.id);
                  setSelectedBadge(null);
                }}
                disabled={!profile?.showcasedBadges?.includes(selectedBadge.id) && (profile?.showcasedBadges?.length || 0) >= 6}
                className={`font-bold py-3 px-8 rounded-full w-full md:w-auto transition-colors cursor-pointer active:scale-95 ${profile?.showcasedBadges?.includes(selectedBadge.id)
                    ? 'bg-[#ff912d] hover:bg-[#ff912d]/80 text-black'
                    : (profile?.showcasedBadges?.length || 0) >= 6
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-[#ff912d] hover:bg-[#ff912d]/80 text-black'
                  }`}
              >
                {profile?.showcasedBadges?.includes(selectedBadge.id)
                  ? 'Remove from Showcase'
                  : (profile?.showcasedBadges?.length || 0) >= 6
                    ? 'Showcase Full'
                    : 'Add to Showcase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
