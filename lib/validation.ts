import { z } from 'zod';
import { isAddress } from 'viem';
import type { FrameMessage, ValidationResult, TipRequest } from './types';

// Address validation
export function validateAddress(address: string): boolean {
  return isAddress(address);
}

// ENS name validation (basic pattern)
export function validateENS(name: string): boolean {
  const ensPattern = /^[a-zA-Z0-9-]+\.eth$/;
  return ensPattern.test(name);
}

// Amount validation
export function validateAmount(amount: string): ValidationResult {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount > 1000000) {
    return { isValid: false, error: 'Amount is too large' };
  }
  
  // Check for reasonable decimal places (max 18 for ETH)
  const decimalParts = amount.split('.');
  if (decimalParts.length > 1 && decimalParts[1].length > 18) {
    return { isValid: false, error: 'Too many decimal places' };
  }
  
  return { isValid: true };
}

// Token symbol validation
export function validateToken(token: string): ValidationResult {
  const allowedTokens = ['ETH', 'USDC', 'USDT', 'WETH', 'DAI'];
  
  if (!allowedTokens.includes(token.toUpperCase())) {
    return { 
      isValid: false, 
      error: `Token ${token} is not supported. Allowed tokens: ${allowedTokens.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

// Chain ID validation
export function validateChainId(chainId: number): ValidationResult {
  const supportedChains = [1, 8453, 10]; // Ethereum, Base, Optimism
  
  if (!supportedChains.includes(chainId)) {
    return { 
      isValid: false, 
      error: `Chain ID ${chainId} is not supported` 
    };
  }
  
  return { isValid: true };
}

// Tip request validation schema
export const tipRequestSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    })
    .refine((val) => parseFloat(val) <= 1000000, {
      message: 'Amount is too large',
    }),
  token: z.string()
    .min(1, 'Token is required')
    .refine((val) => ['ETH', 'USDC', 'USDT', 'WETH', 'DAI'].includes(val.toUpperCase()), {
      message: 'Invalid token',
    }),
  recipient: z.string()
    .min(1, 'Recipient is required')
    .refine((val) => isAddress(val) || validateENS(val), {
      message: 'Invalid recipient address or ENS name',
    }),
  chainId: z.number()
    .optional()
    .refine((val) => !val || [1, 8453, 10].includes(val), {
      message: 'Unsupported chain ID',
    }),
  message: z.string()
    .max(280, 'Message is too long')
    .optional(),
});

// Frame message validation
export async function validateFrameMessage(message: any): Promise<boolean> {
  try {
    // Basic structure validation
    if (!message || typeof message !== 'object') {
      return false;
    }
    
    // Required fields
    const requiredFields = ['fid', 'url', 'messageHash', 'timestamp', 'network'];
    for (const field of requiredFields) {
      if (!(field in message)) {
        return false;
      }
    }
    
    // Type validations
    if (typeof message.fid !== 'number' || message.fid <= 0) {
      return false;
    }
    
    if (typeof message.url !== 'string' || !isValidUrl(message.url)) {
      return false;
    }
    
    if (typeof message.messageHash !== 'string' || message.messageHash.length < 10) {
      return false;
    }
    
    if (typeof message.timestamp !== 'number' || message.timestamp <= 0) {
      return false;
    }
    
    if (typeof message.network !== 'number') {
      return false;
    }
    
    // Button index validation (if present)
    if ('buttonIndex' in message) {
      if (typeof message.buttonIndex !== 'number' || 
          message.buttonIndex < 1 || 
          message.buttonIndex > 4) {
        return false;
      }
    }
    
    // Input text validation (if present)
    if ('inputText' in message) {
      if (typeof message.inputText !== 'string' || message.inputText.length > 256) {
        return false;
      }
    }
    
    // Cast ID validation (if present)
    if ('castId' in message) {
      const castId = message.castId;
      if (!castId || 
          typeof castId.fid !== 'number' || 
          typeof castId.hash !== 'string') {
        return false;
      }
    }
    
    // In a real implementation, you would also verify the message signature
    // against the Farcaster Hub API to ensure authenticity
    
    return true;
  } catch (error) {
    console.error('Frame message validation error:', error);
    return false;
  }
}

// URL validation helper
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Comprehensive tip validation
export function validateTipRequest(request: TipRequest): ValidationResult {
  try {
    tipRequestSchema.parse(request);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        isValid: false,
        error: firstError.message,
        field: firstError.path.join('.'),
      };
    }
    
    return {
      isValid: false,
      error: 'Invalid tip request',
    };
  }
}

// Message length validation for frames
export function validateFrameMessage_Length(message: string): ValidationResult {
  const maxLength = 256;
  
  if (message.length > maxLength) {
    return {
      isValid: false,
      error: `Message is too long. Maximum ${maxLength} characters allowed.`,
    };
  }
  
  return { isValid: true };
}

// Batch validation for multiple tips
export function validateBatchTips(tips: TipRequest[]): ValidationResult[] {
  return tips.map(tip => validateTipRequest(tip));
}

// Rate limiting validation
export function validateRateLimit(
  userRequests: number, 
  timeWindow: number, 
  maxRequests: number
): ValidationResult {
  if (userRequests >= maxRequests) {
    return {
      isValid: false,
      error: `Rate limit exceeded. Maximum ${maxRequests} requests per ${timeWindow / 1000} seconds.`,
    };
  }
  
  return { isValid: true };
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

// Validate transaction hash
export function validateTxHash(hash: string): ValidationResult {
  const txHashPattern = /^0x[a-fA-F0-9]{64}$/;
  
  if (!txHashPattern.test(hash)) {
    return {
      isValid: false,
      error: 'Invalid transaction hash format',
    };
  }
  
  return { isValid: true };
}

// Validate FID (Farcaster ID)
export function validateFID(fid: number): ValidationResult {
  if (!Number.isInteger(fid) || fid <= 0 || fid > 1000000) {
    return {
      isValid: false,
      error: 'Invalid Farcaster ID',
    };
  }
  
  return { isValid: true };
}

// Export validation schemas for reuse
export const schemas = {
  tipRequest: tipRequestSchema,
  address: z.string().refine(validateAddress, 'Invalid address'),
  amount: z.string().refine((val) => validateAmount(val).isValid, 'Invalid amount'),
  token: z.string().refine((val) => validateToken(val).isValid, 'Invalid token'),
  chainId: z.number().refine((val) => validateChainId(val).isValid, 'Invalid chain ID'),
  txHash: z.string().refine((val) => validateTxHash(val).isValid, 'Invalid transaction hash'),
  fid: z.number().refine((val) => validateFID(val).isValid, 'Invalid FID'),
};
