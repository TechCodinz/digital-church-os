import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit/logger';
import { aiRateLimit } from '@/lib/ai-middleware';

const ChoirRequestSchema = z.object({
  theme: z.string().trim().min(3).max(160),
  style: z.enum(['gospel', 'contemporary', 'hymn']).default('gospel'),
  scriptureRefs: z.array(z.string().trim().min(2).max(80)).max(12).optional().default([]),
  type: z.enum(['lyrics', 'song', 'choir', 'worship']).optional().default('lyrics'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = await aiRateLimit(req, session.user.id, { maxRequests: 10, windowMs: 60_000 });
  if (limit) return limit;

  try {
    const body = await req.json();
    const parsed = ChoirRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid choir payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { theme, style, scriptureRefs, type } = parsed.data;
    const { RealWorshipGenerator } = await import('@/lib/ai/christian/worship/realWorshipGenerator');
    const generator = new RealWorshipGenerator();
    const response = await generator.generateWorshipContent({ theme, style });

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'WORSHIP_GENERATION',
      entityType: 'Choir',
      metadata: { theme, style, type, scriptureRefs, safeMode: !process.env.OPENAI_API_KEY },
      req,
    });

    return NextResponse.json({
      ...response,
      safeMode: !process.env.OPENAI_API_KEY,
      suggestions: [
        'Review lyrics with a worship leader before public use.',
        'Match tempo and key to the congregation’s singing range.',
        'Use scripture references as anchors for service flow.',
      ],
    });
  } catch (error) {
    console.error('Error in choir module:', error);
    return NextResponse.json({ error: 'Failed to generate worship content' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    module: 'Christian Worship Choir Module',
    version: '1.1.0',
    safeMode: !process.env.OPENAI_API_KEY,
    capabilities: ['worship lyric drafts', 'chord suggestions', 'scripture basis', 'safe fallback mode'],
  });
}
