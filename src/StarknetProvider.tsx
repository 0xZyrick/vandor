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
    includeRecommended: "always",
  });

  // Cartridge Controller for Sepolia testnet
  const controller = new ControllerConnector({
    rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
  }) as never as Connector;

  // Combine all connectors
  const allConnectors = [
    controller,
    ...injectedConnectors
  ];

  return (
    <StarknetConfig
      chains={[sepolia]}
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