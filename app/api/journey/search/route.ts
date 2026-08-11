import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function cleanQuery(value: string | null) {
  return (value || '').trim().slice(0, 120);
}

async function optionalRows<T>(query: Promise<T[]>, label: string): Promise<T[]> {
  try {
    return await query;
  } catch (error) {
    console.warn(`Journey memory optional source unavailable: ${label}`, error);
    return [];
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to search your private spiritual memory.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = cleanQuery(searchParams.get('q'));
  if (q.length < 2) {
    return NextResponse.json({ error: 'Enter at least 2 characters to search.' }, { status: 400 });
  }

  try {
    const [journalEntries, prayers, goals, sermonNotes] = await Promise.all([
      prisma.journalEntry.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, title: true, mood: true, content: true, createdAt: true },
      }),
      prisma.prayerRequest.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: { id: true, title: true, content: true, isAnswered: true, createdAt: true },
      }),
      prisma.goal.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: { id: true, title: true, description: true, isAchieved: true, createdAt: true },
      }),
      optionalRows(
        prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
          SELECT id, title, notes, scripture_refs, created_at
          FROM sermon_notes
          WHERE user_id = ${session.user.id}
            AND (
              title ILIKE ${`%${q}%`}
              OR COALESCE(notes, '') ILIKE ${`%${q}%`}
              OR array_to_string(scripture_refs, ' ') ILIKE ${`%${q}%`}
            )
          ORDER BY created_at DESC
          LIMIT 12
        `),
        'sermon_notes',
      ),
    ]);

    const results = [
      ...journalEntries.map((entry) => ({
        id: entry.id,
        type: entry.mood?.startsWith('Continuity:') ? 'Journey moment' : 'Journal',
        title: entry.title,
        excerpt: entry.content.slice(0, 360),
        date: entry.createdAt,
        href: '/journal',
      })),
      ...prayers.map((prayer) => ({
        id: prayer.id,
        type: 'Prayer',
        title: prayer.title,
        excerpt: prayer.content.slice(0, 360),
        date: prayer.createdAt,
        meta: prayer.isAnswered ? 'Marked answered' : 'Prayer reflection',
        href: '/prayer-room',
      })),
      ...goals.map((goal) => ({
        id: goal.id,
        type: 'Goal',
        title: goal.title,
        excerpt: (goal.description || '').slice(0, 360),
        date: goal.createdAt,
        meta: goal.isAchieved ? 'Completed' : 'In progress',
        href: '/journey',
      })),
      ...sermonNotes.map((note) => ({
        id: String(note.id || ''),
        type: 'Sermon note',
        title: String(note.title || 'Sermon note'),
        excerpt: String(note.notes || '').slice(0, 360),
        date: note.created_at,
        meta: Array.isArray(note.scripture_refs) ? note.scripture_refs.join(', ') : '',
        href: '/sermons',
      })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())
      .slice(0, 36);

    return NextResponse.json({
      query: q,
      results,
      resultCount: results.length,
      privacyBoundary: {
        accountOnly: true,
        givingExcluded: true,
        pastoralCaseDataExcluded: true,
        childActivityExcluded: true,
        aiInference: false,
      },
    });
  } catch (error) {
    console.error('Journey memory search failed:', error);
    return NextResponse.json({ error: 'Unable to search your private spiritual memory right now.' }, { status: 500 });
  }
}
