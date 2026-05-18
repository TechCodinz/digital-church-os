import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // milliseconds
  maxRequests: number;
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}:${req.nextUrl.pathname}`;
    
    const now = Date.now();
    const limit = rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      // New or expired limit
      rateLimits.set(key, {
        count: 1,
        resetTime: now + config.interval,
      });
      return null;
    }

    if (limit.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((limit.resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    // Increment count
    limit.count++;
    rateLimits.set(key, limit);
    return null;
  };
}

// Clean up expired limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, limit] of Array.from(rateLimits.entries())) {
    if (now > limit.resetTime) {
      rateLimits.delete(key);
    }
  }
}, 60000); // Clean up every minute
