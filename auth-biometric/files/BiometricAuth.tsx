"use client";

import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import styles from "./BiometricAuth.module.css";

/* ── Types ─────────────────────────────────────────────── */

/**
 * Possible states of the biometric authentication flow.
 */
type BiometricState = "idle" | "scanning" | "success" | "error";

/**
 * Simplified credential result returned on success.
 * Contains the raw credential ID and attestation/assertion response data
 * encoded as base64url strings for easy transport.
 */
interface BiometricCredentialResult {
  /** Raw credential ID as a base64url-encoded string. */
  credentialId: string;
  /** The raw ID as an ArrayBuffer reference. */
  rawId: ArrayBuffer;
  /** Type of the public key credential (typically "public-key"). */
  type: string;
  /** Base64url-encoded client data JSON. */
  clientDataJSON: string;
  /** Base64url-encoded attestation object (registration only). */
  attestationObject?: string;
  /** Base64url-encoded authenticator data (authentication only). */
  authenticatorData?: string;
  /** Base64url-encoded signature (authentication only). */
  signature?: string;
}

/**
 * Props for the BiometricAuth component.
 */
interface BiometricAuthProps {
  /** Callback invoked on successful biometric credential creation or assertion. */
  onSuccess: (credential: BiometricCredentialResult) => void;
  /** Callback invoked when an error occurs during the biometric flow. */
  onError: (error: Error) => void;
  /** Whether the component is in registration or authentication mode. */
  mode: "register" | "authenticate";
  /** Relying party display name shown to the user during the WebAuthn prompt. */
  rpName?: string;
  /** Relying party ID. Defaults to `window.location.hostname` at runtime. */
  rpId?: string;
  /** Unique user identifier (opaque string, used as user handle). */
  userId: string;
  /** Human-readable user name displayed in the authenticator prompt. */
  userName: string;
  /** Optional CSS class name applied to the outermost container. */
  className?: string;
  /** Timeout in milliseconds for the WebAuthn ceremony. Defaults to 60000. */
  timeout?: number;
}

/* ── Helpers ───────────────────────────────────────────── */

/**
 * Convert an ArrayBuffer to a base64url-encoded string.
 */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Convert a plain string to an ArrayBuffer (UTF-8).
 */
function stringToBuffer(value: string): ArrayBuffer {
  return new TextEncoder().encode(value).buffer as ArrayBuffer;
}

/**
 * Generate a cryptographically random challenge.
 */
function generateChallenge(): ArrayBuffer {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge.buffer as ArrayBuffer;
}

/* ── SVG Icons ─────────────────────────────────────────── */

function FingerprintIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Fingerprint arcs */}
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
      <path d="M2 12a10 10 0 0 1 18-6" />
      <path d="M2 16h.01" />
      <path d="M21.8 16c.2-2 .131-5.354 0-6" />
      <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
      <path d="M8.65 22c.21-.66.45-1.32.57-2" />
      <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* ── Status config ─────────────────────────────────────── */

interface StateConfig {
  icon: (className?: string) => ReactNode;
  text: string;
  buttonLabel: string;
  buttonClass: string;
}

function getStateConfig(
  state: BiometricState,
  mode: "register" | "authenticate",
  errorMessage: string
): StateConfig {
  switch (state) {
    case "idle":
      return {
        icon: (cls) => <FingerprintIcon className={cls} />,
        text:
          mode === "register"
            ? "Register your biometric credential"
            : "Authenticate with your biometric",
        buttonLabel: "Use biometric",
        buttonClass: styles.button,
      };
    case "scanning":
      return {
        icon: (cls) => <FingerprintIcon className={cls} />,
        text: "Waiting for biometric scan...",
        buttonLabel: "Scanning...",
        buttonClass: `${styles.button} ${styles.buttonScanning}`,
      };
    case "success":
      return {
        icon: (cls) => <ShieldCheckIcon className={cls} />,
        text:
          mode === "register"
            ? "Biometric registered successfully"
            : "Authentication successful",
        buttonLabel: "Success",
        buttonClass: `${styles.button} ${styles.buttonSuccess}`,
      };
    case "error":
      return {
        icon: (cls) => <AlertIcon className={cls} />,
        text: errorMessage || "Biometric authentication failed",
        buttonLabel: "Try again",
        buttonClass: `${styles.button} ${styles.buttonError}`,
      };
  }
}

/* ── Component ─────────────────────────────────────────── */

/**
 * BiometricAuth provides a UI for WebAuthn-based biometric authentication.
 *
 * Supports both registration (creating a new credential) and authentication
 * (asserting an existing credential) flows. Renders an animated fingerprint
 * icon during the scanning phase and provides clear visual feedback for
 * each state of the ceremony.
 *
 * @example
 * ```tsx
 * <BiometricAuth
 *   mode="register"
 *   userId="user-123"
 *   userName="jane@example.com"
 *   onSuccess={(cred) => console.log("Credential:", cred)}
 *   onError={(err) => console.error("Error:", err)}
 * />
 * ```
 */
