'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LeaderboardEntry {
  rank: number;
  address: string;
  amount: string;
  count: number;
  avatar?: string;
  ens?: string;
}

interface LeaderboardTableProps {
  type: 'tippers' | 'recipients';
}

// Mock data - in a real app, this would come from an API
const mockTippers: LeaderboardEntry[] = [
  { rank: 1, address: '0x1234...5678', amount: '12.45 ETH', count: 156, ens: 'alice.eth' },
  { rank: 2, address: '0x2345...6789', amount: '8.92 ETH', count: 89, ens: 'bob.eth' },
  { rank: 3, address: '0x3456...7890', amount: '6.78 ETH', count: 67 },
  { rank: 4, address: '0x4567...8901', amount: '5.23 ETH', count: 45 },
  { rank: 5, address: '0x5678...9012', amount: '4.56 ETH', count: 34 },
];

const mockRecipients: LeaderboardEntry[] = [
  { rank: 1, address: '0x9876...5432', amount: '15.67 ETH', count: 234, ens: 'charlie.eth' },
  { rank: 2, address: '0x8765...4321', amount: '11.23 ETH', count: 178 },
  { rank: 3, address: '0x7654...3210', amount: '9.45 ETH', count: 123, ens: 'diana.eth' },
  { rank: 4, address: '0x6543...2109', amount: '7.89 ETH', count: 98 },
  { rank: 5, address: '0x5432...1098', amount: '6.12 ETH', count: 76 },
];

export function LeaderboardTable({ type }: LeaderboardTableProps) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setData(type === 'tippers' ? mockTippers : mockRecipients);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [type]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-semibold">#{rank}</span>;
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    return entry.ens || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 p-4">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="w-20 h-4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        {type === 'tippers' ? (
          <>
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Top Tippers</h3>
          </>
        ) : (
          <>
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Top Recipients</h3>
          </>
        )}
      </div>

      {/* Table */}
      <div className="space-y-2">
        {data.map((entry, index) => (
          <motion.div
            key={entry.address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                {/* Rank & User Info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getDisplayName(entry).slice(0, 2).toUpperCase()}
                    </div>
                    
                    {/* Name & Address */}
                    <div>
                      <div className="font-medium">
                        {getDisplayName(entry)}
                      </div>
                      {entry.ens && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="font-semibold text-primary">
                    {entry.amount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.count} {type === 'tippers' ? 'tips sent' : 'tips received'}
                  </div>
                </div>
              </div>

              {/* Progress Bar for Top 3 */}
              {entry.rank <= 3 && (
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${100 - (entry.rank - 1) * 25}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pt-4"
      >
        <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
          View Full Leaderboard →
        </button>
      </motion.div>
    </div>
  );
}
