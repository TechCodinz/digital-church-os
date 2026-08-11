import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const allowedSources = new Set([
  'Daily Guide',
  'Scripture',
  'Prayer',
  'Fasting',
  'Family Altar',
  'Choir',
  'Sermon',
  'Service Response',
]);

function parseMood(mood: string | null) {
  if (!mood?.startsWith('Continuity:')) return null;
  const remainder = mood.slice('Continuity:'.length);
  const separator = remainder.indexOf(':');
  const source = separator === -1 ? remainder : remainder.slice(0, separator);
  const sourceKey = separator === -1 ? '' : remainder.slice(separator + 1);
  if (!allowedSources.has(source)) return null;
  return { source, sourceKey };
}

function stripSourcePrefix(title: string, source: string) {
  const prefix = `${source} · `;
  return title.startsWith(prefix) ? title.slice(prefix.length) : title;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to search your private reference library.' }, { status: 401 });
  }

  const q = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 120);
  const source = (request.nextUrl.searchParams.get('source') || '').trim().slice(0, 40);
  const sourceFilter = source && allowedSources.has(source) ? source : '';

  try {
    const rows = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
        mood: { startsWith: sourceFilter ? `Continuity:${sourceFilter}` : 'Continuity:' },
        ...(q ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 80,
      select: { id: true, title: true, content: true, mood: true, createdAt: true },
    });

    const entries = rows.flatMap((row) => {
      const parsed = parseMood(row.mood);
      if (!parsed) return [];
      return [{
        id: row.id,
        source: parsed.source,
        sourceKey: parsed.sourceKey,
        title: stripSourcePrefix(row.title, parsed.source),
        content: row.content,
        createdAt: row.createdAt,
      }];
    });

    return NextResponse.json({
      entries,
      filters: { query: q, source: sourceFilter },
      sources: Array.from(allowedSources),
      privacyBoundary: {
        ownerOnly: true,
        financialActivityExcluded: true,
        pastoralCaseDataExcluded: true,
        childActivityExcluded: true,
        spiritualScoring: false,
      },
    });
  } catch (error) {
    console.error('Journey reference library failed:', error);
    return NextResponse.json({ error: 'Unable to search your private reference library.' }, { status: 500 });
  }
}
