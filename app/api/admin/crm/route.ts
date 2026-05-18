import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const [members, prayers, aid, offerings, children, conferences, posts, flags, liveMessages] = await Promise.all([
      prisma.user.count(),
      prisma.prayerRequest.count(),
      prisma.aidRequest.count(),
      prisma.offering.count(),
      prisma.childProfile.count(),
      prisma.conference.count(),
      prisma.communityPost.count(),
      prisma.flagForReview.count({ where: { resolved: false } }),
      prisma.liveChatMessage.count(),
    ]);

    const recentMembers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, name: true, email: true, role: true, createdAt: true, points: true, level: true } });
    const pendingAid = await prisma.aidRequest.findMany({ where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, title: true, category: true, amount: true, currency: true, status: true, createdAt: true, user: { select: { name: true, email: true } } } });

    return NextResponse.json({
      metrics: { members, prayers, aid, offerings, children, conferences, posts, openCareFlags: flags, liveMessages },
      recentMembers,
      pendingAid,
      suggestedWorkflows: [
        'Review open care flags daily.',
        'Assign support requests by category.',
        'Follow up with new members within 48 hours.',
        'Publish monthly giving transparency reports.',
        'Convert sermon themes into family and youth content packs.',
      ],
    });
  } catch (error) {
    console.error('CRM summary failed:', error);
    return NextResponse.json({ error: 'Failed to load CRM summary' }, { status: 500 });
  }
}
