/**
 * Automated test suite for Session User ID Guard.
 * Covers: missing, empty, "undefined", "null", matching id, mismatching id (409 with SESSION_USER_MISMATCH)
 * for both API route (assertExpectedSessionUser) and server action (assertExpectedActionUser) variants.
 *
 * Run with: npx tsx scripts/test-session-guard.ts
 */

import {
  assertExpectedSessionUser,
  assertExpectedActionUser,
  isMissingExpectedId,
  SESSION_USER_MISMATCH_CODE,
} from "../src/lib/sessionGuard";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

async function runTests() {
  console.log("=== Testing Session User ID Guard Logic ===\n");

  // =========================================================================
  // 1. Helper: isMissingExpectedId
  // =========================================================================
  console.log("--- 1. Testing isMissingExpectedId Helper ---");
  assert(isMissingExpectedId(undefined) === true, "undefined is missing");
  assert(isMissingExpectedId(null) === true, "null is missing");
  assert(isMissingExpectedId("") === true, "empty string is missing");
  assert(isMissingExpectedId("   ") === true, "whitespace string is missing");
  assert(isMissingExpectedId("undefined") === true, 'literal "undefined" string is missing');
  assert(isMissingExpectedId("UNDEFINED") === true, 'case-insensitive "UNDEFINED" string is missing');
  assert(isMissingExpectedId("null") === true, 'literal "null" string is missing');
  assert(isMissingExpectedId("NULL") === true, 'case-insensitive "NULL" string is missing');
  assert(isMissingExpectedId("valid_user_id_123") === false, "valid user id is NOT missing");
  assert(isMissingExpectedId("  valid_user_id_123  ") === false, "padded valid user id is NOT missing");

  // =========================================================================
  // 2. API Route Variant: assertExpectedSessionUser
  // =========================================================================
  console.log("\n--- 2. Testing API Route Variant (assertExpectedSessionUser) ---");
  const sessionUser = "student_active_session_id";

  // Case 2.1: Missing header
  const reqMissing = new Request("http://localhost:3000/api/missions/complete", {
    method: "POST",
  });
  const resMissing = assertExpectedSessionUser(reqMissing, sessionUser, "POST /api/missions/complete");
  assert(resMissing === null, "Missing header allows request (returns null, logs warning)");

  // Case 2.2: Empty header
  const reqEmpty = new Request("http://localhost:3000/api/missions/complete", {
    method: "POST",
    headers: { "x-expected-user-id": "" },
  });
  const resEmpty = assertExpectedSessionUser(reqEmpty, sessionUser, "POST /api/missions/complete");
  assert(resEmpty === null, "Empty header allows request (returns null, logs warning)");

  // Case 2.3: Whitespace-only header
  const reqWhitespace = new Request("http://localhost:3000/api/missions/complete", {
    method: "POST",
    headers: { "x-expected-user-id": "    " },
  });
  const resWhitespace = assertExpectedSessionUser(reqWhitespace, sessionUser, "POST /api/missions/complete");
  assert(resWhitespace === null, "Whitespace-only header allows request (returns null, logs warning)");

  // Case 2.4: Literal "undefined" header
  const reqUndefined = new Request("http://localhost:3000/api/missions/complete", {
    method: "POST",
    headers: { "x-expected-user-id": "undefined" },
  });
  const resUndefined = assertExpectedSessionUser(reqUndefined, sessionUser, "POST /api/missions/complete");
  assert(resUndefined === null, 'Literal "undefined" header allows request (returns null, logs warning)');

  // Case 2.5: Literal "null" header
  const reqNull = new Request("http://localhost:3000/api/missions/complete", {
    method: "POST",
    headers: { "x-expected-user-id": "null" },
  });
  const resNull = assertExpectedSessionUser(reqNull, sessionUser, "POST /api/missions/complete");
  assert(resNull === null, 'Literal "null" header allows request (returns null, logs warning)');

  // Case 2.6: Matching ID
  const reqMatching = new Request("http://localhost:3000/api/missions/complete", {
    method: "POST",
    headers: { "x-expected-user-id": sessionUser },
  });
  const resMatching = assertExpectedSessionUser(reqMatching, sessionUser, "POST /api/missions/complete");
  assert(resMatching === null, "Matching expected ID allows request (returns null)");

  // Case 2.7: Mismatching ID -> 409 SESSION_USER_MISMATCH
  const staleUser = "student_old_stale_tab_id";
  const reqMismatch = new Request("http://localhost:3000/api/missions/complete", {
    method: "POST",
    headers: { "x-expected-user-id": staleUser },
  });
  const resMismatch = assertExpectedSessionUser(reqMismatch, sessionUser, "POST /api/missions/complete");
  assert(resMismatch !== null, "Mismatching ID returns response object");
  assert(resMismatch!.status === 409, `Mismatch status is 409 (got ${resMismatch!.status})`);

  const mismatchJson = await resMismatch!.json();
  assert(mismatchJson.code === SESSION_USER_MISMATCH_CODE, `Response body code is ${SESSION_USER_MISMATCH_CODE}`);
  assert(mismatchJson.error === "SESSION_USER_MISMATCH", 'Response body error is "SESSION_USER_MISMATCH"');
  assert(typeof mismatchJson.message === "string" && mismatchJson.message.length > 0, "Response body contains friendly message");

  // =========================================================================
  // 3. Server Action Variant: assertExpectedActionUser
  // =========================================================================
  console.log("\n--- 3. Testing Server Action Variant (assertExpectedActionUser) ---");
  const adminSessionUser = "admin_active_session_id";

  // Case 3.1: Missing (undefined)
  const actUndefined = assertExpectedActionUser(adminSessionUser, undefined, "createSection");
  assert(actUndefined === null, "undefined action parameter allows request (returns null, logs warning)");

  // Case 3.2: Missing (null)
  const actNullParam = assertExpectedActionUser(adminSessionUser, null as any, "createSection");
  assert(actNullParam === null, "null action parameter allows request (returns null, logs warning)");

  // Case 3.3: Empty string
  const actEmpty = assertExpectedActionUser(adminSessionUser, "", "createSection");
  assert(actEmpty === null, "empty string action parameter allows request (returns null, logs warning)");

  // Case 3.4: Whitespace-only string
  const actWhitespace = assertExpectedActionUser(adminSessionUser, "   ", "createSection");
  assert(actWhitespace === null, "whitespace action parameter allows request (returns null, logs warning)");

  // Case 3.5: Literal "undefined" string
  const actUndefinedStr = assertExpectedActionUser(adminSessionUser, "undefined", "createSection");
  assert(actUndefinedStr === null, 'Literal "undefined" string allows request (returns null, logs warning)');

  // Case 3.6: Literal "null" string
  const actNullStr = assertExpectedActionUser(adminSessionUser, "null", "createSection");
  assert(actNullStr === null, 'Literal "null" string allows request (returns null, logs warning)');

  // Case 3.7: Matching ID
  const actMatching = assertExpectedActionUser(adminSessionUser, adminSessionUser, "createSection");
  assert(actMatching === null, "Matching action parameter allows request (returns null)");

  // Case 3.8: Mismatching ID -> SESSION_USER_MISMATCH
  const staleAdmin = "admin_old_stale_tab_id";
  const actMismatch = assertExpectedActionUser(adminSessionUser, staleAdmin, "createSection");
  assert(actMismatch !== null, "Mismatching action parameter returns error object");
  assert(actMismatch!.success === false, "Result success is false");
  assert(actMismatch!.code === SESSION_USER_MISMATCH_CODE, `Result code is ${SESSION_USER_MISMATCH_CODE}`);
  assert(actMismatch!.error === "SESSION_USER_MISMATCH", 'Result error is "SESSION_USER_MISMATCH"');
  assert(typeof actMismatch!.message === "string" && actMismatch!.message.length > 0, "Result message is present");

  console.log("\nAll Session User ID Guard tests PASSED successfully!");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
