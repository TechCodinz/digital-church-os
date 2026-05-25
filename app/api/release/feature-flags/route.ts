import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const FlagSchema = z.object({
  flagKey: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(1000).optional(),
  enabled: z.boolean(),
  rolloutPercent: z.coerce.number().int().min(0).max(100).default(0),
  config: z.record(z.any()).optional().default({}),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const parsed = FlagSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid feature flag payload', details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO platform_feature_flags (flag_key, title, description, enabled, rollout_percent, config, updated_by)
    VALUES (${d.flagKey}, ${d.title || d.flagKey}, ${d.description || null}, ${d.enabled}, ${d.rolloutPercent}, ${JSON.stringify(d.config)}::jsonb, ${session.user.id})
    ON CONFLICT (flag_key) DO UPDATE SET
      title = COALESCE(EXCLUDED.title, platform_feature_flags.title),
      description = COALESCE(EXCLUDED.description, platform_feature_flags.description),
      enabled = EXCLUDED.enabled,
      rollout_percent = EXCLUDED.rollout_percent,
      config = EXCLUDED.config,
      updated_by = EXCLUDED.updated_by,
      updated_at = now()
    RETURNING *
  `);
  return NextResponse.json({ flag: rows[0] });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const flags = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT pff.*, u.name AS updated_by_name
    FROM platform_feature_flags pff
    LEFT JOIN "User" u ON u.id = pff.updated_by
    ORDER BY flag_key ASC
  `);
  return NextResponse.json({ flags });
}
