import React from 'react';
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
  voyager,
  useInjectedConnectors,
  Connector
} from "@starknet-react/core";

// CORRECT Cartridge import
import ControllerConnector from "@cartridge/controller";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors: injectedConnectors } = useInjectedConnectors({
    recommended: [
      argent(),
      braavos(),
    ],
    includeRecommended: "onlyIfNoConnectors",
  });

  // Cartridge Controller for Sepolia testnet
  const controller = new ControllerConnector({
    rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    policies: []
  }) as never as Connector;

  // Combine all connectors
  const allConnectors = [
    controller,
    ...injectedConnectors
  ];

    console.log('🔌 Available connectors:', allConnectors.map(c => c.id));

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={allConnectors}
      explorer={voyager}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
}

export default StarknetProvider;