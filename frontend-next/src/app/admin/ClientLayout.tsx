"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Settings, FileText, ArrowLeft, ShieldAlert, Activity, MessageSquare, LogOut } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import { signOut } from 'next-auth/react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="flex w-full h-screen bg-[#1a082c] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e0a2d] border-r border-[#ff912d]/20 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-[#ff912d]/20 flex items-center gap-3">
          <ShieldAlert className="text-[#ff912d]" size={28} />
          <div>
            <h1 className="font-display font-black text-xl text-white tracking-wider">NET<span className="text-[#ff912d]">START</span></h1>
            <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin' ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
            <Users size={20} />
            User Management
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
          <Link href="/admin/reports" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/reports' ? 'bg-red-500/10 text-red-400 border border-red-500/20 font-bold' : 'text-gray-400 font-medium hover:bg-white/5'}`}>
            <MessageSquare size={20} />
            User Reports
          </Link>
        </nav>

        <div className="p-4 border-t border-[#ff912d]/20">
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-red-500/10 text-white hover:text-red-400 font-semibold transition-colors border border-white/10 hover:border-red-500/20 cursor-pointer">
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
