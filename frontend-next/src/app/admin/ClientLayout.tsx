"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Settings, 
  FileText, 
  ShieldAlert, 
  Activity, 
  MessageSquare, 
  LogOut, 
  Brain,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import { signOut, useSession } from 'next-auth/react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "SUPER_ADMIN";
  const isTeacher = role === "TEACHER";
  const displayName = session?.user?.displayName || session?.user?.name || "Admin";

  // Dynamic Browser Tab Logo (Favicon) & Title Synchronization
  useEffect(() => {
    const faviconPngHref = isTeacher ? '/favicon-teacher-32.png' : '/favicon-admin-32.png';
    const fullPngHref = isTeacher ? '/favicon-teacher.png' : '/favicon-admin.png';

    // 1. Remove any SVG favicon links from head so the browser prioritizes the NETStart badge
    const existingSvgLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon'][type='image/svg+xml']");
    existingSvgLinks.forEach(el => el.remove());

    // 2. Update standard PNG/ICO favicon link
    let pngLink = document.querySelector<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']");
    if (!pngLink) {
      pngLink = document.createElement('link');
      pngLink.rel = 'icon';
      pngLink.type = 'image/png';
      document.head.appendChild(pngLink);
    }
    pngLink.href = `${faviconPngHref}?v=${isTeacher ? 'teacher' : 'admin'}`;

    // 3. Apple Touch Icon
    let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = fullPngHref;

    // 4. Update tab title if it still has default
    if (isTeacher && document.title.includes('Admin Console')) {
      document.title = document.title.replace('Admin Console', 'Teacher Console');
    } else if (!isTeacher && document.title.includes('Teacher Console')) {
      document.title = document.title.replace('Teacher Console', 'Admin Console');
    }

    return () => {
      // Restore signature NETStart icon badge when unmounting / navigating away
      if (pngLink) pngLink.href = '/favicon-32.png';
      if (appleLink) appleLink.href = '/icon.png';
    };
  }, [isTeacher]);
  
  return (
    <div className="flex w-full h-screen bg-[#1a082c] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e0a2d] border-r border-[#ff912d]/20 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-[#ff912d]/20 flex items-center gap-3">
          <ShieldAlert className="text-[#ff912d]" size={28} />
          <div>
            <h1 className="font-display font-black text-xl text-white tracking-wider">NET<span className="text-[#ff912d]">START</span></h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isTeacher ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/30'}`}>
                {isTeacher ? 'Teacher' : 'Super Admin'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {/* Common / Core: Students */}
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin' ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
            <Users size={20} />
            {isTeacher ? 'My Students' : 'User Management'}
          </Link>

          {/* Sections (both Teachers & Super Admin) */}
          <Link href="/admin/sections" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/sections' ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
            <GraduationCap size={20} />
            {isTeacher ? 'My Sections' : 'Sections'}
          </Link>

          {/* Super Admin Only Links */}
          {!isTeacher && (
            <>
              <Link href="/admin/teachers" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/teachers' ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
                <UserCheck size={20} />
                Teachers
              </Link>
              <Link href="/admin/aptitude" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/aptitude' ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
                <Brain size={20} />
                AI Aptitude Engine
              </Link>
              <Link href="/admin/shop" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/shop' ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
                <Settings size={20} />
                Shop Configuration
              </Link>
              <Link href="/admin/achievements" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/achievements' ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
                <FileText size={20} />
                Achievements
              </Link>
              <Link href="/admin/logs" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/logs' ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
                <Activity size={20} />
                System Logs
              </Link>
            </>
          )}

          {/* User Reports */}
          <Link href="/admin/reports" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/reports' ? 'bg-red-500/10 text-red-400 border border-red-500/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
            <MessageSquare size={20} />
            User Reports
          </Link>
        </nav>

        <div className="p-4 border-t border-[#ff912d]/20 flex flex-col gap-3">
          <div className="px-2 py-1">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/admin-login' })} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/10 text-white hover:text-red-400 font-semibold transition-colors border border-white/10 hover:border-red-500/20 cursor-pointer">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopHeader title="Admin Console" />
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
