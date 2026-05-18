import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prayers = await prisma.prayerRequest.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(prayers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch prayer requests' }, { status: 500 });
    }
}
