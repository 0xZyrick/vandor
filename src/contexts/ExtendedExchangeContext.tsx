// src/contexts/ExtendedExchangeContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from '@starknet-react/core';
import { initializeExtendedService, getExtendedService } from '../services/ExtendedExchangeService';


/* eslint-disable @typescript-eslint/no-explicit-any */


// ============================================================================
// TYPES
// ============================================================================

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
  liquidationPrice: number;
}

interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  size: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

interface Balance {
  available: number;
  total: number;
  margin: number;
  unrealizedPnL: number;
}

interface ExtendedExchangeContextType {
  // Service
  isConnected: boolean;
  isInitialized: boolean;
  
  // Data
  positions: Position[];
  orders: Order[];
  balance: Balance | null;
  
  // Loading states
  loadingPositions: boolean;
  loadingOrders: boolean;
  loadingBalance: boolean;
  
  // Actions
  placeOrder: (params: any) => Promise<any>;
  cancelOrder: (orderId: string) => Promise<any>;
  closePosition: (params: any) => Promise<any>;
  
  // Refresh functions
  refreshPositions: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ExtendedExchangeContext = createContext<ExtendedExchangeContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function ExtendedExchangeProvider({ children }: { children: ReactNode }) {
  const { account } = useAccount();
  
  // Service state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Data
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  
  // Loading states
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // ============================================================================
  // INITIALIZE SERVICE
  // ============================================================================

  useEffect(() => {
    try {
      // Get credentials from environment variables
      const apiKey = import.meta.env.VITE_EXTENDED_API_KEY;
      const starkKey = import.meta.env.VITE_EXTENDED_STARK_KEY;
      const clientId = import.meta.env.VITE_EXTENDED_CLIENT_ID;
      const vaultNumber = import.meta.env.VITE_EXTENDED_VAULT_NUMBER;

      if (!apiKey) {
        console.warn('⚠️ VITE_EXTENDED_API_KEY not found in .env');
        console.log('📋 To enable Extended Exchange integration:');
        console.log('1. Go to https://extended.exchange');
        console.log('2. Navigate to Account > API Management');
        console.log('3. Create API credentials');
        console.log('4. Add to your .env file:');
        console.log('   VITE_EXTENDED_API_KEY=your_api_key');
        console.log('   VITE_EXTENDED_STARK_KEY=your_stark_key');
        console.log('   VITE_EXTENDED_CLIENT_ID=your_client_id');
        console.log('   VITE_EXTENDED_VAULT_NUMBER=your_vault');
        return;
      }

      const service = initializeExtendedService({
        apiKey: apiKey || '',
        starkPrivateKey: starkKey || '',
        clientId: clientId || '',
        vaultNumber: parseInt(vaultNumber || '0'),
      });
      
      setIsInitialized(true);
      console.log('✅ Extended Exchange Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Extended Exchange:', error);
    }
  }, []);

  // ============================================================================
  // CONNECT WALLET
  // ============================================================================

  useEffect(() => {
    if (account && isInitialized) {
      try {
        const service = getExtendedService();
        service.connectWallet(account);
        setIsConnected(true);
        console.log('✅ Wallet connected to Extended Exchange');
        
        // Load initial data
        refreshAll();
      } catch (error) {
        console.error('❌ Failed to connect wallet:', error);
      }
    } else {
      setIsConnected(false);
      setPositions([]);
      setOrders([]);
      setBalance(null);
    }
  }, [account, isInitialized]);

  // ============================================================================
  // REFRESH FUNCTIONS
  // ============================================================================

  const refreshPositions = async () => {
    if (!isConnected || !isInitialized) return;
    
    setLoadingPositions(true);
    try {
      const service = getExtendedService();
      const { positions: newPositions } = await service.getPositions();
      setPositions(newPositions);
      console.log('✅ Positions refreshed:', newPositions.length);
    } catch (error) {
      console.error('❌ Failed to refresh positions:', error);
      // Don't throw - keep old data
    } finally {
      setLoadingPositions(false);
    }
  };

  const refreshOrders = async () => {
    if (!isConnected || !isInitialized) return;
    
    setLoadingOrders(true);
    try {
      const service = getExtendedService();
      const newOrders = await service.getOpenOrders();
      setOrders(newOrders);
      console.log('✅ Orders refreshed:', newOrders.length);
    } catch (error) {
      console.error('❌ Failed to refresh orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const refreshBalance = async () => {
    if (!isConnected || !isInitialized) return;
    
    setLoadingBalance(true);
    try {
      const service = getExtendedService();
      const newBalance = await service.getBalance();
      setBalance(newBalance);
      console.log('✅ Balance refreshed:', newBalance);
    } catch (error) {
      console.error('❌ Failed to refresh balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      refreshPositions(),
      refreshOrders(),
      refreshBalance(),
    ]);
  };

  // ============================================================================
  // AUTO-REFRESH (every 10 seconds)
  // ============================================================================

  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      refreshAll();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isConnected]);

  // ============================================================================
  // TRADING ACTIONS
  // ============================================================================

  const placeOrder = async (params: any) => {
    if (!isInitialized) throw new Error('Service not initialized');
    
    const service = getExtendedService();
    const result = await service.placeOrder(params);
    
    if (result.success) {
      // Refresh data after successful order
      await refreshAll();
    }
    
    return result;
  };

  const cancelOrder = async (orderId: string) => {
    if (!isInitialized) throw new Error('Service not initialized');
    
    const service = getExtendedService();
    const result = await service.cancelOrder(orderId);
    
    if (result.success) {
      await refreshOrders();
    }
    
    return result;
  };

  const closePosition = async (params: any) => {
    if (!isInitialized) throw new Error('Service not initialized');
    
    const service = getExtendedService();
    const result = await service.closePosition(params);
    
    if (result.success) {
      await refreshAll();
    }
    
    return result;
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: ExtendedExchangeContextType = {
    isConnected,
    isInitialized,
    positions,
    orders,
    balance,
    loadingPositions,
    loadingOrders,
    loadingBalance,
    placeOrder,
    cancelOrder,
    closePosition,
    refreshPositions,
    refreshOrders,
    refreshBalance,
    refreshAll,
  };

  return (
    <ExtendedExchangeContext.Provider value={value}>
      {children}
    </ExtendedExchangeContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useExtendedExchange() {
  const context = useContext(ExtendedExchangeContext);
  
  if (context === undefined) {
    throw new Error('useExtendedExchange must be used within ExtendedExchangeProvider');
  }
  
  return context;
}

export default ExtendedExchangeContext;