"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { VT323 } from 'next/font/google';
import TopHeader from '@/components/TopHeader';
import ImageCropModal from '@/components/ImageCropModal';

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // State
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', status: '', bio: '' });
  const [activeTitle, setActiveTitle] = useState('Novice Explorer');
  const [saving, setSaving] = useState(false);

  // Avatar Cropping State
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Friends State
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [addMessage, setAddMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [statsTab, setStatsTab] = useState<'overview' | 'progress'>('overview');

  useEffect(() => {
    setIsPublic(localStorage.getItem('setting_profileVisibility') !== 'false');
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user) {
      fetchProfile();
      fetchFriends();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setFormData({
          displayName: data.user.displayName || `Explorer${Math.floor(10000 + Math.random() * 90000)}`,
          status: data.user.status || '',
          bio: data.user.bio || ''
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends');
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends || []);
        setPendingReceived(data.pendingReceived || []);
      }
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
        body: JSON.stringify(formData)
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

  const sendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMessage('');
    // Mock sending request
    setAddMessage('Friend request sent!');
    setTimeout(() => setAddMessage(''), 3000);
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId })
      });
      if (res.ok) {
        fetchFriends();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeFriend = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    try {
      const res = await fetch(`/api/friends?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFriends();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || status === 'loading') {
    return <div className="h-screen bg-[#270d3c] flex items-center justify-center text-white">Loading Data...</div>;
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
          <div className="flex flex-col gap-10">
            
            {/* IDENTIFICATION CARD */}
            <div className="border-2 border-[#ff912d] rounded-3xl p-8 relative overflow-hidden bg-[#361d57] shadow-[0_0_15px_rgba(255,145,45,0.2)] hover:shadow-[0_0_25px_rgba(255,145,45,0.4)] transition-shadow duration-500">
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
                      className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full cursor-pointer transition-colors border border-white/10 flex items-center gap-2 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { setIsEditing(false); setFormData({ displayName: profile.displayName || profile.name, status: profile.status, bio: profile.bio }); }} 
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-2 px-6 rounded-full cursor-pointer transition-colors border border-red-500/30 active:scale-95"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="bg-[#ff912d] hover:bg-[#ff912d]/80 text-white font-bold py-2 px-6 rounded-full cursor-pointer transition-colors disabled:opacity-50 active:scale-95 flex items-center gap-2"
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
                            <Image src={profile.image} alt="Avatar" fill className="object-cover" />
                          ) : (
                            <span className="text-7xl font-bold text-[#ff912d] opacity-50">{profile?.name?.charAt(0) || 'U'}</span>
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
                      <label className={`${vt323.className} text-white/70 text-lg tracking-[0.1em] uppercase`}>Display Name</label>
                      {isEditing ? (
                        <input type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="bg-[#1e0a2d]/80 text-white px-4 py-3 rounded-lg border border-[#ff912d]/50 focus:border-[#ff912d] outline-none font-sans font-bold shadow-inner" />
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
                          <label className={`${vt323.className} text-white/70 text-lg tracking-[0.1em] uppercase truncate`}>Title</label>
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
                               {activeTitle === 'None' ? 'No Title' : activeTitle}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 h-full min-w-0">
                          <label className={`${vt323.className} text-white/70 text-lg tracking-[0.1em] uppercase truncate`}>Joined Date</label>
                          <div className="bg-black/20 text-white/50 px-4 py-3 rounded-lg border border-white/5 font-sans font-bold cursor-not-allowed truncate w-full">
                             {joinedDate}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className={`${vt323.className} text-white/70 text-lg tracking-[0.1em] uppercase`}>Description / Bio</label>
                      {isEditing ? (
                        <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="bg-[#1e0a2d]/80 text-white px-4 py-3 rounded-lg border border-[#ff912d]/50 focus:border-[#ff912d] outline-none font-sans font-bold shadow-inner resize-none" placeholder="Tell us about yourself..." />
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

            {/* PROFILE STATISTICS */}
            <div className="flex flex-col mt-2 flex-1 gap-4">
               {/* Title Box */}
               <div className="border border-[#ff912d]/50 p-3 bg-[#361d57]/60 text-center rounded-xl shrink-0">
                 <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>Profile Statistics</h2>
               </div>
               
               {/* Tabs and Content */}
               <div className="flex flex-col flex-1">
                 <div className="flex border border-[#ff912d]/50 border-b-0 bg-[#361d57]/60 rounded-t-xl px-2 pt-2 gap-2">
                    <button 
                      onClick={() => setStatsTab('overview')}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-colors ${statsTab === 'overview' ? 'bg-black/30 text-[#ff912d] border-t border-x border-[#ff912d]/50' : 'text-white/50 hover:bg-black/10 hover:text-white/80'}`}
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => setStatsTab('progress')}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-colors ${statsTab === 'progress' ? 'bg-black/30 text-[#ff912d] border-t border-x border-[#ff912d]/50' : 'text-white/50 hover:bg-black/10 hover:text-white/80'}`}
                    >
                      Progress
                    </button>
                 </div>
               <div className="border-x border-b border-[#ff912d]/50 bg-black/30 rounded-b-xl p-6 flex flex-col gap-6 justify-center shadow-inner min-h-[160px] flex-1">
                 {statsTab === 'overview' ? (
                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-[#361d57]/40 border border-[#ff912d]/30 rounded-xl p-6 text-center shadow-inner flex flex-col items-center justify-center">
                         <span className={`${vt323.className} text-[#ff912d] text-5xl mb-2 drop-shadow-md`}>0</span>
                         <span className="text-white/60 text-xs font-bold uppercase tracking-widest text-center">Modules Completed</span>
                      </div>
                      <div className="bg-[#361d57]/40 border border-[#ff912d]/30 rounded-xl p-6 text-center shadow-inner flex flex-col items-center justify-center">
                         <span className={`${vt323.className} text-[#ffb703] text-5xl mb-2 drop-shadow-md`}>0</span>
                         <span className="text-white/60 text-xs font-bold uppercase tracking-widest text-center">Planets Explored</span>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col gap-4">
                      <div className="bg-[#361d57]/30 border border-white/5 rounded-lg p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Frontend Track</span>
                          <span className="text-[#ff912d] text-xs font-bold">0%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ff912d] w-0 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="bg-[#361d57]/30 border border-white/5 rounded-lg p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Backend Track</span>
                          <span className="text-[#9b4dff] text-xs font-bold">0%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                          <div className="h-full bg-[#9b4dff] w-0 rounded-full"></div>
                        </div>
                      </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
         </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-10 min-w-0">
             <div className="flex items-center gap-4">
               {/* Steam-style Level Badge */}
               <div className="relative flex-shrink-0 flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-600 to-yellow-500 rounded-full border-4 border-[#361d57]">
                 <span className={`${vt323.className} text-white text-3xl font-bold mt-1`}>1</span>
               </div>
               
               {/* Level Text & XP Bar */}
               <div className="flex flex-col flex-1 gap-2">
                 <div className="flex justify-between items-end">
                   <h3 className="text-white text-lg font-bold uppercase tracking-wider">Novice Explorer</h3>
                   <span className="text-[#ff912d] text-xs font-bold uppercase">150 XP to Level 2</span>
                 </div>
                 
                 <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                   <div className="h-full bg-gradient-to-r from-orange-600 to-[#ff912d] w-1/3 rounded-full relative">
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progressStripes_2s_linear_infinite]"></div>
                   </div>
                 </div>
               </div>
             </div>

             {/* ACHIEVEMENTS */}
             <div className="flex flex-col gap-4">
               <div className="border border-[#ff912d]/50 p-3 bg-[#361d57]/60 text-center rounded-xl">
                 <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>Achievements</h2>
               </div>

               <div className="border border-[#ff912d]/50 bg-black/20 rounded-xl p-6 relative flex flex-col gap-4 shadow-sm min-h-[160px]">
                 <div className="flex flex-wrap justify-center gap-6">
                   {/* Ready for Blast Off Badge */}
                   <div className="group relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,165,0,0.4)] cursor-pointer hover:scale-110 transition-transform">
                      <Image src="/Planet 1.svg" alt="Badge" width={50} height={50} />
                      <div className="absolute bottom-[110%] hidden group-hover:block w-max max-w-[220px] bg-black/90 text-white text-xs p-3 rounded-lg border border-[#ff912d]/50 z-50 text-center shadow-2xl pointer-events-none">
                        <strong className="block text-[#ff912d] text-sm mb-1 uppercase tracking-wider">Ready for Blast Off!</strong>
                        Achievement: Create An Account
                      </div>
                   </div>
                   
                   <div className="group relative w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(138,43,226,0.4)] cursor-pointer hover:scale-110 transition-transform">
                      <Image src="/Planet 3.svg" alt="Badge" width={50} height={50} />
                      <div className="absolute bottom-[110%] hidden group-hover:block w-max max-w-[220px] bg-black/90 text-white text-xs p-3 rounded-lg border border-[#ff912d]/50 z-50 text-center shadow-2xl pointer-events-none">
                        <strong className="block text-purple-400 text-sm mb-1 uppercase tracking-wider">First Orbit!</strong>
                        Achievement: Complete your first module
                      </div>
                   </div>
                   
                   <div className="w-20 h-20 border-2 border-white/10 border-dashed rounded-full flex items-center justify-center bg-white/5 opacity-50 cursor-not-allowed">
                      <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                   </div>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                   <Link href="#" className="text-white/50 hover:text-[#ff912d] text-xs uppercase tracking-widest transition-colors font-bold flex items-center gap-2">
                     View All Badges
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                   </Link>
                 </div>
               </div>
             </div>
             {/* ONGOING MISSIONS */}
             <div className="flex flex-col gap-4">
               <div className="border border-[#ff912d]/50 p-3 bg-[#361d57]/60 text-center rounded-xl">
                 <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>Ongoing Missions</h2>
               </div>
               
               <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                  {/* Mission 1 */}
                  <div className="border-2 border-[#ff912d]/50 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_0_15px_rgba(255,145,45,0.2)] transition-shadow cursor-pointer flex flex-col group relative bg-black/40 h-[168px]">
                    <div className="h-14 bg-black relative border-b border-[#ff912d]/30 overflow-hidden flex items-center justify-center shrink-0">
                       <Image src="/login-bg-hq.jpg" alt="Mission Background" fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700 group-hover:scale-105" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                       <Image src="/Planet 1.svg" alt="Planet" width={24} height={24} className="absolute z-10 animate-pulse" />
                    </div>
                    
                    <div className="p-3 flex flex-col gap-1 flex-1 min-h-0">
                       <div className="flex justify-between items-center w-full">
                          <h3 className="text-white font-bold text-sm leading-tight truncate mr-2">Current Mission</h3>
                          <span className="text-[#ff912d] text-[8px] uppercase font-bold tracking-widest bg-[#ff912d]/10 px-1.5 py-0.5 rounded border border-[#ff912d]/20 shrink-0">1 day ago</span>
                       </div>
                       
                       <p className="text-white/60 text-[10px] leading-relaxed line-clamp-1">
                         Continue your exploration in the Sandbox environment. You have unfinished modules awaiting your command.
                       </p>
                       
                       <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
                         <div className="flex -space-x-2">
                            <div className="w-5 h-5 rounded-full bg-[#1e0a2d] border border-white/20 flex items-center justify-center z-20">
                               <Image src="/Planet 1.svg" alt="Icon" width={12} height={12} />
                            </div>
                            <div className="w-5 h-5 rounded-full bg-[#361d57] border border-white/20 flex items-center justify-center z-10">
                               <Image src="/Planet 4.svg" alt="Icon" width={12} height={12} />
                            </div>
                         </div>
                         <button className="bg-[#ff912d] text-black font-bold px-3 py-1 rounded-lg text-[10px] hover:bg-[#ff912d]/80 transition-all cursor-pointer shadow-sm">
                           Resume
                         </button>
                       </div>
                    </div>
                  </div>
                  
                  {/* Empty slot example */}
                  <div className="border-2 border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center bg-black/10 h-[168px] p-4 text-center text-white/30 hover:border-white/20 hover:text-white/50 transition-colors cursor-not-allowed">
                     <svg className="w-6 h-6 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                     <span className="text-sm uppercase tracking-wider font-bold">New Mission Slot</span>
                  </div>
               </div>
             </div>

             {/* FRIENDS LIST */}
             <div className="flex flex-col mt-4 gap-4">
               <div className="border border-[#ff912d]/50 p-3 bg-[#361d57]/60 rounded-xl flex justify-between items-center px-6 shrink-0">
                 <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>Friends List</h2>
                 <span className={`${vt323.className} font-bold text-white/50 text-xl`}>{friends.length} Friends</span>
               </div>
               
               {!isPublic ? (
                 <div className="border border-[#ff912d]/50 bg-black/20 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 shadow-inner">
                   <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                   <span className="text-white/40 italic font-sans text-sm">Your profile is currently private.<br/>Friends list is hidden from public view.</span>
                 </div>
               ) : (
                 <div className="border border-[#ff912d]/50 bg-black/20 rounded-xl p-6 flex flex-col gap-6 shadow-inner min-h-[150px]">
                   {/* Pending Requests */}
                   {pendingReceived.length > 0 && (
                     <div className="mb-2">
                       <h3 className={`${vt323.className} text-green-400 text-xl tracking-wider mb-4 border-b border-white/10 pb-2`}>Awaiting Clearance</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {pendingReceived.map((req: any) => (
                           <div key={req.friendshipId} className="flex items-center justify-between bg-[#361d57]/40 p-4 rounded-xl border border-green-500/30">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-[#1e0a2d] flex items-center justify-center font-bold text-[#ff912d]">
                                 {req.user.name?.charAt(0) || 'U'}
                               </div>
                               <span className="font-bold text-sm">{req.user.name}</span>
                             </div>
                             <button onClick={() => acceptRequest(req.friendshipId)} className="bg-green-500 hover:bg-green-400 text-green-950 font-bold px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer active:scale-95">Approve</button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Current Friends */}
                   <div>
                     {friends.length === 0 ? (
                       <p className="text-white/40 italic font-sans text-center py-4">No friends yet.</p>
                     ) : (
                       <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                         {friends.map((friend: any) => (
                           <div key={friend.id} className="group flex items-center gap-4 bg-[#361d57]/30 p-3 rounded-xl border border-white/5 hover:border-[#ff912d]/50 transition-all cursor-pointer">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#361d57] to-[#ff912d] p-0.5">
                               <div className="w-full h-full bg-[#1e0a2d] rounded-full flex items-center justify-center font-bold text-[#ff912d] text-sm">
                                 {friend.name?.charAt(0) || 'U'}
                               </div>
                             </div>
                             <div className="flex flex-col flex-1 min-w-0">
                               <span className="font-bold text-sm truncate">{friend.name}</span>
                               <span className="text-xs text-white/50 truncate">{friend.status || 'Offline'}</span>
                             </div>
                             <button 
                               onClick={(e) => { e.stopPropagation(); removeFriend(friend.id); }} 
                               className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-2 transition-all cursor-pointer flex-shrink-0"
                               title="Revoke clearance"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>
       </div>
    </main>
  );
}
