import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { AidCategory } from '@prisma/client';

const AidRequestSchema = z.object({
    category: z.nativeEnum(AidCategory),
    title: z.string().min(5).max(200),
    description: z.string().min(20).max(5000),
    amount: z.number().positive().optional(),
    proofUrls: z.array(z.string().url()).default([]),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validation = AidRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
        }

        const aidRequest = await prisma.aidRequest.create({
            data: {
                ...validation.data,
                userId: session.user.id,
                status: 'PENDING',
            },
        });

        return NextResponse.json(aidRequest);
    } catch (error) {
        console.error('Error creating aid request:', error);
        return NextResponse.json({ error: 'Failed to create aid request' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const isAdmin = session.user.role === 'CHURCH_ADMIN' || session.user.role === 'AID_REVIEWER';

        const requests = await prisma.aidRequest.findMany({
            where: {
                ...(isAdmin ? {} : { userId: session.user.id }),
                ...(status ? { status: status as any } : {}),
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching aid requests:', error);
        return NextResponse.json({ error: 'Failed to fetch aid requests' }, { status: 500 });
    }
}
