import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { AI_DISCLAIMER } from '@/lib/ai/shared/guardrails';
import { MediaGenerator } from '@/lib/ai/visual/mediaGenerator';

class PrayerWarrior {
    identifyThemes(request: string, history: any[]) {
        // Theme extraction logic
        const themes = [];

        if (request.match(/heal|sick|pain|illness/i)) themes.push('healing');
        if (request.match(/thank|grateful|blessing/i)) themes.push('thanksgiving');
        if (request.match(/guid|direction|wisdom/i)) themes.push('guidance');
        if (request.match(/comfort|peace|anxi|worr/i)) themes.push('comfort');

        return themes;
    }
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const session = await getServerSession(authOptions);
        const isDbUp = await checkDbConnection();

        if (!session?.user && isDbUp) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { prayerRequest, scriptureRefs, style } = body;

        // Get user's prayer history for personalization
        let userPrayers = [];
        if (isDbUp && session?.user) {
            userPrayers = await prisma.prayerRequest.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
        }

        const { RealPrayerWarrior } = await import('@/lib/ai/christian/prayer/realPrayerWarrior');
        const prayerWarrior = new RealPrayerWarrior();
        const response = await prayerWarrior.generatePrayer({
            userId: session?.user?.id || 'demo-user',
            title: prayerRequest.split('\n')[0].substring(0, 100),
            content: prayerRequest,
        });

        // Generate thematic visuals in parallel
        const themeToSearch = response.themes?.[0] || 'peaceful prayer lighting';
        const mediaGen = new MediaGenerator();
        const [imageUrl, videoUrl] = await Promise.all([
            mediaGen.generateImage('Christian prayer: ' + prayerRequest),
            mediaGen.getBackgroundVideo(themeToSearch)
        ]);

        response.visuals = { image: imageUrl, video: videoUrl };

        // Log interaction
        if (isDbUp) {
            await AuditLogger.log({
                actorId: session?.user?.id || 'demo-user',
                action: 'AI_INTERACTION',
                entityType: 'PrayerWarrior',
                metadata: {
                    prayerRequest,
                    scriptureRefs,
                    themes: response.themes,
                },
                req,
            });
        }

        return NextResponse.json({
            ...response,
            disclaimer: AI_DISCLAIMER,
            note: "This prayer is generated as a guide. The most powerful prayers come from your heart.",
        });
    } catch (error) {
        console.error('Error in prayer warrior:', error);
        return NextResponse.json(
            { error: 'Failed to generate prayer' },
            { status: 500 }
        );
    }
}
