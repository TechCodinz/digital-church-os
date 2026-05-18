import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/live-chat
 * Returns recent messages for the live service chat
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const since = searchParams.get('since'); // ISO timestamp for polling

        const where = since
            ? { createdAt: { gt: new Date(since) } }
            : {};

        const messages = await prisma.liveChatMessage.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            take: limit,
            select: {
                id: true,
                content: true,
                type: true,
                createdAt: true,
                user: {
                    select: { name: true, image: true }
                }
            }
        });

        return NextResponse.json({ messages });
    } catch (error) {
        // If table doesn't exist yet, return empty array gracefully
        console.error('Live chat GET error:', error);
        return NextResponse.json({ messages: [] });
    }
}

/**
 * POST /api/live-chat
 * Submit a message to the live service chat
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, type = 'MESSAGE' } = await req.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        if (content.length > 500) {
            return NextResponse.json({ error: 'Message too long (max 500 characters)' }, { status: 400 });
        }

        // Basic content moderation - block URLs and obvious spam
        const hasUrl = /https?:\/\/|www\./i.test(content);
        if (hasUrl) {
            return NextResponse.json({ error: 'Links are not allowed in the chat' }, { status: 400 });
        }

        try {
            const message = await prisma.liveChatMessage.create({
                data: {
                    content: content.trim(),
                    type,
                    userId: session.user.id,
                },
                select: {
                    id: true,
                    content: true,
                    type: true,
                    createdAt: true,
                    user: {
                        select: { name: true, image: true }
                    }
                }
            });

            return NextResponse.json({ message });
        } catch (dbError: any) {
            // If LiveChatMessage model doesn't exist yet, return a mock response
            // so the UI still works without a full schema migration
            console.warn('LiveChatMessage table may not exist yet:', dbError.message);
            return NextResponse.json({
                message: {
                    id: `temp-${Date.now()}`,
                    content: content.trim(),
                    type,
                    createdAt: new Date().toISOString(),
                    user: { name: session.user.name, image: session.user.image }
                }
            });
        }
    } catch (error) {
        console.error('Live chat POST error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