const BiometricAuth: FC<BiometricAuthProps> = ({
  onSuccess,
  onError,
  mode,
  rpName = "My App",
  rpId,
  userId,
  userName,
  className,
  timeout = 60000,
}) => {
  const [state, setState] = useState<BiometricState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [hasPlatformAuth, setHasPlatformAuth] = useState<boolean | null>(null);

  /* ── Feature detection ─────────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    async function detect(): Promise<void> {
      // Check basic WebAuthn support
      if (
        typeof window === "undefined" ||
        !window.PublicKeyCredential ||
        !navigator.credentials
      ) {
        if (!cancelled) {
          setIsSupported(false);
          setHasPlatformAuth(false);
        }
        return;
      }

      if (!cancelled) {
        setIsSupported(true);
      }

      // Check platform authenticator availability
      try {
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!cancelled) {
          setHasPlatformAuth(available);
        }
      } catch {
        if (!cancelled) {
          setHasPlatformAuth(false);
        }
      }
    }

    void detect();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Registration flow ─────────────────────────────── */

  const handleRegister = useCallback(async (): Promise<void> => {
    const effectiveRpId =
      rpId ??
      (typeof window !== "undefined" ? window.location.hostname : "localhost");

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: generateChallenge(),
      rp: {
        name: rpName,
        id: effectiveRpId,
      },
      user: {
        id: stringToBuffer(userId),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout,
      attestation: "none",
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error("Credential creation returned null");
    }

    const response =
      credential.response as AuthenticatorAttestationResponse;

    const result: BiometricCredentialResult = {
      credentialId: bufferToBase64url(credential.rawId),
      rawId: credential.rawId,
      type: credential.type,
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      attestationObject: bufferToBase64url(response.attestationObject),
    };

    return onSuccess(result);
  }, [rpId, rpName, userId, userName, timeout, onSuccess]);

  /* ── Authentication flow ───────────────────────────── */

  const handleAuthenticate = useCallback(async (): Promise<void> => {
    const effectiveRpId =
      rpId ??
      (typeof window !== "undefined" ? window.location.hostname : "localhost");

    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: generateChallenge(),
      rpId: effectiveRpId,
      userVerification: "required",
      timeout,
    };

    const credential = (await navigator.credentials.get({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error("Credential assertion returned null");
    }

    const response =
      credential.response as AuthenticatorAssertionResponse;

    const result: BiometricCredentialResult = {
      credentialId: bufferToBase64url(credential.rawId),
      rawId: credential.rawId,
      type: credential.type,
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      authenticatorData: bufferToBase64url(response.authenticatorData),
      signature: bufferToBase64url(response.signature),
    };

    return onSuccess(result);
  }, [rpId, timeout, onSuccess]);

  /* ── Trigger flow ──────────────────────────────────── */

  const handleClick = useCallback(async (): Promise<void> => {
    if (state === "scanning") return;

    setState("scanning");
    setErrorMessage("");

    try {
      if (mode === "register") {
        await handleRegister();
      } else {
        await handleAuthenticate();
      }
      setState("success");
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err : new Error("Unknown biometric error");

      // Provide user-friendly messages for common WebAuthn errors
      let friendlyMessage = error.message;
      if (error.name === "NotAllowedError") {
        friendlyMessage =
          "Biometric authentication was cancelled or not allowed";
      } else if (error.name === "SecurityError") {
        friendlyMessage =
          "Security error: check that the page is served over HTTPS";
      } else if (error.name === "AbortError") {
        friendlyMessage = "Authentication was aborted";
      } else if (error.name === "InvalidStateError") {
        friendlyMessage =
          mode === "register"
            ? "This authenticator is already registered"
            : "No matching credential found on this device";
      }

      setErrorMessage(friendlyMessage);
      setState("error");
      onError(error);
    }
  }, [state, mode, handleRegister, handleAuthenticate, onError]);

  /* ── Loading state while detecting support ─────────── */

  if (isSupported === null) {
    return null;
  }

  /* ── Unsupported fallback ──────────────────────────── */

  if (!isSupported) {
    return (
      <div
        className={`${styles.fallback}${className ? ` ${className}` : ""}`}
        role="alert"
      >
        <AlertIcon className={styles.icon} />
        <p className={styles.fallbackText}>
          Biometric authentication is not supported in this browser. Please use a
          modern browser with WebAuthn support (Chrome, Safari, Firefox, Edge).
        </p>
      </div>
    );
  }

  /* ── Main UI ───────────────────────────────────────── */

  const config = getStateConfig(state, mode, errorMessage);

  const containerClass = [
    styles.container,
    state === "scanning" ? styles.scanning : "",
    state === "success" ? styles.success : "",
    state === "error" ? styles.error : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass} role="region" aria-label="Biometric authentication">
      <h2 className={styles.title}>
        {mode === "register" ? "Register Biometric" : "Biometric Login"}
      </h2>

      <div className={styles.iconWrapper} aria-hidden="true">
        {config.icon(styles.icon)}
      </div>

      <p className={styles.statusText} aria-live="polite">
        {config.text}
      </p>

      {hasPlatformAuth === false && state === "idle" && (
        <p className={styles.statusText} role="alert">
          No platform authenticator detected. An external security key may be
          required.
        </p>
      )}

      <button
        type="button"
        className={config.buttonClass}
        onClick={() => void handleClick()}
        disabled={state === "scanning" || state === "success"}
        aria-busy={state === "scanning"}
      >
        {config.buttonLabel}
      </button>
    </div>
  );
};

export { BiometricAuth };
export type { BiometricAuthProps, BiometricCredentialResult };
export default BiometricAuth;
