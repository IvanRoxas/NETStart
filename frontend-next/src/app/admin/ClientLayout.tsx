"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  GraduationCap,
  FileText,
  Settings,
  MessageSquare,
  LogOut,
  Brain,
  ShieldAlert,
  UserCheck,
  Activity
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ClientLayoutProps {
  children: React.ReactNode;
  initialRole?: "SUPER_ADMIN" | "TEACHER";
  initialDisplayName?: string;
}

export default function AdminLayoutClient({
  children,
  initialRole,
  initialDisplayName,
}: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Custom Confirmation Modal state
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Determine user role with SSR fallback
  const adminRole = (session?.user as any)?.role || initialRole;
  const isTeacher = adminRole === 'TEACHER';
  const displayName = (session?.user as any)?.displayName || session?.user?.name || initialDisplayName || (isTeacher ? 'Teacher' : 'Administrator');

  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error("Sign out error", e);
    }
    router.replace('/admin-login');
  };

  // Dynamically adjust page title & favicon based on role
  useEffect(() => {
    document.title = isTeacher ? 'NETStart Teacher Portal' : 'NETStart Admin Portal';

    const svgLink = document.querySelector("link[rel*='icon'][type='image/svg+xml']") as HTMLLinkElement;
    const pngLink = document.querySelector("link[rel*='icon']:not([type='image/svg+xml'])") as HTMLLinkElement;
    const appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;

    if (isTeacher) {
      if (svgLink) svgLink.href = '/teacher-favicon.svg';
      if (pngLink) pngLink.href = '/teacher-favicon-32.png';
      if (appleLink) appleLink.href = '/teacher-icon.png';
    } else {
      if (svgLink) svgLink.href = '/admin-favicon.svg';
      if (pngLink) pngLink.href = '/admin-favicon-32.png';
      if (appleLink) appleLink.href = '/admin-icon.png';
    }

    return () => {
      document.title = 'NETStart';
      if (svgLink) svgLink.href = '/favicon.svg';
      if (pngLink) pngLink.href = '/favicon-32.png';
      if (appleLink) appleLink.href = '/icon.png';
    };
  }, [isTeacher]);

  return (
    <div className={`flex w-full h-screen overflow-hidden ${isTeacher ? 'theme-teacher bg-[#f0fdf4]' : 'theme-admin bg-[#eff6ff]'}`}>
      {/* Sidebar - Clean Two-Tone White & Color Navigation */}
      <div className={`w-64 bg-white flex flex-col z-20 shadow-md border-r ${isTeacher ? 'border-emerald-200' : 'border-blue-200'
        }`}>
        {/* Brand Header - High Contrast Logo & Readable Typography */}
        <div className={`p-5 border-b flex items-center gap-3 ${isTeacher ? 'border-emerald-100 bg-emerald-50/50' : 'border-blue-100 bg-blue-50/50'
          }`}>
          <div className={`w-11 h-11 rounded-xl bg-white shadow-sm border p-1 flex items-center justify-center shrink-0 ${isTeacher ? 'border-emerald-200' : 'border-blue-200'
            }`}>
            <Image
              src={isTeacher ? "/assets/global/badges/NETStartIcon-teacher.png" : "/assets/global/badges/NETStartIcon-admin.png"}
              alt="NETStart Logo"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-black text-xl tracking-tight text-slate-900 leading-none">
              NET<span className={isTeacher ? 'text-emerald-600' : 'text-blue-600'}>Start</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${isTeacher
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                {isTeacher ? 'Teacher Portal' : 'Super Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 flex flex-col gap-1.5 overflow-y-auto">
          {/* Common / Core: Students */}
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-sm ${pathname === '/admin'
                ? (isTeacher
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-blue-600 text-white shadow-md shadow-blue-600/20')
                : (isTeacher
                  ? 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50'
                  : 'text-slate-700 hover:text-blue-800 hover:bg-blue-50')
              }`}
          >
            <Users size={19} className={pathname === '/admin' ? 'text-white' : (isTeacher ? 'text-emerald-600' : 'text-blue-600')} />
            <span style={pathname === '/admin' ? { color: '#ffffff' } : undefined}>
              {isTeacher ? 'My Students' : 'User Management'}
            </span>
          </Link>

          {/* Sections (both Teachers & Super Admin) */}
          <Link
            href="/admin/sections"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-sm ${pathname === '/admin/sections'
                ? (isTeacher
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-blue-600 text-white shadow-md shadow-blue-600/20')
                : (isTeacher
                  ? 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50'
                  : 'text-slate-700 hover:text-blue-800 hover:bg-blue-50')
              }`}
          >
            <GraduationCap size={19} className={pathname === '/admin/sections' ? 'text-white' : (isTeacher ? 'text-emerald-600' : 'text-blue-600')} />
            <span style={pathname === '/admin/sections' ? { color: '#ffffff' } : undefined}>
              {isTeacher ? 'My Sections' : 'Sections'}
            </span>
          </Link>

          {/* Super Admin Only Links */}
          {!isTeacher && (
            <>
              <Link
                href="/admin/teachers"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-sm ${pathname === '/admin/teachers'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-700 hover:text-blue-800 hover:bg-blue-50'
                  }`}
              >
                <UserCheck size={19} className={pathname === '/admin/teachers' ? 'text-white' : 'text-blue-600'} />
                <span style={pathname === '/admin/teachers' ? { color: '#ffffff' } : undefined}>Teachers</span>
              </Link>
              <Link
                href="/admin/aptitude"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-sm ${pathname === '/admin/aptitude'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-700 hover:text-blue-800 hover:bg-blue-50'
                  }`}
              >
                <Brain size={19} className={pathname === '/admin/aptitude' ? 'text-white' : 'text-blue-600'} />
                <span style={pathname === '/admin/aptitude' ? { color: '#ffffff' } : undefined}>AI Aptitude Engine</span>
              </Link>
              <Link
                href="/admin/shop"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-sm ${pathname === '/admin/shop'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-700 hover:text-blue-800 hover:bg-blue-50'
                  }`}
              >
                <Settings size={19} className={pathname === '/admin/shop' ? 'text-white' : 'text-blue-600'} />
                <span style={pathname === '/admin/shop' ? { color: '#ffffff' } : undefined}>Shop Configuration</span>
              </Link>
              <Link
                href="/admin/achievements"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-sm ${pathname === '/admin/achievements'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-700 hover:text-blue-800 hover:bg-blue-50'
                  }`}
              >
                <FileText size={19} className={pathname === '/admin/achievements' ? 'text-white' : 'text-blue-600'} />
                <span style={pathname === '/admin/achievements' ? { color: '#ffffff' } : undefined}>Achievements</span>
              </Link>
              <Link
                href="/admin/logs"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-sm ${pathname === '/admin/logs'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-700 hover:text-blue-800 hover:bg-blue-50'
                  }`}
              >
                <Activity size={19} className={pathname === '/admin/logs' ? 'text-white' : 'text-blue-600'} />
                <span style={pathname === '/admin/logs' ? { color: '#ffffff' } : undefined}>System Logs</span>
              </Link>
            </>
          )}

          {/* User Reports */}
          <Link
            href="/admin/reports"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-sm ${pathname === '/admin/reports'
                ? (isTeacher
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-blue-600 text-white shadow-md shadow-blue-600/20')
                : (isTeacher
                  ? 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50'
                  : 'text-slate-700 hover:text-blue-800 hover:bg-blue-50')
              }`}
          >
            <MessageSquare size={19} className={pathname === '/admin/reports' ? 'text-white' : (isTeacher ? 'text-emerald-600' : 'text-blue-600')} />
            <span style={pathname === '/admin/reports' ? { color: '#ffffff' } : undefined}>User Reports</span>
          </Link>
        </nav>

        {/* User Info & Sign Out Footer */}
        <div className={`p-4 border-t flex flex-col gap-2.5 ${isTeacher ? 'border-emerald-100 bg-emerald-50/40' : 'border-blue-100 bg-blue-50/40'
          }`}>
          <div className="px-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Signed in as</p>
            <p className={`text-sm font-black truncate ${isTeacher ? 'text-emerald-950' : 'text-blue-950'}`}>{displayName}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2 px-3.5 rounded-xl font-bold text-xs bg-white text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-slate-200 transition-all cursor-pointer shadow-xs"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Crisp Top Bar with Distinct Primary Accent Line */}
        <header className={`h-16 px-8 flex items-center justify-between border-b bg-white flex-shrink-0 shadow-xs z-10 ${isTeacher ? 'border-b-emerald-600 border-b-2' : 'border-b-blue-600 border-b-2'
          }`}>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              {isTeacher ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <GraduationCap size={18} />
                  </div>
                  Teacher Console
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                    <ShieldAlert size={18} />
                  </div>
                  Admin Console
                </>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs ${isTeacher
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
              }`}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span style={{ color: '#ffffff' }}>{isTeacher ? 'Teacher Workspace' : 'System Authority'}</span>
            </span>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 relative z-10">
          {children}
        </div>
      </div>

      {/* Custom UI Logout Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isTeacher ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>
              <LogOut size={26} />
            </div>
            <h3 className="text-xl font-display font-black text-slate-900 mb-2">Confirm Sign Out</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to end your session in the {isTeacher ? 'Teacher Console' : 'Admin Console'}?
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold transition-all shadow-md ${isTeacher
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
