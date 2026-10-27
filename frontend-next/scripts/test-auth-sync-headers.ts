/**
 * Automated test suite for buildExpectedUserHeader.
 *
 * Covers all required test cases:
 * 1. GET
 * 2. HEAD
 * 3. cross-origin POST
 * 4. same-origin non-/api path
 * 5. /api/auth/callback POST
 * 6. same-origin /api POST with no header
 * 7. live-id header already present (must be overridden with the pinned id)
 * 8. pinned null
 * 9. pinned "undefined"
 * 10. Request object input
 * 11. Headers instance input (verifying caller's Headers object is not mutated)
 *
 * Run with: npx tsx scripts/test-auth-sync-headers.ts
 */

import { buildExpectedUserHeader } from "../src/lib/authSyncHeaders";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

const BASE_ORIGIN = "http://localhost:3000";
const PINNED_ID = "pinned_user_student_123";

console.log("=== Testing buildExpectedUserHeader Decision Logic ===\n");

// 1. GET request -> do not attach
console.log("--- 1. Testing GET Request ---");
const resGet = buildExpectedUserHeader("/api/missions/complete", { method: "GET" }, PINNED_ID, BASE_ORIGIN);
assert(resGet.shouldAttach === false, "GET request should not attach x-expected-user-id");
assert(!resGet.headers.has("x-expected-user-id"), "GET request headers must not contain x-expected-user-id");

// 2. HEAD request -> do not attach
console.log("\n--- 2. Testing HEAD Request ---");
const resHead = buildExpectedUserHeader("/api/missions/complete", { method: "HEAD" }, PINNED_ID, BASE_ORIGIN);
assert(resHead.shouldAttach === false, "HEAD request should not attach x-expected-user-id");
assert(!resHead.headers.has("x-expected-user-id"), "HEAD request headers must not contain x-expected-user-id");

// 3. Cross-origin POST -> do not attach
console.log("\n--- 3. Testing Cross-Origin POST Request ---");
const resCrossOrigin = buildExpectedUserHeader(
  "https://external-service.com/api/telemetry",
  { method: "POST" },
  PINNED_ID,
  BASE_ORIGIN
);
assert(resCrossOrigin.shouldAttach === false, "Cross-origin POST request should not attach x-expected-user-id");
assert(!resCrossOrigin.headers.has("x-expected-user-id"), "Cross-origin headers must not contain x-expected-user-id");

// 4. Same-origin non-/api path -> do not attach
console.log("\n--- 4. Testing Same-Origin Non-/api Path ---");
const resNonApi = buildExpectedUserHeader("/dashboard/save", { method: "POST" }, PINNED_ID, BASE_ORIGIN);
assert(resNonApi.shouldAttach === false, "Non-/api POST request should not attach x-expected-user-id");
assert(!resNonApi.headers.has("x-expected-user-id"), "Non-/api headers must not contain x-expected-user-id");

// 5. /api/auth/callback POST -> do not attach
console.log("\n--- 5. Testing /api/auth/callback POST ---");
const resAuthCallback = buildExpectedUserHeader(
  "/api/auth/callback/credentials",
  { method: "POST" },
  PINNED_ID,
  BASE_ORIGIN
);
assert(resAuthCallback.shouldAttach === false, "/api/auth/callback POST request should not attach x-expected-user-id");
assert(!resAuthCallback.headers.has("x-expected-user-id"), "/api/auth headers must not contain x-expected-user-id");

// 6. Same-origin /api POST with no header -> attach pinned id
console.log("\n--- 6. Testing Same-Origin /api POST with No Header ---");
const resApiPost = buildExpectedUserHeader("/api/missions/complete", { method: "POST" }, PINNED_ID, BASE_ORIGIN);
assert(resApiPost.shouldAttach === true, "Same-origin /api POST should attach x-expected-user-id");
assert(
  resApiPost.headers.get("x-expected-user-id") === PINNED_ID,
  `Attached x-expected-user-id should match pinned ID (got ${resApiPost.headers.get("x-expected-user-id")})`
);

