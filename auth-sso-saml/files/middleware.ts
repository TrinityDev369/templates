/**
 * Next.js SAML Middleware Integration
 *
 * Provides two integration patterns for protecting Next.js routes with SAML SSO:
 *
 *   1. `withSAML(config)` — Edge Middleware that intercepts requests before they
 *      reach the route handler. Compatible with Next.js App Router middleware.
 *
 *   2. `requireSAML(config, handler)` — Higher-order function that wraps an
 *      individual API route handler with SAML session validation.
 *
 * Session data is stored in an encrypted HTTP-only cookie. The encryption key
 * is derived from the SAML_SESSION_SECRET environment variable.
 *
 * Environment variables:
 *   SAML_SESSION_SECRET  — Secret key for cookie encryption (min 32 chars)
 *   SAML_COOKIE_NAME     — Cookie name (default: "__saml_session")
 *   SAML_SESSION_TTL     — Session TTL in seconds (default: 28800 = 8 hours)
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { SAMLConfig, SAMLSession, SAMLUser } from './types';
import { initiateSSO } from './saml-handler';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COOKIE_NAME = process.env.SAML_COOKIE_NAME ?? '__saml_session';
const SESSION_TTL_SECONDS = parseInt(process.env.SAML_SESSION_TTL ?? '28800', 10);
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// ---------------------------------------------------------------------------
// Edge Middleware — withSAML
// ---------------------------------------------------------------------------

/**
 * Create a Next.js Edge Middleware function that enforces SAML authentication.
 *
 * Place in your `middleware.ts` at the project root:
 *
 * ```ts
 * import { createSAMLConfig, withSAML } from '@/modules/auth-sso-saml';
 *
 * const config = createSAMLConfig();
 * export default withSAML(config);
 *
 * export const config = {
 *   matcher: ['/dashboard/:path*', '/api/protected/:path*'],
 * };
 * ```
 *
 * @param samlConfig  Validated SAML configuration
 * @param options     Optional overrides for protected paths
 * @returns           Next.js middleware function
 */
