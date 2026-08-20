import { NextRequest, NextResponse } from 'next/server';
import { getClientKey } from '@/lib/security/rate-limit';

interface RateWindow {
  count: number;
  resetTime: number;
}

const windows = new Map<string, RateWindow>();

function cleanupExpiredWindows() {
  const now = Date.now();
  for (const [key, win] of Array.from(windows.entries())) {
    if (now > win.resetTime) windows.delete(key);
  }
}

export async function aiRateLimit(
  req: NextRequest,
  userId?: string | null,
  options?: { maxRequests?: number; windowMs?: number }
): Promise<NextResponse | null> {
  cleanupExpiredWindows();

  const isAuthenticated = !!userId;
  const maxRequests = options?.maxRequests ?? (isAuthenticated ? 20 : 5);
  const windowMs = options?.windowMs ?? 60_000;
  const identifier = userId || getClientKey(req.headers);
  const key = `ai:${identifier}:${req.nextUrl.pathname}`;

  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now > existing.resetTime) {
    windows.set(key, { count: 1, resetTime: now + windowMs });
    return null;
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

  existing.count += 1;
  windows.set(key, existing);
  return null;
}

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
