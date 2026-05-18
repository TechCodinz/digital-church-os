import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiRateLimit, validateAIRequest } from "@/lib/ai-middleware";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const rateLimitResponse = await aiRateLimit(req, session.user.id);
        if (rateLimitResponse) return rateLimitResponse;

        const { prayerRequest, scriptureRefs } = await req.json();

        const inputError = validateAIRequest(prayerRequest, 'prayer request');
        if (inputError) return inputError;

        const { RealPrayerWarrior } = await import('@/lib/ai/christian/prayer/realPrayerWarrior');
        const prayerWarrior = new RealPrayerWarrior();
        const response = await prayerWarrior.generatePrayer({
            userId: session.user.id,
            title: prayerRequest.split('\n')[0].substring(0, 50),
            content: prayerRequest,
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Prayer warrior error:', error);
        return NextResponse.json({ error: 'Prayer generation failed' }, { status: 500 });
    }
}

