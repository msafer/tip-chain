import type { Token } from './types';

// Supported tokens configuration
export const SUPPORTED_TOKENS: Record<string, Token> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chainId: 1,
    icon: '⟠',
    isNative: true,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 1,
    icon: '💵',
    isNative: false,
    address: '0xA0b86a33E6C17B8D8600Ff3C9C6d5f8a9A1F8C7E', // Example address
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    chainId: 1,
    icon: '💰',
    isNative: false,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    chainId: 1,
    icon: '🔗',
    isNative: false,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
};

// Token addresses by chain
export const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    USDC: '0xA0b86a33E6C17B8D8600Ff3C9C6d5f8a9A1F8C7E',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  // Base
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    WETH: '0x4200000000000000000000000000000000000006',
  },
  // Optimism
  10: {
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    WETH: '0x4200000000000000000000000000000000000006',
  },
};

// Format amount with proper decimals
export function formatAmount(amount: string | number, decimals: number = 18): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '0';
  
  // For very small amounts, show more decimals
  if (num < 0.001) {
    return num.toFixed(Math.min(decimals, 8));
  }
  
  // For amounts less than 1, show up to 6 decimals
  if (num < 1) {
    return num.toFixed(6);
  }
  
  // For amounts less than 1000, show up to 4 decimals
  if (num < 1000) {
    return num.toFixed(4);
  }
  
  // For larger amounts, show up to 2 decimals
  return num.toFixed(2);
}

// Format currency with symbol
export function formatCurrency(
  amount: string | number, 
  symbol: string, 
  decimals?: number
): string {
  const token = SUPPORTED_TOKENS[symbol];
  const tokenDecimals = decimals || token?.decimals || 18;
  const formattedAmount = formatAmount(amount, tokenDecimals);
  
  return `${formattedAmount} ${symbol}`;
}

// Format USD value
export function formatUSD(amount: number): string {
  if (amount < 0.01) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Parse amount string to number
export function parseAmount(amount: string): number {
  const cleaned = amount.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Convert between different units (e.g., ETH to Wei)
export function convertUnits(
  amount: string | number,
  fromDecimals: number,
  toDecimals: number
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '0';
  
  const factor = Math.pow(10, toDecimals - fromDecimals);
  const result = num * factor;
  
  return result.toString();
}

// Get token info by symbol
export function getTokenInfo(symbol: string): Token | undefined {
  return SUPPORTED_TOKENS[symbol.toUpperCase()];
}

// Get token address for specific chain
export function getTokenAddress(symbol: string, chainId: number): string | undefined {
  if (symbol === 'ETH') return undefined; // Native token
  return TOKEN_ADDRESSES[chainId]?.[symbol];
}

// Check if token is supported on chain
export function isTokenSupportedOnChain(symbol: string, chainId: number): boolean {
  if (symbol === 'ETH') return true; // ETH is supported on all chains
  return Boolean(TOKEN_ADDRESSES[chainId]?.[symbol]);
}

// Get all supported tokens for a chain
export function getSupportedTokensForChain(chainId: number): Token[] {
  const tokens: Token[] = [];
  
  // Always include native ETH
  tokens.push({
    ...SUPPORTED_TOKENS.ETH,
    chainId,
  });
  
  // Add supported ERC-20 tokens
  const chainTokens = TOKEN_ADDRESSES[chainId] || {};
  Object.entries(chainTokens).forEach(([symbol, address]) => {
    const tokenInfo = SUPPORTED_TOKENS[symbol];
    if (tokenInfo) {
      tokens.push({
        ...tokenInfo,
        address,
        chainId,
      });
    }
  });
  
  return tokens;
}

// Calculate percentage change
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Format percentage
export function formatPercentage(percentage: number): string {
  const abs = Math.abs(percentage);
  const sign = percentage >= 0 ? '+' : '-';
  
  if (abs < 0.01) return '0.00%';
  if (abs < 1) return `${sign}${abs.toFixed(2)}%`;
  if (abs < 10) return `${sign}${abs.toFixed(1)}%`;
  
  return `${sign}${abs.toFixed(0)}%`;
}

// Abbreviate large numbers
export function abbreviateNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  return (num / 1000000000).toFixed(1) + 'B';
}

// Get token price (mock implementation - in real app would fetch from API)
export async function getTokenPrice(symbol: string): Promise<number | null> {
  // Mock prices for demonstration
  const mockPrices: Record<string, number> = {
    ETH: 2000,
    USDC: 1,
    USDT: 1,
    WETH: 2000,
  };
  
  return mockPrices[symbol] || null;
}

// Calculate USD value
export async function calculateUSDValue(
  amount: string | number,
  symbol: string
): Promise<number | null> {
  const price = await getTokenPrice(symbol);
  if (!price) return null;
  
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  return amountNum * price;
}

// Validate amount against token decimals
export function validateAmountDecimals(amount: string, symbol: string): boolean {
  const token = getTokenInfo(symbol);
  if (!token) return false;
  
  const parts = amount.split('.');
  if (parts.length === 1) return true; // No decimals
  
  const decimalPlaces = parts[1].length;
  return decimalPlaces <= token.decimals;
}

// Round amount to token decimals
export function roundToTokenDecimals(amount: number, symbol: string): number {
  const token = getTokenInfo(symbol);
  if (!token) return amount;
  
  const factor = Math.pow(10, token.decimals);
  return Math.round(amount * factor) / factor;
}

// Format large amounts with commas
export function formatLargeAmount(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num);
}
