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

        const journal = await prisma.journalEntry.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(journal);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const entry = await prisma.journalEntry.create({
            data: {
                title: body.title,
                content: body.content,
                mood: body.mood,
                userId: session.user.id,
            },
        });

        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
    }
}
