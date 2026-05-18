import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { requestId, status, allocationAmount, notes } = body;

        const request = await prisma.aidRequest.findUnique({
            where: { id: requestId },
            include: { user: true },
        });

        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (status === 'APPROVED') {
            // Create allocation record
            const allocation = await prisma.aidAllocation.create({
                data: {
                    requestId,
                    amount: parseFloat(allocationAmount) || request.amount || 0,
                    approvedBy: session.user.id,
                },
            });

            // Update request status
            await prisma.aidRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' },
            });

            // Log the review
            await prisma.aidReview.create({
                data: {
                    requestId,
                    reviewerId: session.user.id,
                    status: 'APPROVED',
                    comments: notes,
                },
            });

            await AuditLogger.log({
                actorId: session.user.id,
                action: 'AID_ALLOCATION_APPROVED',
                entityType: 'AidAllocation',
                entityId: allocation.id,
                metadata: { requestId, amount: allocation.amount },
                req,
            });

            // Trigger actual financial transfer or notification
            const { createNotification } = await import('@/lib/notifications');
            await createNotification({
                userId: request.userId,
                type: 'AID_UPDATE',
                title: 'Aid Request Approved',
                message: `Your request for ${request.category} has been approved. Allocation: ${(request as any).currency}${allocation.amount}.`,
                data: { requestId, allocationId: allocation.id }
            });

        } else if (status === 'REJECTED') {
            await prisma.aidRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' },
            });

            await prisma.aidReview.create({
                data: {
                    requestId,
                    reviewerId: session.user.id,
                    status: 'REJECTED',
                    comments: notes,
                },
            });

            const { createNotification } = await import('@/lib/notifications');
            await createNotification({
                userId: request.userId,
                type: 'AID_UPDATE',
                title: 'Aid Request Update',
                message: `Your request for ${request.category} has been reviewed and declined at this time.`,
                data: { requestId }
            });

            await AuditLogger.log({
                actorId: session.user.id,
                action: 'AID_REQUEST_REJECTED',
                entityType: 'AidRequest',
                entityId: requestId,
                req,
            });
        }

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error('Error reviewing aid request:', error);
        return NextResponse.json(
            { error: 'Failed to review request' },
            { status: 500 }
        );
    }
}
