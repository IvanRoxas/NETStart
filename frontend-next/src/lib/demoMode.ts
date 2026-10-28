"use client";

import { useState, useEffect, useCallback } from 'react';

export const DEMO_MODE_COOKIE = 'netstart_demo_mode';
export const DEMO_MODE_STORAGE_KEY = 'netstart_demo_mode';
export const DEMO_PERMISSION_PREFIX = 'netstart_can_use_demo_mode_';
export const DEMO_PERMISSION_EVENT = 'netstart:demo_permission_changed';

/**
 * Returns true if Demo Mode is enabled in client storage or cookies.
 */
export function isDemoModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const local = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    if (local === 'true') return true;
    if (document.cookie.split('; ').some(row => row.startsWith(`${DEMO_MODE_COOKIE}=true`))) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Returns true/false if canUseDemoMode permission is stored in client storage for this specific user id,
 * or null if unset or if userId is not provided.
 * Does not fall back to any generic key.
 */
export function getCanUseDemoMode(userId?: string | null): boolean | null {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const stored = localStorage.getItem(`${DEMO_PERMISSION_PREFIX}${userId}`);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * Sets the canUseDemoMode permission strictly for this specific user id and dispatches a window event.
 * If userId is missing, does nothing.
 */
export function setCanUseDemoModePermission(userId: string | null | undefined, allowed: boolean): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    localStorage.setItem(`${DEMO_PERMISSION_PREFIX}${userId}`, String(allowed));
    window.dispatchEvent(new CustomEvent(DEMO_PERMISSION_EVENT, { detail: { canUseDemoMode: allowed, userId } }));
  } catch (e) {
    console.warn("Could not set demo mode permission:", e);
  }
}

/**
 * Enables or disables Demo Mode across localStorage and cookies,
 * notifying all listening components via a window event.
 */
export function setDemoModeActive(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true');
      document.cookie = `${DEMO_MODE_COOKIE}=true; path=/; max-age=86400; SameSite=Lax`;
    } else {
      localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
      document.cookie = `${DEMO_MODE_COOKIE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    }
    window.dispatchEvent(new CustomEvent('netstart:demo_mode_changed', { detail: { enabled } }));
  } catch (e) {
    console.warn("Could not set demo mode:", e);
  }
}

/**
 * On revoke: turn demo mode off immediately on the student's side,
 * clear the netstart_demo_mode cookie and the localStorage key.
 */
export function revokeDemoMode(userId?: string | null): void {
  if (userId) {
    setCanUseDemoModePermission(userId, false);
  }
  setDemoModeActive(false);
}

/**
 * Clears demo permission keys (and demo mode active flag) on logout or whenever the logged-in user changes.
 */
export function clearDemoModeStorage(userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.removeItem(`${DEMO_PERMISSION_PREFIX}${userId}`);
    }
    // Remove any user-keyed demo permission entries
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(DEMO_PERMISSION_PREFIX) || key === 'netstart_can_use_demo_mode')) {
        localStorage.removeItem(key);
      }
    }
    setDemoModeActive(false);
  } catch (e) {
    console.warn("Could not clear demo storage:", e);
  }
}

export type DemoHeartbeatAction = 'none' | 'adopt_silent' | 'grant' | 'revoke';

export interface DemoHeartbeatDecision {
  action: DemoHeartbeatAction;
  toast: string | null;
  newHeld: boolean | null;
}

/**
 * Pure decision function for demo mode heartbeat sync.
 *
 * Rules:
 * - A missing or non-boolean field means "no change", never "false".
 * - A heartbeat value that arrives when there is no stored value for this user (heldValue === null)
 *   is adopted silently (no toast).
 * - A toast is shown ONLY when a previously held value for the same user changes.
 *
 * @param serverValue - Value returned by server in heartbeat (boolean or unknown)
 * @param heldValue - Value currently held by client for this user (boolean if set, null if unset)
 */
export function decideDemoHeartbeat(
  serverValue: unknown,
  heldValue: boolean | null
): DemoHeartbeatDecision {
  // Missing or non-boolean: missing field means "no change", never "false"
  if (typeof serverValue !== 'boolean') {
    return {
      action: 'none',
      toast: null,
      newHeld: heldValue,
    };
  }

  // When there is no stored/held value for this user: adopted silently (no toast)
  if (heldValue === null) {
    return {
      action: 'adopt_silent',
      toast: null,
      newHeld: serverValue,
    };
  }

  // When identical to held value: no change, no toast
  if (serverValue === heldValue) {
    return {
      action: 'none',
      toast: null,
      newHeld: heldValue,
    };
  }

  // Value differed from previously held value:
  if (serverValue === true) {
    return {
      action: 'grant',
      toast: 'Instructor enabled Classroom Demo Mode',
      newHeld: true,
    };
  } else {
    return {
      action: 'revoke',
      toast: 'Classroom Demo Mode was turned off',
      newHeld: false,
    };
  }
}

/**
 * React hook to read and toggle Demo Mode state and live permission with real-time sync across components.
 * Server-rendered initial prop wins over localStorage on first render.
 */
export function useDemoMode(initialCanUseDemoMode?: boolean, userId?: string | null) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [canUseDemoMode, setCanUseDemoMode] = useState<boolean | null>(() => {
    // Server-rendered initial prop wins over localStorage on first render
    if (typeof initialCanUseDemoMode === 'boolean') return initialCanUseDemoMode;
    return getCanUseDemoMode(userId);
  });

  useEffect(() => {
    setIsDemoMode(isDemoModeActive());

    if (typeof initialCanUseDemoMode === 'boolean') {
      setCanUseDemoMode(initialCanUseDemoMode);
      if (userId) {
        setCanUseDemoModePermission(userId, initialCanUseDemoMode);
      }
    } else {
      const stored = getCanUseDemoMode(userId);
      if (stored !== null) {
        setCanUseDemoMode(stored);
      }
    }

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.enabled === 'boolean') {
        setIsDemoMode(customEvent.detail.enabled);
      } else {
        setIsDemoMode(isDemoModeActive());
      }
    };

    const handlePermissionSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ canUseDemoMode: boolean; userId?: string }>;
      if (customEvent.detail && typeof customEvent.detail.canUseDemoMode === 'boolean') {
        // If event specifies a userId and hook specifies a userId, only apply if they match
        if (userId && customEvent.detail.userId && customEvent.detail.userId !== userId) {
          return;
        }
        const allowed = customEvent.detail.canUseDemoMode;
        setCanUseDemoMode(allowed);
        if (!allowed) {
          setIsDemoMode(false);
        }
      } else {
        const stored = getCanUseDemoMode(userId);
        if (stored !== null) setCanUseDemoMode(stored);
      }
    };

    window.addEventListener('netstart:demo_mode_changed', handleSync);
    window.addEventListener(DEMO_PERMISSION_EVENT, handlePermissionSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('netstart:demo_mode_changed', handleSync);
      window.removeEventListener(DEMO_PERMISSION_EVENT, handlePermissionSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [initialCanUseDemoMode, userId]);

  const toggleDemoMode = useCallback((override?: boolean) => {
    const nextState = typeof override === 'boolean' ? override : !isDemoModeActive();
    setDemoModeActive(nextState);
    setIsDemoMode(nextState);
    return nextState;
  }, []);

  return { isDemoMode, canUseDemoMode, toggleDemoMode, setDemoMode: setDemoModeActive };
}
