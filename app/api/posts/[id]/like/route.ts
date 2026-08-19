import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Increment the encouragement/like count on a community post. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const post = await prisma.communityPost.update({
            where: { id: params.id },
            data: { likes: { increment: 1 } },
            select: { id: true, likes: true },
        });
        return NextResponse.json({ success: true, likes: post.likes });
    } catch (error) {
        console.error('Like post error:', error);
        return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
    }
}
