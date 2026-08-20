import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // milliseconds
  maxRequests: number;
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

function getRequestIp(req: NextRequest): string {
  const vercelForwardedFor = req.headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) return vercelForwardedFor.split(',')[0]?.trim() || 'unknown';

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';

  return 'unknown';
}

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextRequest) => {
    const ip = getRequestIp(req);
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
