"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const baseMainnet = {
  blockExplorerUrls: ["https://basescan.org"],
  chainId: 8453,
  chainName: "Base",
  iconUrls: ["https://avatars.githubusercontent.com/u/108554348"],
  name: "Base",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  networkId: 8453,
  rpcUrls: ["https://mainnet.base.org"],
  vanityName: "Base",
};

export default function DynamicProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "placeholder",
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: () => [baseMainnet],
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
