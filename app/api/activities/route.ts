import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ActivitySchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(1500),
  activityType: z.string().trim().min(2).max(80),
  points: z.coerce.number().int().min(0).max(10000).default(10),
  rewardEligible: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

const CompleteSchema = z.object({
  activityId: z.string().trim().min(3),
  proofText: z.string().trim().max(2000).optional(),
  proofUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const action = body.action || 'complete';

  if (action === 'create') {
    if (session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    const parsed = ActivitySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid activity payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO sanctuary_activities (title, description, activity_type, points, reward_eligible, starts_at, ends_at, created_by, active)
      VALUES (${d.title}, ${d.description}, ${d.activityType}, ${d.points}, ${d.rewardEligible}, ${d.startsAt ? new Date(d.startsAt) : null}, ${d.endsAt ? new Date(d.endsAt) : null}, ${session.user.id}, true)
      RETURNING *
    `);
    return NextResponse.json({ activity: rows[0] }, { status: 201 });
  }

  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid completion payload', details: parsed.error.flatten() }, { status: 400 });
  const activityRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM sanctuary_activities WHERE id = ${parsed.data.activityId} AND active = true LIMIT 1`);
  const activity = activityRows[0];
  if (!activity) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });

  const completionRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO sanctuary_activity_completions (activity_id, user_id, proof_text, proof_url, status, points_awarded)
    VALUES (${activity.id}, ${session.user.id}, ${parsed.data.proofText || null}, ${parsed.data.proofUrl || null}, ${activity.reward_eligible ? 'APPROVED' : 'PENDING_REVIEW'}, ${activity.reward_eligible ? activity.points : 0})
    ON CONFLICT (activity_id, user_id) DO UPDATE SET proof_text = EXCLUDED.proof_text, proof_url = EXCLUDED.proof_url
    RETURNING *
  `);

  if (activity.reward_eligible) {
    const wallet = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO kingdom_wallets (user_id) VALUES (${session.user.id})
      ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
      RETURNING id, user_id, currency
    `);
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO kingdom_wallet_ledger (wallet_id, user_id, entry_type, source_type, source_id, points_delta, description)
      VALUES (${wallet[0].id}, ${session.user.id}, 'ACTIVITY_REWARD', 'sanctuary_activity', ${activity.id}, ${activity.points}, ${`Completed: ${activity.title}`})
    `);
    await prisma.$executeRaw(Prisma.sql`UPDATE kingdom_wallets SET points_balance = points_balance + ${activity.points}, updated_at = now() WHERE id = ${wallet[0].id}`);
  }

  return NextResponse.json({ completion: completionRows[0] }, { status: 201 });
}

export async function GET() {
  const activities = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, title, description, activity_type, points, reward_eligible, starts_at, ends_at, active, created_at
    FROM sanctuary_activities WHERE active = true ORDER BY created_at DESC LIMIT 100
  `);
  return NextResponse.json({ activities });
}
