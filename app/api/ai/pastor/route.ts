import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkDbConnection } from '@/lib/prisma';
import { aiRateLimit, validateAIRequest } from '@/lib/ai-middleware';
import { AuditLogger } from '@/lib/audit/logger';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Sensitive reflection/care assistance never falls back to a synthetic or
    // shared demo identity. A real authenticated account is required even when
    // the database or AI provider is degraded.
    if (!userId) {
      return NextResponse.json({ error: 'Sign in is required before using the AI ministry companion.' }, { status: 401 });
    }

    const rateLimitResponse = await aiRateLimit(req, userId, { maxRequests: 16, windowMs: 60_000 });
    if (rateLimitResponse) return rateLimitResponse;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const input = typeof body === 'object' && body !== null && 'input' in body
      ? (body as { input?: unknown }).input
      : undefined;
    const inputError = validateAIRequest(typeof input === 'string' ? input : undefined, 'message');
    if (inputError) return inputError;

    const concern = String(input).trim();
    const { RealCounselor } = await import('@/lib/ai/christian/care/realCounselor');
    const counselor = new RealCounselor();
    const response = await counselor.processSession({
      userId,
      concern,
    });

    const timestamp = new Date().toISOString();

    // Do not duplicate the member's concern or generated care/reflection text
    // into the generic AIInteraction audit store. The counselor's dedicated
    // safety logger records only a redaction marker plus risk/response metadata.
    // This route records operational metadata only when the database is healthy.
    if (await checkDbConnection()) {
      try {
        await AuditLogger.log({
          actorId: userId,
          action: 'AI_MINISTRY_COMPANION_USED',
          entityType: 'AIMinistryCompanion',
          metadata: {
            responseType: response.type,
            duration: Date.now() - startTime,
            inputLength: concern.length,
            scriptureReferenceCount: response.content?.scriptures?.length || 0,
            route: '/api/ai/pastor',
            sensitiveContentPersisted: false,
          },
          req,
        });
      } catch (logError) {
        console.error('AI ministry companion metadata audit failed:', logError);
      }
    }

    return NextResponse.json({
      response,
      interactionId: null,
      persistedConversation: false,
      timestamp,
    });
  } catch (error) {
    console.error('AI ministry companion error:', error);
    return NextResponse.json({ error: 'Unable to process the ministry reflection right now.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'available',
    module: 'AI Ministry Companion',
    capabilities: [
      'scripture-grounded reflection',
      'prayer drafting support',
      'human-care routing',
      'crisis-aware safe handoff',
    ],
    storesConversationTextByDefault: false,
    safeMode: !process.env.OPENAI_API_KEY,
  });
}
