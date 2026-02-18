---
name: auth-seed
description: Autonomous auth composer. Discovers security requirements, selects an
  archetype, installs auth modules via @trinity369/use, and generates the glue layer
  (auth context, session management, protected routes). Delivers a wired authentication
  system, not a list of components. Use when building login/signup, setting up auth,
  adding SSO, or wiring session management.
argument-hint: "[describe your app and auth needs]"
---

# Auth Seed

Autonomous executor that composes a complete authentication system from published auth modules. Discovers requirements through conversation, selects the right archetype, installs components in dependency order, and generates the glue layer that wires everything into a working auth system.

## Execution Phases

```
Phase 1: Discovery     -- Understand the app and security requirements
Phase 2: Select        -- Pick archetype and configure modules
Phase 3: Install       -- Run npx @trinity369/use for each module
Phase 4: Glue Layer    -- Generate auth context, session management, protected routes
Phase 5: Verify        -- Check integration and report
```

---

## Phase 1: Discovery

Ask these questions conversationally. Do not dump all at once -- adapt based on answers.

**Core questions:**
1. What kind of application? (consumer SaaS, B2B platform, regulated industry, landing page)
2. Which OAuth providers? (Google, GitHub, Apple, Microsoft, or none)
3. Session strategy? If unsure, explain the trade-off:
   - **Cookies**: Server-managed, automatic CSRF protection, works with SSR. Better for traditional web apps.
   - **JWT**: Stateless, works across domains, good for SPAs and mobile. Needs refresh token rotation.
4. Enterprise SSO needed? (SAML for corporate clients connecting their identity provider)
5. Age restriction or verification required? (alcohol, gambling, healthcare portals)
6. Interest in biometric / passwordless auth? (WebAuthn fingerprint or face recognition)
7. Role-based access control? (admin, user, editor -- or just authenticated/unauthenticated)

**Map answers to an archetype.** If answers are ambiguous, state your recommendation with reasoning and confirm.

---

## Phase 2: Select Archetype and Modules

### Available Archetypes

#### `minimal` -- Landing Page / Simple App
- **Modules**: `auth-login-form`, `auth-signup-form`
- **Session**: JWT (stateless)
- **OAuth**: Google only
- **Use when**: Marketing sites, MVPs, simple apps with basic user accounts

