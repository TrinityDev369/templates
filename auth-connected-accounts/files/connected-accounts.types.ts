/**
 * Type definitions for the Connected Accounts settings component.
 */

/** Supported OAuth providers. */
export type OAuthProvider = "google" | "github" | "apple" | "microsoft" | "slack" | "discord";

/** A connected account entry. */
export interface ConnectedAccount {
  /** The OAuth provider identifier. */
  provider: OAuthProvider;
  /** Whether this provider is currently connected. */
  connected: boolean;
  /** Display email or username for the connected account. */
  accountLabel?: string;
  /** ISO timestamp of when the account was connected. */
  connectedAt?: string;
}

/** Props for the ConnectedAccounts component. */
export interface ConnectedAccountsProps {
  /** List of accounts with their connection status. */
  accounts: ConnectedAccount[];

  /**
   * Called when the user clicks "Connect" on a disconnected provider.
   * The implementation should initiate the OAuth flow.
   */
  onConnect: (provider: OAuthProvider) => Promise<void>;

  /**
   * Called when the user clicks "Disconnect" on a connected provider.
   * The implementation should revoke the OAuth connection.
   */
  onDisconnect: (provider: OAuthProvider) => Promise<void>;

  /**
   * Minimum number of connected accounts required.
   * If the user would go below this threshold, disconnect is disabled.
   * Defaults to 1.
   */
  minConnected?: number;
}
