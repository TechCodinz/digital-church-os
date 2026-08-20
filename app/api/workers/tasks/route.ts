import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const TaskSchema = z.object({
  assignedTo: z.string().trim().min(3),
  departmentId: z.string().trim().optional(),
  liveServiceId: z.string().trim().optional(),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(5).max(2000),
  dueAt: z.string().datetime().optional(),
  pointsAwarded: z.coerce.number().int().min(0).max(10000).default(0),
  stipendAmount: z.coerce.number().min(0).max(100000).default(0),
  currency: z.string().trim().toUpperCase().default('USD'),
});

const CompleteSchema = z.object({
  taskId: z.string().trim().min(3),
  proofText: z.string().trim().max(2000).optional(),
  proofUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const action = body.action || 'create';

  if (action === 'complete') {
    const parsed = CompleteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid completion payload', details: parsed.error.flatten() }, { status: 400 });
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      UPDATE worker_tasks SET status = 'COMPLETED', proof_text = ${parsed.data.proofText || null}, proof_url = ${parsed.data.proofUrl || null}, completed_at = now()
      WHERE id = ${parsed.data.taskId} AND assigned_to = ${session.user.id}
      RETURNING *
    `);
    if (!rows[0]) return NextResponse.json({ error: 'Task not found or not assigned to you' }, { status: 404 });
    return NextResponse.json({ task: rows[0] });
  }

  if (session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const parsed = TaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid worker task payload', details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO worker_tasks (assigned_to, assigned_by, department_id, live_service_id, title, description, due_at, points_awarded, stipend_amount, currency, status)
    VALUES (${d.assignedTo}, ${session.user.id}, ${d.departmentId || null}, ${d.liveServiceId || null}, ${d.title}, ${d.description}, ${d.dueAt ? new Date(d.dueAt) : null}, ${d.pointsAwarded}, ${d.stipendAmount}, ${d.currency}, 'ASSIGNED')
    RETURNING *
  `);
  await AuditLogger.log({ actorId: session.user.id, action: 'WORKER_TASK_ASSIGNED', entityType: 'worker_tasks', entityId: rows[0].id, req });
  return NextResponse.json({ task: rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isAdmin = session.user.role === 'CHURCH_ADMIN';
  const tasks = isAdmin
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT wt.*, u.name AS worker_name, u.email AS worker_email FROM worker_tasks wt JOIN "User" u ON u.id = wt.assigned_to ORDER BY wt.created_at DESC LIMIT 150`)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM worker_tasks WHERE assigned_to = ${session.user.id} ORDER BY created_at DESC LIMIT 100`);
  return NextResponse.json({ tasks, scope: isAdmin ? 'admin' : 'worker' });
}
