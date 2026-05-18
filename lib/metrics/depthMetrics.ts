import { prisma, checkDbConnection } from '../prisma';

export class SpiritualDepthMetrics {
    async calculateDepthProgress(userId: string) {
        const isDbUp = await checkDbConnection();
        if (!isDbUp) {
            return {
                understandingDepth: { surface: 80, meaning: 60, connection: 40, hidden: 20, eternal: 10 },
                depthScore: 350,
                nextMilestone: "Theological Explorer",
                recommendation: "Dive into the cultural depths of the Gospels."
            };
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    aiInteractions: true,
                    activities: true
                }
            });

            if (!user) return null;

            // Simple heuristic for depth score
            const studyScore = user.aiInteractions.length * 10;
            const activityScore = user.activities.length * 5;
            const totalScore = studyScore + activityScore;

            return {
                understandingDepth: {
                    surface: Math.min(100, (totalScore / 10)),
                    meaning: Math.min(100, (totalScore / 20)),
                    connection: Math.min(100, (totalScore / 50)),
                    hidden: Math.min(100, (totalScore / 100)),
                    eternal: Math.min(100, (totalScore / 500))
                },
                depthScore: totalScore,
                nextMilestone: this.getNextMilestone(totalScore),
                userLevel: user.level
            };
        } catch (error) {
            console.error('Metrics Error:', error);
            return null;
        }
    }

    private getNextMilestone(score: number) {
        if (score < 100) return "Faith Seeker";
        if (score < 500) return "Scripture Apprentice";
        if (score < 1000) return "Theological Explorer";
        if (score < 5000) return "Wisdom Hunter";
        return "Spiritual Scholar";
    }
}