// 7. Live-id header already present -> must be overridden with the pinned id
console.log("\n--- 7. Testing Overriding Existing Live-ID Header ---");
const LIVE_ID = "live_user_other_tab_999";
const resOverride = buildExpectedUserHeader(
  "/api/missions/complete",
  {
    method: "POST",
    headers: {
      "x-expected-user-id": LIVE_ID,
      "Content-Type": "application/json",
    },
  },
  PINNED_ID,
  BASE_ORIGIN
);
assert(resOverride.shouldAttach === true, "Request with existing header should attach");
assert(
  resOverride.headers.get("x-expected-user-id") === PINNED_ID,
  `x-expected-user-id must be overridden with pinned ID: expected=${PINNED_ID}, got=${resOverride.headers.get("x-expected-user-id")}`
);
assert(
  resOverride.headers.get("content-type") === "application/json",
  "Existing Content-Type header must be preserved"
);

// 8. Pinned null -> do not attach
console.log("\n--- 8. Testing Pinned null ---");
const resPinnedNull = buildExpectedUserHeader("/api/missions/complete", { method: "POST" }, null, BASE_ORIGIN);
assert(resPinnedNull.shouldAttach === false, "Pinned null must not attach header");
assert(!resPinnedNull.headers.has("x-expected-user-id"), "Headers must not contain x-expected-user-id when pinned is null");

// 9. Pinned "undefined" -> do not attach
console.log("\n--- 9. Testing Pinned 'undefined' ---");
const resPinnedUndefined = buildExpectedUserHeader("/api/missions/complete", { method: "POST" }, "undefined", BASE_ORIGIN);
assert(resPinnedUndefined.shouldAttach === false, "Pinned 'undefined' string must not attach header");
assert(!resPinnedUndefined.headers.has("x-expected-user-id"), "Headers must not contain x-expected-user-id when pinned is 'undefined'");

// 10. Request object input -> support Request object
console.log("\n--- 10. Testing Request Object Input ---");
const reqObject = new Request("http://localhost:3000/api/avatar", {
  method: "POST",
  headers: { "x-custom-guard": "test" },
});
const resRequestInput = buildExpectedUserHeader(reqObject, undefined, PINNED_ID, BASE_ORIGIN);
assert(resRequestInput.shouldAttach === true, "Request object input should attach");
assert(
  resRequestInput.headers.get("x-expected-user-id") === PINNED_ID,
  `Request object input should set pinned id (got ${resRequestInput.headers.get("x-expected-user-id")})`
);
assert(
  resRequestInput.headers.get("x-custom-guard") === "test",
  "Custom headers from Request object must be preserved"
);

// 11. Headers instance input -> must not mutate caller's Headers object
console.log("\n--- 11. Testing Headers Instance Input (Immutability) ---");
const callerHeaders = new Headers({
  "Authorization": "Bearer token123",
  "x-expected-user-id": LIVE_ID,
});
const resHeadersInstance = buildExpectedUserHeader(
  "/api/profile",
  { method: "PUT", headers: callerHeaders },
  PINNED_ID,
  BASE_ORIGIN
);
assert(resHeadersInstance.shouldAttach === true, "Headers instance input should attach");
assert(
  resHeadersInstance.headers.get("x-expected-user-id") === PINNED_ID,
  "New headers must have overridden x-expected-user-id"
);
assert(
  callerHeaders.get("x-expected-user-id") === LIVE_ID,
  `Caller's Headers instance MUST NOT be mutated (caller still has: ${callerHeaders.get("x-expected-user-id")})`
);
assert(
  resHeadersInstance.headers.get("authorization") === "Bearer token123",
  "Authorization header from caller must be preserved in result"
);

console.log("\nAll 11 buildExpectedUserHeader test cases PASSED successfully!");
