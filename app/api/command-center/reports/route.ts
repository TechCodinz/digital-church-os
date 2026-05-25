import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function priorityFromCount(label: string, count: number, threshold: number) {
  return count >= threshold ? `${label}: ${count} item${count === 1 ? '' : 's'} need attention.` : `${label}: stable at ${count}.`;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const [members, openCare, pendingAid, pendingTranslations, workerTasks, testimonies, registrations, products, sites, offlineItems] = await Promise.all([
      prisma.user.count(),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM care_escalations WHERE status IN ('OPEN','IN_PROGRESS')`),
      prisma.aidRequest.count({ where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } } }),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM translation_jobs WHERE status = 'PENDING_REVIEW'`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM worker_tasks WHERE status IN ('ASSIGNED','COMPLETED')`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM testimonies WHERE status = 'PENDING_REVIEW'`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM conference_registrations`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM marketplace_products`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM church_sites`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM offline_sync_items WHERE status = 'QUEUED'`),
    ]);

    const metrics = {
      members,
      openCare: openCare[0]?.count || 0,
      pendingAid,
      pendingTranslations: pendingTranslations[0]?.count || 0,
      workerTasks: workerTasks[0]?.count || 0,
      testimoniesPending: testimonies[0]?.count || 0,
      conferenceRegistrations: registrations[0]?.count || 0,
      marketplaceProducts: products[0]?.count || 0,
      churchSites: sites[0]?.count || 0,
      queuedOfflineItems: offlineItems[0]?.count || 0,
    };

    const healthScore = Math.max(30, Math.min(98, 90 - metrics.openCare * 2 - metrics.pendingAid - metrics.pendingTranslations + Math.min(10, metrics.members)));
    const period = new Date().toISOString().slice(0, 10);
    const priorities = [
      priorityFromCount('Care follow-up', metrics.openCare, 1),
      priorityFromCount('Aid review', metrics.pendingAid, 1),
      priorityFromCount('Translation review', metrics.pendingTranslations, 1),
      priorityFromCount('Worker tasks', metrics.workerTasks, 5),
      priorityFromCount('Testimony review', metrics.testimoniesPending, 1),
    ];
    const opportunities = [
      'Turn this week’s sermon into a full content pack and presentation deck.',
      'Publish an impact summary after support requests are resolved.',
      'Convert active volunteers into worker task assignments and appreciation gifts.',
      'Invite connected churches into a shared conference or prayer campaign.',
    ];
    const risks = [
      metrics.openCare > 0 ? 'Open care items need timely human ownership.' : 'Care queue is currently clear.',
      metrics.pendingAid > 0 ? 'Pending aid requests can reduce trust if not reviewed.' : 'Aid queue is currently stable.',
      metrics.queuedOfflineItems > 10 ? 'Offline sync queue is growing; check sync processing.' : 'Offline sync queue is acceptable.',
    ];

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO command_center_reports (report_type, period, health_score, metrics, priorities, opportunities, risks, generated_by)
      VALUES ('WEEKLY', ${period}, ${healthScore}, ${JSON.stringify(metrics)}::jsonb, ${priorities}, ${opportunities}, ${risks}, ${session.user.id})
      RETURNING *
    `);

    return NextResponse.json({ report: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Command center report generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate command center report' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const reports = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM command_center_reports ORDER BY created_at DESC LIMIT 30
  `);
  return NextResponse.json({ reports });
}
