"use client";

import { useState, useEffect, useCallback } from 'react';

export const DEMO_MODE_COOKIE = 'netstart_demo_mode';
export const DEMO_MODE_STORAGE_KEY = 'netstart_demo_mode';
export const DEMO_PERMISSION_STORAGE_KEY = 'netstart_can_use_demo_mode';
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
 * Returns true/false if canUseDemoMode permission is stored in client storage, or null if unset.
 */
export function getCanUseDemoMode(userId?: string): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const userSpecificKey = userId ? `${DEMO_PERMISSION_STORAGE_KEY}_${userId}` : null;
    const stored = userSpecificKey ? localStorage.getItem(userSpecificKey) : null;
    const fallback = stored ?? localStorage.getItem(DEMO_PERMISSION_STORAGE_KEY);
    if (fallback === 'true') return true;
    if (fallback === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * Sets the canUseDemoMode permission across localStorage and dispatches a window event.
 */
export function setCanUseDemoModePermission(allowed: boolean, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_PERMISSION_STORAGE_KEY, String(allowed));
    if (userId) {
      localStorage.setItem(`${DEMO_PERMISSION_STORAGE_KEY}_${userId}`, String(allowed));
    }
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
export function revokeDemoMode(userId?: string): void {
  setCanUseDemoModePermission(false, userId);
  setDemoModeActive(false);
}

/**
 * React hook to read and toggle Demo Mode state and live permission with real-time sync across components.
 */
export function useDemoMode(initialCanUseDemoMode?: boolean) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [canUseDemoMode, setCanUseDemoMode] = useState<boolean | null>(() => {
    if (typeof initialCanUseDemoMode === 'boolean') return initialCanUseDemoMode;
    return getCanUseDemoMode();
  });

  useEffect(() => {
    setIsDemoMode(isDemoModeActive());

    const currentPermission = getCanUseDemoMode();
    if (currentPermission !== null) {
      setCanUseDemoMode(currentPermission);
    } else if (typeof initialCanUseDemoMode === 'boolean') {
      setCanUseDemoMode(initialCanUseDemoMode);
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
      const customEvent = e as CustomEvent<{ canUseDemoMode: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.canUseDemoMode === 'boolean') {
        const allowed = customEvent.detail.canUseDemoMode;
        setCanUseDemoMode(allowed);
        if (!allowed) {
          setIsDemoMode(false);
        }
      } else {
        const stored = getCanUseDemoMode();
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
  }, [initialCanUseDemoMode]);

  const toggleDemoMode = useCallback((override?: boolean) => {
    const nextState = typeof override === 'boolean' ? override : !isDemoModeActive();
    setDemoModeActive(nextState);
    setIsDemoMode(nextState);
    return nextState;
  }, []);

  return { isDemoMode, canUseDemoMode, toggleDemoMode, setDemoMode: setDemoModeActive };
}
