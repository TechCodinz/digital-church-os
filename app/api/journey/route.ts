import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function optionalRows<T>(query: Promise<T[]>, label: string): Promise<T[]> {
  try {
    return await query;
  } catch (error) {
    // Optional formation tables may be unavailable on an older database. Keep the
    // private journey usable without inventing placeholder records or exposing the error.
    console.warn(`Journey optional source unavailable: ${label}`, error);
    return [];
  }
}

function journalTimelineType(mood: string | null) {
  const prefix = 'Continuity:';
  if (mood?.startsWith(prefix)) return mood.slice(prefix.length) || 'Journey';
  return 'Journal';
}

function journalTimelineMeta(mood: string | null) {
  if (mood?.startsWith('Continuity:')) return 'Private continuity moment';
  return mood || 'Reflection';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [prayers, journalEntries, goals] = await Promise.all([
      prisma.prayerRequest.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, isAnswered: true, createdAt: true },
      }),
      prisma.journalEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: { id: true, title: true, mood: true, createdAt: true },
      }),
      prisma.goal.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, isAchieved: true, targetDate: true, createdAt: true },
      }),
    ]);

    const [sermonNotes, milestones] = await Promise.all([
      optionalRows(
        prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT id, title, scripture_refs, created_at
          FROM sermon_notes
          WHERE user_id = ${session.user.id}
          ORDER BY created_at DESC
          LIMIT 10
        `),
        'sermon_notes',
      ),
      optionalRows(
        prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT id, type, title, achieved_at, created_at
          FROM discipleship_milestones
          WHERE user_id = ${session.user.id}
          ORDER BY created_at DESC
          LIMIT 10
        `),
        'discipleship_milestones',
      ),
    ]);

    const timeline = [
      ...prayers.map((prayer) => ({
        type: 'Prayer',
        title: prayer.title,
        date: prayer.createdAt,
        meta: prayer.isAnswered ? 'Marked answered' : 'Prayer reflection',
      })),
      ...journalEntries.map((entry) => ({
        type: journalTimelineType(entry.mood),
        title: entry.title,
        date: entry.createdAt,
        meta: journalTimelineMeta(entry.mood),
      })),
      ...goals.map((goal) => ({
        type: 'Goal',
        title: goal.title,
        date: goal.createdAt,
        meta: goal.isAchieved ? 'Completed' : 'In progress',
      })),
      ...sermonNotes.map((note) => ({
        type: 'Sermon Note',
        title: String(note.title || 'Sermon note'),
        date: note.created_at,
        meta: Array.isArray(note.scripture_refs) ? note.scripture_refs.join(', ') : '',
      })),
      ...milestones.map((milestone) => ({
        type: 'Milestone',
        title: String(milestone.title || 'Milestone'),
        date: milestone.achieved_at || milestone.created_at,
        meta: String(milestone.type || 'Formation'),
      })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);

    return NextResponse.json({
      timeline,
      prayers,
      journalEntries,
      goals,
      sermonNotes,
      milestones,
      recentCounts: {
        prayers: prayers.length,
        reflections: journalEntries.length,
        goals: goals.length,
        sermonNotes: sermonNotes.length,
        milestones: milestones.length,
      },
      privacyBoundary: {
        spiritualScoring: false,
        financialActivityExcluded: true,
        pastoralCaseDataExcluded: true,
        childActivityExcluded: true,
      },
    });
  } catch (error) {
    console.error('Journey fetch failed:', error);
    return NextResponse.json({ error: 'Failed to load journey' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    const source = typeof body?.source === 'string' ? body.source.trim().slice(0, 60) : 'Journey';

    if (!content) return NextResponse.json({ error: 'Reflection is required.' }, { status: 400 });
    if (content.length > 2500) return NextResponse.json({ error: 'Reflection is too long.' }, { status: 400 });

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        title: `${source || 'Journey'} reflection`,
        content,
        mood: 'Private reflection',
      },
      select: { id: true, title: true, mood: true, createdAt: true },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Journey reflection save failed:', error);
    return NextResponse.json({ error: 'Unable to save private reflection.' }, { status: 500 });
  }
}
