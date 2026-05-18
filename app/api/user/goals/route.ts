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

        const goals = await prisma.goal.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(goals);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const goal = await prisma.goal.create({
            data: {
                title: body.title,
                description: body.description,
                targetDate: body.targetDate ? new Date(body.targetDate) : null,
                userId: session.user.id,
            },
        });

        return NextResponse.json(goal);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }
}
