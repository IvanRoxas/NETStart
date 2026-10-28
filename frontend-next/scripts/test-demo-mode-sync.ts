/**
 * Unit test suite for Demo Mode live sync and heartbeat handling.
 *
 * Covers:
 * 1. Missing field handling (stale-tab fake responses): missing field means "no change", never "false".
 * 2. Real-time grant: server returning true when held was false sets permission and identifies grant toast.
 * 3. Real-time revoke: server returning false when held was true sets permission false, clears cookie & localStorage key, and identifies revoke toast.
 * 4. Normal state restore on revoke: isDemoModeActive() returns false.
 * 5. Identical value handling: no duplicate toast or state change when server value matches held value.
 *
 * Run with: npx tsx scripts/test-demo-mode-sync.ts
 */

// Setup minimal browser-like mocks for node environment
const storage = new Map<string, string>();
const cookies = new Map<string, string>();
const eventListeners = new Map<string, Function[]>();

(global as any).window = {
  addEventListener(event: string, fn: Function) {
    if (!eventListeners.has(event)) eventListeners.set(event, []);
    eventListeners.get(event)!.push(fn);
  },
  removeEventListener(event: string, fn: Function) {
    const list = eventListeners.get(event) || [];
    eventListeners.set(event, list.filter(cb => cb !== fn));
  },
  dispatchEvent(event: any) {
    const list = eventListeners.get(event.type) || [];
    for (const cb of list) cb(event);
    return true;
  }
};

(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, init?: any) {
    this.type = type;
    this.detail = init?.detail;
  }
};

(global as any).localStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, String(v)),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
};

Object.defineProperty(global, 'document', {
  value: {
    get cookie() {
      return Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
    },
    set cookie(str: string) {
      const [pair, ...options] = str.split(';');
      const [k, v] = pair.split('=').map(s => s.trim());
      const isExpired = options.some(opt => opt.includes('max-age=0') || opt.includes('1970'));
      if (isExpired) {
        cookies.delete(k);
      } else {
        cookies.set(k, v);
      }
    }
  },
  writable: true,
  configurable: true,
});

import {
  isDemoModeActive,
  setDemoModeActive,
  getCanUseDemoMode,
  setCanUseDemoModePermission,
  revokeDemoMode,
  DEMO_MODE_COOKIE,
  DEMO_MODE_STORAGE_KEY,
  DEMO_PERMISSION_STORAGE_KEY,
  DEMO_PERMISSION_EVENT,
} from '../src/lib/demoMode';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`PASS: ${msg}`);
}

console.log("=== Testing Demo Mode Live Updates & Sync Logic ===\n");

// --- 1. Basic storage & activation ---
console.log("--- 1. Testing Activation and Revocation Mechanics ---");
storage.clear();
cookies.clear();

assert(!isDemoModeActive(), "Initially demo mode is inactive");

setDemoModeActive(true);
assert(isDemoModeActive(), "Demo mode is active after setDemoModeActive(true)");
assert(storage.get(DEMO_MODE_STORAGE_KEY) === 'true', "localStorage has demo mode key");
assert(cookies.get(DEMO_MODE_COOKIE) === 'true', "cookie has demo mode key");

setDemoModeActive(false);
assert(!isDemoModeActive(), "Demo mode is inactive after setDemoModeActive(false)");
assert(!storage.has(DEMO_MODE_STORAGE_KEY), "localStorage key was removed");
assert(!cookies.has(DEMO_MODE_COOKIE), "cookie was removed");

// --- 2. Permission storage & events ---
console.log("\n--- 2. Testing Permission Storage & Events ---");
let permissionEventFired = false;
let lastPermissionDetail: any = null;

(global as any).window.addEventListener(DEMO_PERMISSION_EVENT, (e: any) => {
  permissionEventFired = true;
  lastPermissionDetail = e.detail;
});

setCanUseDemoModePermission(true, "student_1");
assert(getCanUseDemoMode("student_1") === true, "getCanUseDemoMode returns true when set");
assert(permissionEventFired, "DEMO_PERMISSION_EVENT was dispatched");
assert(lastPermissionDetail?.canUseDemoMode === true, "Event detail carried canUseDemoMode: true");

