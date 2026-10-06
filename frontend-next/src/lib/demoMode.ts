"use client";

import { useState, useEffect, useCallback } from 'react';

export const DEMO_MODE_COOKIE = 'netstart_demo_mode';
export const DEMO_MODE_STORAGE_KEY = 'netstart_demo_mode';

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
 * React hook to read and toggle Demo Mode state with real-time sync across components.
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    setIsDemoMode(isDemoModeActive());

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.enabled === 'boolean') {
        setIsDemoMode(customEvent.detail.enabled);
      } else {
        setIsDemoMode(isDemoModeActive());
      }
    };

    window.addEventListener('netstart:demo_mode_changed', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('netstart:demo_mode_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const toggleDemoMode = useCallback((override?: boolean) => {
    const nextState = typeof override === 'boolean' ? override : !isDemoModeActive();
    setDemoModeActive(nextState);
    setIsDemoMode(nextState);
    return nextState;
  }, []);

  return { isDemoMode, toggleDemoMode, setDemoMode: setDemoModeActive };
}
