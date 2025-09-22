'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TokenToggleProps {
  selectedToken: string;
  onTokenChange: (token: string) => void;
}

interface Token {
  symbol: string;
  name: string;
  icon: string;
  chainIds: number[];
}

const supportedTokens: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '⟠',
    chainIds: [1, 8453, 10], // Mainnet, Base, Optimism
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    chainIds: [1, 8453, 10], // Mainnet, Base, Optimism
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '💰',
    chainIds: [1, 8453, 10], // Mainnet, Base, Optimism
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    icon: '🔗',
    chainIds: [1, 8453, 10], // Mainnet, Base, Optimism
  },
];

export function TokenToggle({ selectedToken, onTokenChange }: TokenToggleProps) {
  const { chain } = useAccount();

  // Filter tokens based on current chain
  const availableTokens = supportedTokens.filter(token => 
    !chain || token.chainIds.includes(chain.id)
  );

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">
        Select Token
      </label>
      
      <Tabs value={selectedToken} onValueChange={onTokenChange}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
          {availableTokens.map((token) => (
            <TabsTrigger
              key={token.symbol}
              value={token.symbol}
              className="flex items-center gap-2"
            >
              <span className="text-lg">{token.icon}</span>
              <span className="font-medium">{token.symbol}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Token Info */}
      {selectedToken && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted/50 rounded-lg border"
        >
          {(() => {
            const token = supportedTokens.find(t => t.symbol === selectedToken);
            if (!token) return null;

            return (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{token.icon}</span>
                <div>
                  <div className="font-medium">{token.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {token.symbol}
                  </div>
                </div>
                {chain && (
                  <div className="ml-auto">
                    <div className="text-xs text-muted-foreground">
                      Available on {chain.name}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Chain Warning */}
      {chain && availableTokens.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <span>⚠️</span>
            <span className="text-sm">
              No supported tokens available on {chain.name}. 
              Please switch to Base or Optimism network.
            </span>
          </div>
        </motion.div>
      )}

      {/* Network Recommendation */}
      {!chain && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <span>ℹ️</span>
            <span className="text-sm">
              Connect your wallet to see available tokens for your network.
              We recommend using Base or Optimism for lower fees.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
