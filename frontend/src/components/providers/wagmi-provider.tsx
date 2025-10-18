"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { baseAccount } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { METADATA } from "../../lib/utils";

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    // [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: METADATA.name,
      appLogoUrl: METADATA.iconImageUrl,
    }),
  ],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
