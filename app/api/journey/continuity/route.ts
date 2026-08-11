import { NextResponse } from 'next/server';
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

type ContinuityBody = {
  source?: unknown;
  sourceKey?: unknown;
  title?: unknown;
  content?: unknown;
  scriptureRefs?: unknown;
  nextStep?: unknown;
};

function cleanString(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanRefs(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((item) => item.slice(0, 120));
}

function cleanSourceKey(value: unknown) {
  return cleanString(value, 120)
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to save this moment to your private journey.' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as ContinuityBody;
    const source = cleanString(body.source, 40);
    const sourceKey = cleanSourceKey(body.sourceKey);
    const title = cleanString(body.title, 120);
    const content = cleanString(body.content, 3500);
    const nextStep = cleanString(body.nextStep, 800);
    const scriptureRefs = cleanRefs(body.scriptureRefs);

    if (!allowedSources.has(source)) {
      return NextResponse.json({ error: 'Unsupported journey source.' }, { status: 400 });
    }
    if (!content && !nextStep) {
      return NextResponse.json({ error: 'Add a reflection or next step before saving.' }, { status: 400 });
    }

    const sections = [
      content,
      scriptureRefs.length ? `Scripture: ${scriptureRefs.join(', ')}` : '',
      nextStep ? `Next step: ${nextStep}` : '',
    ].filter(Boolean);
    const mood = sourceKey ? `Continuity:${source}:${sourceKey}` : `Continuity:${source}`;
    const data = {
      title: `${source} · ${title || 'Journey moment'}`,
      content: sections.join('\n\n'),
      mood,
    };

    const existing = sourceKey
      ? await prisma.journalEntry.findFirst({
          where: { userId: session.user.id, mood },
          select: { id: true },
        })
      : null;

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
      privacy: 'Private to your signed-in account and included in your Journey timeline.',
    }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Journey continuity save failed:', error);
    return NextResponse.json({ error: 'Unable to save this private journey moment.' }, { status: 500 });
  }
}
