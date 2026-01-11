// StarknetProvider.tsx - NUCLEAR FIX
import React from 'react';
import {
  StarknetConfig,
  argent,
  braavos,
  voyager,
  useInjectedConnectors,
  jsonRpcProvider,
} from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "always",
  });

  const network = import.meta.env.VITE_NETWORK === 'mainnet' ? mainnet : sepolia;

  // NUCLEAR FIX: Custom RPC provider that doesn't check version
  const rpcProvider = jsonRpcProvider({
    rpc: () => {
      const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
      
      return {
        nodeUrl: isMainnet 
          ? 'https://starknet-mainnet.public.blastapi.io/rpc/v0_7'
          : 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
      };
    },
  });

  console.log('🚀 Vandor starting...');
  console.log('🌍 Network:', network.network);
  console.log('🔌 Available connectors:', connectors);

  return (
    <StarknetConfig
      chains={[network]}
      provider={rpcProvider}
      connectors={connectors}
      explorer={voyager}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
}

export default StarknetProvider;