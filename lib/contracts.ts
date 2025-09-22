import type { TokenContract, ContractInfo } from './types';
import { TOKEN_ADDRESSES } from './currency';

// ERC-20 Token ABI (minimal interface)
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'spender', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
];

// Token decimals mapping
const TOKEN_DECIMALS: Record<string, number> = {
  ETH: 18,
  WETH: 18,
  USDC: 6,
  USDT: 6,
  DAI: 18,
};

// Get token contract info
export function getTokenContract(symbol: string, chainId: number): TokenContract | null {
  if (symbol === 'ETH') {
    return null; // Native token doesn't have a contract
  }

  const address = TOKEN_ADDRESSES[chainId]?.[symbol];
  if (!address) {
    return null;
  }

  const decimals = TOKEN_DECIMALS[symbol];
  if (decimals === undefined) {
    return null;
  }

  return {
    address,
    abi: ERC20_ABI,
    chainId,
    symbol,
    decimals,
  };
}

// Get token decimals
export function getTokenDecimals(symbol: string): number {
  return TOKEN_DECIMALS[symbol] || 18;
}

// Check if address is a contract (basic heuristic)
export function isContract(address: string): boolean {
  // This is a simple check - in a real app you'd query the blockchain
  return address.length === 42 && address.startsWith('0x');
}

// Contract addresses for different chains
export const CONTRACT_ADDRESSES = {
  // Tip Chain custom contracts (if any)
  tipTracker: {
    1: '0x...',    // Ethereum
    8453: '0x...', // Base
    10: '0x...',   // Optimism
  },
};

// Get contract address for a specific chain
export function getContractAddress(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  chainId: number
): string | undefined {
  return CONTRACT_ADDRESSES[contractName][chainId as keyof typeof CONTRACT_ADDRESSES[typeof contractName]];
}

// Multicall contract addresses (for batch calls)
export const MULTICALL_ADDRESSES: Record<number, string> = {
  1: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',    // Ethereum
  8453: '0xcA11bde05977b3631167028862bE2a173976CA11', // Base
  10: '0xcA11bde05977b3631167028862bE2a173976CA11',   // Optimism
};

// ENS Registry addresses
export const ENS_REGISTRY_ADDRESSES: Record<number, string> = {
  1: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',    // Ethereum
  // ENS is primarily on Ethereum mainnet
};

// Common contract interactions

// Encode transfer function call
export function encodeTransfer(to: string, amount: bigint): string {
  // This would typically use ethers.js or viem to encode
  // For now, returning a placeholder
  return `0xa9059cbb${to.slice(2).padStart(64, '0')}${amount.toString(16).padStart(64, '0')}`;
}

// Encode approve function call
export function encodeApprove(spender: string, amount: bigint): string {
  // This would typically use ethers.js or viem to encode
  // For now, returning a placeholder
  return `0x095ea7b3${spender.slice(2).padStart(64, '0')}${amount.toString(16).padStart(64, '0')}`;
}

// Gas estimates for different operations
export const GAS_ESTIMATES = {
  ETH_TRANSFER: 21000,
  ERC20_TRANSFER: 65000,
  ERC20_APPROVE: 50000,
  CONTRACT_CALL: 100000,
};

// Get estimated gas for operation
export function getEstimatedGas(operation: keyof typeof GAS_ESTIMATES): number {
  return GAS_ESTIMATES[operation];
}

// Token list for UI components
export const TOKEN_LIST = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '⟠',
    decimals: 18,
    isNative: true,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    decimals: 6,
    isNative: false,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '💰',
    decimals: 6,
    isNative: false,
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    icon: '🔗',
    decimals: 18,
    isNative: false,
  },
];

// Get token list for specific chain
export function getTokenListForChain(chainId: number) {
  return TOKEN_LIST.filter(token => {
    if (token.isNative) return true;
    return Boolean(TOKEN_ADDRESSES[chainId]?.[token.symbol]);
  });
}

// Contract event signatures
export const EVENT_SIGNATURES = {
  Transfer: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  Approval: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
};

// Decode transfer event (simplified)
export function decodeTransferEvent(log: any): { from: string; to: string; value: bigint } | null {
  if (log.topics[0] !== EVENT_SIGNATURES.Transfer) {
    return null;
  }

  try {
    return {
      from: `0x${log.topics[1].slice(26)}`,
      to: `0x${log.topics[2].slice(26)}`,
      value: BigInt(log.data),
    };
  } catch {
    return null;
  }
}

// Check if token supports permits (EIP-2612)
export function supportsPermit(symbol: string, chainId: number): boolean {
  // List of tokens that support permit on each chain
  const permitTokens: Record<number, string[]> = {
    1: ['DAI', 'USDC'],
    8453: ['USDC'],
    10: ['USDC'],
  };

  return permitTokens[chainId]?.includes(symbol) || false;
}

// Get permit domain separator (for EIP-2612)
export function getPermitDomainSeparator(
  tokenAddress: string,
  chainId: number,
  tokenName: string
): any {
  return {
    name: tokenName,
    version: '2',
    chainId,
    verifyingContract: tokenAddress,
  };
}

// Contract interaction helpers
export class ContractHelper {
  static async getBalance(
    tokenAddress: string | null,
    userAddress: string,
    provider: any
  ): Promise<bigint> {
    if (!tokenAddress) {
      // Native token balance
      return await provider.getBalance(userAddress);
    }

    // ERC-20 token balance
    const contract = new provider.Contract(tokenAddress, ERC20_ABI);
    return await contract.balanceOf(userAddress);
  }

  static async getAllowance(
    tokenAddress: string,
    owner: string,
    spender: string,
    provider: any
  ): Promise<bigint> {
    const contract = new provider.Contract(tokenAddress, ERC20_ABI);
    return await contract.allowance(owner, spender);
  }

  static async getTokenInfo(
    tokenAddress: string,
    provider: any
  ): Promise<{ name: string; symbol: string; decimals: number }> {
    const contract = new provider.Contract(tokenAddress, ERC20_ABI);
    
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);

    return { name, symbol, decimals };
  }
}

// Export everything needed for contract interactions
export {
  type TokenContract,
  type ContractInfo,
};
