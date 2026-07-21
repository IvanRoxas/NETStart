"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedState = localStorage.getItem("sidebar_minimized");
    if (storedState === "true") {
      setIsMinimized(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsMinimized(prev => {
      const nextState = !prev;
      localStorage.setItem("sidebar_minimized", String(nextState));
      return nextState;
    });
  };

  // Prevent flicker on first render by not animating width if not mounted
  const sidebarWidthClass = !isMounted ? (isMinimized ? 'w-20' : 'w-64') : (isMinimized ? 'w-20' : 'w-64');


  const navLinks = [
    {
      name: "Home",
      path: "/dashboard",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      )
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      )
    },
    {
      name: "Missions",
      path: "/modules",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
        </svg>
      )
    },
    {
      name: "Rewards",
      path: "/rewards",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      )
    },
    {
      name: "Notifications",
      path: "/notifications",
      category: "System",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
      )
    },
    {
      name: "Settings",
      path: "/settings",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    }
  ];

  return (
    <aside 
      className={`border-r border-white/5 bg-[#150524]/60 backdrop-blur-xl flex-shrink-0 flex flex-col z-20 h-full transition-all duration-300 ease-in-out relative ${sidebarWidthClass}`}
    >
      {/* Toggle Button (Middle Semicircle) */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-16 bg-[#ff912d] text-white rounded-r-xl rounded-l-none flex items-center justify-center cursor-pointer shadow-lg z-50 hover:bg-orange-400 transition-colors border border-white/10 border-l-0"
        title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
      >
        <svg 
          className={`w-3 h-3 transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Brand */}
      <div className={`p-6 flex items-center gap-3 transition-all duration-300 h-24 ${isMinimized ? 'justify-center px-0' : 'px-8'}`}>
        <div className="w-10 h-10 flex-shrink-0 relative flex items-center justify-center">
          <Image 
            src="/NETStartIcon.png" 
            alt="NETStart Logo" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>
        {!isMinimized && (
          <span className="font-display font-bold text-2xl tracking-wide text-white whitespace-nowrap animate-fade-in leading-none pt-1">
            NET<span className="text-[#ff912d]">Start</span>
          </span>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          
          return (
            <React.Fragment key={link.path}>
              {link.category && !isMinimized && (
                <div className="mt-6 mb-2 px-4 text-xs uppercase tracking-widest text-white/40 font-semibold animate-fade-in">
                  {link.category}
                </div>
              )}
              {link.category && isMinimized && (
                <div className="mt-6 mb-2 w-full flex justify-center">
                  <div className="w-6 h-[1px] bg-white/10 rounded-full"></div>
                </div>
              )}
              
              <Link 
                href={link.path} 
                className={`flex items-center gap-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden ${
                  isMinimized ? 'px-0 justify-center w-12 h-12 mx-auto' : 'px-4 w-full'
                } ${
                  isActive 
                    ? 'bg-orange-500/10 text-[#ff912d] font-semibold border border-orange-500/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={isMinimized ? link.name : undefined}
              >
                {isActive && !isMinimized && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff912d] rounded-r-full"></div>
                )}
                {isActive && isMinimized && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ff912d] rounded-full"></div>
                )}
                
                <div className={`${isActive ? 'text-[#ff912d]' : ''}`}>
                  {link.icon}
                </div>

                {!isMinimized && (
                  <span className="whitespace-nowrap">{link.name}</span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className={`p-6 border-t border-white/5 flex transition-all duration-300 ${isMinimized ? 'justify-center px-2' : ''}`}>
        <div className="w-full">
          <LogoutButton isMinimized={isMinimized} />
        </div>
      </div>
    </aside>
  );
}