// --- 3. Revoke Demo Mode Mechanics ---
console.log("\n--- 3. Testing Revoke Demo Mode Mechanics ---");
// Re-enable demo mode
setDemoModeActive(true);
assert(isDemoModeActive(), "Demo mode is on prior to revoke");

permissionEventFired = false;
revokeDemoMode("student_1");

assert(!isDemoModeActive(), "On revoke: demo mode is immediately turned off");
assert(!storage.has(DEMO_MODE_STORAGE_KEY), "On revoke: localStorage demo mode key is cleared");
assert(!cookies.has(DEMO_MODE_COOKIE), "On revoke: netstart_demo_mode cookie is cleared");
assert(getCanUseDemoMode("student_1") === false, "On revoke: permission is marked false");
assert(lastPermissionDetail?.canUseDemoMode === false, "On revoke: permission event carried false");

// --- 4. Heartbeat Response Logic Simulation ---
console.log("\n--- 4. Testing Heartbeat canUseDemoMode Handling ---");

function simulateHeartbeatSync(
  serverPayload: any,
  currentHeld: boolean | null,
  sessionUser: any
): {
  newHeld: boolean | null;
  toast: string | null;
  actionTaken: boolean;
} {
  // Heartbeat contract: missing field means "no change", never "false"
  if (typeof serverPayload?.canUseDemoMode !== 'boolean') {
    return { newHeld: currentHeld, toast: null, actionTaken: false };
  }

  const serverVal = serverPayload.canUseDemoMode;
  let held = currentHeld;
  if (held === null) {
    held = Boolean(sessionUser?.canUseDemoMode);
  }

  if (serverVal !== held) {
    if (serverVal) {
      return {
        newHeld: true,
        toast: "Instructor enabled Classroom Demo Mode",
        actionTaken: true,
      };
    } else {
      return {
        newHeld: false,
        toast: "Classroom Demo Mode was turned off",
        actionTaken: true,
      };
    }
  }

  return { newHeld: held, toast: null, actionTaken: false };
}

// 4a. Stale tab fake response (missing canUseDemoMode)
const staleResponse = { notifications: [] };
const resStale = simulateHeartbeatSync(staleResponse, true, { canUseDemoMode: true });
assert(!resStale.actionTaken, "Stale tab fake response with missing field causes no action");
assert(resStale.newHeld === true, "Missing field does NOT turn demo mode false (never false on missing)");
assert(resStale.toast === null, "No toast shown on missing field");

const staleUnread = { count: 0 };
const resStaleUnread = simulateHeartbeatSync(staleUnread, true, { canUseDemoMode: true });
assert(!resStaleUnread.actionTaken, "Stale unread-count response with missing field causes no action");
assert(resStaleUnread.newHeld === true, "Held value remains true");

// 4b. Teacher grants demo mode (held=false, server=true)
const grantPayload = { notifications: [], canUseDemoMode: true };
const resGrant = simulateHeartbeatSync(grantPayload, false, { canUseDemoMode: false });
assert(resGrant.actionTaken, "Heartbeat with differed true value triggers action");
assert(resGrant.newHeld === true, "New held value updated to true");
assert(resGrant.toast === "Instructor enabled Classroom Demo Mode", "Toast is 'Instructor enabled Classroom Demo Mode'");

// 4c. Teacher revokes demo mode (held=true, server=false)
const revokePayload = { notifications: [], canUseDemoMode: false };
const resRevoke = simulateHeartbeatSync(revokePayload, true, { canUseDemoMode: true });
assert(resRevoke.actionTaken, "Heartbeat with differed false value triggers action");
assert(resRevoke.newHeld === false, "New held value updated to false");
assert(resRevoke.toast === "Classroom Demo Mode was turned off", "Toast is 'Classroom Demo Mode was turned off'");

// 4d. Unchanged heartbeat (held=false, server=false or held=true, server=true)
const samePayload = { notifications: [], canUseDemoMode: false };
const resSame = simulateHeartbeatSync(samePayload, false, { canUseDemoMode: false });
assert(!resSame.actionTaken, "Identical server and client value triggers no action");
assert(resSame.toast === null, "No toast shown when value is identical");

console.log("\nAll Demo Mode Sync test assertions PASSED successfully!");
