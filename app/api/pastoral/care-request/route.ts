import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
        return NextResponse.json({ error: 'Sign in is required to record a pastoral follow-up request.' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const concern = typeof body?.concern === 'string' ? body.concern.trim().slice(0, 4000) : '';
        const urgency = body?.urgency === 'urgent' || body?.urgency === 'sensitive' ? body.urgency : 'normal';

        if (!concern) {
            return NextResponse.json({ error: 'Please describe what kind of human pastoral follow-up you need.' }, { status: 400 });
        }

        const followUp = await prisma.followUp.create({
            data: {
                userId,
                type: 'PASTORAL_CARE_REQUEST',
                content: `[${urgency.toUpperCase()}] ${concern}`,
                scheduledFor: new Date(),
                status: 'PENDING',
            },
        });

        await prisma.notification.create({
            data: {
                userId,
                type: 'PASTORAL_CARE_REQUEST_RECORDED',
                title: 'Pastoral follow-up request recorded',
                message: 'Your request has been recorded for follow-up. A church-specific pastor assignment is only confirmed when a connected church workspace routes it to a real ministry team.',
                data: { followUpId: followUp.id, urgency },
            },
        });

        return NextResponse.json({
            success: true,
            status: 'RECORDED',
            routedToPastor: false,
            followUpId: followUp.id,
            message: 'Your pastoral follow-up request has been recorded. This response does not claim that a specific pastor has accepted or been assigned to it yet.',
        });
    } catch (error) {
        console.error('Pastoral care request error:', error);
        return NextResponse.json({ error: 'Unable to record the pastoral follow-up request right now.' }, { status: 500 });
    }
}
