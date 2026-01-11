// StarknetProvider.tsx
import { mainnet } from "@starknet-react/chains";
import { 
  StarknetConfig, 
  argent, 
  braavos, 
  voyager, 
  useInjectedConnectors, 
  // publicProvider // Use this for reliability
  jsonRpcProvider
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "always",
  });

  // FORCE Mainnet here to stop the flip-flopping
  const network = mainnet; 

  const rpcProvider = jsonRpcProvider({
    rpc: () => ({
      // Nethermind is good, but Lava or Blast are often more stable for Mainnet
      nodeUrl: 'https://free-rpc.nethermind.io/mainnet-juno',
    }),
  });

  return (
    <StarknetConfig
      chains={[network]} // Only provide Mainnet
      provider={rpcProvider}
      connectors={connectors}
      explorer={voyager}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
}