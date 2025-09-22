import type { RateLimitResult } from './types';

// Simple in-memory rate limiter for development
// In production, you'd want to use Redis or similar
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanup(now);
    }

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });

      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      };
    }

    // Increment count
    entry.count++;

    if (entry.count > this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: entry.resetTime,
      };
    }

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - entry.count,
      reset: entry.resetTime,
    };
  }

  private cleanup(now: number): void {
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  // Get current status for an identifier
  getStatus(identifier: string): { count: number; resetTime: number } | null {
    const entry = this.requests.get(identifier);
    return entry || null;
  }

  // Reset rate limit for an identifier
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  // Clear all rate limits
  clear(): void {
    this.requests.clear();
  }
}

// Redis-based rate limiter (for production)
class RedisRateLimiter {
  private redis: any;
  private maxRequests: number;
  private windowMs: number;

  constructor(redis: any, maxRequests: number = 100, windowMs: number = 60000) {
    this.redis = redis;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Count requests in current window
      pipeline.zcard(key);
      
      // Set expiration
      pipeline.expire(key, Math.ceil(this.windowMs / 1000));
      
      const results = await pipeline.exec();
      const count = results[2][1]; // Get count from zcard command

      if (count > this.maxRequests) {
        return {
          success: false,
          limit: this.maxRequests,
          remaining: 0,
          reset: now + this.windowMs,
        };
      }

      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - count,
        reset: now + this.windowMs,
      };
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      // Fallback to allowing the request if Redis fails
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      };
    }
  }

  async getStatus(identifier: string): Promise<{ count: number; resetTime: number } | null> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      const count = await this.redis.zcount(key, windowStart, now);
      return {
        count,
        resetTime: now + this.windowMs,
      };
    } catch (error) {
      console.error('Redis rate limiter status error:', error);
      return null;
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis rate limiter reset error:', error);
    }
  }
}

// Configuration for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // General API endpoints
  api: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  
  // Frame endpoints (more restrictive)
  frames: {
    maxRequests: 50,
    windowMs: 60000, // 1 minute
  },
  
  // Tip creation (very restrictive)
  tips: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
  
  // Image generation
  images: {
    maxRequests: 200,
    windowMs: 60000, // 1 minute
  },
  
  // Authentication
  auth: {
    maxRequests: 5,
    windowMs: 300000, // 5 minutes
  },
};

// Create rate limiter instances
function createRateLimiter(config: { maxRequests: number; windowMs: number }) {
  // Use Redis in production if available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.NODE_ENV === 'production') {
    try {
      // This would be initialized with actual Redis client
      // const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL);
      // return new RedisRateLimiter(redis, config.maxRequests, config.windowMs);
    } catch (error) {
      console.warn('Failed to initialize Redis rate limiter, falling back to in-memory');
    }
  }
  
  // Fallback to in-memory rate limiter
  return new InMemoryRateLimiter(config.maxRequests, config.windowMs);
}

// Export rate limiter instances
export const rateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.api);
export const frameRateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.frames);
export const tipRateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.tips);
export const imageRateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.images);
export const authRateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.auth);

// Middleware factory for Next.js API routes
export function createRateLimitMiddleware(
  limiter: InMemoryRateLimiter | RedisRateLimiter,
  getIdentifier: (req: any) => string = (req) => req.ip || 'anonymous'
) {
  return async function rateLimitMiddleware(req: any, res: any, next: () => void) {
    const identifier = getIdentifier(req);
    const result = await limiter.limit(identifier);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.reset);

    if (!result.success) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again after ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      });
      return;
    }

    next();
  };
}

// IP-based identifier
export function getIPIdentifier(req: any): string {
  // Check various headers for real IP
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return req.socket?.remoteAddress || req.ip || 'anonymous';
}

// User-based identifier (when authenticated)
export function getUserIdentifier(req: any): string {
  // Extract user ID from authentication
  const user = req.user || req.auth?.user;
  if (user?.id) {
    return `user:${user.id}`;
  }
  
  // Extract from JWT token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      // This would decode the JWT and extract user ID
      // const decoded = jwt.decode(token);
      // return `user:${decoded.sub}`;
    } catch (error) {
      // Invalid token, fall back to IP
    }
  }
  
  // Fallback to IP-based identification
  return getIPIdentifier(req);
}

// Combined identifier (user + IP for extra security)
export function getCombinedIdentifier(req: any): string {
  const userId = getUserIdentifier(req);
  const ip = getIPIdentifier(req);
  
  if (userId.startsWith('user:')) {
    return `${userId}:${ip}`;
  }
  
  return ip;
}

// Rate limit bypass for trusted sources
export function shouldBypassRateLimit(req: any): boolean {
  // Bypass for localhost in development
  if (process.env.NODE_ENV === 'development') {
    const ip = getIPIdentifier(req);
    if (['127.0.0.1', '::1', 'localhost'].includes(ip)) {
      return true;
    }
  }
  
  // Bypass for trusted IPs
  const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
  const ip = getIPIdentifier(req);
  if (trustedIPs.includes(ip)) {
    return true;
  }
  
  // Bypass for admin users
  const user = req.user || req.auth?.user;
  if (user?.role === 'admin') {
    return true;
  }
  
  return false;
}

// Rate limit status checker
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIGS = 'api'
): Promise<RateLimitResult> {
  const limiter = createRateLimiter(RATE_LIMIT_CONFIGS[type]);
  return limiter.limit(identifier);
}

// Export types and utilities
export type { RateLimitResult };
export { InMemoryRateLimiter, RedisRateLimiter };
