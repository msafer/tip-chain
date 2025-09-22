import type { FrameConfig, FrameButton, FrameMessage } from './types';

// Frame image generation utilities
export class FrameImageGenerator {
  static generateTipImage(
    recipient: string,
    amount: string,
    token: string,
    status: 'initial' | 'selected' | 'success' | 'error' = 'initial'
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tip-chain.vercel.app';
    const params = new URLSearchParams({
      recipient,
      amount,
      token,
      status,
    });
    
    return `${baseUrl}/api/frame/image?${params.toString()}`;
  }

  static generateLeaderboardImage(
    type: 'tippers' | 'recipients',
    period: 'day' | 'week' | 'month' = 'week'
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tip-chain.vercel.app';
    const params = new URLSearchParams({ type, period });
    
    return `${baseUrl}/api/frame/image/leaderboard?${params.toString()}`;
  }

  static generateStatsImage(address: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tip-chain.vercel.app';
    const params = new URLSearchParams({ address });
    
    return `${baseUrl}/api/frame/image/stats?${params.toString()}`;
  }
}

// Frame configuration builder
export class FrameBuilder {
  private config: FrameConfig;

  constructor() {
    this.config = {
      image: '',
      imageAspectRatio: '1.91:1',
      buttons: [],
    };
  }

  setImage(imageUrl: string): this {
    this.config.image = imageUrl;
    return this;
  }

  setAspectRatio(ratio: '1.91:1' | '1:1'): this {
    this.config.imageAspectRatio = ratio;
    return this;
  }

  addButton(button: FrameButton): this {
    if (this.config.buttons!.length >= 4) {
      throw new Error('Maximum 4 buttons allowed per frame');
    }
    this.config.buttons!.push(button);
    return this;
  }

  setInputText(placeholder: string): this {
    this.config.inputText = placeholder;
    return this;
  }

  setState(state: string): this {
    this.config.state = state;
    return this;
  }

  build(): FrameConfig {
    if (!this.config.image) {
      throw new Error('Image URL is required');
    }
    return { ...this.config };
  }

