/**
 * Blockchain Wallet Integration — Type Definitions
 *
 * Strongly-typed interfaces for wallet configuration, state management,
 * transaction handling, and supported chain definitions.
 */

// ---------------------------------------------------------------------------
// Supported Chains
// ---------------------------------------------------------------------------

/** Well-known EVM chain identifiers. */
export enum SupportedChain {
  /** Ethereum mainnet (chain ID 1). */
  EthereumMainnet = 1,
  /** Goerli testnet (chain ID 5). */
  Goerli = 5,
  /** Sepolia testnet (chain ID 11155111). */
  Sepolia = 11155111,
  /** Polygon mainnet (chain ID 137). */
  Polygon = 137,
  /** Polygon Mumbai testnet (chain ID 80001). */
  PolygonMumbai = 80001,
  /** Arbitrum One mainnet (chain ID 42161). */
  ArbitrumOne = 42161,
  /** Arbitrum Goerli testnet (chain ID 421613). */
  ArbitrumGoerli = 421613,
  /** Optimism mainnet (chain ID 10). */
  Optimism = 10,
  /** Base mainnet (chain ID 8453). */
  Base = 8453,
  /** Avalanche C-Chain mainnet (chain ID 43114). */
  Avalanche = 43114,
  /** BNB Smart Chain mainnet (chain ID 56). */
  BNBChain = 56,
}

// ---------------------------------------------------------------------------
// Chain Metadata
// ---------------------------------------------------------------------------

/** Metadata for an EVM-compatible chain. */
export interface ChainConfig {
  /** Numeric chain ID. */
  chainId: number;
  /** Human-readable chain name, e.g. "Ethereum Mainnet". */
  name: string;
  /** JSON-RPC endpoint URL. */
  rpcUrl: string;
  /** Native currency symbol, e.g. "ETH". */
  currencySymbol: string;
  /** Block explorer URL (optional). */
  blockExplorerUrl?: string;
}

// ---------------------------------------------------------------------------
// Wallet Configuration
// ---------------------------------------------------------------------------

/** Top-level configuration passed to the wallet client and provider. */
export interface WalletConfig {
  /** Application name shown in wallet connection prompts. */
  appName: string;
  /** Chains the application supports. At least one is required. */
  supportedChains: ChainConfig[];
  /** Whether to auto-connect on page load if a previous session exists. */
  autoConnect?: boolean;
}

// ---------------------------------------------------------------------------
// Wallet State
// ---------------------------------------------------------------------------

/** Current state of the connected wallet. */
export interface WalletState {
  /** The connected account address, or `null` if disconnected. */
  address: string | null;
  /** The active chain ID, or `null` if disconnected. */
  chainId: number | null;
  /** Whether a wallet is currently connected. */
  isConnected: boolean;
  /** Whether a connection or transaction is in progress. */
  isLoading: boolean;
  /** Native token balance in ETH (as a decimal string), or `null` if unknown. */
  balance: string | null;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

/** Parameters for sending an on-chain transaction. */
export interface TransactionRequest {
  /** Recipient address (0x-prefixed hex string). */
  to: string;
  /** Value to send in wei (as a decimal string or bigint-compatible value). */
  value?: string;
  /** Calldata for contract interactions (0x-prefixed hex string). */
  data?: string;
  /** Gas limit override. When omitted the provider estimates automatically. */
  gasLimit?: string;
}

/** Outcome of a submitted transaction. */
export interface TransactionResult {
  /** Transaction hash (0x-prefixed hex string). */
  hash: string;
  /** Confirmation status. */
  status: "pending" | "confirmed" | "failed";
  /** Full transaction receipt once confirmed, or `null` while pending. */
  receipt: TransactionReceipt | null;
}

/** Minimal transaction receipt fields. */
export interface TransactionReceipt {
  /** Transaction hash. */
  transactionHash: string;
  /** Block number the transaction was included in. */
  blockNumber: number;
  /** Gas actually consumed by the transaction. */
  gasUsed: string;
  /** Effective gas price in wei. */
  effectiveGasPrice: string;
  /** `1` for success, `0` for revert. */
  status: number;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Error codes emitted by the wallet client. */
export enum WalletErrorCode {
  /** No injected provider (e.g. MetaMask) was detected. */
  NO_PROVIDER = "NO_PROVIDER",
  /** The user rejected the connection or transaction request. */
  USER_REJECTED = "USER_REJECTED",
  /** The requested chain is not in the supported chains list. */
  UNSUPPORTED_CHAIN = "UNSUPPORTED_CHAIN",
  /** Chain switch failed (e.g. user rejected the network add prompt). */
  CHAIN_SWITCH_FAILED = "CHAIN_SWITCH_FAILED",
  /** Transaction submission or confirmation failed. */
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  /** Message signing was rejected or failed. */
  SIGN_FAILED = "SIGN_FAILED",
  /** A generic/unknown error occurred. */
  UNKNOWN = "UNKNOWN",
}

/** Typed error thrown by wallet operations. */
export class WalletError extends Error {
  /** Machine-readable error code. */
  readonly code: WalletErrorCode;

  constructor(code: WalletErrorCode, message: string) {
    super(message);
    this.name = "WalletError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Wallet Actions (used by the React hook)
// ---------------------------------------------------------------------------

/** Actions exposed by the `useWallet` hook alongside wallet state. */
export interface WalletActions {
  /** Prompt the user to connect their wallet. */
  connect: () => Promise<void>;
  /** Disconnect the wallet and clear local state. */
  disconnect: () => void;
  /** Send a transaction and wait for confirmation. */
  sendTransaction: (tx: TransactionRequest) => Promise<TransactionResult>;
  /** Request a personal signature (EIP-191). */
  signMessage: (message: string) => Promise<string>;
  /** Switch to a different supported chain. */
  switchChain: (chainId: number) => Promise<void>;
}
