import { NextResponse } from "next/server";

export const SESSION_USER_MISMATCH_CODE = "SESSION_USER_MISMATCH";

export interface SessionMismatchResult {
  success: false;
  error: string;
  code: string;
  message: string;
}

/**
 * Validates the expected user ID against the active session user ID for API Routes.
 * - If expectedUserId is missing: logs a warning and returns null (allows the request so no flow breaks).
 * - If expectedUserId matches sessionUserId: returns null (allows the request).
 * - If expectedUserId does not match sessionUserId: returns a 409 NextResponse with SESSION_USER_MISMATCH code.
 */
export function assertExpectedSessionUser(
  req: Request,
  sessionUserId: string | null | undefined,
  endpointName: string
): NextResponse | null {
  const expectedUserId = req.headers.get("x-expected-user-id");

  if (!expectedUserId) {
    console.warn(
      `[SESSION_GUARD] Missing x-expected-user-id at ${endpointName} for session user ${sessionUserId}`
    );
    return null;
  }

  if (expectedUserId !== sessionUserId) {
    console.warn(
      `[SESSION_GUARD] SESSION_USER_MISMATCH at ${endpointName}: expected=${expectedUserId}, active=${sessionUserId}`
    );
    return NextResponse.json(
      {
        error: "SESSION_USER_MISMATCH",
        code: SESSION_USER_MISMATCH_CODE,
        message: "Your session changed in another tab. Reload to sync with your current account.",
      },
      { status: 409 }
    );
  }

  return null;
}

/**
 * Validates the expected user ID against the active session user ID for Server Actions.
 * - If expectedUserId is missing: logs a warning and returns null (allows the request so no flow breaks).
 * - If expectedUserId matches sessionUserId: returns null (allows the request).
 * - If expectedUserId does not match sessionUserId: returns an error object with SESSION_USER_MISMATCH code.
 */
export function assertExpectedActionUser(
  sessionUserId: string | null | undefined,
  expectedUserId: string | null | undefined,
  actionName: string
): SessionMismatchResult | null {
  if (!expectedUserId) {
    console.warn(
      `[SESSION_GUARD] Missing expectedUserId at action ${actionName} for session user ${sessionUserId}`
    );
    return null;
  }

  if (expectedUserId !== sessionUserId) {
    console.warn(
      `[SESSION_GUARD] SESSION_USER_MISMATCH at action ${actionName}: expected=${expectedUserId}, active=${sessionUserId}`
    );
    return {
      success: false,
      error: "SESSION_USER_MISMATCH",
      code: SESSION_USER_MISMATCH_CODE,
      message: "Your session changed in another tab. Reload to sync with your current account.",
    };
  }

  return null;
}
