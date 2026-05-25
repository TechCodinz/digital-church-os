import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const HostMessageSchema = z.object({
  userId: z.string().trim().optional(),
  contextType: z.string().trim().min(2).max(80),
  contextId: z.string().trim().optional(),
  message: z.string().trim().min(3).max(1000),
  actionLabel: z.string().trim().max(80).optional(),
  actionHref: z.string().trim().max(220).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = HostMessageSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid sanctuary host payload', details: parsed.error.flatten() }, { status: 400 });
  const targetUserId = parsed.data.userId || session.user.id;
  if (targetUserId !== session.user.id && session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO sanctuary_host_messages (user_id, context_type, context_id, message, action_label, action_href, status)
    VALUES (${targetUserId}, ${parsed.data.contextType}, ${parsed.data.contextId || null}, ${parsed.data.message}, ${parsed.data.actionLabel || null}, ${parsed.data.actionHref || null}, 'UNREAD')
    RETURNING *
  `);
  return NextResponse.json({ message: rows[0] }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM sanctuary_host_messages
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
    LIMIT 50
  `);

  return NextResponse.json({
    messages,
    defaultPrompt: `Welcome${session.user.name ? `, ${session.user.name}` : ''}. Check your journey, prayer room, service activity, rewards, and next care step today.`,
  });
}
