import React from 'react';
import { sepolia} from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
  voyager,
  useInjectedConnectors,
} from "@starknet-react/core";

// NEW: Cartridge imports
import { CartridgeController } from "@cartridge/controller";

const cartridgeConnector = new CartridgeController({
  // Tip: For testing, you don't actually need a project ID, 
  // but it's better to get one from controller.cartridge.gg
  projectId: "VANDOR_TESTNET_01", 
  rpc: "https://api.cartridge.gg/x/starknet/sepolia", // ✅ Changed to Sepolia
}).connector();

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [
      argent(),
      braavos(),
      cartridgeConnector,
    ],
    includeRecommended: "always",
  });

  return (
    <StarknetConfig
      chains={[sepolia]} // ✅ Default to Sepolia only for now to avoid confusion
      provider={publicProvider()}
      connectors={connectors}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}