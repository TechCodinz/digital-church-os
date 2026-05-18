import { PrismaClient, Offering } from '@prisma/client';

const prisma = new PrismaClient();

// lib/payments/impactStories.ts
export class ImpactStoryEngine {
    async generateImpactStory(offering: any) {
        const impact: any = {
            PLATFORM_UPKEEP: {
                stories: [
                    {
                        title: "Better Streaming Quality",
                        description: "Your giving helps 10,000+ users watch services smoothly",
                        image: "/impacts/streaming.jpg",
                    },
                    {
                        title: "AI Sermon Improvements",
                        description: "More accurate, deeper Bible teaching for all ages",
                        image: "/impacts/ai.jpg",
                    },
                ],
            },
            COMMUNITY_AID: {
                stories: [
                    {
                        title: "Family Kept Their Home",
                        description: "Your giving helped prevent eviction for a single mom",
                        image: "/impacts/family.jpg",
                    },
                    {
                        title: "Medical Bills Paid",
                        description: "A family facing cancer received financial relief",
                        image: "/impacts/medical.jpg",
                    },
                ],
            },
            CONFERENCE_SUPPORT: {
                stories: [
                    {
                        title: "Youth Encounter God",
                        description: "50 teenagers gave their lives to Christ",
                        image: "/impacts/youth.jpg",
                    },
                    {
                        title: "Leaders Trained",
                        description: "100 new small group leaders equipped",
                        image: "/impacts/leaders.jpg",
                    },
                ],
            },
        };

        return impact[offering.purpose] || impact.PLATFORM_UPKEEP;
    }

    async getPersonalizedImpact(userId: string) {
        const userOfferings = await prisma.offering.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const totalGiven = userOfferings.reduce((sum, o) => sum + o.amount, 0);

        return {
            totalGiven,
            impactSummary: {
                platform: userOfferings.filter(o => o.purpose === 'PLATFORM_UPKEEP').length,
                aid: userOfferings.filter(o => o.purpose === 'COMMUNITY_AID').length,
                conferences: userOfferings.filter(o => o.purpose === 'CONFERENCE_SUPPORT').length,
            },
            stories: await Promise.all(
                userOfferings.map(o => this.generateImpactStory(o))
            ),
            nextMilestone: this.calculateNextMilestone(totalGiven),
        };
    }

    calculateNextMilestone(totalGiven: number) {
        if (totalGiven < 100) return 100;
        if (totalGiven < 500) return 500;
        if (totalGiven < 1000) return 1000;
        return totalGiven + 1000;
    }
}
