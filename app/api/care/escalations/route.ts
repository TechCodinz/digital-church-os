import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';

const EscalationSchema = z.object({
  title: z.string().trim().min(4).max(140).default('Care team follow-up requested'),
  description: z.string().trim().min(6).max(2000),
  source: z.string().trim().max(80).default('member'),
  country: z.string().trim().max(80).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRISIS']).default('MEDIUM'),
  notifyPastor: z.boolean().default(true),
  notifyTrustedContact: z.boolean().default(false),
  stayWithPerson: z.boolean().default(false),
  assignedTo: z.string().trim().optional(),
  followUpAt: z.string().datetime().optional(),
});

function emergencyText(country?: string) {
  if (!country) return 'If there is immediate danger, contact local emergency services now. This platform is not emergency dispatch.';
  const c = country.toLowerCase();
  if (c.includes('united states') || c === 'us' || c === 'usa') return 'If there is immediate danger in the U.S., call 911. For emotional crisis support, call or text 988.';
  if (c.includes('united kingdom') || c === 'uk') return 'If there is immediate danger in the UK, call 999. For urgent NHS support, call 111.';
  if (c.includes('nigeria')) return 'If there is immediate danger in Nigeria, contact local emergency services, nearby trusted people, or the nearest hospital/police emergency support.';
  return 'If there is immediate danger, contact local emergency services in your country immediately.';
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = rateLimit(`care-escalation:${session.user.id}:${getClientKey(req.headers)}`, { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: 'Too many care escalation requests. Please wait before trying again.' }, { status: 429, headers: rateLimitHeaders(limit) });

  try {
    const parsed = EscalationSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid escalation payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(limit) });

    const data = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO care_escalations (
        user_id, source, urgency, status, title, description, country, emergency_disclaimer,
        notify_pastor, notify_trusted_contact, stay_with_person, assigned_to, metadata
      ) VALUES (
        ${session.user.id}, ${data.source}, ${data.urgency}, 'OPEN', ${data.title}, ${data.description}, ${data.country || null}, ${emergencyText(data.country)},
        ${data.notifyPastor}, ${data.notifyTrustedContact}, ${data.stayWithPerson}, ${data.assignedTo || null}, ${JSON.stringify({ createdFrom: 'api' })}::jsonb
      )
      RETURNING id, user_id, source, urgency, status, title, description, country, emergency_disclaimer, notify_pastor, notify_trusted_contact, stay_with_person, assigned_to, created_at, updated_at
    `);

    const escalation = rows[0];

    if (data.followUpAt) {
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO care_followups (escalation_id, user_id, assigned_to, type, scheduled_for, status)
        VALUES (${escalation.id}, ${session.user.id}, ${data.assignedTo || null}, 'PASTORAL_CHECK_IN', ${new Date(data.followUpAt)}, 'PENDING')
      `);
    }

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'CARE_ESCALATION_CREATED',
      entityType: 'care_escalations',
      entityId: escalation.id,
      metadata: { urgency: data.urgency, source: data.source, assignedTo: data.assignedTo || null },
      req,
    });

    return NextResponse.json({ escalation }, { status: 201, headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error('Care escalation failed:', error);
    return NextResponse.json({ error: 'Failed to create care escalation' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isCareLeader = ['CHURCH_ADMIN', 'AID_REVIEWER', 'AI_DEPARTMENT'].includes(session.user.role);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || null;

  const rows = isCareLeader
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT ce.*, u.name AS user_name, u.email AS user_email, au.name AS assigned_name, au.email AS assigned_email
        FROM care_escalations ce
        JOIN "User" u ON u.id = ce.user_id
        LEFT JOIN "User" au ON au.id = ce.assigned_to
        WHERE (${status}::text IS NULL OR ce.status = ${status})
        ORDER BY ce.created_at DESC
        LIMIT 150
      `)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT ce.*
        FROM care_escalations ce
        WHERE ce.user_id = ${session.user.id} AND (${status}::text IS NULL OR ce.status = ${status})
        ORDER BY ce.created_at DESC
        LIMIT 100
      `);

  return NextResponse.json({ escalations: rows, scope: isCareLeader ? 'care-team' : 'member' });
}
