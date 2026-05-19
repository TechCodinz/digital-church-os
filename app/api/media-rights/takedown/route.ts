import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TakedownSchema = z.object({
  mediaItemId: z.string().trim().optional(),
  requesterName: z.string().trim().min(2).max(160),
  requesterEmail: z.string().trim().email(),
  requesterRole: z.enum(['RIGHTS_OWNER', 'AGENT', 'ARTIST', 'PUBLISHER', 'PLATFORM', 'OTHER']).default('RIGHTS_OWNER'),
  claimType: z.enum(['COPYRIGHT', 'TRADEMARK', 'PRIVACY', 'LICENSE_SCOPE', 'OTHER']).default('COPYRIGHT'),
  claimDetails: z.string().trim().min(20).max(5000),
  proofUrl: z.string().url().optional(),
});

const ReviewSchema = z.object({
  takedownRequestId: z.string().trim().min(3),
  status: z.enum(['RECEIVED', 'UNDER_REVIEW', 'ACTIONED', 'REJECTED', 'RESOLVED']),
  resolutionNotes: z.string().trim().max(3000).optional(),
  applyHold: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action || 'submit';
  const session = await getServerSession(authOptions);

  try {
    if (action === 'review') {
      if (session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      const parsed = ReviewSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid takedown review payload', details: parsed.error.flatten() }, { status: 400 });
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        UPDATE media_takedown_requests
        SET status = ${parsed.data.status}, reviewed_by = ${session.user.id}, reviewed_at = now(), resolution_notes = ${parsed.data.resolutionNotes || null}
        WHERE id = ${parsed.data.takedownRequestId}
        RETURNING *
      `);
      const request = rows[0];
      if (!request) return NextResponse.json({ error: 'Takedown request not found' }, { status: 404 });

      if (request.media_item_id && parsed.data.applyHold && ['RECEIVED', 'UNDER_REVIEW', 'ACTIONED'].includes(parsed.data.status)) {
        await prisma.$executeRaw(Prisma.sql`
          UPDATE worship_media_items
          SET takedown_status = 'HOLD', distribution_allowed = false, status = 'PENDING_REVIEW', updated_at = now()
          WHERE id = ${request.media_item_id}
        `);
        await prisma.$executeRaw(Prisma.sql`
          INSERT INTO media_license_audit_events (media_item_id, actor_id, event_type, to_status, notes)
          VALUES (${request.media_item_id}, ${session.user.id}, 'TAKEDOWN_HOLD_APPLIED', 'HOLD', ${parsed.data.resolutionNotes || 'Takedown hold applied.'})
        `);
      }
      return NextResponse.json({ takedown: request });
    }

    const parsed = TakedownSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid takedown payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO media_takedown_requests (media_item_id, requester_name, requester_email, requester_role, claim_type, claim_details, proof_url, status)
      VALUES (${d.mediaItemId || null}, ${d.requesterName}, ${d.requesterEmail}, ${d.requesterRole}, ${d.claimType}, ${d.claimDetails}, ${d.proofUrl || null}, 'RECEIVED')
      RETURNING *
    `);
    if (d.mediaItemId) {
      await prisma.$executeRaw(Prisma.sql`
        UPDATE worship_media_items SET takedown_status = 'HOLD', distribution_allowed = false, status = 'PENDING_REVIEW', updated_at = now() WHERE id = ${d.mediaItemId}
      `);
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO media_license_audit_events (media_item_id, event_type, to_status, notes)
        VALUES (${d.mediaItemId}, 'TAKEDOWN_RECEIVED', 'HOLD', ${'Automatic distribution hold after takedown request.'})
      `);
    }
    return NextResponse.json({ takedown: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Takedown workflow failed:', error);
    return NextResponse.json({ error: 'Failed to process takedown request' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const takedowns = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT tr.*, wmi.title AS media_title, wmi.artist, wmi.status AS media_status, wmi.takedown_status
    FROM media_takedown_requests tr
    LEFT JOIN worship_media_items wmi ON wmi.id = tr.media_item_id
    ORDER BY tr.created_at DESC LIMIT 150
  `);
  return NextResponse.json({ takedowns });
}
