/**
 * User-Scoped Storage Utility
 * Prevents user progress, XP, completed missions, directives, and workspace XML
 * from bleeding across different accounts sharing the same browser/device.
 */

export function getScopedKey(key: string, userId?: string | null): string {
  if (!userId) return `netstart_${key}`;
  return `netstart_u_${userId}_${key}`;
}

export function getUserStorageItem(key: string, userId?: string | null): string | null {
  if (typeof window === 'undefined') return null;
  // If no userId is provided, do not allow reading other user's legacy un-scoped data
  if (!userId) return null;
  const scopedKey = getScopedKey(key, userId);
  return localStorage.getItem(scopedKey);
}

export function setUserStorageItem(key: string, value: string, userId?: string | null): void {
  if (typeof window === 'undefined' || !userId) return;
  const scopedKey = getScopedKey(key, userId);
  localStorage.setItem(scopedKey, value);
}

export function removeUserStorageItem(key: string, userId?: string | null): void {
  if (typeof window === 'undefined' || !userId) return;
  const scopedKey = getScopedKey(key, userId);
  localStorage.removeItem(scopedKey);
}

/**
 * Purge legacy un-scoped NetStart keys to avoid bleed from previous sessions
 */
export function clearLegacyUnscopedData(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove = [
      'netstart_player_xp',
      'netstart_completed_missions',
      'netstart_claimed_directives',
      'netstart_active_saved_level',
      'netstart_active_level',
      'netstart_last_animated_planet_idx',
      'netstart_planet_unlock_pending',
      'netstart_avatar_layers',
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;

      // DO NOT delete user audio preferences, general app settings, or auth data
      if (
        key.startsWith('netstart_bgm_') ||
        key.startsWith('netstart_remember_') ||
        key.startsWith('netstart_in_level') ||
        key.startsWith('netstart_demo_mode') ||
        key.startsWith('netstart_solution_timer_') ||
        key.startsWith('netstart_u_') ||
        key.startsWith('setting_')
      ) {
        continue;
      }

      // Only purge old un-scoped gameplay progress and workspace XML keys
      if (
        key.startsWith('netstart_saved_workspace_') ||
        key.startsWith('netstart_completed_sections_') ||
        key.startsWith('netstart_completed_goals_') ||
        key.startsWith('netstart_venus3_') ||
        key.startsWith('netstart_mercury3_') ||
        key.startsWith('netstart_earth2_') ||
        key.startsWith('netstart_jupiter2_') ||
        key.startsWith('netstart_saturn_')
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Could not clear legacy unscoped data:', e);
  }
}
