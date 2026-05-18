import { prisma, checkDbConnection } from '@/lib/prisma';

export class FollowUpSystem {
    static async scheduleFollowUps(prayerRequestId: string, userId: string, title: string) {
        const isDbUp = await checkDbConnection();
        if (!isDbUp) return;

        const intervals = [
            { delay: 24 * 60 * 60 * 1000, type: 'check-in' }, // 1 day
            { delay: 3 * 24 * 60 * 60 * 1000, type: 'encouragement' }, // 3 days
            { delay: 7 * 24 * 60 * 60 * 1000, type: 'testimony' }, // 1 week
        ];

        try {
            const followUps = intervals.map(interval => ({
                userId,
                prayerRequestId,
                type: interval.type,
                scheduledFor: new Date(Date.now() + interval.delay),
                content: this.getFollowUpContent(interval.type, title),
                status: 'PENDING'
            }));

            await prisma.followUp.createMany({
                data: followUps
            });
        } catch (error) {
            console.error('Failed to schedule follow-ups:', error);
        }
    }

    private static getFollowUpContent(type: string, title: string) {
        const templates: Record<string, string> = {
            'check-in': `How are you feeling about "${title}" today? We're still praying! 🙏`,
            'encouragement': `Just wanted to share that the community is lifting up "${title}" this morning. Be encouraged!`,
            'testimony': `Has there been any movement on "${title}"? We'd love to celebrate any small victory with you!`,
        };
        return templates[type] || `Thinking of you relative to your prayer: "${title}"`;
    }

    static async processPendingFollowUps() {
        const isDbUp = await checkDbConnection();
        if (!isDbUp) return [];

        const now = new Date();
        const pending = await prisma.followUp.findMany({
            where: {
                status: 'PENDING',
                scheduledFor: { lte: now }
            }
        });

        for (const fu of pending) {
            // In a real app, this would trigger an email or push via lib/notifications.ts
            // For now, we update status to SENT
            await prisma.followUp.update({
                where: { id: fu.id },
                data: {
                    status: 'SENT',
                    sentAt: now
                }
            });
        }

        return pending;
    }
}
