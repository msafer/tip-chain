'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { getTokenContract, getTokenDecimals } from '@/lib/contracts';
import { validateAddress } from '@/lib/validation';

interface TipButtonProps {
  amount: string;
  token: string;
  recipient: string;
}

export function TipButton({ amount, token, recipient }: TipButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isValidAmount = amount && parseFloat(amount) > 0;
  const isValidRecipient = recipient && validateAddress(recipient);
  const canSendTip = isConnected && isValidAmount && isValidRecipient && !isLoading && !isPending;

  const handleSendTip = async () => {
    if (!canSendTip || !chain) return;

    try {
      setIsLoading(true);

      if (token === 'ETH') {
        // Send native ETH
        await writeContract({
          to: recipient as `0x${string}`,
          value: parseEther(amount),
        });
      } else {
        // Send ERC-20 token
        const tokenContract = getTokenContract(token, chain.id);
        if (!tokenContract) {
          throw new Error(`Token ${token} not supported on ${chain.name}`);
        }

        const decimals = getTokenDecimals(token);
        const tokenAmount = parseUnits(amount, decimals);

        await writeContract({
          address: tokenContract.address as `0x${string}`,
          abi: [
            {
              name: 'transfer',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              outputs: [{ name: '', type: 'bool' }],
            },
          ],
          functionName: 'transfer',
          args: [recipient as `0x${string}`, tokenAmount],
        });
      }

      toast.success('Transaction submitted!');
    } catch (err) {
      console.error('Transaction failed:', err);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state
  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="space-y-4"
      >
        <Button
          disabled
          className="w-full bg-green-600 hover:bg-green-600"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Tip Sent Successfully!
        </Button>
        {hash && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Transaction Hash:</p>
            <code className="text-xs bg-muted p-2 rounded font-mono break-all">
              {hash}
            </code>
          </div>
        )}
      </motion.div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="destructive"
          disabled
          className="w-full"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Transaction Failed
        </Button>
        <div className="text-center">
          <p className="text-sm text-destructive">
            {error.message || 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSendTip}
        disabled={!canSendTip}
        className="w-full"
        size="lg"
      >
        {isPending || isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isPending ? 'Confirming...' : 'Processing...'}
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Tip
          </>
        )}
      </Button>

      {/* Validation Messages */}
      {!isConnected && (
        <p className="text-sm text-muted-foreground text-center">
          Connect your wallet to send tips
        </p>
      )}
      
      {isConnected && !isValidAmount && (
        <p className="text-sm text-destructive text-center">
          Please enter a valid amount
        </p>
      )}
      
      {isConnected && !isValidRecipient && (
        <p className="text-sm text-destructive text-center">
          Please enter a valid recipient address
        </p>
      )}

      {isConnected && isValidAmount && isValidRecipient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground"
        >
          Ready to send {amount} {token} to {recipient.slice(0, 6)}...{recipient.slice(-4)}
        </motion.div>
      )}
    </div>
  );
}
