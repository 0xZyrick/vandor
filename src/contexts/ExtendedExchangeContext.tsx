// src/contexts/ExtendedExchangeContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAccount } from '@starknet-react/core';
import { initializeExtendedService, getExtendedService } from '../services/ExtendedExchangeService';

/* eslint-disable @typescript-eslint/no-explicit-any */

// TYPES
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
  isConnected: boolean;
  isInitialized: boolean;
  positions: Position[];
  orders: Order[];
  balance: Balance | null;
  loadingPositions: boolean;
  loadingOrders: boolean;
  loadingBalance: boolean;
  placeOrder: (params: any) => Promise<any>;
  cancelOrder: (orderId: string) => Promise<any>;
  closePosition: (params: any) => Promise<any>;
  refreshPositions: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const ExtendedExchangeContext = createContext<ExtendedExchangeContextType | undefined>(undefined);

export function ExtendedExchangeProvider({ children }: { children: ReactNode }) {
  const { account } = useAccount();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // INITIALIZE SERVICE FOR TESTNET
  useEffect(() => {
    try {
      // For testnet, these can be empty strings since we're just reading public data
      initializeExtendedService({
        apiKey: '',
        starkPrivateKey: '',
        clientId: 'VANDOR_TESTNET',
        vaultNumber: 0,
        network: 'sepolia',
      });
      
      setIsInitialized(true);
      console.log('✅ Extended Exchange Service initialized (TESTNET MODE)');
    } catch (error) {
      console.error('❌ Failed to initialize Extended Exchange:', error);
    }
  }, []);

  // CONNECT WALLET
  useEffect(() => {
    if (account && isInitialized) {
      try {
        const service = getExtendedService();
        service.connectWallet(account as any);
        setIsConnected(true);
        console.log('✅ Wallet connected to Extended Exchange');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isInitialized]);

  // REFRESH FUNCTIONS
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

  // AUTO-REFRESH (every 10 seconds)
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      refreshAll();
    }, 10000);
    
    return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // TRADING ACTIONS
  const placeOrder = async (params: any) => {
    if (!isInitialized) throw new Error('Service not initialized');
    
    const service = getExtendedService();
    const result = await service.placeOrder(params);
    
    if ((result as any).success) {
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
    
    if ((result as any).success) {
      await refreshAll();
    }
    
    return result;
  };

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

// eslint-disable-next-line react-refresh/only-export-components
export function useExtended() {
  const context = useContext(ExtendedExchangeContext);
  
  if (context === undefined) {
    throw new Error('useExtendedExchange must be used within ExtendedExchangeProvider');
  }
  
  return context;
}
