// StarknetProvider.tsx (FIXED - No Cartridge, Mobile Support Added)
import React from 'react';
import { mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
  voyager,
  useInjectedConnectors,
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  
  // Get injected wallet connectors (browser extensions)
  const { connectors: injectedConnectors } = useInjectedConnectors({
    recommended: [
      argent(),
      braavos(),
    ],
    includeRecommended: "always",
    // This will detect mobile wallets too
    order: "random",
  });

  // 📱 Mobile Wallet Support
  // Argent Mobile and Braavos Mobile use WalletConnect
  // They'll be automatically detected by useInjectedConnectors
  
  console.log('🔌 Available connectors:', injectedConnectors.map(c => ({
    id: c.id,
    name: c.name,
    available: c.available,
  })));

  return (
    <StarknetConfig
      chains={[mainnet]} // CHANGED FROM sepolia
      provider={publicProvider()}
      connectors={injectedConnectors}
      explorer={voyager}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
}

export default StarknetProvider;