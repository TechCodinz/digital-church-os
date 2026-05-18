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

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                religion: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Build safe update payload — only allow known safe fields
        const updateData: Record<string, any> = {};
        if (body.name !== undefined) updateData.name = String(body.name).trim().slice(0, 100);
        if (body.faithPreference !== undefined) updateData.faithPreference = String(body.faithPreference);
        if (body.bio !== undefined) updateData.bio = String(body.bio).trim().slice(0, 500);
        if (body.notificationsEnabled !== undefined) updateData.notificationsEnabled = Boolean(body.notificationsEnabled);

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            include: { religion: true },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Profile PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

