import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get('recipient') || 'someone special';
    const amount = searchParams.get('amount') || '0.01';
    const token = searchParams.get('token') || 'ETH';
    const status = searchParams.get('status') || 'initial';

    // Generate dynamic frame image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            fontFamily: 'system-ui, sans-serif',
            color: 'white',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />
          
          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              zIndex: 1,
              padding: '40px',
            }}
          >
            {/* Logo/Icon */}
            <div
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
                border: '3px solid rgba(255,255,255,0.3)',
              }}
            >
              <span style={{ fontSize: '60px' }}>💰</span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                background: 'linear-gradient(90deg, #ffffff, #f0f0f0)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Tip Chain
            </h1>

            {/* Status-based content */}
            {status === 'selected' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '600',
                    opacity: 0.9,
                  }}
                >
                  Tip Selected!
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '20px 40px',
                    borderRadius: '16px',
                    border: '2px solid rgba(255,255,255,0.25)',
                    fontSize: '28px',
                    fontWeight: 'bold',
                  }}
                >
                  {amount} {token}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    opacity: 0.8,
                  }}
                >
                  to {recipient.length > 20 ? `${recipient.slice(0, 20)}...` : recipient}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '600',
                    opacity: 0.9,
                    textAlign: 'center',
                    maxWidth: '800px',
                  }}
                >
                  Send cryptocurrency tips seamlessly
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    opacity: 0.7,
                    textAlign: 'center',
                  }}
                >
                  Choose an amount to tip {recipient}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    marginTop: '20px',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255,255,255,0.25)',
                      fontSize: '20px',
                      fontWeight: '600',
                    }}
                  >
                    0.01 ETH
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255,255,255,0.25)',
                      fontSize: '20px',
                      fontWeight: '600',
                    }}
                  >
                    0.05 ETH
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255,255,255,0.25)',
                      fontSize: '20px',
                      fontWeight: '600',
                    }}
                  >
                    0.1 ETH
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                fontSize: '18px',
                opacity: 0.6,
              }}
            >
              Powered by Base & Optimism • Farcaster Frames
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Frame image generation error:', error);
    return new NextResponse('Failed to generate image', { status: 500 });
  }
}
