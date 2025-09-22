'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Users, Zap } from 'lucide-react';
import { AmountSelector } from '@/components/AmountSelector';
import { TipButton } from '@/components/TipButton';
import { TokenToggle } from '@/components/TokenToggle';
import { ShareCard } from '@/components/ShareCard';
import { WalletConnector } from '@/components/WalletConnector';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { ProfileStats } from '@/components/ProfileStats';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const stats = [
  {
    title: 'Total Tips',
    value: '$12,345',
    change: '+23%',
    icon: Coins,
  },
  {
    title: 'Active Users',
    value: '1,234',
    change: '+18%',
    icon: Users,
  },
  {
    title: 'Growth Rate',
    value: '45%',
    change: '+12%',
    icon: TrendingUp,
  },
  {
    title: 'Transactions',
    value: '5,678',
    change: '+35%',
    icon: Zap,
  },
];

export default function HomePage() {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [recipient, setRecipient] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Tip Chain
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Send cryptocurrency tips seamlessly through Farcaster frames on Base and Optimism networks
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {stats.map((stat, index) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tipping Interface */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Send a Tip</h2>
            
            <div className="space-y-6">
              {/* Wallet Connection */}
              <WalletConnector />
              
              {/* Recipient Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Recipient Address or ENS
                </label>
                <input
                  type="text"
                  placeholder="0x... or username.eth"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
              
              {/* Token Selection */}
              <TokenToggle
                selectedToken={selectedToken}
                onTokenChange={setSelectedToken}
              />
              
              {/* Amount Selection */}
              <AmountSelector
                selectedAmount={selectedAmount}
                onAmountChange={setSelectedAmount}
                token={selectedToken}
              />
              
              {/* Tip Button */}
              <TipButton
                amount={selectedAmount}
                token={selectedToken}
                recipient={recipient}
              />
              
              {/* Share Card */}
              <ShareCard
                amount={selectedAmount}
                token={selectedToken}
                recipient={recipient}
              />
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Profile Stats */}
          <ProfileStats />
          
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Coins className="mr-2 h-4 w-4" />
                View Transaction History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Find Friends
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Leaderboards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12"
      >
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Leaderboards</h2>
          
          <Tabs defaultValue="tippers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tippers">Top Tippers</TabsTrigger>
              <TabsTrigger value="recipients">Top Recipients</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tippers" className="mt-6">
              <LeaderboardTable type="tippers" />
            </TabsContent>
            
            <TabsContent value="recipients" className="mt-6">
              <LeaderboardTable type="recipients" />
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
