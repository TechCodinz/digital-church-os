import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subscription } = await req.json();

        if (!subscription) {
            return NextResponse.json({ error: 'No subscription provided' }, { status: 400 });
        }

        // Store subscription in database
        // We'll update the User model to include pushSubscriptions if not present,
        // or store in a dedicated model.
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                notificationPreferences: {
                    ...(session.user as any).notificationPreferences as any,
                    pushSubscription: subscription,
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
