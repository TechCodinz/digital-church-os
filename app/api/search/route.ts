import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const type = searchParams.get('type') || 'all';

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        const results: any = {};

        // Search conferences
        if (type === 'all' || type === 'conferences') {
            results.conferences = await prisma.conference.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { theme: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 5,
            });
        }

        // Search community posts
        if (type === 'all' || type === 'posts') {
            results.posts = await prisma.communityPost.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { content: { contains: query, mode: 'insensitive' } },
                    ],
                    status: 'APPROVED',
                },
                include: {
                    user: {
                        select: { name: true, image: true },
                    },
                },
                take: 10,
            });
        }

        // Search users (limited)
        if (type === 'all' || type === 'users') {
            results.users = await prisma.user.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' },
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
                take: 5,
            });
        }

        // Search prayer requests (public only)
        if (type === 'all' || type === 'prayers') {
            results.prayers = await prisma.prayerRequest.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { content: { contains: query, mode: 'insensitive' } },
                    ],
                    visibility: 'PUBLIC',
                },
                take: 5,
            });
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
