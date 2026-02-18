/**
 * Type definitions for the trusted devices management component.
 *
 * Covers device metadata (browser, OS, location, device type) and
 * the callbacks for revoking individual or all other devices.
 */

/* -- Device types ------------------------------------------------ */

/**
 * Discriminated device category used to select the appropriate icon
 * and label in the device list.
 */
export type DeviceType = "desktop" | "mobile" | "tablet";

/* -- Device entity ----------------------------------------------- */

/**
 * Represents a single trusted device that has authenticated against
 * the user's account.
 */
export interface TrustedDevice {
  /** Unique identifier for this device/session. */
  id: string;

  /** Human-readable device name, e.g. "MacBook Pro", "iPhone 15 Pro". */
  name: string;

  /** Browser name and version, e.g. "Chrome 122", "Safari 17.3". */
  browser: string;

  /** Operating system, e.g. "macOS 14.3", "Windows 11", "iOS 17.3". */
  os: string;

  /** Optional geographic location, e.g. "Berlin, Germany". */
  location?: string;

  /** Optional IP address from which the device last connected. */
  ip?: string;

  /** Timestamp of the last activity on this device (ISO string or Date). */
  lastActive: Date | string;

  /** Whether this device is the one currently making the request. */
  isCurrent: boolean;

  /** The form factor of the device. */
  deviceType: DeviceType;
}

/* -- Component props --------------------------------------------- */

/**
 * Props for the top-level DeviceTrust component.
 */
export interface DeviceTrustProps {
  /** List of trusted devices to display. */
  devices: TrustedDevice[];

  /**
   * Called when the user confirms revoking a single device.
   * Should resolve when the server has acknowledged the revocation.
   */
  onRevoke: (deviceId: string) => Promise<void>;

  /**
   * Called when the user confirms revoking all devices except the current one.
   * Should resolve when the server has acknowledged the revocation.
   * When omitted, the "Revoke all other devices" button is hidden.
   */
  onRevokeAll?: () => Promise<void>;

  /** When true, displays a loading skeleton instead of the device list. */
  isLoading?: boolean;
}
