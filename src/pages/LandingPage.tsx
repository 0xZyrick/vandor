// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Zap, Shield, ArrowRight } from 'lucide-react';
import { useAccount } from '@starknet-react/core';
import { useEffect } from 'react';

export default function LandingPage() {
  // const [showConnectModal, setShowConnectModal] = useState(false);
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  // Auto-redirect if already connected
  useEffect(() => {
    if (isConnected) {
      navigate('/markets');
    }
  }, [isConnected, navigate]);

  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-10 max-w-4xl">
        
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src="/logo.png" alt="Vandor" className="h-12 animate-bounce" />
        </div>

        {/* Hero Text */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Trade Perpetuals
          <br />
          on Starknet
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Experience lightning-fast perpetual futures trading with up to 20x leverage. 
          Powered by Extended Exchange on Starknet.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => navigate ('/trade')}
            className="px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full font-bold text-lg transition flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/50"
          >
            Start Trading
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/markets')}
            className="px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-full font-bold text-lg transition"
          >
            View Markets
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-800/25 rounded-2xl p-6 backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">Instant order execution on Starknet L2</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Up to 20x Leverage</h3>
            <p className="text-gray-400 text-sm">Maximize your trading potential</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Non-Custodial</h3>
            <p className="text-gray-400 text-sm">Your keys, your crypto, always</p>
          </div>
        </div>
      </div>
    </div>
  );
}