import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30days';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Fetch analytics data
    const [
      userGrowth,
      prayerStats,
      offeringStats,
      conferenceStats,
      engagementStats,
      topContributors,
      pendingPosts,
    ] = await Promise.all([
      // User growth
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Prayer statistics
      prisma.prayerRequest.groupBy({
        by: ['visibility'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Offering statistics
      prisma.offering.aggregate({
        where: {
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Conference attendance
      prisma.conferenceAttendance.groupBy({
        by: ['attended'],
        where: {
          registeredAt: { gte: startDate },
        },
        _count: true,
      }),

      // Community engagement
      prisma.communityPost.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // Top contributors
      prisma.user.findMany({
        take: 10,
        orderBy: {
          offerings: {
            _count: 'desc',
          },
        },
        select: {
          name: true,
          email: true,
          _count: {
            select: { offerings: true },
          },
        },
      }),

      // Pending community posts
      prisma.communityPost.count({
        where: { status: 'PENDING' },
      }),
    ]);

    // Calculate daily active users
    const dailyActive = await prisma.session.groupBy({
      by: ['expires'],
      where: {
        expires: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      _count: true,
    });

    // Build recentActivity feed
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { name: true, createdAt: true },
    });
    const recentPosts = await prisma.communityPost.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { createdAt: true },
    });
    const recentOfferings = await prisma.offering.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { amount: true, createdAt: true },
    });

    const toRelative = (date: Date) => {
      const diff = Math.round((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return `${diff} seconds ago`;
      if (diff < 3600) return `${Math.round(diff / 60)} minutes ago`;
      if (diff < 86400) return `${Math.round(diff / 3600)} hours ago`;
      return `${Math.round(diff / 86400)} days ago`;
    };

    const recentActivity = [
      ...recentUsers.map(u => ({ icon: 'user', text: `${u.name || 'New member'} joined`, time: toRelative(u.createdAt) })),
      ...recentPosts.map(p => ({ icon: 'post', text: 'New post awaiting moderation', time: toRelative(p.createdAt) })),
      ...recentOfferings.map(o => ({ icon: 'offering', text: `New offering received: $${o.amount.toLocaleString()}`, time: toRelative(o.createdAt) })),
    ].sort((a, b) => 0); // maintain as-is, already chronological

    const analytics = {
      period,
      summary: {
        totalUsers: await prisma.user.count(),
        activeUsers: dailyActive.length,
        totalOfferings: offeringStats._count,
        offeringAmount: offeringStats._sum.amount || 0,
        totalPrayers: prayerStats.reduce((sum, p) => sum + p._count, 0),
        publicPrayers: prayerStats.find(p => p.visibility === 'PUBLIC')?._count || 0,
        privatePrayers: prayerStats.find(p => p.visibility === 'PRIVATE')?._count || 0,
        pendingPosts: pendingPosts,
      },
      trends: {
        userGrowth: userGrowth.length,
        prayerGrowth: prayerStats.reduce((sum, p) => sum + p._count, 0),
        conferenceAttendance: conferenceStats.find(c => c.attended)?._count || 0,
        engagementRate: ((engagementStats / Math.max(userGrowth.length, 1)) * 100).toFixed(1),
      },
      topContributors,
      recentActivity,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
