import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const requests = await prisma.aidRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                allocations: true,
                reviews: {
                    include: {
                        reviewer: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching admin aid requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch aid requests' },
            { status: 500 }
        );
    }
}
