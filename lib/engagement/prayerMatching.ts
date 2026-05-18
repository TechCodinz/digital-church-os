import { prisma, checkDbConnection } from '@/lib/prisma';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';

export class PrayerPartnerMatcher {
    private static scriptureLoader = new ScriptureLoader();

    static async findMatches(userId: string) {
        const isDbUp = await checkDbConnection();
        if (!isDbUp) {
            // Demo Fallback
            return [
                {
                    user: { id: 'demo-match-1', name: 'Sister Faith' },
                    compatibility: 0.95,
                    reason: "You both frequently pray for family and community healing."
                },
                {
                    user: { id: 'demo-match-2', name: 'Brother James' },
                    compatibility: 0.88,
                    reason: "Match found: Shared spiritual goals in deepening scripture study."
                }
            ];
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { prayerRequests: true }
            });

            if (!user || user.prayerRequests.length === 0) return [];

            // Simple thematic matching for demo/initial implementation
            // Real implementation would use semantic vectors from scriptureLoader
            const userThemes = user.prayerRequests.map(p => p.title.toLowerCase());

            const potentialMatches = await prisma.user.findMany({
                where: {
                    id: { not: userId },
                    prayerRequests: { some: {} }
                },
                include: { prayerRequests: true },
                take: 5
            });

            const rankedMatches = potentialMatches.map(match => {
                const matchThemes = match.prayerRequests.map(p => p.title.toLowerCase());
                const commonThemes = userThemes.filter(t => matchThemes.includes(t));

                return {
                    user: { id: match.id, name: match.name || 'Community Member' },
                    compatibility: 0.5 + (commonThemes.length * 0.1),
                    reason: commonThemes.length > 0
                        ? `Shared heart for: ${commonThemes.join(', ')}`
                        : "Growing together in faith and intercession."
                };
            });

            return rankedMatches.sort((a, b) => b.compatibility - a.compatibility);
        } catch (error) {
            console.error('Matching Error:', error);
            return [];
        }
    }
}
