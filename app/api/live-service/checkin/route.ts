import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const CheckInSchema = z.object({
  liveServiceId: z.string().trim().min(3),
  guestName: z.string().trim().max(120).optional(),
  guestEmail: z.string().trim().email().optional(),
  source: z.string().trim().max(80).default('web'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const parsed = CheckInSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid check-in payload', details: parsed.error.flatten() }, { status: 400 });

  if (!session?.user?.id && !parsed.data.guestEmail) {
    return NextResponse.json({ error: 'Sign in or provide guest email to check in.' }, { status: 401 });
  }

  try {
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO live_service_attendance (live_service_id, user_id, guest_name, guest_email, source)
      VALUES (${parsed.data.liveServiceId}, ${session?.user?.id || null}, ${parsed.data.guestName || null}, ${parsed.data.guestEmail || null}, ${parsed.data.source})
      ON CONFLICT (live_service_id, user_id) DO UPDATE SET checked_in_at = now(), left_at = NULL
      RETURNING id, live_service_id, user_id, guest_name, guest_email, checked_in_at, source
    `);

    if (session?.user?.id) {
      await AuditLogger.log({ actorId: session.user.id, action: 'LIVE_SERVICE_CHECKIN', entityType: 'live_service_attendance', entityId: rows[0].id, metadata: { liveServiceId: parsed.data.liveServiceId }, req });
    }

    return NextResponse.json({ attendance: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Live service check-in failed:', error);
    return NextResponse.json({ error: 'Failed to check in to live service' }, { status: 500 });
  }
}
