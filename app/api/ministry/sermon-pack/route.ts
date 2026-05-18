import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { generateSermonContentPack } from '@/lib/ministry-os/sermonToEverything';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';
import { AuditLogger } from '@/lib/audit/logger';

const SermonPackSchema = z.object({
  theme: z.string().trim().min(3).max(180),
  scriptureRefs: z.array(z.string().trim().min(2).max(80)).max(12).optional(),
  audience: z.enum(['general', 'children', 'youth', 'leaders']).optional().default('general'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = rateLimit(`sermon-pack:${session.user.id}:${getClientKey(req.headers)}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many sermon pack generations. Please wait before trying again.' }, { status: 429, headers: rateLimitHeaders(limit) });
  }

  try {
    const parsed = SermonPackSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid sermon pack payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(limit) });
    }

    const pack = generateSermonContentPack(parsed.data);

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'SERMON_CONTENT_PACK_GENERATED',
      entityType: 'SermonContentPack',
      metadata: { theme: pack.theme, scriptureRefs: pack.scriptureRefs, audience: parsed.data.audience },
      req,
    });

    return NextResponse.json({ pack, generatedAt: new Date().toISOString() }, { headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error('Sermon pack generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate sermon content pack' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}

export async function GET() {
  return NextResponse.json({
    module: 'Sermon-to-Everything Engine',
    capabilities: ['sermon outline', 'children lesson', 'youth discussion', 'worship set', 'prayer points', 'social posts', 'newsletter', 'video script', 'bulletin', 'devotional plan'],
  });
}
