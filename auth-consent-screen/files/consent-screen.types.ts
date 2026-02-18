/** Risk level for an OAuth scope — determines visual indicator color. */
export type ScopeRisk = "low" | "medium" | "high";

/** A single OAuth scope requested by the application. */
export interface OAuthScope {
  /** Unique scope identifier (e.g. "read:profile", "write:repos"). */
  id: string;
  /** Human-readable scope name (e.g. "Read your profile"). */
  name: string;
  /** Longer description of what this scope grants. */
  description: string;
  /** Risk level — low (green), medium (yellow), high (red). */
  risk: ScopeRisk;
}

/** The third-party application requesting authorization. */
export interface OAuthApp {
  /** Display name of the application. */
  name: string;
  /** URL to the application's logo/icon. */
  logoUrl?: string;
  /** Short description of what the application does. */
  description: string;
  /** URL to the application's website. */
  websiteUrl?: string;
  /** Name of the developer or organization that created the app. */
  developerName?: string;
}

/** Props for the ConsentScreen component. */
export interface ConsentScreenProps {
  /** The application requesting access. */
  app: OAuthApp;
  /** List of OAuth scopes the application is requesting. */
  scopes: OAuthScope[];
  /** The currently authenticated user. */
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  /** Called when the user clicks "Allow". Should complete the authorization flow. */
  onAllow: () => Promise<void>;
  /** Called when the user clicks "Deny". Should redirect back to the app with an error. */
  onDeny: () => void;
}
