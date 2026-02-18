"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  Fingerprint,
  Key,
  Loader2,
  Shield,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type {
  AuthenticationAssertion,
  PasskeyCredential,
  PasskeyWebAuthnProps,
} from "./passkey-webauthn.types";

/* ── Base64url helpers ───────────────────────────────────── */

/**
 * Encode an ArrayBuffer to a base64url string (URL-safe, no padding).
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
 * Decode a base64url string back to an ArrayBuffer.
 */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random buffer of the given byte length.
 */
function randomBuffer(length: number): ArrayBuffer {
  return crypto.getRandomValues(new Uint8Array(length)).buffer;
}

/* ── Mode type ───────────────────────────────────────────── */

type Mode = "register" | "authenticate";

/* ── PasskeyWebAuthn component ───────────────────────────── */

export function PasskeyWebAuthn({
  onRegister,
  onAuthenticate,
  onError,
  registeredPasskeys = [],
  userName = "user@example.com",
  userDisplayName = "User",
}: PasskeyWebAuthnProps) {
  const [mode, setMode] = React.useState<Mode>("authenticate");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSupported, setIsSupported] = React.useState(true);

  /* ── Browser support check ──────────────────────────────── */

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.PublicKeyCredential
    ) {
      setIsSupported(false);
    }
  }, []);

  /* ── Error handling ─────────────────────────────────────── */

  const handleError = React.useCallback(
    (err: unknown) => {
      const error =
        err instanceof Error ? err : new Error(String(err));

      // Translate common WebAuthn errors to user-friendly messages
      let message: string;
      if (error.name === "NotAllowedError") {
        message = "The operation was cancelled or timed out. Please try again.";
      } else if (error.name === "SecurityError") {
        message =
          "A security error occurred. Ensure you are using HTTPS.";
      } else if (error.name === "InvalidStateError") {
        message =
          "This authenticator is already registered. Try signing in instead.";
      } else if (error.name === "NotSupportedError") {
        message =
          "Your browser or device does not support this authentication method.";
      } else {
        message = error.message || "An unexpected error occurred.";
      }

      setError(message);
      setSuccess(null);

      if (onError) {
        onError(error);
      }
    },
    [onError],
  );

  /* ── Registration ceremony ──────────────────────────────── */

  const handleRegister = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userId = randomBuffer(32);
      const challenge = randomBuffer(32);

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: document.title || "WebAuthn App",
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: userName,
          displayName: userDisplayName,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },   // ES256
          { alg: -257, type: "public-key" },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "preferred",
          userVerification: "preferred",
        },
        timeout: 60000,
        attestation: "none",
        // Exclude already-registered credentials to prevent duplicates
        excludeCredentials: registeredPasskeys.map((pk) => ({
          id: base64urlToBuffer(pk.id),
          type: "public-key" as const,
          transports: pk.transports as AuthenticatorTransport[],
        })),
      };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("No credential returned from authenticator.");
      }

      const response =
        credential.response as AuthenticatorAttestationResponse;

      const passkeyCredential: PasskeyCredential = {
        id: bufferToBase64url(credential.rawId),
        rawId: bufferToBase64url(credential.rawId),
        type: "public-key",
        publicKey: bufferToBase64url(response.getPublicKey?.() ?? new ArrayBuffer(0)),
        transports: (response.getTransports?.() as string[]) ?? [],
        createdAt: new Date().toISOString(),
      };

      await onRegister(passkeyCredential);
      setSuccess("Passkey registered successfully!");
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    userName,
    userDisplayName,
    registeredPasskeys,
    onRegister,
    handleError,
  ]);

  /* ── Authentication ceremony ────────────────────────────── */

  const handleAuthenticate = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const challenge = randomBuffer(32);

      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        timeout: 60000,
        userVerification: "preferred",
        // Allow any registered credential (empty = discoverable)
        allowCredentials:
          registeredPasskeys.length > 0
            ? registeredPasskeys.map((pk) => ({
                id: base64urlToBuffer(pk.id),
                type: "public-key" as const,
                transports: pk.transports as AuthenticatorTransport[],
              }))
            : [],
      };

      const assertion = (await navigator.credentials.get({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential | null;

      if (!assertion) {
        throw new Error("No assertion returned from authenticator.");
      }

      const response =
        assertion.response as AuthenticatorAssertionResponse;

      const authAssertion: AuthenticationAssertion = {
        id: bufferToBase64url(assertion.rawId),
        rawId: bufferToBase64url(assertion.rawId),
        signature: bufferToBase64url(response.signature),
        authenticatorData: bufferToBase64url(response.authenticatorData),
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
      };

      await onAuthenticate(authAssertion);
      setSuccess("Authentication successful!");
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [registeredPasskeys, onAuthenticate, handleError]);

  /* ── Render helpers ─────────────────────────────────────── */

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  /* ── Unsupported browser ────────────────────────────────── */

  if (!isSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Passkeys Not Supported</CardTitle>
            <CardDescription>
              Your browser does not support WebAuthn passkeys. Please use a
              modern browser such as Chrome, Safari, Firefox, or Edge.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  /* ── Main UI ────────────────────────────────────────────── */

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">
            {mode === "register"
              ? "Register a Passkey"
              : "Sign In with Passkey"}
          </CardTitle>
          <CardDescription>
            {mode === "register"
              ? "Create a passkey using your fingerprint, face, or security key"
              : "Use your registered passkey to sign in securely"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success alert */}
          {success && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Action button */}
          {mode === "register" ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating passkey...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Create Passkey
                </>
              )}
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleAuthenticate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Sign In with Passkey
                </>
              )}
            </Button>
          )}

          {/* Registered passkeys list */}
          {registeredPasskeys.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-muted-foreground">
                Registered Passkeys ({registeredPasskeys.length})
              </p>
              <div className="space-y-2">
                {registeredPasskeys.map((passkey) => (
                  <div
                    key={passkey.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {passkey.transports.includes("internal") ? (
                        <Fingerprint className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Key className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {passkey.transports.includes("internal")
                            ? "Platform Authenticator"
                            : "Security Key"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDate(passkey.createdAt)} &middot;{" "}
                          {passkey.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Trash2 className="h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-destructive" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "register" ? "authenticate" : "register");
              setError(null);
              setSuccess(null);
            }}
          >
            {mode === "register"
              ? "Already have a passkey? Sign in"
              : "Register a new passkey"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