  // Generate HTML with frame meta tags
  generateHTML(title: string = 'Tip Chain Frame'): string {
    const config = this.build();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tip-chain.vercel.app';

    let metaTags = `
      <meta property="fc:frame" content="vNext">
      <meta property="fc:frame:image" content="${config.image}">
      <meta property="fc:frame:image:aspect_ratio" content="${config.imageAspectRatio}">
    `;

    // Add buttons
    config.buttons?.forEach((button, index) => {
      const buttonIndex = index + 1;
      metaTags += `
        <meta property="fc:frame:button:${buttonIndex}" content="${button.content}">
        <meta property="fc:frame:button:${buttonIndex}:action" content="${button.action}">
      `;
      
      if (button.target) {
        metaTags += `
          <meta property="fc:frame:button:${buttonIndex}:target" content="${button.target}">
        `;
      }
      
      if (button.postUrl) {
        metaTags += `
          <meta property="fc:frame:button:${buttonIndex}:post_url" content="${button.postUrl}">
        `;
      }
    });

    // Add input text if present
    if (config.inputText) {
      metaTags += `
        <meta property="fc:frame:input:text" content="${config.inputText}">
      `;
    }

    // Add state if present
    if (config.state) {
      metaTags += `
        <meta property="fc:frame:state" content="${config.state}">
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${title}</title>
          
          ${metaTags}
          
          <!-- Open Graph meta tags -->
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="Send cryptocurrency tips seamlessly through Farcaster frames">
          <meta property="og:image" content="${config.image}">
          <meta property="og:url" content="${baseUrl}">
          <meta property="og:type" content="website">
          
          <!-- Twitter meta tags -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="${title}">
          <meta name="twitter:description" content="Send cryptocurrency tips seamlessly through Farcaster frames">
          <meta name="twitter:image" content="${config.image}">
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-align: center; padding: 20px;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: bold;">Tip Chain</h1>
            <p style="font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; max-width: 600px;">
              Send cryptocurrency tips seamlessly through Farcaster frames
            </p>
            <a href="${baseUrl}" style="background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 8px; text-decoration: none; color: white; font-weight: 600; border: 1px solid rgba(255,255,255,0.3); transition: all 0.2s;">
              Visit Tip Chain App
            </a>
          </div>
        </body>
      </html>
    `;
  }
}

// Pre-built frame configurations
export const FrameTemplates = {
  // Initial tip frame
  tipInitial: (recipient: string = '', amount: string = '0.01', token: string = 'ETH') => {
    const builder = new FrameBuilder();
    const imageUrl = FrameImageGenerator.generateTipImage(recipient, amount, token, 'initial');
    
    return builder
      .setImage(imageUrl)
      .addButton({
        content: '💰 Tip 0.01 ETH',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=0.01&token=ETH&recipient=${encodeURIComponent(recipient)}`,
      })
      .addButton({
        content: '💎 Tip 0.05 ETH',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=0.05&token=ETH&recipient=${encodeURIComponent(recipient)}`,
      })
      .addButton({
        content: '🚀 Tip 0.1 ETH',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=0.1&token=ETH&recipient=${encodeURIComponent(recipient)}`,
      })
      .addButton({
        content: '🔗 Visit App',
        action: 'link',
        target: process.env.NEXT_PUBLIC_APP_URL,
      })
      .build();
  },

  // Tip confirmation frame
  tipConfirmation: (recipient: string, amount: string, token: string) => {
    const builder = new FrameBuilder();
    const imageUrl = FrameImageGenerator.generateTipImage(recipient, amount, token, 'selected');
    
    return builder
      .setImage(imageUrl)
      .addButton({
        content: '✅ Confirm Tip',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/prepare-tip?amount=${amount}&token=${token}&recipient=${encodeURIComponent(recipient)}`,
      })
      .addButton({
        content: '🔄 Change Amount',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame`,
      })
      .addButton({
        content: '🔗 Visit App',
        action: 'link',
        target: process.env.NEXT_PUBLIC_APP_URL,
      })
      .build();
  },

  // Success frame
  tipSuccess: (txHash: string) => {
    const builder = new FrameBuilder();
    const imageUrl = FrameImageGenerator.generateTipImage('', '', '', 'success');
    
    return builder
      .setImage(imageUrl)
      .addButton({
        content: '🎉 Send Another',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame`,
      })
      .addButton({
        content: '🔗 View Transaction',
        action: 'link',
        target: `https://basescan.org/tx/${txHash}`,
      })
      .addButton({
        content: '📊 View Stats',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/stats`,
      })
      .build();
  },

  // Error frame
  tipError: (error: string = 'Something went wrong') => {
    const builder = new FrameBuilder();
    const imageUrl = FrameImageGenerator.generateTipImage('', '', '', 'error');
    
    return builder
      .setImage(imageUrl)
      .addButton({
        content: '🔄 Try Again',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame`,
      })
      .addButton({
        content: '🔗 Visit App',
        action: 'link',
        target: process.env.NEXT_PUBLIC_APP_URL,
      })
      .build();
  },

  // Leaderboard frame
  leaderboard: (type: 'tippers' | 'recipients' = 'tippers') => {
    const builder = new FrameBuilder();
    const imageUrl = FrameImageGenerator.generateLeaderboardImage(type);
    
    return builder
      .setImage(imageUrl)
      .addButton({
        content: type === 'tippers' ? '👑 Top Recipients' : '🏆 Top Tippers',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/leaderboard?type=${type === 'tippers' ? 'recipients' : 'tippers'}`,
      })
      .addButton({
        content: '💰 Send Tip',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame`,
      })
      .addButton({
        content: '📊 My Stats',
        action: 'post',
        target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/stats`,
      })
      .addButton({
        content: '🔗 Visit App',
        action: 'link',
        target: process.env.NEXT_PUBLIC_APP_URL,
      })
      .build();
  },
};

// Frame message parser
export class FrameMessageParser {
  static parse(body: any): FrameMessage | null {
    try {
      if (!body || typeof body !== 'object') {
        return null;
      }

      const message: FrameMessage = {
        fid: body.fid,
        url: body.url,
        messageHash: body.messageHash,
        timestamp: body.timestamp,
        network: body.network,
        buttonIndex: body.buttonIndex || 1,
      };

      // Optional fields
      if (body.inputText) {
        message.inputText = body.inputText;
      }

      if (body.castId) {
        message.castId = {
          fid: body.castId.fid,
          hash: body.castId.hash,
        };
      }

      return message;
    } catch (error) {
      console.error('Failed to parse frame message:', error);
      return null;
    }
  }

  static getButtonAction(message: FrameMessage, buttons: FrameButton[]): FrameButton | null {
    const buttonIndex = message.buttonIndex - 1; // Convert to 0-based index
    return buttons[buttonIndex] || null;
  }
}

// Frame validation utilities
export const FrameValidator = {
  // Validate frame configuration
  validateConfig(config: FrameConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.image) {
      errors.push('Image URL is required');
    }

    if (config.buttons && config.buttons.length > 4) {
      errors.push('Maximum 4 buttons allowed');
    }

    if (config.buttons) {
      config.buttons.forEach((button, index) => {
        if (!button.content) {
          errors.push(`Button ${index + 1} content is required`);
        }
        
        if (button.content.length > 32) {
          errors.push(`Button ${index + 1} content too long (max 32 characters)`);
        }
        
        if (!['post', 'link', 'tx'].includes(button.action)) {
          errors.push(`Button ${index + 1} has invalid action`);
        }
      });
    }

    if (config.inputText && config.inputText.length > 32) {
      errors.push('Input text too long (max 32 characters)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Validate frame message
  validateMessage(message: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!message) {
      errors.push('Message is required');
      return { valid: false, errors };
    }

    if (typeof message.fid !== 'number' || message.fid <= 0) {
      errors.push('Valid FID is required');
    }

    if (!message.url || typeof message.url !== 'string') {
      errors.push('Valid URL is required');
    }

    if (!message.messageHash || typeof message.messageHash !== 'string') {
      errors.push('Valid message hash is required');
    }

    if (typeof message.timestamp !== 'number' || message.timestamp <= 0) {
      errors.push('Valid timestamp is required');
    }

    if (typeof message.network !== 'number') {
      errors.push('Valid network is required');
    }

    if (message.buttonIndex && (typeof message.buttonIndex !== 'number' || message.buttonIndex < 1 || message.buttonIndex > 4)) {
      errors.push('Button index must be between 1 and 4');
    }

    if (message.inputText && (typeof message.inputText !== 'string' || message.inputText.length > 256)) {
      errors.push('Input text must be a string with max 256 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// Export utilities
export function generateFrameImage(
  recipient: string,
  amount: string,
  token: string,
  status: 'initial' | 'selected' | 'success' | 'error' = 'initial'
): string {
  return FrameImageGenerator.generateTipImage(recipient, amount, token, status);
}

export function createTipFrame(recipient: string = '', amount: string = '0.01', token: string = 'ETH'): string {
  const config = FrameTemplates.tipInitial(recipient, amount, token);
  const builder = new FrameBuilder();
  return builder.generateHTML('Tip Chain - Send a Tip');
}

export function createLeaderboardFrame(type: 'tippers' | 'recipients' = 'tippers'): string {
  const config = FrameTemplates.leaderboard(type);
  const builder = new FrameBuilder();
  return builder.generateHTML('Tip Chain - Leaderboard');
}
