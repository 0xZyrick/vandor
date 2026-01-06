

import { useState } from 'react';
import { useConnect, useAccount, useDisconnect, useBalance } from "@starknet-react/core";
import  PositionsDropdown  from"../components/PositionsDropdown"
import { Menu, Settings, LogOut, HelpCircle, User, X} from "lucide-react"
import SideMenu from "./SideMenu"

export default function Header() {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  // const [showModal, setShowModal] = useState(false);
  const { data: balance } = useBalance({ address });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
    <SideMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-900 sticky top-0 bg-[#0a0a0f] z-50">
            <div className="flex gap-4 items-center">
              {/* Menu Button linked to Sidebar */}
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
                <Menu className="h-6 w-6 text-gray-400 hover:text-white" />
              </button>
              <img src="/vandar.svg" alt="Vandor" className="h-8" />
            </div>

            {/* Center Section: Navigation */}
      <div className="hidden md:flex">
        <nav className="flex items-center space-x-7">
          <a href="/markets" className="text-[16px] font-medium text-gray-400 hover:text-white transition">Markets</a>
          <a href="/trade" className="text-[16px] font-medium text-gray-400 hover:text-white transition">Trade</a>
          {/* <a href="/positions" className="text-[16px] font-medium text-gray-400 hover:text-white transition">Positions</a> */}
          <a href="/account" className="text-[16px] font-medium text-gray-800 hover:text-white transition">Portfolio</a>
          <a href="/leaderboard" className="text-[16px] font-medium text-gray-800 hover:text-white transition">Leaderboard</a>
        </nav>
      </div>

      <div className='flex gap-4 items-center'>
        <PositionsDropdown />

      </div>

      <div className='flex gap-4 items-center relative'>
          {isConnected ? (
            <div className="relative">
              {/* THE TWO-LINE CONNECTED BUTTON */}
              <button 
                onClick={() => setShowProfilePopup(!showProfilePopup)}
                className="flex items-center gap-3 px-4 py-1.5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500/50 transition"
              >
                <div className="text-right">
                  <p className="text-[13px] font-bold text-white leading-tight">Builder Account</p>
                  <p className="text-[10px] font-mono text-gray-500 leading-tight">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {/* PROFILE POPUP MODAL */}
              {showProfilePopup && (
                <div className="absolute right-0 mt-3 w-72 bg-[#0d0d12] border border-gray-800 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Balance</p>
                      <p className="text-xl font-bold">
                        {balance?.formatted ? Number(balance.formatted).toFixed(4) : "0.00"} {balance?.symbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">Vello User</p>
                      <p className="text-[10px] text-blue-400">Mainnet</p>
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
                      onClick={() => { disconnect(); setShowProfilePopup(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-xl text-sm text-red-400"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-2.5 bg-blue-400 text-black font-black rounded-full hover:bg-white transition uppercase text-xs tracking-wider"
            >
              Log in
            </button>
          )}
        </div>
    </header>
    {/* LOGIN SELECTION MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-[#0d0d12] border border-gray-800 p-8 rounded-[40px] w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Connect</h2>
              <button onClick={() => setShowLoginModal(false)} className="p-2 bg-gray-900 rounded-full hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => { connect({ connector }); setShowLoginModal(false); }}
                  className="w-full py-4 bg-gray-900 hover:bg-blue-600/10 border border-gray-800 hover:border-blue-500/50 rounded-2xl font-bold transition flex items-center px-6 gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img src={connector.icon.dark} alt="" className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{connector.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {connector.id === 'argentWebWallet' ? 'Gmail / Email Login' : 'Browser Extension'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-[10px] text-gray-500 px-4">
              By connecting, you agree to Vello's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </>
  );
}