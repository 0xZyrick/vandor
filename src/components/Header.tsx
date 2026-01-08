import { useState, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect, useBalance } from "@starknet-react/core";
import PositionsDropdown from "../components/PositionsDropdown";
import { Menu, Settings, LogOut, HelpCircle, User, X, Wallet, Mail, CheckCircle } from "lucide-react";
import SideMenu from "./SideMenu";
import { connect as starknetKitConnect } from "starknetkit";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Header() {
  const { connect, connectors } = useConnect();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');

  const getWalletType = () => {
    if (!connector) return 'Wallet';
    // Cartridge often identifies as 'controller'
    if (connector.id.toLowerCase().includes('cartridge') || connector.id.toLowerCase().includes('controller')) {
       return 'Cartridge';
    }
    if (connector.id.includes('argent')) return 'Argent X';
    if (connector.id.includes('braavos')) return 'Braavos';
    return connector.name || 'Wallet';
  };

  // Show welcome toast on connection
  useEffect(() => {
    if (isConnected && connectionStatus === 'connecting') {
      // Use timeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setConnectionStatus('success');
        setShowWelcomeToast(true);
      }, 0);
      
      const toastTimer = setTimeout(() => {
        setShowWelcomeToast(false);
      }, 4000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(toastTimer);
      };
    }
  }, [isConnected, connectionStatus]);

  const handleConnect = async (selectedConnector?: any) => {
  setConnectionStatus('connecting');
  
  try {
    // If a specific connector was clicked (like Cartridge or Argent)
    if (selectedConnector) {
      await connect({ connector: selectedConnector });
    } else {
      // SMART MOBILE FALLBACK: If they just click "Connect" 
      // This opens the professional StarknetKit modal (perfect for mobile)
      const { connector } = await starknetKitConnect({
        connectors: connectors as any,
        dappName: "Vandor",
      });
      if (connector) await connect({ connector });
    }
    
    setShowLoginModal(false);
  } catch (error) {
    console.error('Connection failed:', error);
    setConnectionStatus('error');
  }
};

  const handleDisconnect = () => {
    disconnect();
    setShowProfilePopup(false);
    setConnectionStatus('idle');
  };

  // Group connectors by type
  const cartridgeConnector = connectors.find(c => c.id.includes('cartridge'));
  const walletConnectors = connectors.filter(c => !c.id.includes('cartridge'));

  return (
    <>
      <SideMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Welcome Toast */}
      {showWelcomeToast && (
        <div className="fixed top-20 right-6 z-100 animate-in slide-in-from-top-5 duration-3000">
          <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center gap-3 min-w-300px">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Connected Successfully!</p>
              <p className="text-gray-400 text-xs">Welcome to Vandor • {getWalletType()}</p>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-900 sticky top-0 bg-[#0a0a0f] z-50">
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="xl:hidden">
            <Menu className="h-6 w-6 text-gray-400 hover:text-white" />
          </button>
          <img src="/vandar.svg" alt="Vandor" className="h-8" />
        </div>

        {/* Center Section: Navigation */}
        <div className="hidden xl:flex">
          <nav className="flex items-center space-x-7">
            <a href="/markets" className="text-[16px] font-medium text-gray-400 hover:text-white transition">Markets</a>
            <a href="/btcusdc" className="text-[16px] font-medium text-gray-400 hover:text-white transition">Trade</a>
            <a href="/portfolio" className="text-[16px] font-medium text-gray-400 hover:text-white transition">Portfolio</a>
            <a href="/leaderboard" className="text-[16px] font-medium text-gray-800 hover:text-white transition p-0.5">Leaderboard<span className="text-xs text-white bg-blue-800 p-0.5 rounded">coming soon</span></a>
            <a href="/docs" className="text-[16px] font-medium text-gray-400 hover:text-white transition">Docs</a>
          </nav>
        </div>

        <div className='flex gap-2 items-center'>
          <PositionsDropdown />
        
          <div className='flex gap-4 items-center relative'>
            {isConnected ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfilePopup(!showProfilePopup)}
                  className="flex items-center gap-3 px-4 py-1.5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500/50 transition"
                >
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-white leading-tight">{getWalletType()}</p>
                    <p className="text-[10px] font-mono text-gray-500 leading-tight">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>

                {showProfilePopup && (
                  <div className="absolute right-0 mt-3 w-72 bg-[#0d0d12] border border-gray-800 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Balance</p>
                        <p className="text-xl font-bold">
                          {balance?.formatted ? Number(balance.formatted).toFixed(4) : "0.00"} {balance?.symbol || 'STRK'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">Vandor User</p>
                        <p className="text-[12px] text-blue-400">{getWalletType()}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-sm text-gray-300">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-sm text-gray-300">
                        <HelpCircle className="w-4 h-4" /> Help Center
                      </button>
                      <div className="h-px bg-gray-800 my-2" />
                      <button 
                        onClick={handleDisconnect}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-xl text-sm text-red-400"
                      >
                        <LogOut className="w-4 h-4" /> Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2.5 bg-blue-500 text-black font-black rounded-full hover:bg-white transition uppercase text-xs tracking-wide"
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'log in'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* LOGIN SELECTION MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-[#0d0d12] border border-gray-800 p-8 rounded-[40px] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Connect to Vandor</h2>
                <p className="text-gray-500 text-sm mt-1">Choose your preferred sign-in method</p>
              </div>
              <button 
                onClick={() => setShowLoginModal(false)} 
                className="p-2 bg-gray-900 rounded-full hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Cartridge Controller (Email/Username) */}
              {cartridgeConnector && (
                <>
                  <button
                    onClick={() => handleConnect(cartridgeConnector)}
                    disabled={connectionStatus === 'connecting'}
                    className="w-full py-5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-2 border-blue-500/50 rounded-2xl font-bold transition flex items-center px-6 gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span className="text-xs text-gray-600 uppercase font-semibold">Or use wallet</span>
                    <div className="flex-1 h-px bg-gray-800"></div>
                  </div>
                </>
              )}

              {/* Browser Wallets */}
              {walletConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={connectionStatus === 'connecting'}
                  className="w-full py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-2xl font-bold transition flex items-center px-6 gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden">
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

            {connectionStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm text-center">Connection failed. Please try again.</p>
              </div>
            )}

            <p className="mt-6 text-center text-[10px] text-gray-500 px-4">
              By connecting, you agree to Vandor's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </>
  );
}