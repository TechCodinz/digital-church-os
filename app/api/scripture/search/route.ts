import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SearchSchema = z.object({
  query: z.string().trim().min(2).max(200).optional(),
  reference: z.string().trim().max(80).optional(),
  versionCodes: z.array(z.string().trim().max(20)).max(8).optional().default(['KJV', 'WEB']),
  topic: z.string().trim().max(80).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = SearchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid scripture search payload', details: parsed.error.flatten() }, { status: 400 });

  const { query, reference, versionCodes, topic } = parsed.data;

  const passages = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, version_code, book, chapter, verse_start, verse_end, reference, text, topics, emotions, metadata
    FROM scripture_passages
    WHERE version_code = ANY(${versionCodes})
      AND (${reference || null}::text IS NULL OR reference ILIKE ${reference ? `%${reference}%` : null})
      AND (${topic || null}::text IS NULL OR ${topic || null} = ANY(topics))
      AND (${query || null}::text IS NULL OR text ILIKE ${query ? `%${query}%` : null} OR reference ILIKE ${query ? `%${query}%` : null})
    ORDER BY version_code, book, chapter, verse_start
    LIMIT 80
  `);

  return NextResponse.json({ passages, licensingNote: 'Use public-domain/local passages only unless a licensed Bible provider is configured.' });
}

export async function GET() {
  const versions = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT code, name, language, public_domain, offline_allowed, license_notes, enabled
    FROM bible_versions
    WHERE enabled = true
    ORDER BY language, name
  `);
  const providers = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT name, enabled, requires_api_key, license_notes FROM bible_translation_providers ORDER BY name
  `);
  return NextResponse.json({ versions, providers });
}