export function withSAML(
  samlConfig: SAMLConfig,
  options: {
    /** Paths to exclude from SAML protection (e.g. /api/saml/callback) */
    excludePaths?: string[];
    /** Custom login redirect path (defaults to IdP SSO redirect) */
    loginPath?: string;
  } = {},
) {
  const excludePaths = options.excludePaths ?? [
    '/api/saml/callback',
    '/api/saml/metadata',
    '/api/saml/logout',
  ];

  return async function samlMiddleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;

    // Skip excluded paths (SAML endpoints themselves, public assets, etc.)
    if (excludePaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    // Attempt to read and decrypt the session cookie
    const sessionCookie = request.cookies.get(COOKIE_NAME);
    if (sessionCookie?.value) {
      try {
        const session = decryptSession(sessionCookie.value);

        // Validate session expiry
        if (session && session.expiresAt > Date.now()) {
          // Session is valid — attach user info as a request header for
          // downstream route handlers to consume.
          const response = NextResponse.next();
          response.headers.set('x-saml-user', JSON.stringify(session.user));
          response.headers.set('x-saml-session-index', session.sessionIndex);
          return response;
        }
      } catch {
        // Cookie is corrupt or tampered — fall through to redirect
      }
    }

    // No valid session — redirect to IdP for authentication
    if (options.loginPath) {
      const loginUrl = new URL(options.loginPath, request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Direct IdP redirect
    const { redirectUrl } = initiateSSO(samlConfig);
    return NextResponse.redirect(redirectUrl);
  };
}

// ---------------------------------------------------------------------------
// API Route Wrapper — requireSAML
// ---------------------------------------------------------------------------

/**
 * Wrap a Next.js API route handler with SAML session validation.
 *
 * The handler receives the authenticated SAMLSession as its second argument:
 *
 * ```ts
 * import { createSAMLConfig, requireSAML } from '@/modules/auth-sso-saml';
 *
 * const config = createSAMLConfig();
 *
 * export const GET = requireSAML(config, async (request, session) => {
 *   return Response.json({ user: session.user });
 * });
 * ```
 *
 * @param samlConfig  Validated SAML configuration
 * @param handler     Async route handler receiving (request, session)
 * @returns           Wrapped handler that returns 401 if session is invalid
 */
export function requireSAML(
  samlConfig: SAMLConfig,
  handler: (request: NextRequest, session: SAMLSession) => Promise<Response>,
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    const sessionCookie = request.cookies.get(COOKIE_NAME);

    if (!sessionCookie?.value) {
      return new Response(
        JSON.stringify({ error: 'SAML authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    let session: SAMLSession | null = null;
    try {
      session = decryptSession(sessionCookie.value);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid SAML session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!session || session.expiresAt <= Date.now()) {
      return new Response(
        JSON.stringify({ error: 'SAML session expired' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return handler(request, session);
  };
}

// ---------------------------------------------------------------------------
// Session Cookie Management
// ---------------------------------------------------------------------------

/**
 * Create an encrypted session cookie value from a SAMLUser and assertion data.
 *
 * Call this in your `/api/saml/callback` handler after successful validation:
 *
 * ```ts
 * import { createSessionCookie } from '@/modules/auth-sso-saml/middleware';
 *
 * const cookie = createSessionCookie(user, sessionIndex, nameId);
 * response.cookies.set('__saml_session', cookie, { ... });
 * ```
 *
 * @param user          Authenticated SAMLUser
 * @param sessionIndex  SessionIndex from the SAML assertion
 * @param nameId        NameID value from the assertion
 * @param ttlSeconds    Session TTL override (default: SAML_SESSION_TTL env)
 * @returns             Encrypted cookie string
 */
export function createSessionCookie(
  user: SAMLUser,
  sessionIndex: string,
  nameId: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): string {
  const session: SAMLSession = {
    user,
    sessionIndex,
    nameId,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };

  return encryptSession(session);
}

/**
 * Parse the SAML session from a request's cookies.
 * Returns null if no valid session exists.
 *
 * @param request  The incoming Next.js request
 * @returns        Decrypted SAMLSession or null
 */
export function getSessionFromRequest(request: NextRequest): SAMLSession | null {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const session = decryptSession(cookie.value);
    if (session && session.expiresAt > Date.now()) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build a Set-Cookie header string for clearing the SAML session.
 * Use in logout handlers.
 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// ---------------------------------------------------------------------------
// Encryption / Decryption Internals
// ---------------------------------------------------------------------------

/**
 * Get the encryption key derived from SAML_SESSION_SECRET.
 * Uses SHA-256 to normalize the secret to exactly 32 bytes.
 *
 * @throws If SAML_SESSION_SECRET is not set
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.SAML_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      '[SAML] SAML_SESSION_SECRET environment variable is required for session encryption. ' +
      'Set a random string of at least 32 characters.',
    );
  }
  // Derive a fixed-length key via SHA-256
  return createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a SAMLSession object into a tamper-proof cookie value.
 *
 * Format: base64(iv + authTag + ciphertext)
 */
function encryptSession(session: SAMLSession): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  const plaintext = JSON.stringify(session);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Pack: IV (16) + AuthTag (16) + Ciphertext (variable)
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString('base64');
}

/**
 * Decrypt a cookie value back into a SAMLSession object.
 *
 * @returns Parsed SAMLSession or null if decryption/parsing fails
 */
function decryptSession(cookieValue: string): SAMLSession | null {
  try {
    const key = getEncryptionKey();
    const packed = Buffer.from(cookieValue, 'base64');

    if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      return null;
    }

    const iv = packed.subarray(0, IV_LENGTH);
    const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf-8')) as SAMLSession;
  } catch {
    return null;
  }
}
