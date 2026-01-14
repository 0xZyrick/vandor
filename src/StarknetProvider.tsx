import { mainnet } from "@starknet-react/chains";
import { 
  StarknetConfig, 
  argent, 
  braavos, 
  voyager, 
  useInjectedConnectors, 
  jsonRpcProvider
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "always",
  });

  const network = mainnet; 

  const rpcProvider = jsonRpcProvider({
    rpc: () => ({
      nodeUrl: 'https://free-rpc.nethermind.io/mainnet-juno',
    }),
  });

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