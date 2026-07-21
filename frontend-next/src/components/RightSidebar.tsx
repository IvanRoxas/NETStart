"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
export default function RightSidebar() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [isToggled, setIsToggled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Friends state
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // User Profile State (fetches latest from DB to override stale session cookie)
  const [userProfile, setUserProfile] = useState<{name?: string, displayName?: string, image?: string} | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedState = localStorage.getItem("right_sidebar_toggled");
    if (storedState === "false") {
      setIsToggled(false);
    }
  }, []);

  const toggleSidebar = () => {
    setIsToggled(prev => {
      const nextState = !prev;
      localStorage.setItem("right_sidebar_toggled", String(nextState));
      return nextState;
    });
  };

  const fetchFriends = useCallback(async (showLoading = false) => {
    if (showLoading) setFriendsLoading(true);
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch (err) {
      console.error('Failed to fetch friends', err);
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      // Fetch latest profile to override stale NextAuth cookies
      fetch(`/api/profile?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUserProfile({
              name: data.user.name,
              displayName: data.user.displayName,
              image: data.user.image ? `/api/profile/avatar?id=${(session.user as any).id}&t=${Date.now()}` : undefined
            });
            // If DB says no image but session has one, clear the stale session
            if (!data.user.image && session.user?.image) {
              update({ image: null });
            }
          }
        })
        .catch(err => console.error('Failed to fetch user profile', err));

      fetchFriends(true);

      const interval = setInterval(() => {
        fetchFriends();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [session, fetchFriends]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleAddFriend = async (userId: string) => {
    setSearchResults(prev => prev.map(u =>
      u.id === userId ? { ...u, friendship_status: 'pending_sent' } : u
    ));
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      });
      if (!res.ok) {
        throw new Error('Failed');
      }
    } catch (err) {
      console.error(err);
      setSearchResults(prev => prev.map(u =>
        u.id === userId ? { ...u, friendship_status: 'none' } : u
      ));
    }
  };

  const showingSearchResults = searchQuery.length >= 2;
  const displayList = showingSearchResults ? searchResults : friends;

  const sidebarWidthClass = !mounted ? (isToggled ? 'w-80' : 'w-20') : (isToggled ? 'w-80' : 'w-20');

  if (!session?.user) return null;

  return (
    <>
      <aside 
        className={`border-l border-white/5 bg-[#150524]/60 backdrop-blur-xl flex-shrink-0 flex flex-col z-20 h-full transition-all duration-300 ease-in-out relative ${sidebarWidthClass}`}
      >
        <button 
          onClick={toggleSidebar}
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-16 bg-[#ff912d] text-white rounded-l-xl rounded-r-none flex items-center justify-center cursor-pointer shadow-lg z-50 hover:bg-orange-400 transition-colors border border-white/10 border-r-0"
          title={isToggled ? "Minimize Right Panel" : "Expand Right Panel"}
        >
          <svg 
            className={`w-3 h-3 transition-transform duration-300 ${isToggled ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div 
          onClick={() => router.push('/profile')}
          className={`p-6 flex items-center transition-all duration-300 border-b border-white/5 cursor-pointer group ${isToggled ? 'justify-start px-6 h-24 gap-4' : 'justify-center px-0 flex-col py-8'}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#361d57] to-[#ff912d] p-[2px] shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
             <div className="w-full h-full bg-[#1e0a2d] rounded-full overflow-hidden flex items-center justify-center">
                {(userProfile?.image || session.user?.image) ? (
                   <Image src={userProfile?.image || session.user?.image!} alt="User Avatar" width={40} height={40} className="object-cover" />
                ) : (
                   <span className="font-bold text-[#ff912d] text-sm uppercase">{(userProfile?.displayName || userProfile?.name || (session.user as any)?.displayName || session.user?.name)?.charAt(0) || 'U'}</span>
                )}
             </div>
          </div>

          {isToggled && (
            <div className="flex items-center justify-between flex-1 overflow-hidden">
              <span className="font-semibold text-sm text-white group-hover:text-[#ff912d] transition-colors truncate">
                {userProfile?.displayName || userProfile?.name || (session.user as any)?.displayName || session.user?.name || 'User'}
              </span>
              <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          )}
        </div>

        {isToggled && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Blank Square Placeholder */}
            <div className="bg-[#361d57]/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 min-h-[150px]">
               {/* Reserved for future feature */}
            </div>

            {/* Friends List Widget */}
            <div className="bg-[#361d57]/30 border border-white/5 rounded-2xl p-4 flex flex-col flex-1 min-h-[300px]">
               <h4 className="text-white font-bold text-sm tracking-widest mb-4 text-[#ff912d]">FRIENDS LIST</h4>
               
               <div className="relative mb-4">
                 <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Search explorers..."
                   className="w-full bg-black/20 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none border border-white/5 focus:border-[#ff912d]/50 transition-colors"
                 />
               </div>

               <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                 {isSearching || (!isSearching && !showingSearchResults && friendsLoading) ? (
                   [1,2,3].map(i => (
                     <div key={i} className="flex gap-3 items-center opacity-50">
                       <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse"></div>
                       <div className="flex-1">
                         <div className="h-3 w-20 bg-white/5 rounded animate-pulse mb-1"></div>
                         <div className="h-2 w-12 bg-white/5 rounded animate-pulse"></div>
                       </div>
                     </div>
                   ))
                 ) : displayList.length === 0 ? (
                   <div className="text-center text-white/40 text-xs py-8 px-4">
                     {showingSearchResults ? 'No explorers found.' : 'Your friends list is empty. Search for users to add them!'}
                   </div>
                 ) : (
                   displayList.map((u: any) => (
                     <div key={u.id} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer" onClick={() => router.push(`/profile/${u.id}`)}>
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[#1e0a2d] border border-white/10 flex items-center justify-center font-bold text-[#ff912d] overflow-hidden">
                           {u.avatar_url || u.image ? (
                              <Image src={u.avatar_url || u.image} alt="" width={40} height={40} className="object-cover" />
                           ) : (
                              (u.displayName || u.name)?.charAt(0) || 'U'
                           )}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-white/90 leading-tight truncate max-w-[100px]">{u.displayName || u.name}</span>
                           <span className="text-[10px] text-white/40 truncate">{u.status || 'Offline'}</span>
                         </div>
                       </div>

                       {showingSearchResults && (
                         <div className="flex-shrink-0">
                           {u.friendship_status === 'none' && (
                             <button onClick={(e) => { e.stopPropagation(); handleAddFriend(u.id); }} className="w-8 h-8 rounded-full bg-[#ff912d]/20 text-[#ff912d] hover:bg-[#ff912d] hover:text-white flex items-center justify-center transition-colors">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                             </button>
                           )}
                           {u.friendship_status === 'pending_sent' && <span className="text-[10px] font-bold text-[#ff912d] bg-[#ff912d]/10 px-2 py-1 rounded-full">Pending</span>}
                           {u.friendship_status === 'friends' && <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Friend</span>}
                         </div>
                       )}
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
