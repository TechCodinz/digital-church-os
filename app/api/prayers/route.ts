import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PrayerSchema = z.object({
    title: z.string().min(3).max(100),
    content: z.string().min(10).max(1000),
    visibility: z.enum(['PUBLIC', 'PRIVATE', 'ANONYMOUS']).default('PUBLIC'),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validation = PrayerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
        }

        const prayer = await prisma.prayerRequest.create({
            data: {
                ...validation.data,
                userId: session.user.id,
            },
        });

        return NextResponse.json(prayer);
    } catch (error) {
        console.error('Error creating prayer:', error);
        return NextResponse.json({ error: 'Failed to create prayer' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        const prayers = await prisma.prayerRequest.findMany({
            where: userId ? { userId } : { visibility: 'PUBLIC' },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(prayers);
    } catch (error) {
        console.error('Error fetching prayers:', error);
        return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
    }
}
