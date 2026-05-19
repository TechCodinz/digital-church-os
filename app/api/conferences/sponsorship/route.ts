import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const RegistrationSchema = z.object({
  conferenceId: z.string().trim().min(3),
  ticketId: z.string().trim().optional(),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(40).optional(),
});

const SponsorshipSchema = z.object({
  conferenceId: z.string().trim().min(3),
  requestType: z.enum(['TICKET', 'TRANSPORT', 'FOOD', 'DATA', 'ACCOMMODATION', 'WORKER_ALLOWANCE', 'OTHER']),
  amountRequested: z.coerce.number().min(0).max(100000).default(0),
  currency: z.string().trim().toUpperCase().default('USD'),
  reason: z.string().trim().min(5).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const action = body.action || 'sponsorship-request';

  if (action === 'register') {
    const parsed = RegistrationSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid registration payload', details: parsed.error.flatten() }, { status: 400 });
    if (!session?.user?.id && !parsed.data.email) return NextResponse.json({ error: 'Sign in or provide email to register.' }, { status: 401 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO conference_registrations (conference_id, ticket_id, user_id, name, email, phone, status)
      VALUES (${d.conferenceId}, ${d.ticketId || null}, ${session?.user?.id || null}, ${d.name || session?.user?.name || null}, ${d.email || session?.user?.email || null}, ${d.phone || null}, 'REGISTERED')
      RETURNING *
    `);
    return NextResponse.json({ registration: rows[0] }, { status: 201 });
  }

  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = SponsorshipSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid sponsorship payload', details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO conference_sponsorship_requests (conference_id, user_id, request_type, amount_requested, currency, reason, status)
    VALUES (${d.conferenceId}, ${session.user.id}, ${d.requestType}, ${d.amountRequested}, ${d.currency}, ${d.reason}, 'PENDING')
    RETURNING *
  `);
  return NextResponse.json({ request: rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isAdmin = session.user.role === 'CHURCH_ADMIN';
  const { searchParams } = new URL(req.url);
  const conferenceId = searchParams.get('conferenceId');

  const sponsorships = isAdmin
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT csr.*, u.name, u.email FROM conference_sponsorship_requests csr JOIN "User" u ON u.id = csr.user_id WHERE (${conferenceId || null}::text IS NULL OR csr.conference_id = ${conferenceId || null}) ORDER BY csr.created_at DESC LIMIT 150`)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM conference_sponsorship_requests WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 100`);

  const registrations = isAdmin
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM conference_registrations WHERE (${conferenceId || null}::text IS NULL OR conference_id = ${conferenceId || null}) ORDER BY created_at DESC LIMIT 150`)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM conference_registrations WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 100`);

  return NextResponse.json({ sponsorships, registrations, scope: isAdmin ? 'admin' : 'member' });
}
