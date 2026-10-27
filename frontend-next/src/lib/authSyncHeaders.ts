import { isMissingExpectedId } from "./sessionGuard";

export interface ExpectedUserHeaderDecision {
  shouldAttach: boolean;
  headers: Headers;
}

/**
 * Pure decision function to determine whether and how to attach `x-expected-user-id` to outgoing requests.
 *
 * Rules:
 * - Only for non-GET/HEAD requests
 * - Must be same-origin (never cross-origin)
 * - Path must start with /api/
 * - Path must NOT start with /api/auth/
 * - Pinned user ID must be valid (not null, empty, whitespace, "undefined", "null")
 * - If valid and meeting criteria, sets `x-expected-user-id` to pinnedUserId (overriding any existing header)
 * - Does NOT mutate caller's Headers object
 * - Supports string, URL, and Request object inputs
 * - Supports init.headers as Headers instance, [string, string][], or Record<string, string>
 */
export function buildExpectedUserHeader(
  input: RequestInfo | URL,
  init?: RequestInit,
  pinnedUserId?: string | null,
  baseOrigin?: string
): ExpectedUserHeaderDecision {
  // 1. Resolve method: init.method takes precedence, then Request.method, defaulting to "GET"
  let method = "GET";
  if (init?.method) {
    method = init.method.toUpperCase();
  } else if (typeof input === "object" && "method" in input && (input as Request).method) {
    method = (input as Request).method.toUpperCase();
  }

  // 2. Resolve URL and origin
  const defaultOrigin =
    baseOrigin ||
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost:3000");

  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (typeof input === "object" && "url" in input) {
    urlStr = (input as Request).url;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlStr, defaultOrigin);
  } catch {
    return { shouldAttach: false, headers: new Headers() };
  }

  // 3. Clone / build headers into a new Headers instance without mutating caller's headers
  const newHeaders = new Headers();

  // If input is a Request object, extract its headers first
  if (typeof input === "object" && "headers" in input && (input as Request).headers) {
    const reqHeaders = (input as Request).headers;
    if (typeof reqHeaders.forEach === "function") {
      reqHeaders.forEach((val, key) => {
        newHeaders.set(key, val);
      });
    }
  }

  // If init.headers was provided, copy/override without mutating caller
  if (init?.headers) {
    if (init.headers instanceof Headers || typeof (init.headers as any).forEach === "function") {
      (init.headers as Headers).forEach((val, key) => {
        newHeaders.set(key, val);
      });
    } else if (Array.isArray(init.headers)) {
      for (const [k, v] of init.headers) {
        newHeaders.set(k, v);
      }
    } else if (typeof init.headers === "object") {
      for (const [k, v] of Object.entries(init.headers)) {
        if (v !== undefined) {
          newHeaders.set(k, String(v));
        }
      }
    }
  }

  // 4. Decision criteria
  // a) non-GET / non-HEAD
  const isEligibleMethod = method !== "GET" && method !== "HEAD";

  // b) same origin only
  const isSameOrigin = parsedUrl.origin === defaultOrigin;

  // c) path starts with /api/ and does NOT start with /api/auth/
  const pathname = parsedUrl.pathname;
  const isApiPath = pathname.startsWith("/api/");
  const isAuthPath = pathname.startsWith("/api/auth/") || pathname === "/api/auth";

  // d) pinnedUserId is valid (not null, empty, whitespace, "undefined", "null")
  const isValidPinnedId = !isMissingExpectedId(pinnedUserId);

  const shouldAttach = isEligibleMethod && isSameOrigin && isApiPath && !isAuthPath && isValidPinnedId;

  if (shouldAttach && pinnedUserId) {
    newHeaders.set("x-expected-user-id", pinnedUserId.trim());
  }

  return {
    shouldAttach,
    headers: newHeaders,
  };
}
