import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period'); // e.g. "2024-Q1"

        // In a real app, you would fetch the report for the period.
        // Here we generate an aggregate report dynamically.

        // Base date filtering (e.g., last 30 days if no period)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const DateFilter = period ? {} : { gte: startDate };

        // 1. Calculate Total Offerings (COMMUNITY_AID specific)
        const offerings = await prisma.offering.aggregate({
            where: {
                purpose: 'COMMUNITY_AID',
                createdAt: DateFilter as any,
            },
            _sum: {
                amount: true,
            },
        });

        // 2. Calculate Distributed Aid
        const allocations = await prisma.aidAllocation.aggregate({
            where: {
                createdAt: DateFilter as any,
            },
            _sum: {
                amount: true,
            },
        });

        // 3. Breakdown by category
        const categoryBreakdown = await prisma.aidAllocation.groupBy({
            by: ['requestId'], // We need to join to get category, this is a simplified group
        });

        // More realistic approach for reporting:
        const requests = await prisma.aidRequest.findMany({
            where: {
                status: { in: ['APPROVED', 'DISBURSED'] },
                updatedAt: DateFilter as any,
            },
            select: {
                category: true,
                amount: true,
            }
        });

        const categories: Record<string, number> = {};
        requests.forEach((r: any) => {
            categories[r.category] = (categories[r.category] || 0) + r.amount;
        });

        // 4. Counts
        const approvedCount = await prisma.aidRequest.count({
            where: { status: 'APPROVED', updatedAt: DateFilter as any },
        });

        const pendingCount = await prisma.aidRequest.count({
            where: { status: 'PENDING' },
        });

        const report = {
            period: period || 'Last 30 Days',
            totalOfferings: offerings._sum.amount || 0,
            totalAidDistributed: allocations._sum.amount || 0,
            categories,
            approvedRequests: approvedCount,
            pendingRequests: pendingCount,
            publishedAt: new Date().toISOString(),
        };

        return NextResponse.json(report);
    } catch (error) {
        console.error('Error generating transparency report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
