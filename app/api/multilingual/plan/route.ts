import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const TranslationJobSchema = z.object({
  sourceLanguage: z.string().trim().min(2).max(40).default('English'),
  targetLanguages: z.array(z.string().trim().min(2).max(40)).min(1).max(12).default(['Spanish', 'French', 'Yoruba', 'Igbo', 'Hausa']),
  contentType: z.enum(['sermon', 'prayer', 'devotional', 'children_lesson', 'live_caption']).default('sermon'),
  contentId: z.string().trim().optional(),
  inputText: z.string().trim().min(2).max(10000).optional(),
});

function buildWorkflow(contentType: string) {
  return [
    'Extract scripture references and theological claims.',
    `Prepare ${contentType} text for plain-language translation.`,
    'Create one translation job per target language.',
    'Require human review for doctrine, tone, idioms, and cultural context.',
    'Publish low-data text version only after review approval.',
  ];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = TranslationJobSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid multilingual plan payload', details: parsed.error.flatten() }, { status: 400 });

  try {
    const { sourceLanguage, targetLanguages, contentType, contentId, inputText } = parsed.data;
    const jobs = [];

    for (const targetLanguage of targetLanguages) {
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO translation_jobs (requested_by, source_language, target_language, content_type, content_id, input_text, status, human_review_required)
        VALUES (${session.user.id}, ${sourceLanguage}, ${targetLanguage}, ${contentType}, ${contentId || null}, ${inputText || null}, 'PENDING_REVIEW', true)
        RETURNING id, source_language, target_language, content_type, content_id, status, human_review_required, created_at, updated_at
      `);
      jobs.push(rows[0]);
    }

    await AuditLogger.log({ actorId: session.user.id, action: 'TRANSLATION_JOBS_CREATED', entityType: 'translation_jobs', metadata: { sourceLanguage, targetLanguages, contentType, count: jobs.length }, req });

    return NextResponse.json({
      jobs,
      workflow: buildWorkflow(contentType),
      safeguards: ['Human review required', 'No unsupported prophecy claims', 'Local crisis resources by country', 'Avoid idioms that do not translate clearly'],
    }, { status: 201 });
  } catch (error) {
    console.error('Translation job creation failed:', error);
    return NextResponse.json({ error: 'Failed to create translation jobs' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isReviewer = ['CHURCH_ADMIN', 'AI_DEPARTMENT'].includes(session.user.role);
  const jobs = isReviewer
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT tj.*, u.name AS requester_name, u.email AS requester_email
        FROM translation_jobs tj
        LEFT JOIN "User" u ON u.id = tj.requested_by
        ORDER BY tj.created_at DESC
        LIMIT 150
      `)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT id, source_language, target_language, content_type, content_id, status, human_review_required, created_at, updated_at
        FROM translation_jobs
        WHERE requested_by = ${session.user.id}
        ORDER BY created_at DESC
        LIMIT 100
      `);

  return NextResponse.json({ jobs, supportedRoadmap: ['Spanish', 'French', 'Portuguese', 'Yoruba', 'Igbo', 'Hausa', 'Arabic', 'Swahili'], status: 'translation-production-foundation' });
}
