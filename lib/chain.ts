import type { SupportedChain } from './types';

// Supported blockchain networks
export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://mainnet.infura.io/v3/',
      'https://eth-mainnet.alchemyapi.io/v2/',
      'https://cloudflare-eth.com',
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrl: 'https://ethereum.org/favicon.ico',
  },
  {
    id: 8453,
    name: 'Base',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base-mainnet.blastapi.io',
    ],
    blockExplorerUrls: ['https://basescan.org'],
    iconUrl: 'https://base.org/favicon.ico',
  },
  {
    id: 10,
    name: 'Optimism',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://mainnet.optimism.io',
      'https://optimism-mainnet.infura.io/v3/',
    ],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconUrl: 'https://optimism.io/favicon.ico',
  },
];

// Testnet chains (for development)
export const TESTNET_CHAINS: SupportedChain[] = [
  {
    id: 11155111, // Sepolia
    name: 'Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://sepolia.infura.io/v3/',
      'https://eth-sepolia.public.blastapi.io',
    ],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    iconUrl: 'https://ethereum.org/favicon.ico',
  },
  {
    id: 84532, // Base Sepolia
    name: 'Base Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
    iconUrl: 'https://base.org/favicon.ico',
  },
  {
    id: 11155420, // Optimism Sepolia
    name: 'Optimism Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimistic.etherscan.io'],
    iconUrl: 'https://optimism.io/favicon.ico',
  },
];

// Get all supported chains (mainnet + testnet in development)
export function getSupportedChains(): SupportedChain[] {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? SUPPORTED_CHAINS : [...SUPPORTED_CHAINS, ...TESTNET_CHAINS];
}

// Get chain by ID
export function getChainById(chainId: number): SupportedChain | undefined {
  const allChains = getSupportedChains();
  return allChains.find(chain => chain.id === chainId);
}

// Check if chain is supported
export function isChainSupported(chainId: number): boolean {
  return Boolean(getChainById(chainId));
}

// Get default chain (Base preferred for lower fees)
export function getDefaultChain(): SupportedChain {
  return SUPPORTED_CHAINS.find(chain => chain.id === 8453) || SUPPORTED_CHAINS[0];
}

// Get chain name
export function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name || `Chain ${chainId}`;
}

// Get block explorer URL
export function getBlockExplorerUrl(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.blockExplorerUrls[0] || '';
}

// Get transaction URL
export function getTxUrl(chainId: number, txHash: string): string {
  const explorerUrl = getBlockExplorerUrl(chainId);
  return explorerUrl ? `${explorerUrl}/tx/${txHash}` : '';
}

// Get address URL
export function getAddressUrl(chainId: number, address: string): string {
  const explorerUrl = getBlockExplorerUrl(chainId);
  return explorerUrl ? `${explorerUrl}/address/${address}` : '';
}

// Get RPC URL with API key
export function getRpcUrl(chainId: number, apiKey?: string): string {
  const chain = getChainById(chainId);
  if (!chain) return '';

  // Use API key if provided for better rate limits
  if (apiKey) {
    const rpcUrl = chain.rpcUrls[0];
    if (rpcUrl.includes('infura.io')) {
      return `${rpcUrl}${apiKey}`;
    }
    if (rpcUrl.includes('alchemyapi.io')) {
      return `${rpcUrl}${apiKey}`;
    }
  }

  // Fallback to public RPC
  return chain.rpcUrls[chain.rpcUrls.length - 1];
}

// Chain-specific gas settings
export const CHAIN_GAS_SETTINGS = {
  1: { // Ethereum
    gasPrice: { min: 20, max: 100 }, // gwei
    maxFeePerGas: { min: 30, max: 150 },
    maxPriorityFeePerGas: { min: 2, max: 10 },
  },
  8453: { // Base
    gasPrice: { min: 0.001, max: 1 },
    maxFeePerGas: { min: 0.001, max: 2 },
    maxPriorityFeePerGas: { min: 0.001, max: 0.1 },
  },
  10: { // Optimism
    gasPrice: { min: 0.001, max: 1 },
    maxFeePerGas: { min: 0.001, max: 2 },
    maxPriorityFeePerGas: { min: 0.001, max: 0.1 },
  },
};

// Get gas settings for chain
export function getGasSettings(chainId: number) {
  return CHAIN_GAS_SETTINGS[chainId as keyof typeof CHAIN_GAS_SETTINGS] || CHAIN_GAS_SETTINGS[1];
}

// Layer 2 detection
export function isL2Chain(chainId: number): boolean {
  const l2Chains = [8453, 10, 137, 42161]; // Base, Optimism, Polygon, Arbitrum
  return l2Chains.includes(chainId);
}

// Get average block time (in seconds)
export function getBlockTime(chainId: number): number {
  const blockTimes: Record<number, number> = {
    1: 12,     // Ethereum: ~12 seconds
    8453: 2,   // Base: ~2 seconds
    10: 2,     // Optimism: ~2 seconds
  };
  
  return blockTimes[chainId] || 12;
}

// Get confirmation requirements
export function getConfirmationCount(chainId: number): number {
  const confirmations: Record<number, number> = {
    1: 12,     // Ethereum: 12 confirmations (~2.4 minutes)
    8453: 5,   // Base: 5 confirmations (~10 seconds)
    10: 5,     // Optimism: 5 confirmations (~10 seconds)
  };
  
  return confirmations[chainId] || 12;
}

// Chain categorization
export function getChainCategory(chainId: number): 'mainnet' | 'l2' | 'testnet' {
  if (TESTNET_CHAINS.some(chain => chain.id === chainId)) {
    return 'testnet';
  }
  
  if (isL2Chain(chainId)) {
    return 'l2';
  }
  
  return 'mainnet';
}

// Get chain icon URL
export function getChainIcon(chainId: number): string {
  const chain = getChainById(chainId);
  
  // Fallback icons if not specified
  const fallbackIcons: Record<number, string> = {
    1: '⟠',
    8453: '🔵',
    10: '🔴',
  };
  
  return chain?.iconUrl || fallbackIcons[chainId] || '⚪';
}

// Check if chain supports EIP-1559 (type 2 transactions)
export function supportsEIP1559(chainId: number): boolean {
  const eip1559Chains = [1, 8453, 10]; // Most modern chains support it
  return eip1559Chains.includes(chainId);
}

// Get bridge URLs for cross-chain transfers
export function getBridgeUrl(fromChainId: number, toChainId: number): string | null {
  const bridges: Record<string, string> = {
    '1-8453': 'https://bridge.base.org',
    '8453-1': 'https://bridge.base.org',
    '1-10': 'https://app.optimism.io/bridge',
    '10-1': 'https://app.optimism.io/bridge',
  };
  
  return bridges[`${fromChainId}-${toChainId}`] || null;
}

// Chain configuration for wagmi
export function getWagmiChainConfig(chainId: number) {
  const chain = getChainById(chainId);
  if (!chain) return null;

  return {
    id: chain.id,
    name: chain.name,
    network: chain.name.toLowerCase(),
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: {
      default: { http: [chain.rpcUrls[0]] },
      public: { http: [chain.rpcUrls[chain.rpcUrls.length - 1]] },
    },
    blockExplorers: {
      default: {
        name: `${chain.name} Explorer`,
        url: chain.blockExplorerUrls[0],
      },
    },
  };
}

// Export commonly used chains
export const ETHEREUM = SUPPORTED_CHAINS[0];
export const BASE = SUPPORTED_CHAINS[1];
export const OPTIMISM = SUPPORTED_CHAINS[2];
