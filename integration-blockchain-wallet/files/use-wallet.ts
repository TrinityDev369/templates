"use client";

/**
 * useWallet — React hook for blockchain wallet interaction
 *
 * Returns the current wallet state (address, chainId, balance, etc.) and
 * actions (connect, disconnect, sendTransaction, signMessage, switchChain).
 *
 * Must be used inside a `<WalletProvider>`. Throws a descriptive error if
 * called outside the provider boundary.
 *
 * @example
 * ```tsx
 * import { useWallet } from "@/integrations/blockchain-wallet/use-wallet";
 *
 * function ConnectButton() {
 *   const { isConnected, address, balance, connect, disconnect } = useWallet();
 *
 *   if (isConnected) {
 *     return (
 *       <div>
 *         <p>{address}</p>
 *         <p>{balance} ETH</p>
 *         <button onClick={disconnect}>Disconnect</button>
 *       </div>
 *     );
 *   }
 *
 *   return <button onClick={connect}>Connect Wallet</button>;
 * }
 * ```
 */

import { useContext } from "react";

import { WalletContext } from "./wallet-provider";
import type { WalletContextValue } from "./wallet-provider";

/**
 * Access the wallet context from any component inside `<WalletProvider>`.
 *
 * @returns Combined wallet state and actions.
 * @throws If called outside of a `<WalletProvider>`.
 */
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error(
      "useWallet must be used within a <WalletProvider>. " +
        "Wrap your component tree with <WalletProvider config={...}>.",
    );
  }

  return context;
}
