/** A single entry in the IP allowlist. */
export interface IpAllowlistEntry {
  /** Unique identifier for this entry. */
  id: string;

  /** IPv4 address or CIDR notation (e.g. "192.168.1.0/24"). */
  value: string;

  /** Optional human-readable label or note for this entry. */
  note?: string;

  /** Whether this individual entry is active. */
  enabled: boolean;
}

export interface IpAllowlistProps {
  /** Current list of allowlist entries. */
  entries: IpAllowlistEntry[];

  /**
   * Called when the user submits a new entry.
   * The consumer is responsible for generating the `id` and persisting.
   */
  onAdd: (value: string, note: string) => void;

  /** Called when the user removes an entry by its id. */
  onRemove: (id: string) => void;

  /** Called when the user toggles an individual entry on or off. */
  onToggleEntry: (id: string, enabled: boolean) => void;

  /** Called when the user toggles the master enforcement switch. */
  onToggleEnforcement: (enforced: boolean) => void;

  /** Whether the allowlist is currently being enforced. */
  enforced: boolean;

  /** Optional class name forwarded to the root element. */
  className?: string;
}
