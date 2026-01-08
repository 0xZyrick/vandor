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
import ControllerConnector from "@cartridge/controller";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  
  const { connectors: injectedConnectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "always"
  });

  // Cartridge Controller - use testnet RPC
  const isTestnet = import.meta.env.VITE_TESTNET_MODE === 'true';
  
  const controller = new ControllerConnector({
    rpcUrl: isTestnet 
      ? "https://api.cartridge.gg/x/starknet/sepolia"
      : "https://api.cartridge.gg/x/starknet/mainnet",
  }) as never as Connector;

  const allConnectors = [controller, ...injectedConnectors];

  return (
    <StarknetConfig
      chains={isTestnet ? [sepolia] : [mainnet, sepolia]}
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