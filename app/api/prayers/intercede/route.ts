import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * "Join in prayer" — records that the signed-in user is standing in intercession
 * for a given prayer request, connecting them with others praying for the same
 * need. Idempotent: a user only counts once per request.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Sign in to join in prayer' }, { status: 401 });
        }

        const { prayerRequestId } = await req.json();
        if (!prayerRequestId) {
            return NextResponse.json({ error: 'prayerRequestId is required' }, { status: 400 });
        }

        const prayer = await prisma.prayerRequest.findUnique({ where: { id: prayerRequestId } });
        if (!prayer) {
            return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
        }

        const existing = await prisma.intercession.findFirst({
            where: { prayerRequestId, userId: session.user.id },
        });

        let joined = true;
        if (!existing) {
            await prisma.intercession.create({
                data: {
                    userId: session.user.id,
                    prayerRequestId,
                    scheduledFor: new Date(),
                    completedAt: new Date(),
                    notes: 'Joined in prayer from the Prayer Room',
                },
            });
        } else {
            joined = true; // already standing with them
        }

        const count = await prisma.intercession.count({ where: { prayerRequestId } });
        return NextResponse.json({ success: true, joined, alreadyJoined: !!existing, count });
    } catch (error) {
        console.error('Intercede error:', error);
        return NextResponse.json({ error: 'Failed to join in prayer' }, { status: 500 });
    }
}
