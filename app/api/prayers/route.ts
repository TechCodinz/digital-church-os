import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { extractThemes, themeLabel } from '@/lib/ai/shared/offlineWisdom';

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
                },
                _count: { select: { intercessions: true, encouragements: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Enrich each prayer with detected "need" themes + a live intercessor count,
        // so users can connect to others praying about the same need.
        const enriched = prayers.map((p) => {
            const themes = extractThemes(`${p.title} ${p.content}`, 3);
            return {
                ...p,
                themes,
                themeLabels: themes.map((t) => themeLabel(t)),
                intercessorCount: p._count?.intercessions ?? 0,
                encouragementCount: p._count?.encouragements ?? 0,
            };
        });

        return NextResponse.json(enriched);
    } catch (error) {
        console.error('Error fetching prayers:', error);
        return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
    }
}
