import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [prayers, aiInteractions, notifications] = await Promise.all([
            prisma.prayerRequest.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.aIInteraction.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.notification.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);

        const activities = [
            ...prayers.map((p: any) => ({
                id: p.id,
                type: 'prayer',
                title: p.title,
                status: 'Request Active',
                time: p.createdAt
            })),
            ...aiInteractions.map((i: any) => ({
                id: i.id,
                type: 'ai',
                title: `AI Guidance: ${i.moduleId}`,
                status: 'Guidance Provided',
                time: i.createdAt
            })),
            ...notifications.map((n: any) => ({
                id: n.id,
                type: 'notification',
                title: n.title,
                status: n.read ? 'Viewed' : 'New',
                time: n.createdAt
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
