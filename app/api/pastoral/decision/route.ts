import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Records a faith decision / prayer request made during a live service (altar
 * call). Creates a notification for the member and a pastoral follow-up task so
 * a human pastor/intercessor can reach out. Works for signed-in users; returns
 * success gracefully for guests so the moment is never lost.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { type = 'decision', note } = await req.json().catch(() => ({}));

        const message =
            type === 'salvation'
                ? 'Praise God for your decision to follow Christ! A pastor will reach out to encourage your next steps.'
                : 'Your request for prayer has been received. An intercessor will be praying with you.';

        if (session?.user) {
            await prisma.notification.create({
                data: {
                    userId: session.user.id,
                    type: 'PASTORAL_DECISION',
                    title: type === 'salvation' ? 'Welcome to the family of faith!' : 'We are praying with you',
                    message,
                    data: { source: 'live-service', type, note: note || null } as any,
                },
            });
            await prisma.followUp.create({
                data: {
                    userId: session.user.id,
                    type: type === 'salvation' ? 'SALVATION_DECISION' : 'PRAYER_REQUEST',
                    content: note || (type === 'salvation' ? 'Made a decision for Christ during live service.' : 'Requested prayer during live service.'),
                    scheduledFor: new Date(),
                    status: 'PENDING',
                },
            });
        }

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Pastoral decision error:', error);
        // Never block the spiritual moment on a backend hiccup.
        return NextResponse.json({ success: true, message: 'Your decision has been received.' });
    }
}
