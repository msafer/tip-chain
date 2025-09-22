'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { TrendingUp, Send, Wallet, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface UserStats {
  totalSent: string;
  totalReceived: string;
  tipsSent: number;
  tipsReceived: number;
  rank: number;
  badges: string[];
}

// Mock user stats - in a real app, this would come from an API
const mockStats: UserStats = {
  totalSent: '2.45 ETH',
  totalReceived: '1.89 ETH',
  tipsSent: 23,
  tipsReceived: 17,
  rank: 142,
  badges: ['Early Adopter', 'Generous Tipper'],
};

export function ProfileStats() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      // Simulate API call
      const timer = setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setStats(null);
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Connect Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to view your tipping statistics
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-6 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No Stats Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start tipping to see your statistics here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const statItems = [
    {
      icon: Send,
      label: 'Total Sent',
      value: stats.totalSent,
      subValue: `${stats.tipsSent} tips`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: TrendingUp,
      label: 'Total Received',
      value: stats.totalReceived,
      subValue: `${stats.tipsReceived} tips`,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: Award,
      label: 'Global Rank',
      value: `#${stats.rank}`,
      subValue: 'of all users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">
              {address?.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <h3 className="font-semibold text-lg">Your Stats</h3>
          <p className="text-sm text-muted-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="space-y-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  {item.label}
                </div>
                <div className="font-semibold">
                  {item.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.subValue}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        {stats.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-sm">Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((badge, index) => (
                <motion.span
                  key={badge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                >
                  🏆 {badge}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Progress to Next Milestone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next milestone:</span>
            <span className="font-medium">25 tips sent</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(stats.tipsSent / 25) * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {25 - stats.tipsSent} more tips to unlock the "Super Tipper" badge
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
