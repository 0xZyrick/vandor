import React from 'react';
import { sepolia, mainnet } from "@starknet-react/chains";
import { 
  StarknetConfig, 
  publicProvider, 
  argent,
  braavos,
  voyager,
  useInjectedConnectors,
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  
const { connectors } = useInjectedConnectors({
    recommended: [
      argent(), // Supports mobile/extension
      braavos(), 
    ],
    // This allows users to login via Email/Social if they don't have an extension
    includeRecommended: "always", 
  });

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={connectors}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}

export default StarknetProvider;