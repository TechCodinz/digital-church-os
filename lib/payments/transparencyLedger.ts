import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// lib/payments/transparencyLedger.ts
export class TransparencyLedger {
    async updateLedger(offering: any) {
        // Update running totals
        const totals = await prisma.offering.aggregate({
            where: { purpose: offering.purpose },
            _sum: { amount: true },
        });

        // Update category distribution
        const byPurpose = await prisma.offering.groupBy({
            by: ['purpose'],
            _sum: { amount: true },
        });

        // Calculate percentages
        const total = byPurpose.reduce((sum, p) => sum + (p._sum.amount || 0), 0);
        const distribution = byPurpose.map(p => ({
            purpose: p.purpose,
            amount: p._sum.amount || 0,
            percentage: (((p._sum.amount || 0) / total) * 100).toFixed(1),
        }));

        // Update public ledger
        await prisma.transparencyReport.create({
            data: {
                period: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
                totalOfferings: total,
                totalAidDistributed: 0,
                categories: distribution as any,
                approvedRequests: 0,
                pendingRequests: 0,
                publishedBy: offering.userId || 'demo_user_id',
            },
        });

        // Update aid allocation if needed
        if (offering.purpose === 'COMMUNITY_AID') {
            // Logic handled elsewhere or through AidAllocationEngine
        }
    }

    async getPublicLedger() {
        const [totals, recent, distribution] = await Promise.all([
            prisma.offering.aggregate({
                _sum: { amount: true },
            }),
            prisma.offering.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    amount: true,
                    purpose: true,
                    createdAt: true,
                },
            }),
            prisma.offering.groupBy({
                by: ['purpose'],
                _sum: { amount: true },
                _count: true,
            }),
        ]);

        const total = totals._sum.amount || 0;

        return {
            totalRaised: total,
            recentTransactions: recent.map(t => ({
                ...t,
                amount: t.amount,
                date: t.createdAt,
            })),
            distribution: distribution.map(d => ({
                purpose: d.purpose,
                amount: d._sum.amount || 0,
                count: d._count,
                percentage: (((d._sum.amount || 0) / total) * 100).toFixed(1),
            })),
            timestamp: new Date(),
        };
    }
}
