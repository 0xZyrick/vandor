import { useState } from "react";
import { useConnect } from "@starknet-react/core";
import { X, Wallet, Mail } from "lucide-react";
import { ControllerConnector } from '@cartridge/connector'

const cartridgeController = new Controller({
  rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet",
});

/* eslint-disable @typescript-eslint/no-explicit-any */    

export default function ConnectModal({ onClose }: { onClose: () => void }) {
  const { connect, connectors } = useConnect();
  const [username, setUsername] = useState("");
  const [isCartridgeLoading, setIsCartridgeLoading] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  // Get wallet connectors (Argent, Braavos)
  const walletConnectors = connectors.filter(c => !c.id.includes('cartridge'));

  const handleCartridgeLogin = async () => {
    if (!username) {
      alert("Enter username or email");
      return;
    }
    
    setIsCartridgeLoading(true);
    try {
      const account = await cartridgeController.connect({ username });
      console.log("✅ Cartridge connected:", account.address);
      alert(`Connected!\nUsername: ${username}\nAddress: ${account.address}`);
      onClose();
    } catch (err: any) {
      console.error("Cartridge error:", err);
      alert(`Failed: ${err.message || "Connection error"}`);
    } finally {
      setIsCartridgeLoading(false);
    }
  };

  const handleWalletConnect = async (connector: any) => {
    try {
      await connect({ connector });
      onClose();
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="bg-[#0d0d12] border border-gray-800 p-8 rounded-[40px] w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Connect to Vandor</h2>
            <p className="text-gray-500 text-sm mt-1">Choose your sign-in method</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-900 rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!showUsernameInput ? (
          <div className="flex flex-col gap-3">
            {/* Cartridge Option */}
            <button
              onClick={() => setShowUsernameInput(true)}
              className="w-full py-5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-2 border-blue-500/50 rounded-2xl font-bold transition flex items-center px-6 gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-base font-bold text-white">Email / Username</p>
                <p className="text-[11px] text-blue-200">No seed phrase • Account Abstraction</p>
              </div>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-800"></div>
              <span className="text-xs text-gray-600 uppercase font-semibold">Or connect wallet</span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>

            {/* Wallet Options */}
            {walletConnectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleWalletConnect(connector)}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl font-bold transition flex items-center px-6 gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                  {connector.icon ? (
                    <img 
                      src={typeof connector.icon === 'string' ? connector.icon : connector.icon.dark} 
                      alt="" 
                      className="w-6 h-6" 
                    />
                  ) : (
                    <Wallet className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-white">{connector.name}</p>
                  <p className="text-[10px] text-gray-500">Browser Extension</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Username or Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <button
              onClick={handleCartridgeLogin}
              disabled={isCartridgeLoading}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition disabled:opacity-50"
            >
              {isCartridgeLoading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              onClick={() => setShowUsernameInput(false)}
              className="text-gray-500 hover:text-white text-sm"
            >
              ← Back to options
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-[10px] text-gray-500 px-4">
          By connecting, you agree to Vandor's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}