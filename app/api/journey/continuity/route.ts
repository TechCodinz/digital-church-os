import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const allowedSources = new Set([
  'Daily Guide',
  'Scripture',
  'Prayer',
  'Fasting',
  'Fasting & Prayer',
  'Family Altar',
  'Choir',
  'Choir Studio',
  'Sermon',
  'Live Sermon',
  'Service Response',
  'Pastoral Reflection',
]);

type ContinuityBody = {
  source?: unknown;
  sourceKey?: unknown;
  title?: unknown;
  content?: unknown;
  scriptureRefs?: unknown;
  nextStep?: unknown;
};

type DeleteBody = {
  id?: unknown;
};

function cleanString(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanRefs(value: unknown) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\n,;]+/)
      : [];

  return raw
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((item) => item.slice(0, 120));
}

function cleanSourceKey(value: unknown) {
  return cleanString(value, 160)
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function defaultDailySourceKey(source: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:${day}`;
}

function parseContinuityMood(mood: string | null) {
  if (!mood?.startsWith('Continuity:')) return null;
  const remainder = mood.slice('Continuity:'.length);
  const separator = remainder.indexOf(':');
  const source = separator === -1 ? remainder : remainder.slice(0, separator);
  const sourceKey = separator === -1 ? '' : remainder.slice(separator + 1);
  if (!allowedSources.has(source)) return null;
  return { source, sourceKey };
}

function displayTitle(title: string, source: string) {
  const prefix = `${source} · `;
  return title.startsWith(prefix) ? title.slice(prefix.length) : title;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to view your private journey continuity.' }, { status: 401 });
  }

  try {
    const rows = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
        mood: { startsWith: 'Continuity:' },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
      select: {
        id: true,
        title: true,
        mood: true,
        createdAt: true,
      },
    });

    const moments = rows.flatMap((row) => {
      const parsed = parseContinuityMood(row.mood);
      if (!parsed) return [];
      return [{
        id: row.id,
        source: parsed.source,
        sourceKey: parsed.sourceKey,
        title: displayTitle(row.title, parsed.source),
        createdAt: row.createdAt,
      }];
    });

    const sourceCounts = moments.reduce<Record<string, number>>((counts, moment) => {
      counts[moment.source] = (counts[moment.source] || 0) + 1;
      return counts;
    }, {});

    return NextResponse.json({
      moments,
      sourceCounts,
      privacyBoundary: {
        contentExcluded: true,
        financialActivityExcluded: true,
        pastoralCaseDataExcluded: true,
        childActivityExcluded: true,
        spiritualScoring: false,
      },
    });
  } catch (error) {
    console.error('Journey continuity fetch failed:', error);
    return NextResponse.json({ error: 'Unable to load private journey continuity.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to save this moment to your private journey.' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as ContinuityBody;
    const source = cleanString(body.source, 60);
    const requestedSourceKey = cleanSourceKey(body.sourceKey);
    const title = cleanString(body.title, 120);
    const content = cleanString(body.content, 6000);
    const nextStep = cleanString(body.nextStep, 1000);
    const scriptureRefs = cleanRefs(body.scriptureRefs);

    if (!allowedSources.has(source)) {
      return NextResponse.json({ error: 'Unsupported journey source.' }, { status: 400 });
    }
    if (!content && !nextStep) {
      return NextResponse.json({ error: 'Add a reflection or next step before saving.' }, { status: 400 });
    }

    const sourceKey = requestedSourceKey || defaultDailySourceKey(source);
    const sections = [
      content,
      scriptureRefs.length ? `Scripture: ${scriptureRefs.join(', ')}` : '',
      nextStep ? `Next step: ${nextStep}` : '',
    ].filter(Boolean);
    const mood = `Continuity:${source}:${sourceKey}`;
    const data = {
      title: `${source} · ${title || 'Journey moment'}`,
      content: sections.join('\n\n'),
      mood,
    };

    const existing = await prisma.journalEntry.findFirst({
      where: { userId: session.user.id, mood },
      select: { id: true },
    });

    const entry = existing
      ? await prisma.journalEntry.update({
          where: { id: existing.id },
          data,
          select: { id: true, title: true, mood: true, createdAt: true },
        })
      : await prisma.journalEntry.create({
          data: { userId: session.user.id, ...data },
          select: { id: true, title: true, mood: true, createdAt: true },
        });

    return NextResponse.json({
      entry,
      operation: existing ? 'updated' : 'created',
      sourceKey,
      privacy: 'Private to your signed-in account and included in your Journey timeline.',
    }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Journey continuity save failed:', error);
    return NextResponse.json({ error: 'Unable to save this private journey moment.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to manage your private journey.' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as DeleteBody;
    const id = cleanString(body.id, 120);
    if (!id) return NextResponse.json({ error: 'Journey moment id is required.' }, { status: 400 });

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
        mood: { startsWith: 'Continuity:' },
      },
      select: { id: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Private continuity moment not found.' }, { status: 404 });
    }

    await prisma.journalEntry.delete({ where: { id: entry.id } });
    return NextResponse.json({ deleted: true, id: entry.id });
  } catch (error) {
    console.error('Journey continuity delete failed:', error);
    return NextResponse.json({ error: 'Unable to remove this private journey moment.' }, { status: 500 });
  }
}
