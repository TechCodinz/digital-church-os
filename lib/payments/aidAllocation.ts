import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// lib/payments/aidAllocation.ts
export class AidAllocationEngine {
    async allocateFunds() {
        // Get available aid funds
        const aidPool = await prisma.offering.aggregate({
            where: {
                purpose: 'COMMUNITY_AID',
            },
            _sum: { amount: true },
        });

        const available = aidPool._sum.amount || 0;

        // Get pending requests
        const pendingRequests = await prisma.aidRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
        });

        // Calculate allocations
        const allocations = [];
        let remaining = available;

        for (const request of pendingRequests) {
            if (remaining <= 0) break;

            const allocation = {
                requestId: request.id,
                userId: request.userId,
                requestedAmount: request.amount,
                allocatedAmount: Math.min(request.amount || 500, remaining),
                category: request.category,
            };

            allocations.push(allocation);
            remaining -= allocation.allocatedAmount;

            // Update request status
            await prisma.aidRequest.update({
                where: { id: request.id },
                data: {
                    status: 'APPROVED',
                    approvedAmount: allocation.allocatedAmount,
                },
            });

            // Notify user handling can go here
        }

        return {
            totalAllocated: available - remaining,
            remainingFunds: remaining,
            allocations,
        };
    }

    async getAidTransparency() {
        const [total, byCategory, approved] = await Promise.all([
            prisma.aidRequest.aggregate({
                where: { status: 'APPROVED' },
                _sum: { approvedAmount: true },
            }),
            prisma.aidRequest.groupBy({
                by: ['category'],
                where: { status: 'APPROVED' },
                _sum: { approvedAmount: true },
                _count: true,
            }),
            prisma.aidRequest.count({
                where: { status: 'APPROVED' },
            }),
        ]);

        return {
            totalDistributed: total._sum.approvedAmount || 0,
            numberOfFamilies: approved,
            byCategory: byCategory.map(c => ({
                category: c.category,
                amount: c._sum.approvedAmount || 0,
                count: c._count,
            })),
            pendingRequests: await prisma.aidRequest.count({
                where: { status: 'PENDING' },
            }),
        };
    }
}
