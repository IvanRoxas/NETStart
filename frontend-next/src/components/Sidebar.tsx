"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { useNavigationGuard } from "@/context/NavigationGuardContext";
import { getUserStorageItem, setUserStorageItem } from "@/lib/userStorage";
import { useDemoMode } from "@/lib/demoMode";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isInLevel, requestNavigation } = useNavigationGuard();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const canUseDemoMode = Boolean((session?.user as any)?.canUseDemoMode);
  const { isDemoMode } = useDemoMode();

  const asideRef = useRef<HTMLElement>(null);
  const sandboxRef = useRef<HTMLAnchorElement>(null);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sandbox Lock & Indicator States
  const [isSandboxUnlocked, setIsSandboxUnlocked] = useState(false);
  const effectiveSandboxUnlocked = isSandboxUnlocked || (canUseDemoMode && isDemoMode);
  const [hasClickedSandboxNew, setHasClickedSandboxNew] = useState(true);
  const [sandboxOffsetTop, setSandboxOffsetTop] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedState = localStorage.getItem("sidebar_minimized");
    const isMin = storedState === "true";
    if (isMin) {
      setIsMinimized(true);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sidebar_change", { detail: { isMinimized: isMin } }));
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    // 1. Instant check from user-scoped storage
    const localUnlocked = getUserStorageItem("sandbox_unlocked", userId) === "true";
    if (localUnlocked) {
      setIsSandboxUnlocked(true);
    }
    const clickedNew = getUserStorageItem("sandbox_new_clicked", userId) === "true";
    setHasClickedSandboxNew(clickedNew);

    // 2. Fetch server truth from database
    const fetchSandboxStatus = () => {
      fetch(`/api/sandbox/status?t=${Date.now()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.isUnlocked) {
            setIsSandboxUnlocked(true);
            setUserStorageItem("sandbox_unlocked", "true", userId);
          }
        })
        .catch(() => {});
    };

    fetchSandboxStatus();

    // 3. Listen to real-time events from mission completions
    const handleSandboxUnlocked = () => {
      setIsSandboxUnlocked(true);
      setUserStorageItem("sandbox_unlocked", "true", userId);
    };

    window.addEventListener("sandbox_unlocked", handleSandboxUnlocked);
    window.addEventListener("notifications_updated", fetchSandboxStatus);

    return () => {
      window.removeEventListener("sandbox_unlocked", handleSandboxUnlocked);
      window.removeEventListener("notifications_updated", fetchSandboxStatus);
    };
  }, [userId]);

  // Dynamically calculate Sandbox item position to anchor external floating badge
  const updateSandboxPosition = useCallback(() => {
    if (sandboxRef.current && asideRef.current) {
      const asideRect = asideRef.current.getBoundingClientRect();
      const linkRect = sandboxRef.current.getBoundingClientRect();
      setSandboxOffsetTop(linkRect.top - asideRect.top + linkRect.height / 2);
    }
  }, []);

  useEffect(() => {
    updateSandboxPosition();
    const handleResize = () => updateSandboxPosition();
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(updateSandboxPosition, 350);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [updateSandboxPosition, isMinimized, isMounted, effectiveSandboxUnlocked]);

  const showLockedToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSandboxClick = () => {
    if (!hasClickedSandboxNew) {
      setHasClickedSandboxNew(true);
      if (userId) {
        setUserStorageItem("sandbox_new_clicked", "true", userId);
      }
    }
  };

  const toggleSidebar = () => {
    setIsMinimized(prev => {
      const nextState = !prev;
      localStorage.setItem("sidebar_minimized", String(nextState));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sidebar_change", { detail: { isMinimized: nextState } }));
      }
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
      name: "Sandbox",
      path: "/code-sandbox",
      isSandbox: true,
      icon: !effectiveSandboxUnlocked ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0 text-white/40">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </svg>
      )
    },
    {
      name: "Rewards",
      path: "/shop",
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
      ref={asideRef}
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
            src="/assets/global/badges/NETStartIcon.png" 
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
      <nav 
        onScroll={updateSandboxPosition}
        className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden"
      >
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          const isSandboxLink = link.path === "/code-sandbox";
          const isLocked = isSandboxLink && !effectiveSandboxUnlocked;
          
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
                ref={isSandboxLink ? sandboxRef : undefined}
                href={link.path} 
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    showLockedToast("Complete the Moon tutorial and all 3 levels to unlock the Code Sandbox.");
                    return;
                  }

                  if (isSandboxLink) {
                    handleSandboxClick();
                  }

                  if (isInLevel) {
                    e.preventDefault();
                    requestNavigation(link.path);
                  }
                }}
                className={`flex items-center gap-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden ${
                  isMinimized ? 'px-0 justify-center w-12 h-12 mx-auto' : 'px-4 w-full'
                } ${
                  isLocked
                    ? 'opacity-60 cursor-not-allowed hover:bg-white/5 text-white/40 border border-transparent'
                    : isActive 
                    ? 'bg-orange-500/10 text-[#ff912d] font-semibold border border-orange-500/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={isMinimized ? (isLocked ? "Sandbox (Locked: Complete Moon tutorial)" : link.name) : undefined}
              >
                {isActive && !isMinimized && !isLocked && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff912d] rounded-r-full"></div>
                )}
                {isActive && isMinimized && !isLocked && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ff912d] rounded-full"></div>
                )}
                
                <div className={`relative ${isActive && !isLocked ? 'text-[#ff912d]' : ''}`}>
                  {link.icon}
                </div>

                {!isMinimized && (
                  <span className="whitespace-nowrap">{link.name}</span>
                )}

                {/* Subtitle locked badge for expanded sidebar */}
                {!isMinimized && isLocked && (
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/5">
                    Locked
                  </span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Floating External Bouncing "NEW" Indicator Callout */}
      {/* Appears outside the sidebar to the right, pointing directly to the Sandbox icon */}
      {effectiveSandboxUnlocked && !hasClickedSandboxNew && sandboxOffsetTop !== null && (
        <div
          aria-label="New feature notice"
          style={{ top: `${sandboxOffsetTop}px` }}
          className="absolute left-full -translate-y-1/2 ml-3.5 z-50 pointer-events-auto select-none"
        >
          <button
            type="button"
            onClick={() => {
              handleSandboxClick();
              if (isInLevel) {
                requestNavigation("/code-sandbox");
              } else {
                router.push("/code-sandbox");
              }
            }}
            className="flex items-center group cursor-pointer animate-bounce-horizontal focus:outline-none"
            title="Click to explore the newly unlocked Code Sandbox"
          >
            {/* Seamless triangular pointer arrow pointing directly inward at the Sandbox icon */}
            <svg
              className="w-2.5 h-4 -mr-[1px] text-[#ff912d] drop-shadow-[0_0_8px_rgba(255,145,45,0.85)] shrink-0 transition-transform group-hover:scale-110"
              viewBox="0 0 10 16"
              fill="currentColor"
            >
              <polygon points="0,8 10,1 10,15" />
            </svg>

            {/* Pill Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ff912d] via-orange-500 to-[#ff5722] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,145,45,0.7)] border border-white/30 whitespace-nowrap group-hover:scale-105 active:scale-95 transition-transform">
              <Sparkles className="w-3.5 h-3.5 fill-amber-200 text-amber-200 animate-spin shrink-0" style={{ animationDuration: "3s" }} />
              <span className="font-extrabold tracking-widest text-[11px] drop-shadow-sm">NEW</span>
              <span className="font-medium text-[11px] capitalize tracking-normal text-white/95">Sandbox</span>
            </div>
          </button>
        </div>
      )}

      {/* Bottom Actions */}
      <div className={`p-4 border-t border-white/5 flex items-center transition-all duration-300 ${isMinimized ? 'justify-center px-0' : 'px-4'}`}>
        <LogoutButton isMinimized={isMinimized} />
      </div>

      {/* Custom UI Toast for Locked Sandbox Notice (Portaled to document.body to break out of sidebar containing block) */}
      {toastMessage && isMounted && typeof document !== "undefined" && createPortal(
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100000] max-w-lg w-[calc(100%-2rem)] sm:w-auto bg-[#1a0826]/95 border border-[#ff912d]/50 rounded-2xl px-5 py-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(255,145,45,0.2)] backdrop-blur-xl flex items-center justify-between gap-4 text-white animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0 text-[#ff912d] shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ff912d]">
                Sandbox Locked
              </span>
              <span className="text-xs text-white/90 font-medium whitespace-nowrap">
                {toastMessage}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/40 hover:text-white rounded-full p-1.5 hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
            title="Dismiss notice"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>,
        document.body
      )}
    </aside>
  );
}
