"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  isMinimized?: boolean;
}

export default function LogoutButton({ isMinimized = false }: LogoutButtonProps) {
  const handleLogout = async () => {
    // Triggers NextAuth's signOut and forces a redirect to /login
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button 
      onClick={handleLogout}
      title={isMinimized ? "Sign Out" : undefined}
      className={`flex items-center gap-2 py-3 text-white/80 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors w-full cursor-pointer border border-transparent hover:border-red-400/20 group relative ${
        isMinimized ? 'justify-center px-0 w-12 h-12 mx-auto' : 'justify-center px-4'
      }`}
      aria-label="Sign Out"
    >
      <svg className={`w-5 h-5 flex-shrink-0 ${isMinimized ? 'group-hover:-translate-x-1 transition-transform' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
      {!isMinimized && <span className="whitespace-nowrap">Sign Out</span>}
    </button>
  );
}
