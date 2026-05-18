import { NextRequest, NextResponse } from 'next/server';

/**
 * AI-specific middleware utilities.
 *
 * Provides:
 * - Per-user rate limiting (tied to session user ID or IP)
 * - Abuse detection (empty or excessively short inputs)
 * - Consistent 429 responses with Retry-After header
 *
 * Usage in any /api/ai/* route:
 *   import { aiRateLimit } from '@/lib/ai-middleware';
 *   const limit = await aiRateLimit(req, userId);
 *   if (limit) return limit; // returns a 429 NextResponse
 */

interface Window {
    count: number;
    resetTime: number;
}

const windows = new Map<string, Window>();

// Cleanup expired windows every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, win] of Array.from(windows.entries())) {
            if (now > win.resetTime) windows.delete(key);
        }
    }, 5 * 60 * 1000);
}

/**
 * Rate limit AI requests per user or IP.
 * Returns null if allowed, or a NextResponse(429) if rate limited.
 *
 * @param req     - The incoming request
 * @param userId  - Optional: authenticated user ID (preferred over IP)
 * @param options - Override defaults: maxRequests (default 20/min for auth, 5/min for anon)
 */
export async function aiRateLimit(
    req: NextRequest,
    userId?: string | null,
    options?: { maxRequests?: number; windowMs?: number }
): Promise<NextResponse | null> {
    const isAuthenticated = !!userId;
    const maxRequests = options?.maxRequests ?? (isAuthenticated ? 20 : 5);
    const windowMs = options?.windowMs ?? 60_000; // 1 minute window

    const identifier = userId || req.ip || req.headers.get('x-forwarded-for') || 'anon';
    const key = `ai:${identifier}:${req.nextUrl.pathname}`;

    const now = Date.now();
    const existing = windows.get(key);

    if (!existing || now > existing.resetTime) {
        windows.set(key, { count: 1, resetTime: now + windowMs });
        return null; // allowed
    }

    if (existing.count >= maxRequests) {
        const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
        return NextResponse.json(
            {
                error: 'AI request limit reached. Please wait a moment before asking again.',
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Limit': String(maxRequests),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(existing.resetTime / 1000)),
                },
            }
        );
    }

    existing.count++;
    return null; // allowed
}

/**
 * Validate that the AI input field is not empty or suspiciously short.
 * Returns null if valid, or a NextResponse(400) if invalid.
 */
export function validateAIRequest(
    input: string | null | undefined,
    fieldName = 'input'
): NextResponse | null {
    if (!input || input.trim().length < 3) {
        return NextResponse.json(
            { error: `Please provide a valid ${fieldName} (at least 3 characters).` },
            { status: 400 }
        );
    }
    if (input.length > 4000) {
        return NextResponse.json(
            { error: `Your ${fieldName} is too long. Please keep it under 4000 characters.` },
            { status: 400 }
        );
    }
    return null;
}
