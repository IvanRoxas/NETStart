"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AlertCircle, LogOut, Rocket, X, Pause } from "lucide-react";

interface NavigationGuardContextType {
  isInLevel: boolean;
  setIsInLevel: (inLevel: boolean) => void;
  registerSaveHandler: (handler: () => Promise<void>) => void;
  unregisterSaveHandler: () => void;
  requestNavigation: (path: string) => void;
  requestLogout: () => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(undefined);

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // If path is /sandbox, we consider the user inside an active level
  const [isInLevelState, setIsInLevelState] = useState(false);
  const isInLevel = isInLevelState || pathname === "/sandbox";

  const saveHandlerRef = useRef<(() => Promise<void>) | null>(null);

  // Modals state
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pending action: either a destination route string or 'LOGOUT'
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const registerSaveHandler = useCallback((handler: () => Promise<void>) => {
    saveHandlerRef.current = handler;
  }, []);

  const unregisterSaveHandler = useCallback(() => {
    saveHandlerRef.current = null;
  }, []);

  const setIsInLevel = useCallback((inLevel: boolean) => {
    setIsInLevelState(inLevel);
  }, []);

  const requestNavigation = useCallback((path: string) => {
    if (isInLevel && pathname !== path) {
      setPendingAction(path);
      setIsSuspendModalOpen(true);
    } else {
      router.push(path);
    }
  }, [isInLevel, pathname, router]);

  const requestLogout = useCallback(() => {
    if (isInLevel) {
      setPendingAction("LOGOUT");
      setIsSuspendModalOpen(true);
    } else {
      setPendingAction("LOGOUT");
      setIsLogoutModalOpen(true);
    }
  }, [isInLevel]);

  const handleCancelSuspend = () => {
    setIsSuspendModalOpen(false);
    setPendingAction(null);
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      if (saveHandlerRef.current) {
        await saveHandlerRef.current();
      }
    } catch (err) {
      console.error("Failed to save level state before exit:", err);
    } finally {
      setIsSaving(false);
    }

    const action = pendingAction;
    setIsSuspendModalOpen(false);

    if (action === "LOGOUT") {
      // Seamless modal chaining: immediately mount global logout modal
      setPendingAction("LOGOUT");
      setIsLogoutModalOpen(true);
    } else if (action) {
      setPendingAction(null);
      router.push(action);
    }
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
    setPendingAction(null);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <NavigationGuardContext.Provider
      value={{
        isInLevel,
        setIsInLevel,
        registerSaveHandler,
        unregisterSaveHandler,
        requestNavigation,
        requestLogout,
      }}
    >
      {children}

      {/* PHASE 1: Suspend Simulation Modal */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a082c]/95 border-2 border-[#ff912d]/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,145,45,0.25)] flex flex-col items-center text-center relative overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={handleCancelSuspend}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/10 cursor-pointer"
              title="Cancel"
            >
              <X size={18} />
            </button>

            {/* Glowing Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#ff912d]/15 border border-[#ff912d]/40 flex items-center justify-center text-[#ff912d] mb-4 shadow-[0_0_20px_rgba(255,145,45,0.3)]">
              <Rocket size={26} className="animate-pulse" />
            </div>

            {/* Title & Body */}
            <h3 className="text-xl sm:text-2xl font-black font-display text-white uppercase tracking-wider mb-2">
              LEAVE THE GAME?
            </h3>
            <p className="text-sm text-gray-300 font-sans leading-relaxed mb-6">
              Leaving this level will save your progress, do you wish to proceed?
            </p>

            {/* Actions */}
            <div className="w-full flex items-center gap-3">
              <button
                onClick={handleCancelSuspend}
                disabled={isSaving}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndExit}
                disabled={isSaving}
                className="flex-1 py-3 px-4 rounded-xl bg-[#ff912d] hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ff912d]/25 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSaving ? "Saving..." : "Save & Exit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a082c]/95 border-2 border-yellow-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.25)] flex flex-col items-center text-center relative overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={handleCancelLogout}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/10 cursor-pointer"
              title="Cancel"
            >
              <X size={18} />
            </button>

            {/* Glowing Icon */}
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/15 border border-yellow-500/40 flex items-center justify-center text-yellow-400 mb-4 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <LogOut size={26} />
            </div>

            {/* Title & Body */}
            <h3 className="text-xl sm:text-2xl font-black font-display text-white uppercase tracking-wider mb-2">
              LOG OUT
            </h3>
            <p className="text-sm text-gray-300 font-sans leading-relaxed mb-6">
              Are you sure you want to log out of NETStart?
            </p>

            {/* Actions */}
            <div className="w-full flex items-center gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-[#ff912d] hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ff912d]/25 active:scale-95 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error("useNavigationGuard must be used within a NavigationGuardProvider");
  }
  return context;
}
