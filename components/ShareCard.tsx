'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

interface ShareCardProps {
  amount: string;
  token: string;
  recipient: string;
}

export function ShareCard({ amount, token, recipient }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState<'frame' | 'direct'>('frame');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tip-chain.vercel.app';
  
  const frameUrl = `${baseUrl}/api/frame?recipient=${encodeURIComponent(recipient)}&amount=${amount}&token=${token}`;
  const directUrl = `${baseUrl}?recipient=${encodeURIComponent(recipient)}&amount=${amount}&token=${token}`;
  
  const shareUrl = shareMethod === 'frame' ? frameUrl : directUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tip Chain - Send a Tip',
          text: `Send a ${amount} ${token} tip through Tip Chain`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const shareText = `🎯 Send a ${amount} ${token} tip through Tip Chain!`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  if (!amount || !recipient) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Tip Request
        </h3>

        {/* Share Method Toggle */}
        <div className="flex gap-2">
          <Button
            variant={shareMethod === 'frame' ? 'default' : 'outline'}
            onClick={() => setShareMethod('frame')}
            className="flex-1"
          >
            📱 Farcaster Frame
          </Button>
          <Button
            variant={shareMethod === 'direct' ? 'default' : 'outline'}
            onClick={() => setShareMethod('direct')}
            className="flex-1"
          >
            🔗 Direct Link
          </Button>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {shareMethod === 'frame' ? 'Frame URL' : 'Direct URL'}
          </label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="px-3"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button
            onClick={() => window.open(shareUrl, '_blank')}
            variant="outline"
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>

        {/* Social Media Buttons */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Share on social media:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => window.open(twitterUrl, '_blank')}
              variant="outline"
              className="w-full"
            >
              🐦 Twitter
            </Button>
            <Button
              onClick={() => window.open(telegramUrl, '_blank')}
              variant="outline"
              className="w-full"
            >
              📱 Telegram
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="text-sm text-muted-foreground">
          {shareMethod === 'frame' ? (
            <p>
              📱 Share this Frame URL on Farcaster for users to tip directly within the app.
            </p>
          ) : (
            <p>
              🔗 Share this direct link to allow users to tip through the Tip Chain website.
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
