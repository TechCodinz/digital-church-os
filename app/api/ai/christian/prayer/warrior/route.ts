import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit/logger';
import { AI_DISCLAIMER } from '@/lib/ai/shared/guardrails';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';

const GuidedPrayerSchema = z.object({
    prayerRequest: z.string().trim().min(3).max(4000),
    scriptureRefs: z.array(z.string().trim().max(80)).max(8).optional(),
    style: z.string().trim().max(80).optional(),
});

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Sign in is required for guided prayer.' }, { status: 401 });
    }

    const limit = rateLimit(`guided-prayer:${session.user.id}:${getClientKey(req.headers)}`, {
        limit: 8,
        windowMs: 10 * 60 * 1000,
    });
    if (!limit.allowed) {
        return NextResponse.json(
            { error: 'Too many guided-prayer requests. Please pause before trying again.' },
            { status: 429, headers: rateLimitHeaders(limit) },
        );
    }

    try {
        const parsed = GuidedPrayerSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Please provide a valid prayer request.', details: parsed.error.flatten() },
                { status: 400, headers: rateLimitHeaders(limit) },
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'Guided prayer is not configured in this environment.' },
                { status: 503, headers: rateLimitHeaders(limit) },
            );
        }

        const { prayerRequest, scriptureRefs, style } = parsed.data;
        const { RealPrayerWarrior } = await import('@/lib/ai/christian/prayer/realPrayerWarrior');
        const prayerCompanion = new RealPrayerWarrior();
        const response = await prayerCompanion.generatePrayer({
            userId: session.user.id,
            title: prayerRequest.split('\n')[0].substring(0, 100),
            content: prayerRequest,
        });

        // The cinematic prayer experience is rendered locally by the sanctuary
        // UI. Do not send prayer-derived themes or text to a second decorative
        // media provider; that would create an unnecessary additional disclosure.
        response.visuals = { image: null, video: null };

        // Sensitive prayer text is deliberately excluded from generic audit
        // metadata. The audit records operation facts only.
        try {
            await AuditLogger.log({
                actorId: session.user.id,
                action: 'AI_INTERACTION',
                entityType: 'GuidedPrayer',
                metadata: {
                    inputStored: false,
                    outputStored: false,
                    secondaryMediaDisclosure: false,
                    inputLength: prayerRequest.length,
                    suppliedScriptureRefCount: scriptureRefs?.length || 0,
                    styleSupplied: Boolean(style),
                    themeCount: response.themes?.length || 0,
                    durationMs: Date.now() - startTime,
                },
                req,
            });
        } catch (auditError) {
            console.error('Guided-prayer metadata audit failed:', auditError);
        }

        return NextResponse.json(
            {
                ...response,
                disclaimer: AI_DISCLAIMER,
                note: 'This is a generated prayer draft for reflection. It does not speak for God or replace Scripture or human pastoral care.',
            },
            { headers: rateLimitHeaders(limit) },
        );
    } catch (error) {
        console.error('Guided prayer failed:', error);
        return NextResponse.json(
            { error: 'Guided prayer could not be prepared right now.' },
            { status: 500, headers: rateLimitHeaders(limit) },
        );
    }
}
