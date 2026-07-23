// Minimal JWT payload decoder — no `atob`/`Buffer` dependency so it behaves the
// same on web and native. We only ever read claims from a token the backend just
// issued us; signature verification is the backend's job, not the client's.

export interface AccessTokenClaims {
  sub: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles?: string[] };
  exp?: number;
  [key: string]: unknown;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  let binary = '';
  let buffer = 0;
  let bits = 0;
  for (const char of normalized) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      binary += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  // Re-interpret the byte string as UTF-8 (JWT payloads are UTF-8 JSON).
  try {
    return decodeURIComponent(
      binary
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
  } catch {
    return binary;
  }
}

export function decodeAccessToken(token: string): AccessTokenClaims | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    return JSON.parse(base64UrlDecode(payload)) as AccessTokenClaims;
  } catch {
    return null;
  }
}

const KNOWN_ROLES = ['admin', 'member', 'trainer'] as const;
export type KnownRole = (typeof KNOWN_ROLES)[number];

/** Maps Keycloak's realm_access.roles (e.g. ["ADMIN"]) to our app-level Role. */
export function extractRole(claims: AccessTokenClaims): KnownRole | null {
  const roles = claims.realm_access?.roles ?? [];
  const lowered = roles.map(r => r.toLowerCase());
  return KNOWN_ROLES.find(r => lowered.includes(r)) ?? null;
}
