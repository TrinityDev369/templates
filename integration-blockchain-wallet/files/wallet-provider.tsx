"use client";

/**
 * Blockchain Wallet Provider
 *
 * React context provider that wraps `WalletClient` and exposes reactive
 * wallet state to the component tree. Handles account/chain change events,
 * auto-reconnection, and clean teardown on unmount.
 *
 * @example
 * ```tsx
 * import { WalletProvider } from "@/integrations/blockchain-wallet/wallet-provider";
 * import { SupportedChain } from "@/integrations/blockchain-wallet/types";
 *
 * const config = {
 *   appName: "My DApp",
 *   autoConnect: true,
 *   supportedChains: [
 *     { chainId: SupportedChain.EthereumMainnet, name: "Ethereum", rpcUrl: "https://eth.llamarpc.com", currencySymbol: "ETH" },
 *   ],
 * };
 *
 * export default function App({ children }: { children: React.ReactNode }) {
 *   return <WalletProvider config={config}>{children}</WalletProvider>;
 * }
 * ```
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { WalletClient } from "./client";
import type {
  WalletConfig,
  WalletState,
  TransactionRequest,
  TransactionResult,
  WalletActions,
} from "./types";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/** Combined context value: current wallet state + available actions. */
export interface WalletContextValue extends WalletState, WalletActions {}

/**
 * React context for the wallet. Consumers should use the `useWallet` hook
 * rather than consuming this context directly.
 */
export const WalletContext = createContext<WalletContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface WalletProviderProps {
  /** Wallet configuration (chains, app name, auto-connect flag). */
  config: WalletConfig;
  /** Child components that can consume the wallet context. */
  children: ReactNode;
}

/**
 * Provides wallet state and actions to the React component tree.
 *
 * The provider instantiates a `WalletClient` once and keeps React state
 * synchronised with the client's internal state via event listeners.
 */
export function WalletProvider({ config, children }: WalletProviderProps) {
  // Stable client reference — created once, survives re-renders.
  const clientRef = useRef<WalletClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = new WalletClient(config);
  }
  const client = clientRef.current;

  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isLoading: false,
    balance: null,
  });

  /** Sync React state with the client's internal state. */
  const syncState = useCallback(() => {
    setWalletState({ ...client.state });
  }, [client]);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const connect = useCallback(async () => {
    await client.connect();
    syncState();
  }, [client, syncState]);

  const disconnect = useCallback(() => {
    client.disconnect();
    syncState();
  }, [client, syncState]);

  const sendTransaction = useCallback(
    async (tx: TransactionRequest): Promise<TransactionResult> => {
      syncState(); // reflect isLoading immediately
      try {
        const result = await client.sendTransaction(tx);
        syncState();
        return result;
      } catch (error) {
        syncState();
        throw error;
      }
    },
    [client, syncState],
  );

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      return client.signMessage(message);
    },
    [client],
  );

  const switchChain = useCallback(
    async (chainId: number): Promise<void> => {
      await client.switchChain(chainId);
      syncState();
    },
    [client, syncState],
  );

  // -----------------------------------------------------------------------
  // Event listeners — account and chain changes from the wallet
  // -----------------------------------------------------------------------

  useEffect(() => {
    const handleAccountsChanged = () => {
      // Re-read state from the client which has already been updated.
      syncState();
    };

    const handleChainChanged = () => {
      syncState();
    };

    const handleDisconnect = () => {
      syncState();
    };

    client.on("accountsChanged", handleAccountsChanged);
    client.on("chainChanged", handleChainChanged);
    client.on("disconnect", handleDisconnect);

    return () => {
      client.off("accountsChanged", handleAccountsChanged);
      client.off("chainChanged", handleChainChanged);
      client.off("disconnect", handleDisconnect);
    };
  }, [client, syncState]);

  // -----------------------------------------------------------------------
  // Auto-reconnect on mount
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (config.autoConnect !== false && client.wasConnected()) {
      client
        .connect()
        .then(() => syncState())
        .catch(() => {
          // Auto-reconnect failure is non-fatal — user can manually connect.
        });
    }
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Context value
  // -----------------------------------------------------------------------

  const contextValue = useMemo<WalletContextValue>(
    () => ({
      ...walletState,
      connect,
      disconnect,
      sendTransaction,
      signMessage,
      switchChain,
    }),
    [walletState, connect, disconnect, sendTransaction, signMessage, switchChain],
  );

  return (
    <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
  );
}
