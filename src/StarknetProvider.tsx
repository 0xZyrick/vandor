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
  
  const { connectors: injectedConnectors } = useInjectedConnectors({
    recommended: [
      argent(),
      braavos(),
    ],
    includeRecommended: "always",
    order: "random",
  });

  console.log('🔌 Available connectors:', injectedConnectors.map(c => ({
    id: c.id,
    name: c.name,
    available: c.available,
  })));

   const NETWORK = mainnet;

  return (
    <StarknetConfig
      chains={[NETWORK]}
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