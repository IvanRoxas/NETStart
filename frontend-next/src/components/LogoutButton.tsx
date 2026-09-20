"use client";

import { useNavigationGuard } from "@/context/NavigationGuardContext";

interface LogoutButtonProps {
  isMinimized?: boolean;
}

export default function LogoutButton({ isMinimized = false }: LogoutButtonProps) {
  const { requestLogout } = useNavigationGuard();

  const handleLogout = () => {
    requestLogout();
  };

  return (
    <button 
      onClick={handleLogout}
      title={isMinimized ? "Sign Out" : undefined}
      className={`flex items-center text-white/80 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all duration-200 cursor-pointer border border-transparent hover:border-red-400/20 group relative overflow-hidden ${
        isMinimized 
          ? 'w-12 h-12 justify-center p-0 mx-auto' 
          : 'w-full py-3 px-4 justify-start gap-4'
      }`}
      aria-label="Sign Out"
    >
      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
      {!isMinimized && <span className="whitespace-nowrap">Sign Out</span>}
    </button>
  );
}
