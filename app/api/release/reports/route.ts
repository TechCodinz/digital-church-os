import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ReportSchema = z.object({
  entityType: z.string().trim().min(2).max(80),
  entityId: z.string().trim().min(2).max(180),
  reason: z.string().trim().min(3).max(180),
  details: z.string().trim().max(3000).optional(),
  reporterEmail: z.string().trim().email().optional(),
});

const ReviewSchema = z.object({
  reportId: z.string().trim().min(3),
  status: z.enum(['OPEN', 'IN_REVIEW', 'ACTIONED', 'DISMISSED', 'RESOLVED']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
  resolutionNotes: z.string().trim().max(3000).optional(),
  actionType: z.string().trim().max(80).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const action = body.action || 'submit';

  try {
    if (action === 'review') {
      if (session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      const parsed = ReviewSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid report review payload', details: parsed.error.flatten() }, { status: 400 });
      const d = parsed.data;
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        UPDATE content_reports
        SET status = ${d.status},
            priority = COALESCE(${d.priority || null}, priority),
            reviewed_by = ${session.user.id},
            reviewed_at = now(),
            resolution_notes = ${d.resolutionNotes || null}
        WHERE id = ${d.reportId}
        RETURNING *
      `);
      const report = rows[0];
      if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

      if (d.actionType) {
        await prisma.$executeRaw(Prisma.sql`
          INSERT INTO review_actions (actor_id, entity_type, entity_id, action_type, reason, metadata)
          VALUES (${session.user.id}, ${report.entity_type}, ${report.entity_id}, ${d.actionType}, ${d.resolutionNotes || d.status}, ${JSON.stringify({ reportId: d.reportId })}::jsonb)
        `);
      }
      return NextResponse.json({ report });
    }

    const parsed = ReportSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid report payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO content_reports (reporter_id, reporter_email, entity_type, entity_id, reason, details, status, priority)
      VALUES (${session?.user?.id || null}, ${d.reporterEmail || session?.user?.email || null}, ${d.entityType}, ${d.entityId}, ${d.reason}, ${d.details || null}, 'OPEN', 'NORMAL')
      RETURNING *
    `);
    return NextResponse.json({ report: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Content report workflow failed:', error);
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const reports = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT cr.*, u.name AS reporter_name, u.email AS reporter_account_email
    FROM content_reports cr
    LEFT JOIN "User" u ON u.id = cr.reporter_id
    WHERE (${status || null}::text IS NULL OR cr.status = ${status || null})
    ORDER BY CASE WHEN cr.priority = 'HIGH' THEN 0 WHEN cr.priority = 'NORMAL' THEN 1 ELSE 2 END, cr.created_at DESC
    LIMIT 200
  `);

  const actions = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT ra.*, u.name AS actor_name FROM review_actions ra LEFT JOIN "User" u ON u.id = ra.actor_id ORDER BY ra.created_at DESC LIMIT 100
  `);

  return NextResponse.json({ reports, actions });
}
