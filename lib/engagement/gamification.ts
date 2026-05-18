import { prisma, checkDbConnection } from '@/lib/prisma';

export const gamificationSystem = {
    badges: [
        { id: 'first-prayer', name: 'First Step', icon: '🌟', points: 10, requirement: 'Post your first prayer request' },
        { id: 'prayer-warrior', name: 'Prayer Warrior', icon: '⚔️', points: 100, requirement: 'Intercede for 50 people' },
        { id: 'encourager', name: 'Community Encourager', icon: '💝', points: 100, requirement: 'Leave 20 encouraging comments' },
        { id: 'faithful', name: 'Faithful Attender', icon: '📖', points: 200, requirement: 'Attend 10 virtual conferences' },
        { id: 'giver', name: 'Cheerful Giver', icon: '🎁', points: 150, requirement: 'Make 5 offerings' },
        { id: 'mentor', name: 'Spiritual Mentor', icon: '👑', points: 500, requirement: 'Successfully refer 10 new members' },
    ],

    levels: [
        { level: 1, minPoints: 0, name: 'Seed' },
        { level: 2, minPoints: 100, name: 'Sprout' },
        { level: 3, minPoints: 300, name: 'Sapling' },
        { level: 4, minPoints: 600, name: 'Branch' },
        { level: 5, minPoints: 1000, name: 'Tree' },
        { level: 6, minPoints: 2000, name: 'Fruit-Bearing' },
    ],

    async trackActivity(userId: string, type: string, content: string, points: number) {
        const isDbUp = await checkDbConnection();
        if (!isDbUp) return { success: true, demo: true };

        try {
            // Log the activity
            await prisma.userActivity.create({
                data: { userId, type, content, points }
            });

            // Update user points and level
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { points: true, level: true }
            });

            if (user) {
                const newPoints = user.points + points;
                const newLevel = this.levels.reduce((acc, curr) =>
                    newPoints >= curr.minPoints ? curr.level : acc, 1);

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        points: newPoints,
                        level: newLevel
                    }
                });

                return { success: true, points: newPoints, level: newLevel };
            }
        } catch (error) {
            console.error('Gamification Error:', error);
        }
        return { success: false };
    }
};
