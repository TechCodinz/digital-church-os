import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/offerings/public
 * Returns public-facing offering statistics for the transparency ledger on the Offering page.
 * No authentication required — this is public transparency data.
 */
export async function GET() {
    try {
        // Aggregate total offerings
        const totalResult = await prisma.offering.aggregate({
            _sum: { amount: true },
            _count: { id: true },
        });

        // Aggregate by purpose
        const byPurpose = await prisma.offering.groupBy({
            by: ['purpose'],
            _sum: { amount: true },
            _count: { id: true },
        });

        // Get the most recent transactions (public, non-identifying)
        const recentTransactions = await prisma.offering.findMany({
            select: {
                amount: true,
                purpose: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        const totalRaised = totalResult._sum.amount || 0;

        const distribution = byPurpose.map(p => ({
            purpose: p.purpose,
            amount: p._sum.amount || 0,
            count: p._count.id,
        }));

        return NextResponse.json({
            totalRaised,
            totalGifts: totalResult._count.id,
            recentTransactions: recentTransactions.map(t => ({
                amount: t.amount,
                purpose: t.purpose,
                date: t.createdAt,
            })),
            distribution,
        });
    } catch (error) {
        console.error('Error fetching public offering data:', error);
        return NextResponse.json(
            { totalRaised: 0, totalGifts: 0, recentTransactions: [], distribution: [] },
            { status: 200 } // Return empty data gracefully rather than error
        );
    }
}
