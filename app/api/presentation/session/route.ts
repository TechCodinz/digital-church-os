import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SessionSchema = z.object({
  liveServiceId: z.string().trim().min(3),
  deckId: z.string().trim().optional(),
  screenMode: z.enum(['SANCTUARY', 'STREAM', 'CONFIDENCE', 'LOWER_THIRD']).default('SANCTUARY'),
});

const EventSchema = z.object({
  sessionId: z.string().trim().min(3),
  eventType: z.enum(['START', 'END', 'NEXT_SLIDE', 'PREVIOUS_SLIDE', 'GO_TO_SLIDE', 'SHOW_VERSE', 'SHOW_LYRICS', 'SHOW_ANNOUNCEMENT']),
  currentSlideId: z.string().trim().optional(),
  payload: z.record(z.any()).optional().default({}),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['CHURCH_ADMIN', 'AI_DEPARTMENT'].includes(session.user.role)) return NextResponse.json({ error: 'Presenter access required' }, { status: 403 });

  const body = await req.json();
  const action = body.action || 'create-session';

  if (action === 'event') {
    const parsed = EventSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid presentation event', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    if (d.currentSlideId) {
      await prisma.$executeRaw(Prisma.sql`UPDATE live_presentation_sessions SET current_slide_id = ${d.currentSlideId}, status = 'LIVE' WHERE id = ${d.sessionId}`);
    }
    if (d.eventType === 'START') await prisma.$executeRaw(Prisma.sql`UPDATE live_presentation_sessions SET status = 'LIVE', started_at = COALESCE(started_at, now()) WHERE id = ${d.sessionId}`);
    if (d.eventType === 'END') await prisma.$executeRaw(Prisma.sql`UPDATE live_presentation_sessions SET status = 'ENDED', ended_at = now() WHERE id = ${d.sessionId}`);

    const events = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO live_presentation_events (session_id, actor_id, event_type, payload)
      VALUES (${d.sessionId}, ${session.user.id}, ${d.eventType}, ${JSON.stringify(d.payload)}::jsonb)
      RETURNING *
    `);
    return NextResponse.json({ event: events[0] }, { status: 201 });
  }

  const parsed = SessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid presentation session payload', details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO live_presentation_sessions (live_service_id, deck_id, controller_id, status, screen_mode)
    VALUES (${d.liveServiceId}, ${d.deckId || null}, ${session.user.id}, 'READY', ${d.screenMode})
    RETURNING *
  `);
  return NextResponse.json({ session: rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const liveServiceId = searchParams.get('liveServiceId');
  const sessionId = searchParams.get('sessionId');

  const sessions = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT lps.*, d.title AS deck_title, s.title AS current_slide_title, s.body AS current_slide_body
    FROM live_presentation_sessions lps
    LEFT JOIN sermon_presentation_decks d ON d.id = lps.deck_id
    LEFT JOIN presentation_slides s ON s.id = lps.current_slide_id
    WHERE (${liveServiceId || null}::text IS NULL OR lps.live_service_id = ${liveServiceId || null})
      AND (${sessionId || null}::text IS NULL OR lps.id = ${sessionId || null})
    ORDER BY lps.created_at DESC
    LIMIT 50
  `);

  const events = sessionId ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM live_presentation_events WHERE session_id = ${sessionId} ORDER BY created_at DESC LIMIT 100
  `) : [];

  return NextResponse.json({ sessions, events });
}
