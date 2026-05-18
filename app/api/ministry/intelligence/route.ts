import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateRaizionMinistryReport } from '@/lib/ministry-os/raizionInsights';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const isAdmin = session.user.role === 'CHURCH_ADMIN';
    const [prayers, aidRequests, offerings, aiLogs, children, posts] = await Promise.all([
      prisma.prayerRequest.count({ where: isAdmin ? {} : { userId: session.user.id } }),
      prisma.aidRequest.count({ where: isAdmin ? {} : { userId: session.user.id } }),
      prisma.offering.count({ where: isAdmin ? {} : { userId: session.user.id } }),
      prisma.aIInteraction.count({ where: isAdmin ? {} : { userId: session.user.id } }),
      prisma.childProfile.count({ where: isAdmin ? {} : { parentId: session.user.id } }),
      prisma.communityPost.count({ where: isAdmin ? {} : { userId: session.user.id } }),
    ]);

    const report = generateRaizionMinistryReport({
      healthScore: Math.min(95, 55 + prayers * 2 + offerings * 2 + aiLogs + children * 3 + posts),
      urgentPriorities: [
        aidRequests > 0 ? `Review ${aidRequests} support request${aidRequests === 1 ? '' : 's'}.` : 'No support requests found for this scope yet.',
        prayers > 0 ? `Follow up on ${prayers} prayer request${prayers === 1 ? '' : 's'}.` : 'Invite members to begin using the prayer room.',
        'Generate a sermon content pack for the next service.',
      ],
    });

    return NextResponse.json({ report, metrics: { prayers, aidRequests, offerings, aiLogs, children, posts }, scope: isAdmin ? 'church' : 'member' });
  } catch (error) {
    console.error('Ministry intelligence failed:', error);
    return NextResponse.json({ report: generateRaizionMinistryReport(), scope: 'safe-fallback', warning: 'Database metrics unavailable; returned safe strategic report.' });
  }
}
