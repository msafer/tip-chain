import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { z } from 'zod';
import { validateFrameMessage } from '@/lib/validation';
import { getTokenContract, getTokenDecimals } from '@/lib/contracts';
import { getSupportedChains } from '@/lib/chain';
import { rateLimit } from '@/lib/rate-limit';

const tipSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  token: z.string().min(1, 'Token is required'),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid recipient address'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success } = await rateLimit.limit(identifier);
    
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    
    // Validate frame message
    const isValid = await validateFrameMessage(body);
    if (!isValid) {
      return new NextResponse('Invalid frame message', { status: 400 });
    }

    // Extract parameters
    const amount = searchParams.get('amount') || '0.01';
    const token = searchParams.get('token') || 'ETH';
    const recipient = searchParams.get('recipient') || '';

    // Validate input
    const validation = tipSchema.safeParse({ amount, token, recipient });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { amount: validAmount, token: validToken, recipient: validRecipient } = validation.data;

    // Get supported chains and select the best one (Base preferred)
    const chains = getSupportedChains();
    const preferredChain = chains.find(chain => chain.name.toLowerCase() === 'base') || chains[0];

    if (!preferredChain) {
      return NextResponse.json(
        { error: 'No supported chains available' },
        { status: 500 }
      );
    }

    // Prepare transaction data
    let transactionData;
    const amountInWei = ethers.parseEther(validAmount);

    if (validToken === 'ETH') {
      // Native ETH transfer
      transactionData = {
        to: validRecipient,
        value: amountInWei.toString(),
        data: '0x',
      };
    } else {
      // ERC-20 token transfer
      const tokenContract = getTokenContract(validToken, preferredChain.id);
      if (!tokenContract) {
        return NextResponse.json(
          { error: `Token ${validToken} not supported on ${preferredChain.name}` },
          { status: 400 }
        );
      }

      const decimals = getTokenDecimals(validToken);
      const tokenAmount = ethers.parseUnits(validAmount, decimals);
      
      // Create transfer function call data
      const transferInterface = new ethers.Interface([
        'function transfer(address to, uint256 amount) external returns (bool)'
      ]);
      
      const transferData = transferInterface.encodeFunctionData('transfer', [
        validRecipient,
        tokenAmount
      ]);

      transactionData = {
        to: tokenContract.address,
        value: '0',
        data: transferData,
      };
    }

    // Create transaction frame response
    const frameHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Tip Chain - Execute Transaction</title>
          
          <!-- Frame meta tags -->
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?recipient=${encodeURIComponent(validRecipient)}&amount=${validAmount}&token=${validToken}&status=transaction">
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
          
          <!-- Transaction frame -->
          <meta property="fc:frame:button:1" content="💸 Send Tip">
          <meta property="fc:frame:button:1:action" content="tx">
          <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=${validAmount}&token=${validToken}&recipient=${encodeURIComponent(validRecipient)}">
          <meta property="fc:frame:button:1:post_url" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/success">
          
          <meta property="fc:frame:button:2" content="🔙 Go Back">
          <meta property="fc:frame:button:2:action" content="post">
          <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame">
          
          <!-- Transaction data -->
          <meta property="fc:frame:tx:chain_id" content="${preferredChain.id}">
          <meta property="fc:frame:tx:method" content="eth_sendTransaction">
          <meta property="fc:frame:tx:params" content='[${JSON.stringify(transactionData)}]'>
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-align: center; padding: 20px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold;">Ready to Send!</h1>
            <div style="background: rgba(255,255,255,0.15); padding: 30px; border-radius: 16px; border: 2px solid rgba(255,255,255,0.25); margin-bottom: 2rem;">
              <p style="font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">
                ${validAmount} ${validToken}
              </p>
              <p style="opacity: 0.8; font-size: 1rem;">
                to ${validRecipient}
              </p>
              <p style="opacity: 0.7; font-size: 0.9rem; margin-top: 1rem;">
                on ${preferredChain.name} Network
              </p>
            </div>
            <p style="opacity: 0.9; max-width: 400px;">
              Click "Send Tip" to execute the transaction through your connected wallet
            </p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(frameHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Prepare tip error:', error);
    
    // Return error frame
    const errorFrameHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Tip Chain - Error</title>
          
          <!-- Frame meta tags -->
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?status=error">
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
          <meta property="fc:frame:button:1" content="🔄 Try Again">
          <meta property="fc:frame:button:1:action" content="post">
          <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame">
          
          <meta property="fc:frame:button:2" content="🔗 Visit App">
          <meta property="fc:frame:button:2:action" content="link">
          <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_APP_URL}">
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; text-align: center; padding: 20px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold;">⚠️ Error</h1>
            <p style="font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem;">
              Something went wrong while preparing your tip. Please try again.
            </p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(errorFrameHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests for transaction confirmation
  const { searchParams } = new URL(request.url);
  const txHash = searchParams.get('txHash');
  
  if (txHash) {
    // Transaction was successful
    const successFrameHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Tip Chain - Success</title>
          
          <!-- Frame meta tags -->
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?status=success&txHash=${txHash}">
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
          <meta property="fc:frame:button:1" content="🎉 Send Another">
          <meta property="fc:frame:button:1:action" content="post">
          <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame">
          
          <meta property="fc:frame:button:2" content="🔗 View on Explorer">
          <meta property="fc:frame:button:2:action" content="link">
          <meta property="fc:frame:button:2:target" content="https://basescan.org/tx/${txHash}">
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #10b981, #059669); color: white; text-align: center; padding: 20px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold;">🎉 Tip Sent!</h1>
            <p style="font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem;">
              Your tip has been successfully sent!
            </p>
            <p style="font-size: 0.9rem; opacity: 0.7; font-family: monospace;">
              Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}
            </p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(successFrameHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  }

  return new NextResponse('Method not allowed', { status: 405 });
}
