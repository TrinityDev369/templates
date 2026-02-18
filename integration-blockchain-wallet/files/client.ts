/**
 * Blockchain Wallet Client
 *
 * Pure ethers.js v6 client for interacting with EVM-compatible wallets.
 * Handles connection, chain switching, balance queries, transaction sending,
 * message signing, and event subscriptions. No React dependencies.
 *
 * @example
 * ```ts
 * import { WalletClient } from "@/integrations/blockchain-wallet/client";
 * import { SupportedChain } from "@/integrations/blockchain-wallet/types";
 *
 * const client = new WalletClient({
 *   appName: "My DApp",
 *   supportedChains: [
 *     { chainId: SupportedChain.EthereumMainnet, name: "Ethereum", rpcUrl: "https://eth.llamarpc.com", currencySymbol: "ETH" },
 *   ],
 * });
 *
 * await client.connect();
 * const balance = await client.getBalance();
 * ```
 */

import { BrowserProvider, formatEther, parseEther } from "ethers";
import type { Eip1193Provider, TransactionResponse } from "ethers";

import type {
  WalletConfig,
  WalletState,
  TransactionRequest,
  TransactionResult,
  TransactionReceipt,
  ChainConfig,
} from "./types";
import { WalletError, WalletErrorCode } from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Key used to persist the "previously connected" flag in localStorage. */
const STORAGE_KEY = "blockchain-wallet:connected";

/** Convert a chain ID number to the 0x-prefixed hex string that wallet_addEthereumChain expects. */
function toHexChainId(chainId: number): string {
  return "0x" + chainId.toString(16);
}

/**
 * Detect an EIP-1193 injected provider.
 * Throws `WalletError(NO_PROVIDER)` when no provider is found.
 */
function getInjectedProvider(): Eip1193Provider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new WalletError(
      WalletErrorCode.NO_PROVIDER,
      "No injected wallet provider detected. Install MetaMask or another Web3 wallet.",
    );
  }
  return window.ethereum as Eip1193Provider;
}

/**
 * Map a raw error into a typed `WalletError`.
 * MetaMask and other wallets use error code `4001` for user rejections.
 */
