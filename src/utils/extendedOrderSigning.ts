// extendedOrderSigning.ts - PRODUCTION READY
import { Account, type TypedData } from 'starknet';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface StarknetDomain {
  name: string;
  version: string;
  chainId: string;
  revision: string;
}

interface OrderParams {
  market: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  size: number;
  price: number;
  leverage?: number;
  externalId: string;
  fee: string;
  collateralPosition: string;
  nonce: number;
  expiryEpochMillis: number;
}

/**
 * Create SNIP-12 TypedData for Extended Exchange
 * This is the EXACT format Extended expects
 */
export function createExtendedOrderTypedData(
  order: OrderParams,
  domain: StarknetDomain
): TypedData {
  
  // Convert numbers to felt format (hex strings)
  // Extended expects decimal strings, not hex
    const sizeInFelt = (order.size * 1e18).toFixed(0);
    const priceInFelt = (order.price * 1e6).toFixed(0);
    const feeLimitInFelt = (parseFloat(order.fee) * 1e18).toFixed(0);
  
  const typedData: TypedData = {
    types: {
      StarknetDomain: [
        { name: 'name', type: 'shortstring' },
        { name: 'version', type: 'shortstring' },
        { name: 'chainId', type: 'shortstring' },
        { name: 'revision', type: 'shortstring' },
      ],
      Order: [
        { name: 'market', type: 'shortstring' },
        { name: 'side', type: 'felt' },
        { name: 'orderType', type: 'felt' },
        { name: 'size', type: 'felt' },
        { name: 'price', type: 'felt' },
        { name: 'expiryTimestamp', type: 'felt' },
        { name: 'nonce', type: 'felt' },
        { name: 'positionId', type: 'felt' },
        { name: 'feeLimit', type: 'felt' },
      ],
    },
    primaryType: 'Order',
    domain: {
      name: domain.name,
      version: domain.version,
      chainId: domain.chainId,
      revision: domain.revision,
    },
    message: {
      market: order.market,
      side: order.side === 'BUY' ? '0' : '1',
      orderType: order.type === 'MARKET' ? '0' : '1',
      size: sizeInFelt,
      price: priceInFelt,
      expiryTimestamp: order.expiryEpochMillis.toString(),
      nonce: order.nonce.toString(),
      positionId: order.collateralPosition,
      feeLimit: feeLimitInFelt,
    },
  };

  return typedData;
}

/**
 * Sign order - FIXED signature type handling
 */
export async function signExtendedOrder(
  account: Account,
  typedData: TypedData
): Promise<string[]> {
  try {
    console.log('✍️ Requesting wallet signature...');
    
    const signature = await account.signMessage(typedData);
    
    // FIXED: Handle all possible signature formats
    let sigArray: string[];
    
    if (Array.isArray(signature)) {
      // Already an array - just convert each element to string
      sigArray = signature.map((s: any) => {
        if (typeof s === 'string') return s;
        if (typeof s === 'bigint') return s.toString();
        if (s && typeof s === 'object' && 'toString' in s) return s.toString();
        return String(s);
      });
    } else if (signature && typeof signature === 'object') {
      // Object format like {r, s}
      const sig = signature as any;
      sigArray = [
        typeof sig.r === 'string' ? sig.r : String(sig.r),
        typeof sig.s === 'string' ? sig.s : String(sig.s)
      ];
    } else {
      throw new Error('Invalid signature format');
    }
    
    console.log('✅ Order signed successfully');
    console.log('🔐 Signature:', sigArray);
    
    return sigArray;
  } catch (error: any) {
    console.error('❌ Signature rejected:', error);
    throw new Error('User rejected signature');
  }
}

/**
 * Generate unique nonce (must be 1 to 2^31)
 */
export function generateOrderNonce(): number {
  const maxNonce = Math.pow(2, 31) - 1;
  return Math.floor(Math.random() * maxNonce) + 1;
}

/**
 * Calculate order expiry (max 90 days mainnet, 28 days testnet)
 */
export function calculateOrderExpiry(daysFromNow: number = 7, isMainnet: boolean = false): number {
  const now = Date.now();
  const maxDays = isMainnet ? 90 : 28;
  const expiryDays = Math.min(daysFromNow, maxDays);
  return now + (expiryDays * 24 * 60 * 60 * 1000);
}

/**
 * Format signature for Extended API
 */
export function formatSignatureForAPI(signature: string[]): { r: string; s: string } {
  if (signature.length < 2) {
    throw new Error('Invalid signature - must have r and s components');
  }
  
  return {
    r: signature[0],
    s: signature[1],
  };
}

/**
 * Complete order signing flow
 */
export async function signAndFormatOrder(
  account: Account,
  orderParams: Omit<OrderParams, 'nonce' | 'expiryEpochMillis'>,
  // vaultNumber: number,
  domain: StarknetDomain,
  isMainnet: boolean = false
) {
  const nonce = generateOrderNonce();
  const expiryEpochMillis = calculateOrderExpiry(7, isMainnet);
  
  const fullOrderParams: OrderParams = {
    ...orderParams,
    nonce,
    expiryEpochMillis,
  };
  
  const typedData = createExtendedOrderTypedData(fullOrderParams, domain);
  const signature = await signExtendedOrder(account, typedData);
  
  return {
    order: fullOrderParams,
    signature: formatSignatureForAPI(signature),
    starkKey: account.address,
  };
}