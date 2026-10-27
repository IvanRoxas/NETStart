"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AuthSyncContextType {
  isStale: boolean;
  currentUserId: string | null;
}

const AuthSyncContext = createContext<AuthSyncContextType>({
  isStale: false,
  currentUserId: null,
});

export const useAuthSync = () => useContext(AuthSyncContext);

interface AuthSyncProviderProps {
  children: React.ReactNode;
  realm?: "student" | "admin";
}

interface AuthSyncMessage {
  type: "LOGIN" | "LOGOUT" | "SESSION_CHANGE";
  userId: string | null;
  realm: "student" | "admin";
  senderTabId: string;
  timestamp: number;
}

// Stable tab identifier for this tab instance
const tabId = typeof window !== "undefined"
  ? (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `tab_${Math.random().toString(36).slice(2)}_${Date.now()}`)
  : "server_tab";

import { SessionMismatchResult } from "@/lib/sessionGuard";

export function triggerSessionMismatchOverlay() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("netstart:session_user_mismatch"));
  }
}

export function checkSessionMismatch(result: any): result is SessionMismatchResult {
  if (result && (result.code === "SESSION_USER_MISMATCH" || result.error === "SESSION_USER_MISMATCH")) {
    triggerSessionMismatchOverlay();
    return true;
  }
  return false;
}

export default function AuthSyncProvider({
  children,
  realm = "student",
}: AuthSyncProviderProps) {
  const { data: session, status } = useSession();
  const currentUserId = (session?.user as any)?.id || null;

  const [isStale, setIsStale] = useState(false);
  const initialUserIdRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const channelName = `netstart_auth_sync_${realm}`;
  const storageKey = `netstart_auth_sync_${realm}`;

  const broadcastAuthChange = (type: "LOGIN" | "LOGOUT", newUserId: string | null) => {
    const payload: AuthSyncMessage = {
      type,
      userId: newUserId,
      realm,
      senderTabId: tabId,
      timestamp: Date.now(),
    };

    // 1. BroadcastChannel API
    try {
      channelRef.current?.postMessage(payload);
    } catch {
      // ignore
    }

    // 2. localStorage storage event fallback
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  // Track initial user and broadcast local login/logout transitions
  useEffect(() => {
    if (status === "loading") return;

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      initialUserIdRef.current = currentUserId;

      if (currentUserId) {
        broadcastAuthChange("LOGIN", currentUserId);
      }
      return;
    }

    // Detect session change within this tab (e.g. window refocus refresh)
    if (initialUserIdRef.current && currentUserId !== initialUserIdRef.current) {
      setIsStale(true);
    } else if (!initialUserIdRef.current && currentUserId) {
      initialUserIdRef.current = currentUserId;
      broadcastAuthChange("LOGIN", currentUserId);
    } else if (initialUserIdRef.current && !currentUserId) {
      broadcastAuthChange("LOGOUT", null);
    }
  }, [currentUserId, status]);

  // Setup multi-tab communication channels
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleIncomingMessage = (msg: AuthSyncMessage) => {
      if (!msg || msg.senderTabId === tabId || msg.realm !== realm) return;

      const myUser = initialUserIdRef.current;
      // Stale condition: this tab was mounted with an active user, but another tab logged into a different user or logged out
      if (myUser && myUser !== msg.userId) {
        console.warn(
          `[AUTH_SYNC] Session change detected from tab ${msg.senderTabId}. Active user: ${myUser}, remote user: ${msg.userId}. Marking tab as stale.`
        );
        setIsStale(true);
      }
    };

    // 1. BroadcastChannel
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(channelName);
        channelRef.current = channel;

        channel.onmessage = (event: MessageEvent<AuthSyncMessage>) => {
          handleIncomingMessage(event.data);
        };
      } catch (err) {
        console.warn("[AUTH_SYNC] BroadcastChannel init error:", err);
      }
    }

    // 2. Storage event
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const data: AuthSyncMessage = JSON.parse(event.newValue);
        handleIncomingMessage(data);
      } catch {
        // ignore parse error
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      try {
        channel?.close();
      } catch {
        // ignore
      }
    };
  }, [realm]);

  // Listen for SESSION_USER_MISMATCH events triggered by server actions or sleeping tab responses
  useEffect(() => {
    const handleMismatchEvent = () => {
      console.warn("[AUTH_SYNC] SESSION_USER_MISMATCH event received. Marking tab as stale.");
      setIsStale(true);
    };
    window.addEventListener("netstart:session_user_mismatch", handleMismatchEvent);
    return () => {
      window.removeEventListener("netstart:session_user_mismatch", handleMismatchEvent);
    };
  }, []);

  // Intercept fetch to:
  // 1. Block outgoing writes if already marked stale
  // 2. Detect 409 SESSION_USER_MISMATCH from server responses (e.g. tabs that woke up from sleep)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const init = args[1];
      const method = (init?.method || "GET").toUpperCase();

      if (isStale && method !== "GET" && method !== "HEAD") {
        console.warn("[AUTH_SYNC] Stale tab write blocked:", args[0]);
        return new Response(
          JSON.stringify({
            error: "Session changed in another tab. Reload.",
            code: "SESSION_USER_MISMATCH",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      const response = await originalFetch(...args);

      if (response.status === 409) {
        try {
          const clone = response.clone();
          const body = await clone.json();
          if (body?.code === "SESSION_USER_MISMATCH" || body?.error === "SESSION_USER_MISMATCH") {
            console.warn("[AUTH_SYNC] Intercepted 409 SESSION_USER_MISMATCH on:", args[0]);
            setIsStale(true);
          }
        } catch {
          // Ignore non-json 409 responses
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isStale]);

  return (
    <AuthSyncContext.Provider value={{ isStale, currentUserId }}>
      {children}

      {/* Blocking Modal Overlay on Session Mismatch */}
      {isStale && (
        <div
          id="auth-session-mismatch-modal"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          style={{ pointerEvents: "auto" }}
        >
          <div className="bg-[#1e0a2d] border-2 border-[#ff912d] rounded-3xl p-7 sm:p-9 max-w-md w-full shadow-[0_0_50px_rgba(255,145,45,0.3)] space-y-6 text-center relative">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ff912d]/15 border-2 border-[#ff912d] flex items-center justify-center text-[#ff912d]">
              <AlertTriangle size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase tracking-wider">
                Session Changed
              </h2>
              <p className="text-sm text-gray-200 leading-relaxed font-sans">
                Your session changed in another tab. Reload to sync with your current account and prevent data collision.
              </p>
            </div>

            <div className="pt-2">
              <button
                id="auth-session-reload-btn"
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#ff912d] to-amber-500 hover:from-[#ff912d]/90 hover:to-amber-500/90 text-black font-black font-display text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <RefreshCw size={16} /> Reload
              </button>
            </div>

            <p className="text-[11px] font-mono text-gray-400">
              [DISPATCH: ACCOUNT PROTECTION GUARD ACTIVE]
            </p>
          </div>
        </div>
      )}
    </AuthSyncContext.Provider>
  );
}
