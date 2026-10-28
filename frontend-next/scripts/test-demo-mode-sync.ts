/**
 * Unit test suite for Demo Mode live sync, user-scoped storage, and heartbeat decision logic.
 *
 * Covers:
 * 1. Account isolation: Account A true then Account B false in the same storage.
 *    Account B must NOT inherit Account A, and must get NO toast (adopted silently).
 * 2. Missing field handling: missing/non-boolean field means "no change", never "false".
 * 3. Real-time revoke: revoke clears cookie, clears localStorage key, and turns demo mode off immediately.
 * 4. Real-time grant: server returning true when held was false sets permission and returns grant toast.
 * 5. Real-time revoke toast: server returning false when held was true returns revoke toast.
 * 6. Identical value handling: no action and no toast when server value matches held value.
 * 7. Storage cleanup on user change / logout via clearDemoModeStorage.
 *
 * Run with: npx tsx scripts/test-demo-mode-sync.ts
 */

// Setup browser environment mocks for Node test runner
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
  get length() {
    return storage.size;
  },
  key: (i: number) => Array.from(storage.keys())[i] ?? null,
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
  clearDemoModeStorage,
  decideDemoHeartbeat,
  DEMO_MODE_COOKIE,
  DEMO_MODE_STORAGE_KEY,
  DEMO_PERMISSION_PREFIX,
  DEMO_PERMISSION_EVENT,
} from '../src/lib/demoMode';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`PASS: ${msg}`);
}

console.log("=== Testing Demo Mode Live Updates & User Storage Isolation ===\n");

// --- 1. Account Isolation: Account A true, then Account B false in same storage ---
console.log("--- 1. Testing Account Isolation in Storage ---");
storage.clear();
cookies.clear();

// Account A is granted permission
setCanUseDemoModePermission("account_a", true);
assert(getCanUseDemoMode("account_a") === true, "Account A has canUseDemoMode = true");
assert(storage.get(`${DEMO_PERMISSION_PREFIX}account_a`) === 'true', "Account A stored under user-keyed storage");

// Account B checks storage: must NOT inherit Account A
const accountBHeld = getCanUseDemoMode("account_b");
assert(accountBHeld === null, "Account B has null stored value (does NOT inherit Account A)");

// Heartbeat arrives for Account B with server value = false
const decisionB = decideDemoHeartbeat(false, accountBHeld);
assert(decisionB.action === 'adopt_silent', "Account B adopts server value silently on first heartbeat");
assert(decisionB.toast === null, "Account B gets NO toast when adopting initial value");
assert(decisionB.newHeld === false, "Account B new held value is false");

// Store Account B's adopted value
setCanUseDemoModePermission("account_b", false);
assert(getCanUseDemoMode("account_b") === false, "Account B now stored as false");
assert(getCanUseDemoMode("account_a") === true, "Account A remains true and unaffected by Account B");

// --- 2. Missing field means no change (never false) ---
console.log("\n--- 2. Testing Missing Field Handling (Stale Tab / Missing Field) ---");
const missingDecision1 = decideDemoHeartbeat(undefined, true);
assert(missingDecision1.action === 'none', "Missing field (undefined) results in action: 'none'");
assert(missingDecision1.toast === null, "Missing field produces no toast");
assert(missingDecision1.newHeld === true, "Missing field preserves held value = true (never turns false)");

const missingDecision2 = decideDemoHeartbeat(null, true);
assert(missingDecision2.action === 'none', "Non-boolean field (null) results in action: 'none'");
assert(missingDecision2.newHeld === true, "Preserves held value");

const staleFakePayload: any = { notifications: [] }; // Stale tab fake response
const missingDecision3 = decideDemoHeartbeat(staleFakePayload.canUseDemoMode, true);
assert(missingDecision3.action === 'none', "Stale tab fake response without canUseDemoMode results in action: 'none'");
assert(missingDecision3.newHeld === true, "Stale tab does not turn demo mode false");

// --- 3. Real-time Grant shows a toast ---
console.log("\n--- 3. Testing Real-Time Grant ---");
const grantDecision = decideDemoHeartbeat(true, false);
assert(grantDecision.action === 'grant', "Decision action is 'grant'");
assert(grantDecision.toast === "Instructor enabled Classroom Demo Mode", "Grant toast text matches required message");
assert(grantDecision.newHeld === true, "New held value updated to true");

// --- 4. Real-time Revoke clears cookie, key, and shows a toast ---
console.log("\n--- 4. Testing Real-Time Revoke Mechanics ---");
// Turn demo mode on for student_1
setDemoModeActive(true);
setCanUseDemoModePermission("student_1", true);
assert(isDemoModeActive(), "Demo mode is currently ON");
assert(storage.get(DEMO_MODE_STORAGE_KEY) === 'true', "localStorage demo active key is set");
assert(cookies.get(DEMO_MODE_COOKIE) === 'true', "Cookie is set to true");

// Heartbeat returns false for student_1 who previously held true
const revokeDecision = decideDemoHeartbeat(false, true);
assert(revokeDecision.action === 'revoke', "Decision action is 'revoke'");
assert(revokeDecision.toast === "Classroom Demo Mode was turned off", "Revoke toast text matches required message");
assert(revokeDecision.newHeld === false, "New held value updated to false");

// Execute real revoke helper
revokeDemoMode("student_1");
assert(!isDemoModeActive(), "On revoke: demo mode is immediately turned OFF");
assert(!storage.has(DEMO_MODE_STORAGE_KEY), "On revoke: localStorage demo mode key is deleted");
assert(!cookies.has(DEMO_MODE_COOKIE), "On revoke: netstart_demo_mode cookie is expired/cleared");
assert(getCanUseDemoMode("student_1") === false, "On revoke: student_1 permission is stored as false");

// --- 5. Unchanged Value Produces No Action / No Toast ---
console.log("\n--- 5. Testing Unchanged Values ---");
const unchangedTrue = decideDemoHeartbeat(true, true);
assert(unchangedTrue.action === 'none', "Unchanged true produces action: 'none'");
assert(unchangedTrue.toast === null, "Unchanged true produces no toast");

const unchangedFalse = decideDemoHeartbeat(false, false);
assert(unchangedFalse.action === 'none', "Unchanged false produces action: 'none'");
assert(unchangedFalse.toast === null, "Unchanged false produces no toast");

// --- 6. Storage Cleanup on User Change / Logout ---
console.log("\n--- 6. Testing Storage Cleanup on Logout / User Change ---");
setCanUseDemoModePermission("user_leaving", true);
setDemoModeActive(true);
assert(getCanUseDemoMode("user_leaving") === true, "user_leaving has active permission");
assert(isDemoModeActive(), "Demo mode is active before logout");

clearDemoModeStorage("user_leaving");
assert(getCanUseDemoMode("user_leaving") === null, "user_leaving permission key was deleted on logout");
assert(!isDemoModeActive(), "Demo mode was turned off on logout");
assert(!storage.has(DEMO_MODE_STORAGE_KEY), "Demo mode active key removed");

console.log("\nAll Demo Mode Sync & User Storage Isolation tests PASSED successfully!");
