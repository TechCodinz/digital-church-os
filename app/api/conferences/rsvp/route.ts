import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Register (RSVP) the signed-in user for a conference. Idempotent via the
 * unique (userId, conferenceId) constraint on ConferenceAttendance.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Sign in to register' }, { status: 401 });
        }

        const { conferenceId } = await req.json();
        if (!conferenceId) {
            return NextResponse.json({ error: 'conferenceId is required' }, { status: 400 });
        }

        const conference = await prisma.conference.findUnique({ where: { id: conferenceId } });
        if (!conference) {
            return NextResponse.json({ error: 'Conference not found' }, { status: 404 });
        }

        await prisma.conferenceAttendance.upsert({
            where: { userId_conferenceId: { userId: session.user.id, conferenceId } },
            update: {},
            create: { userId: session.user.id, conferenceId },
        });

        const count = await prisma.conferenceAttendance.count({ where: { conferenceId } });
        return NextResponse.json({ success: true, registered: true, attendeeCount: count });
    } catch (error) {
        console.error('Conference RSVP error:', error);
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }
}
