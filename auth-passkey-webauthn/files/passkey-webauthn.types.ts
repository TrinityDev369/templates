/**
 * Type definitions for the WebAuthn passkey registration and authentication module.
 *
 * These types model the WebAuthn credential lifecycle:
 * register (create) -> store -> authenticate (get) -> verify
 */

/* -- Credential types ---------------------------------------------------- */

/**
 * A registered passkey credential returned after a successful
 * `navigator.credentials.create()` ceremony.
 *
 * The `publicKey` and transport hints are needed for server-side storage
 * and future authentication ceremonies.
 */
export interface PasskeyCredential {
  /** Base64url-encoded credential identifier. */
  id: string;

  /** Raw credential ID as a base64url string (mirrors `id` for convenience). */
  rawId: string;

  /** Credential type — always `"public-key"` for WebAuthn. */
  type: "public-key";

  /** Base64url-encoded COSE public key from the authenticator. */
  publicKey: string;

  /**
   * Transport hints indicating how the authenticator communicates
   * (e.g. `"internal"` for platform authenticators, `"usb"` for security keys).
   */
  transports: string[];

  /** ISO 8601 timestamp of when the credential was created. */
  createdAt: string;
}

/* -- Authentication types ------------------------------------------------ */

/**
 * An authentication assertion returned after a successful
 * `navigator.credentials.get()` ceremony.
 *
 * Send this to the server for signature verification.
 */
export interface AuthenticationAssertion {
  /** Base64url-encoded credential identifier used during authentication. */
  id: string;

  /** Raw credential ID as a base64url string. */
  rawId: string;

  /** Base64url-encoded signature produced by the authenticator. */
  signature: string;

  /** Base64url-encoded authenticator data (includes flags, counter, etc.). */
  authenticatorData: string;

  /** Base64url-encoded client data JSON used in the signing ceremony. */
  clientDataJSON: string;
}

/* -- Component props ----------------------------------------------------- */

/**
 * Props for the top-level PasskeyWebAuthn component.
 */
export interface PasskeyWebAuthnProps {
  /**
   * Called after a successful passkey registration ceremony.
   * The implementation should persist the credential on the server.
   */
  onRegister: (credential: PasskeyCredential) => Promise<void>;

  /**
   * Called after a successful passkey authentication ceremony.
   * The implementation should verify the assertion server-side.
   */
  onAuthenticate: (assertion: AuthenticationAssertion) => Promise<void>;

  /**
   * Optional error handler for WebAuthn failures.
   * When omitted, errors are displayed inline in the UI.
   */
  onError?: (error: Error) => void;

  /**
   * Previously registered passkeys to display in the management list.
   * When provided, users can see and manage their registered credentials.
   */
  registeredPasskeys?: PasskeyCredential[];

  /**
   * The user's account name (typically an email) used as `user.name`
   * in the WebAuthn creation options.
   * @default "user@example.com"
   */
  userName?: string;

  /**
   * A human-friendly display name for the user, used as `user.displayName`
   * in the WebAuthn creation options.
   * @default "User"
   */
  userDisplayName?: string;
}