#### `standard` -- Standard Web App Auth
- **Modules**: `auth-login-form`, `auth-signup-form`, `auth-password-reset`
- **Session**: Cookie-based or JWT (user's choice)
- **OAuth**: Google, GitHub (configurable)
- **Use when**: Most SaaS applications, dashboards, content platforms

#### `social` -- Social-First Auth
- **Modules**: `auth-login-form`, `auth-signup-form`, `auth-password-reset`
- **Session**: JWT with refresh tokens
- **OAuth**: Multiple providers prominent, email/password secondary
- **Use when**: Consumer apps where social login reduces friction

#### `enterprise` -- Enterprise / B2B Auth
- **Modules**: `auth-login-form`, `auth-signup-form`, `auth-password-reset`, `auth-sso-saml`, `auth-biometric`
- **Session**: Cookie-based with CSRF, secure flags
- **OAuth**: SSO-first, email/password fallback
- **Use when**: B2B platforms, corporate tools, multi-tenant SaaS
- **Extras**: Role-based access hooks, audit logging stubs

#### `regulated` -- Healthcare / FinTech / Age-Restricted
- **Modules**: ALL (login, signup, password-reset, sso-saml, biometric, age-verification)
- **Session**: Strict cookies, short TTL, re-auth for sensitive operations
- **OAuth**: Limited or none (compliance constraints)
- **Use when**: Healthcare, financial services, age-restricted content
- **Extras**: Age gate, biometric re-auth, audit trail, session timeouts

### Composition Graph

```
Layer 0 -- CORE (always installed)
  +-- auth-login-form
  +-- auth-signup-form

Layer 1 -- RECOVERY (standard and above)
  +-- auth-password-reset

Layer 2 -- ENTERPRISE (enterprise, regulated)
  +-- auth-sso-saml
  +-- auth-biometric

Layer 3 -- COMPLIANCE (regulated only)
  +-- auth-age-verification
```

### Present the Plan

Before executing, show the user:

```
Archetype: [name]
Modules to install (in order):
  1. auth-login-form        -- Core login UI
  2. auth-signup-form       -- Registration with validation
  3. auth-password-reset    -- Multi-step recovery flow
  [4. auth-sso-saml]       -- SAML SSO integration
  [5. auth-biometric]      -- WebAuthn fingerprint/face
  [6. auth-age-verification] -- Age gate with persistence

Session strategy: [cookie-based / JWT / JWT with refresh]
OAuth providers: [list]
Roles: [list]

Glue layer will generate:
  - src/lib/auth/types.ts
  - src/lib/auth/auth-context.tsx
  - src/lib/auth/protected-route.tsx
  - src/lib/auth/index.ts
  [- src/middleware.ts snippet (Next.js)]

Proceed? [Y/n]
```

Wait for explicit confirmation before installing anything.

---

## Phase 3: Install Modules

Install modules **in layer order** using `npx @trinity369/use`. Each command installs the template files into the project.

```bash
# Layer 0 -- Core
npx @trinity369/use auth-login-form
npx @trinity369/use auth-signup-form

# Layer 1 -- Recovery
npx @trinity369/use auth-password-reset

# Layer 2 -- Enterprise (if archetype includes them)
npx @trinity369/use auth-sso-saml
npx @trinity369/use auth-biometric

# Layer 3 -- Compliance (if archetype includes them)
npx @trinity369/use auth-age-verification
```

**Rules:**
- Run each command sequentially; confirm each succeeds before continuing
- If a module fails to install, report the error and ask the user how to proceed
- Do NOT skip layers -- install in order so dependencies are satisfied
- Log each installation result

---

## Phase 4: Generate Glue Layer

This is the critical phase. The installed modules are standalone UI components. The glue layer wires them into a functioning auth system.

### 4.1 User and Session Types

Generate `src/lib/auth/types.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
}

// Configure roles based on archetype
export type UserRole = 'user' | 'admin';
// enterprise/regulated: add 'editor' | 'viewer' | 'superadmin' as needed

export interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

Adapt the `UserRole` union based on the roles discussed in Phase 1.

### 4.2 Auth Context Provider

Generate `src/lib/auth/auth-context.tsx`:

Provides React context wrapping the application:
- `user` -- current authenticated user or null
- `isAuthenticated` -- derived boolean
- `isLoading` -- true during initial session check and auth operations
- `error` -- last auth error message or null
- `login(email, password)` -- authenticate and set session
- `signup(email, password, name)` -- register and set session
- `logout()` -- clear session and redirect
- `refreshSession()` -- refresh the access token (JWT archetypes)

**Session strategy affects implementation:**
- **Cookie-based**: Auth operations call API routes; cookies are set server-side with httpOnly, secure, sameSite flags. Context reads session from a `/api/auth/me` endpoint.
- **JWT**: Tokens stored in memory (never localStorage). Refresh token in httpOnly cookie. Context manages token lifecycle and refresh.

### 4.3 Protected Route

Generate `src/lib/auth/protected-route.tsx`:

Component that wraps routes requiring authentication:
- Redirects unauthenticated users to the login page
- Configurable redirect path (default: `/login`)
- Optional role check: `<ProtectedRoute roles={['admin']}>` restricts to specific roles
- Shows loading state during auth check (do not flash login page)
- Works with both Next.js App Router and React Router

### 4.4 Barrel Export

Generate `src/lib/auth/index.ts`:

```typescript
export { AuthProvider, useAuth } from './auth-context';
export { ProtectedRoute } from './protected-route';
export type { User, Session, AuthState, UserRole } from './types';
```

### 4.5 Next.js Middleware (if detected)

If the project uses Next.js, generate or append to `src/middleware.ts`:

```typescript
// Auth middleware -- protect routes server-side
// Add paths that require authentication
const protectedPaths = ['/dashboard', '/settings', '/admin'];
const publicPaths = ['/login', '/signup', '/reset-password'];
```

The middleware checks for a valid session cookie/token and redirects unauthenticated requests to `/login`.

### 4.6 Archetype-Specific Extras

**enterprise archetype:**
- Add audit logging utility stub (`src/lib/auth/audit.ts`) that logs auth events
- Add SSO configuration helper referencing the installed `auth-sso-saml` module
- Wire biometric as optional MFA in the auth context

**regulated archetype:**
- Add session timeout configuration (short TTL, configurable)
- Add re-authentication gate for sensitive operations
- Wire age verification as a pre-auth gate
- Add audit trail hooks on every auth state change

---

## Phase 5: Verify and Report

### Integration Check

After generating all files, verify:
1. All installed module directories exist and contain expected files
2. All glue layer files are written and have no syntax errors
3. Imports between glue layer and installed modules resolve correctly
4. TypeScript compilation passes (run `npx tsc --noEmit` if tsconfig exists)

### Security Advisory

ALWAYS include this in the final output -- auth is the highest-risk domain:

```
SECURITY NOTE: This skill generates UI components and client-side auth scaffolding.
You MUST implement server-side validation separately:
- Verify tokens server-side on every protected API route
- Hash passwords with bcrypt/argon2 (never store plaintext)
- Use HTTPS in production
- Set secure, httpOnly, sameSite flags on session cookies
- Implement rate limiting on auth endpoints
- Store secrets in environment variables (never commit them)
- Rotate JWT secrets periodically
- Log authentication events for audit trails
```

### Completion Report

```
Auth System Composed
====================
Archetype:  [name]
Modules:    [N] installed
Session:    [strategy]
OAuth:      [providers]
Roles:      [list]

Installed:
  [check] auth-login-form        -> components/auth-login-form/
  [check] auth-signup-form       -> components/auth-signup-form/
  [check] auth-password-reset    -> components/auth-password-reset/
  ...

Generated:
  [check] src/lib/auth/types.ts
  [check] src/lib/auth/auth-context.tsx
  [check] src/lib/auth/protected-route.tsx
  [check] src/lib/auth/index.ts
  [check] src/middleware.ts (Next.js)

Next steps:
  1. Implement API routes for login/signup/logout/refresh
  2. Connect auth context to your API endpoints
  3. Set environment variables: JWT_SECRET, OAUTH_CLIENT_ID, etc.
  4. Wrap your app root in <AuthProvider>
  5. Protect routes with <ProtectedRoute> or middleware
  6. READ THE SECURITY NOTE ABOVE
```

---

## Edge Cases

**Existing auth files**: If `src/lib/auth/` already exists, warn the user and ask whether to overwrite, merge, or use an alternative path.

**Non-Next.js projects**: Skip middleware generation. Adjust protected route to work with React Router, Remix, or plain React.

**JavaScript (no TypeScript)**: Generate `.js` files instead of `.ts/.tsx`. Drop type annotations but keep JSDoc comments for IDE support.

**Monorepo**: Ask which package/app should receive the auth system. Adjust paths accordingly.

**Partial archetype**: User wants enterprise SSO but not biometric. Allow module-level overrides after archetype selection -- the archetype is a starting point, not a constraint.

---

## Available Auth Modules Reference

| Slug | Description |
|------|-------------|
| `auth-login-form` | Centered card login with email, password, show/hide toggle, remember me, OAuth buttons |
| `auth-signup-form` | Registration form with validation, password strength meter, terms checkbox, OAuth buttons |
| `auth-password-reset` | Multi-step reset: email request, 6-digit code verification, new password |
| `auth-sso-saml` | SAML SSO integration module for enterprise Next.js applications |
| `auth-biometric` | Biometric auth UI using WebAuthn API with fingerprint/face recognition |
| `auth-age-verification` | Age verification gate with date picker and localStorage persistence |

These are the only valid slugs. Do not reference or install any others.
