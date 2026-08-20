import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Delete a journal entry the signed-in user owns. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const entry = await prisma.journalEntry.findUnique({ where: { id: params.id } });
        if (!entry) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (entry.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.journalEntry.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete journal entry error:', error);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }
}

/** Update a journal entry the signed-in user owns. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const entry = await prisma.journalEntry.findUnique({ where: { id: params.id } });
        if (!entry || entry.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const body = await req.json();
        const updated = await prisma.journalEntry.update({
            where: { id: params.id },
            data: {
                title: body.title ?? entry.title,
                content: body.content ?? entry.content,
                mood: body.mood ?? entry.mood,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update journal entry error:', error);
        return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }
}
