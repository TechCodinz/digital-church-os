import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Collect all user data
        const userData = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                prayerRequests: true,
                goals: true,
                journalEntries: true,
                conferenceAttendance: {
                    include: { conference: true },
                },
                offerings: true,
                posts: true,
                aiInteractions: true,
                aidRequests: true,
            },
        });

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Format as JSON
        const exportData = {
            exportedAt: new Date().toISOString(),
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                faithPreference: userData.faithPreference,
                createdAt: userData.createdAt,
            },
            prayerRequests: userData.prayerRequests,
            goals: userData.goals,
            journalEntries: userData.journalEntries,
            conferences: userData.conferenceAttendance.map(ca => ({
                ...ca.conference,
                attended: ca.attended,
                registeredAt: ca.registeredAt,
            })),
            offerings: userData.offerings,
            communityPosts: userData.posts,
            aiInteractions: userData.aiInteractions,
            aidRequests: userData.aidRequests,
        };

        // Return as downloadable JSON
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="user-data-${session.user.id}.json"`,
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
