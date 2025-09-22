'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AmountSelectorProps {
  selectedAmount: string;
  onAmountChange: (amount: string) => void;
  token: string;
}

const presetAmounts = ['0.01', '0.05', '0.1', '0.5', '1.0'];

export function AmountSelector({ selectedAmount, onAmountChange, token }: AmountSelectorProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (amount: string) => {
    setIsCustom(false);
    setCustomAmount('');
    onAmountChange(amount);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    onAmountChange(value);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">
        Amount ({token})
      </label>
      
      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-2">
        {presetAmounts.map((amount, index) => (
          <motion.div
            key={amount}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant={selectedAmount === amount && !isCustom ? "default" : "outline"}
              onClick={() => handlePresetClick(amount)}
              className="w-full"
            >
              {amount} {token}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Or enter custom amount:
        </label>
        <div className="relative">
          <Input
            type="number"
            step="0.001"
            min="0"
            placeholder={`Enter ${token} amount`}
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            className={isCustom ? "ring-2 ring-primary" : ""}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
            {token}
          </span>
        </div>
      </div>

      {/* Amount Display */}
      {selectedAmount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/10 rounded-lg border border-primary/20"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {selectedAmount} {token}
            </div>
            <div className="text-sm text-muted-foreground">
              Selected amount
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
