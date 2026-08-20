import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { extractThemes, findVersesForQuery, themeLabel } from '@/lib/ai/shared/offlineWisdom';

export const dynamic = 'force-dynamic';

const EncouragementSchema = z.object({
    content: z.string().min(2).max(500),
    isAmen: z.boolean().optional(),
});

/** GET: list encouragements for a prayer. `?suggest=1` returns an AI-suggested (unsaved) word of comfort. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const prayerRequestId = params.id;

        if (req.nextUrl.searchParams.get('suggest') === '1') {
            const prayer = await prisma.prayerRequest.findUnique({ where: { id: prayerRequestId } });
            if (!prayer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            const themes = extractThemes(`${prayer.title} ${prayer.content}`, 2);
            const verse = findVersesForQuery(`${prayer.title} ${prayer.content}`, 1)[0];
            const focus = themeLabel(themes[0]).toLowerCase();
            const suggestion =
                `Standing with you in prayer for ${focus}. May you sense God\u2019s nearness today \u2014 ` +
                `"${verse?.text}" (${verse?.reference}). You are not alone in this.`;
            return NextResponse.json({ suggestion, verse: verse?.reference });
        }

        const encouragements = await prisma.prayerEncouragement.findMany({
            where: { prayerRequestId },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(encouragements);
    } catch (error) {
        console.error('List encouragements error:', error);
        return NextResponse.json({ error: 'Failed to load encouragements' }, { status: 500 });
    }
}

/** POST: add an encouragement / word of comfort to a prayer thread. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Sign in to encourage' }, { status: 401 });
        }

        const prayerRequestId = params.id;
        const prayer = await prisma.prayerRequest.findUnique({ where: { id: prayerRequestId } });
        if (!prayer) return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });

        const body = await req.json();
        const parsed = EncouragementSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });
        }

        const created = await prisma.prayerEncouragement.create({
            data: {
                prayerRequestId,
                userId: session.user.id,
                content: parsed.data.content,
                isAmen: parsed.data.isAmen ?? false,
            },
            include: { user: { select: { name: true } } },
        });

        const count = await prisma.prayerEncouragement.count({ where: { prayerRequestId } });
        return NextResponse.json({ success: true, encouragement: created, count });
    } catch (error) {
        console.error('Create encouragement error:', error);
        return NextResponse.json({ error: 'Failed to post encouragement' }, { status: 500 });
    }
}
