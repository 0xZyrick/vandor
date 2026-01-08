// ============================================
// StarknetProvider.tsx - CORRECT CARTRIDGE IMPLEMENTATION
// ============================================
"use client"
import React from 'react';
import { sepolia, mainnet } from "@starknet-react/chains";
import { 
  StarknetConfig, 
  publicProvider, 
  argent,
  braavos,
  voyager,
  useInjectedConnectors,
  Connector
} from "@starknet-react/core";

// CORRECT: Use @cartridge/controller (not @cartridge/connector)
import ControllerConnector from "@cartridge/controller";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  
  // Injected wallets (Argent X, Braavos)
  const { connectors: injectedConnectors } = useInjectedConnectors({
    recommended: [
      argent(),
      braavos(), 
    ],
    includeRecommended: "always"
  });

  // Cartridge Controller - CORRECT WAY
  const controller = new ControllerConnector({
    rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet",
  }) as never as Connector;

  // Combine all connectors
  const allConnectors = [
    controller,
    ...injectedConnectors
  ];

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={allConnectors}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}

export default StarknetProvider;
