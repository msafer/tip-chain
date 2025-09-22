import { NextRequest, NextResponse } from 'next/server';
import { generateFrameImage } from '@/lib/frames';
import { validateFrameMessage } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success } = await rateLimit.limit(identifier);
    
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get('recipient') || '';
    const amount = searchParams.get('amount') || '0.01';
    const token = searchParams.get('token') || 'ETH';

    // Generate the initial frame HTML
    const frameHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Tip Chain - Send a Tip</title>
          
          <!-- Frame meta tags -->
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?recipient=${encodeURIComponent(recipient)}&amount=${amount}&token=${token}">
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
          <meta property="fc:frame:button:1" content="💰 Tip 0.01 ETH">
          <meta property="fc:frame:button:1:action" content="post">
          <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=0.01&token=ETH&recipient=${encodeURIComponent(recipient)}">
          
          <meta property="fc:frame:button:2" content="💎 Tip 0.05 ETH">
          <meta property="fc:frame:button:2:action" content="post">
          <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=0.05&token=ETH&recipient=${encodeURIComponent(recipient)}">
          
          <meta property="fc:frame:button:3" content="🚀 Tip 0.1 ETH">
          <meta property="fc:frame:button:3:action" content="post">
          <meta property="fc:frame:button:3:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=0.1&token=ETH&recipient=${encodeURIComponent(recipient)}">
          
          <meta property="fc:frame:button:4" content="🔗 Visit App">
          <meta property="fc:frame:button:4:action" content="link">
          <meta property="fc:frame:button:4:target" content="${process.env.NEXT_PUBLIC_APP_URL}">
          
          <!-- Open Graph meta tags -->
          <meta property="og:title" content="Tip Chain - Send a Tip">
          <meta property="og:description" content="Send cryptocurrency tips seamlessly through Farcaster frames">
          <meta property="og:image" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?recipient=${encodeURIComponent(recipient)}&amount=${amount}&token=${token}">
          <meta property="og:url" content="${process.env.NEXT_PUBLIC_APP_URL}">
          <meta property="og:type" content="website">
          
          <!-- Twitter meta tags -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="Tip Chain - Send a Tip">
          <meta name="twitter:description" content="Send cryptocurrency tips seamlessly through Farcaster frames">
          <meta name="twitter:image" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?recipient=${encodeURIComponent(recipient)}&amount=${amount}&token=${token}">
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-align: center; padding: 20px;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: bold;">Tip Chain</h1>
            <p style="font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; max-width: 600px;">
              Send cryptocurrency tips seamlessly through Farcaster frames on Base and Optimism networks
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 8px; text-decoration: none; color: white; font-weight: 600; border: 1px solid rgba(255,255,255,0.3); transition: all 0.2s;">
              Visit Tip Chain App
            </a>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(frameHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Frame GET error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success } = await rateLimit.limit(identifier);
    
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const body = await request.json();
    
    // Validate the frame message
    const isValid = await validateFrameMessage(body);
    if (!isValid) {
      return new NextResponse('Invalid frame message', { status: 400 });
    }

    const { buttonIndex, inputText } = body;
    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get('recipient') || inputText || '';

    // Handle button interactions
    let amount = '0.01';
    let token = 'ETH';
    
    switch (buttonIndex) {
      case 1:
        amount = '0.01';
        break;
      case 2:
        amount = '0.05';
        break;
      case 3:
        amount = '0.1';
        break;
      default:
        amount = '0.01';
    }

    // Generate response frame
    const responseHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Tip Chain - Tip Selected</title>
          
          <!-- Frame meta tags -->
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?recipient=${encodeURIComponent(recipient)}&amount=${amount}&token=${token}&status=selected">
          <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
          <meta property="fc:frame:button:1" content="✅ Confirm Tip">
          <meta property="fc:frame:button:1:action" content="post">
          <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=${amount}&token=${token}&recipient=${encodeURIComponent(recipient)}">
          
          <meta property="fc:frame:button:2" content="🔄 Change Amount">
          <meta property="fc:frame:button:2:action" content="post">
          <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_APP_URL}/api/frame">
          
          <meta property="fc:frame:button:3" content="🔗 Visit App">
          <meta property="fc:frame:button:3:action" content="link">
          <meta property="fc:frame:button:3:target" content="${process.env.NEXT_PUBLIC_APP_URL}">
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-align: center; padding: 20px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold;">Tip Selected!</h1>
            <p style="font-size: 1.5rem; margin-bottom: 2rem;">
              ${amount} ${token} to ${recipient || 'recipient'}
            </p>
            <p style="opacity: 0.9;">Click "Confirm Tip" to proceed with the transaction</p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(responseHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=30',
      },
    });
  } catch (error) {
    console.error('Frame POST error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
