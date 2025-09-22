'use client';

import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WalletConnector() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Wallet Connection */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Wallet Connection</label>
        <ConnectButton 
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
          chainStatus={{
            smallScreen: 'icon',
            largeScreen: 'full',
          }}
          showBalance={{
            smallScreen: false,
            largeScreen: true,
          }}
        />
      </div>

      {/* Wallet Info */}
      {isConnected && address && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="space-y-3">
              {/* Address */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address:</span>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </code>
              </div>

              {/* Network */}
              {chain && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    {chain.name}
                  </Badge>
                </div>
              )}

              {/* Balance */}
              {balance && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <span className="text-sm font-medium">
                    {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Network Warning */}
      {isConnected && chain && ![1, 8453, 10].includes(chain.id) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <span>⚠️</span>
            <span className="text-sm">
              You're connected to {chain.name}. For the best experience, 
              please switch to Base or Optimism network.
            </span>
          </div>
        </motion.div>
      )}

      {/* Connection Instructions */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span>ℹ️</span>
              <span className="text-sm font-medium">Connect your wallet to get started</span>
            </div>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-6">
              <li>• MetaMask, WalletConnect, and other popular wallets supported</li>
              <li>• Works on Base, Optimism, and Ethereum networks</li>
              <li>• Your funds remain secure in your wallet</li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Custom Badge component since it might not be in ui/badge
function Badge({ children, variant = "default", className = "" }: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