function mapError(error: unknown, fallbackCode: WalletErrorCode): WalletError {
  if (error instanceof WalletError) return error;

  const rawCode = (error as { code?: number })?.code;
  const message = error instanceof Error ? error.message : String(error);

  if (rawCode === 4001) {
    return new WalletError(WalletErrorCode.USER_REJECTED, "User rejected the request.");
  }

  return new WalletError(fallbackCode, message);
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

/** Events emitted by the wallet client. */
export type WalletEventType = "accountsChanged" | "chainChanged" | "disconnect";

/** Callback signature for wallet events. */
export type WalletEventCallback = (data: string[] | string | null) => void;

// ---------------------------------------------------------------------------
// WalletClient
// ---------------------------------------------------------------------------

/**
 * Stateful client that wraps an injected EIP-1193 provider via ethers.js v6.
 *
 * Lifecycle: construct -> connect -> interact -> disconnect.
 * Subscribe to account/chain change events via `on` / `off`.
 */
export class WalletClient {
  private readonly config: WalletConfig;
  private provider: BrowserProvider | null = null;
  private listeners: Map<WalletEventType, Set<WalletEventCallback>> = new Map();
  private boundAccountsChanged: ((accounts: string[]) => void) | null = null;
  private boundChainChanged: ((chainId: string) => void) | null = null;

  /** Current wallet state (read-only snapshot). */
  state: WalletState = {
    address: null,
    chainId: null,
    isConnected: false,
    isLoading: false,
    balance: null,
  };

  constructor(config: WalletConfig) {
    if (!config.supportedChains.length) {
      throw new WalletError(
        WalletErrorCode.UNSUPPORTED_CHAIN,
        "WalletConfig.supportedChains must contain at least one chain.",
      );
    }
    this.config = config;
  }

  // -----------------------------------------------------------------------
  // Connection
  // -----------------------------------------------------------------------

  /**
   * Request wallet connection. Prompts the user to approve account access.
   * On success, subscribes to account/chain change events and persists
   * the connected flag for auto-reconnect.
   */
  async connect(): Promise<void> {
    try {
      this.state = { ...this.state, isLoading: true };

      const injected = getInjectedProvider();
      this.provider = new BrowserProvider(injected);

      // Request accounts (triggers MetaMask popup if not already approved).
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      // Fetch initial balance.
      const balanceWei = await this.provider.getBalance(address);
      const balance = formatEther(balanceWei);

      this.state = {
        address,
        chainId,
        isConnected: true,
        isLoading: false,
        balance,
      };

      this.subscribeToProviderEvents(injected);
      this.persistConnection(true);
    } catch (error) {
      this.state = { ...this.state, isLoading: false };
      throw mapError(error, WalletErrorCode.UNKNOWN);
    }
  }

  /**
   * Disconnect the wallet. Clears state, removes event listeners, and
   * removes the persisted connection flag.
   */
  disconnect(): void {
    this.unsubscribeFromProviderEvents();
    this.provider = null;
    this.state = {
      address: null,
      chainId: null,
      isConnected: false,
      isLoading: false,
      balance: null,
    };
    this.persistConnection(false);
    this.emit("disconnect", null);
  }

  // -----------------------------------------------------------------------
  // Chain management
  // -----------------------------------------------------------------------

  /**
   * Switch to a different chain. If the chain is not yet added to the user's
   * wallet, attempts to add it automatically using `wallet_addEthereumChain`.
   *
   * @param chainId - Target chain ID (must be in `config.supportedChains`).
   */
  async switchChain(chainId: number): Promise<void> {
    const chainConfig = this.findChain(chainId);
    if (!chainConfig) {
      throw new WalletError(
        WalletErrorCode.UNSUPPORTED_CHAIN,
        `Chain ${chainId} is not in the supported chains list.`,
      );
    }

    const injected = getInjectedProvider();

    try {
      await (injected as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHexChainId(chainId) }],
      });
    } catch (error: unknown) {
      const code = (error as { code?: number })?.code;

      // 4902 = chain not added to wallet yet.
      if (code === 4902) {
        try {
          await (injected as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: toHexChainId(chainId),
                chainName: chainConfig.name,
                rpcUrls: [chainConfig.rpcUrl],
                nativeCurrency: {
                  name: chainConfig.currencySymbol,
                  symbol: chainConfig.currencySymbol,
                  decimals: 18,
                },
                blockExplorerUrls: chainConfig.blockExplorerUrl
                  ? [chainConfig.blockExplorerUrl]
                  : undefined,
              },
            ],
          });
        } catch (addError) {
          throw mapError(addError, WalletErrorCode.CHAIN_SWITCH_FAILED);
        }
      } else {
        throw mapError(error, WalletErrorCode.CHAIN_SWITCH_FAILED);
      }
    }

    // Refresh state after switch.
    await this.refreshState();
  }

  // -----------------------------------------------------------------------
  // Balance & Address
  // -----------------------------------------------------------------------

  /**
   * Fetch the native token balance for the connected account.
   *
   * @returns Balance in ETH as a decimal string.
   */
  async getBalance(): Promise<string> {
    this.ensureConnected();

    const balanceWei = await this.provider!.getBalance(this.state.address!);
    const balance = formatEther(balanceWei);

    this.state = { ...this.state, balance };
    return balance;
  }

  /**
   * Get the current connected address.
   *
   * @returns The 0x-prefixed account address.
   */
  getAddress(): string {
    this.ensureConnected();
    return this.state.address!;
  }

  // -----------------------------------------------------------------------
  // Transactions
  // -----------------------------------------------------------------------

  /**
   * Send a transaction via the connected wallet.
   *
   * Waits for the transaction to be confirmed (1 block) and returns
   * the result with receipt.
   *
   * @param tx - Transaction parameters.
   * @returns Transaction result with hash, status, and receipt.
   */
  async sendTransaction(tx: TransactionRequest): Promise<TransactionResult> {
    this.ensureConnected();

    try {
      this.state = { ...this.state, isLoading: true };

      const signer = await this.provider!.getSigner();

      const txParams: Record<string, unknown> = { to: tx.to };
      if (tx.value) txParams.value = parseEther(tx.value);
      if (tx.data) txParams.data = tx.data;
      if (tx.gasLimit) txParams.gasLimit = BigInt(tx.gasLimit);

      const response: TransactionResponse = await signer.sendTransaction(txParams);

      // Wait for 1 confirmation.
      const ethersReceipt = await response.wait(1);

      if (!ethersReceipt) {
        this.state = { ...this.state, isLoading: false };
        return {
          hash: response.hash,
          status: "failed",
          receipt: null,
        };
      }

      const receipt: TransactionReceipt = {
        transactionHash: ethersReceipt.hash,
        blockNumber: ethersReceipt.blockNumber,
        gasUsed: ethersReceipt.gasUsed.toString(),
        effectiveGasPrice: ethersReceipt.gasPrice.toString(),
        status: ethersReceipt.status ?? 0,
      };

      this.state = { ...this.state, isLoading: false };

      // Refresh balance after transaction.
      this.getBalance().catch(() => {
        /* best-effort refresh */
      });

      return {
        hash: response.hash,
        status: receipt.status === 1 ? "confirmed" : "failed",
        receipt,
      };
    } catch (error) {
      this.state = { ...this.state, isLoading: false };
      throw mapError(error, WalletErrorCode.TRANSACTION_FAILED);
    }
  }

  // -----------------------------------------------------------------------
  // Message signing
  // -----------------------------------------------------------------------

  /**
   * Request a personal signature (EIP-191) from the connected wallet.
   *
   * @param message - The plaintext message to sign.
   * @returns The hex-encoded signature string.
   */
  async signMessage(message: string): Promise<string> {
    this.ensureConnected();

    try {
      const signer = await this.provider!.getSigner();
      return await signer.signMessage(message);
    } catch (error) {
      throw mapError(error, WalletErrorCode.SIGN_FAILED);
    }
  }

  // -----------------------------------------------------------------------
  // Event system
  // -----------------------------------------------------------------------

  /**
   * Subscribe to wallet events.
   *
   * @param event    - Event type: `"accountsChanged"`, `"chainChanged"`, or `"disconnect"`.
   * @param callback - Listener function.
   */
  on(event: WalletEventType, callback: WalletEventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from a wallet event.
   *
   * @param event    - Event type.
   * @param callback - The exact callback reference passed to `on`.
   */
  off(event: WalletEventType, callback: WalletEventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  // -----------------------------------------------------------------------
  // Auto-reconnect support
  // -----------------------------------------------------------------------

  /**
   * Check whether a previous session was persisted.
   * Used by the provider to decide if auto-connect should fire.
   */
  wasConnected(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  /** Find a chain config by ID, or return undefined. */
  private findChain(chainId: number): ChainConfig | undefined {
    return this.config.supportedChains.find((c) => c.chainId === chainId);
  }

  /** Assert that the wallet is connected, or throw. */
  private ensureConnected(): void {
    if (!this.state.isConnected || !this.provider || !this.state.address) {
      throw new WalletError(
        WalletErrorCode.UNKNOWN,
        "Wallet is not connected. Call connect() first.",
      );
    }
  }

  /** Persist or clear the connection flag in localStorage. */
  private persistConnection(connected: boolean): void {
    try {
      if (connected) {
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable (SSR, private mode) — silently ignore.
    }
  }

  /** Refresh address, chainId, and balance from the provider. */
  private async refreshState(): Promise<void> {
    if (!this.provider) return;

    try {
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      const balanceWei = await this.provider.getBalance(address);
      const balance = formatEther(balanceWei);

      this.state = {
        ...this.state,
        address,
        chainId,
        balance,
        isConnected: true,
      };
    } catch {
      // If refresh fails the state remains stale — callers handle as needed.
    }
  }

  /** Wire up the injected provider's EIP-1193 events. */
  private subscribeToProviderEvents(injected: Eip1193Provider): void {
    const ethereum = injected as Eip1193Provider & {
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };

    this.boundAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.state = { ...this.state, address: accounts[0] };
        this.getBalance().catch(() => {});
        this.emit("accountsChanged", accounts);
      }
    };

    this.boundChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      this.state = { ...this.state, chainId };

      // Re-create provider to pick up the new chain.
      this.provider = new BrowserProvider(injected);
      this.getBalance().catch(() => {});
      this.emit("chainChanged", chainIdHex);
    };

    ethereum.on("accountsChanged", this.boundAccountsChanged);
    ethereum.on("chainChanged", this.boundChainChanged);
  }

  /** Remove injected provider event listeners. */
  private unsubscribeFromProviderEvents(): void {
    try {
      const ethereum = getInjectedProvider() as Eip1193Provider & {
        removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      };

      if (this.boundAccountsChanged) {
        ethereum.removeListener("accountsChanged", this.boundAccountsChanged);
        this.boundAccountsChanged = null;
      }
      if (this.boundChainChanged) {
        ethereum.removeListener("chainChanged", this.boundChainChanged);
        this.boundChainChanged = null;
      }
    } catch {
      // No provider available — nothing to unsubscribe from.
    }
  }

  /** Emit an event to all registered listeners. */
  private emit(event: WalletEventType, data: string[] | string | null): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        try {
          cb(data);
        } catch {
          // Listener errors must not break the client.
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Window type augmentation for TypeScript
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}
