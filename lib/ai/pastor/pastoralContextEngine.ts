import { prisma } from '@/lib/prisma';

export interface UserPastoralContext {
    userId: string;
    userName: string;
    faithPreference: string;
    onboardingCompleted: boolean;
    recentMoods: string[];
    recentPrayerTopics: string[];
    growthMilestones: string[];
    engagementScore: number;
}

export class PastoralContextEngine {
    async getUserContext(userId: string): Promise<UserPastoralContext> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    journalEntries: { take: 5, orderBy: { createdAt: 'desc' } },
                    prayerRequests: { take: 5, orderBy: { createdAt: 'desc' } },
                    trackRecord: true,
                }
            });

            if (!user) {
                return this.getDefaultContext(userId);
            }

            const recentMoods = user.journalEntries.map(j => j.mood).filter(Boolean) as string[];
            const recentPrayerTopics = user.prayerRequests.map(p => p.title);

            return {
                userId,
                userName: user.name || 'Beloved Pilgrim',
                faithPreference: user.faithPreference || 'Christian',
                onboardingCompleted: user.onboardingCompleted,
                recentMoods: recentMoods.length > 0 ? recentMoods : ['seeking', 'hopeful'],
                recentPrayerTopics: recentPrayerTopics.length > 0 ? recentPrayerTopics : ['Family peace', 'Spiritual growth'],
                growthMilestones: user.trackRecord?.keyInsights || ['Started spiritual journey', 'Engaged in community prayer'],
                engagementScore: user.trackRecord?.engagementScore || 100,
            };
        } catch (err) {
            console.error('Error fetching pastoral context:', err);
            return this.getDefaultContext(userId);
        }
    }

    private getDefaultContext(userId: string): UserPastoralContext {
        return {
            userId,
            userName: 'Friend in Faith',
            faithPreference: 'Christian',
            onboardingCompleted: true,
            recentMoods: ['seeking', 'peaceful'],
            recentPrayerTopics: ['Spiritual wisdom'],
            growthMilestones: ['Welcome to Sanctuary AI'],
            engagementScore: 50,
        };
    }
}
