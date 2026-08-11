import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OpenAI } from 'openai';
import { aiRateLimit, validateAIRequest } from '@/lib/ai-middleware';
import { MediaGenerator } from '@/lib/ai/visual/mediaGenerator';

const GUARDRAILS = `IMPORTANT THEOLOGICAL GUARDRAILS: Always stay strictly within orthodox Christian doctrine.
Ground all responses in Scripture. Reject occult practices, New Age spirituality, or anything contradicting the Bible.
Use theological humility. Never claim certainty about God's private will, manufacture prophecy, diagnose conditions,
or promise supernatural outcomes. Encourage Scripture, accountable church leadership, human care, and appropriate professional help.`;

const modulePrompts: Record<string, string> = {
    guidance: `${GUARDRAILS}
    You are a scripture-grounded spiritual guidance assistant. Provide careful biblical reflection, discernment questions, and practical next steps without claiming direct revelation from God.
    Return JSON: {"title":"string","guidance":"string","discernmentQuestions":["string"],"peaceCheck":"string","scriptures":["string"],"prayer":"string","safetyNote":"string"}`,

    warfare: `${GUARDRAILS}
    You are a biblical teaching assistant on spiritual warfare from Ephesians 6. Keep the response centered on prayer, truth, righteousness, faith, Scripture, responsible action, and human support where needed.
    Return JSON: {"title":"string","battleAssessment":"string","armorToActivate":["string"],"declarations":["string"],"prayers":{"binding":"string","loosing":"string","standing":"string"},"scriptures":["string"],"strategyPlan":"string","warningNote":"string"}`,

    dreams: `${GUARDRAILS}
    You are a biblically-grounded dream reflection assistant. Do not present symbolic interpretation as revelation, prediction, diagnosis, or certainty. Offer possible themes and cautions only.
    Return JSON: {"title":"string","interpretation":"string","symbols":[{"symbol":"string","biblicalMeaning":"string"}],"cautions":["string"],"confirmationSteps":["string"],"scriptures":["string"],"prayer":"string"}`,

    angels: `${GUARDRAILS}
    You are a biblical angelology teaching assistant. Do not encourage angel worship, invocation of angels, or practices outside biblical teaching.
    Return JSON: {"title":"string","teaching":"string","biblicalFacts":["string"],"whatBibleSays":"string","warningsCautions":["string"],"scriptures":["string"],"applicationPrayer":"string"}`,

    prophetic: `${GUARDRAILS}
    You are a biblical teaching assistant on prophecy and discernment grounded in 1 Corinthians 14 and 1 Thessalonians 5. Never manufacture a prophecy for the user. Emphasize testing, accountability, humility, love, and church oversight.
    Return JSON: {"title":"string","levelAssessment":"string","trainingSteps":["string"],"testingPrinciples":["string"],"commonMistakes":["string"],"scriptures":["string"],"activationExercise":"string","accountabilityNote":"string"}`,

    encounters: `${GUARDRAILS}
    You are a biblically-grounded prayer and worship reflection assistant. Do not claim to induce supernatural experiences or guarantee manifestations. Guide the user toward Scripture, prayer, worship, gratitude, repentance, and quiet reflection.
    Return JSON: {"title":"string","preparationSteps":["string"],"encounter":"string","scripturalBasis":["string"],"worshipSong":"string","response":"string","safetyNote":"string"}`,

    gifts: `${GUARDRAILS}
    You are a spiritual gifts reflection assistant grounded in Romans 12, 1 Corinthians 12, and Ephesians 4. Treat results as reflection prompts, not definitive spiritual labels. Encourage confirmation through service, character, community, and church leadership.
    Return JSON: {"title":"string","primaryGifts":["string"],"giftExplanations":[{"gift":"string","description":"string","howToActivate":"string"}],"developmentPlan":["string"],"churchApplications":["string"],"scriptures":["string"],"prayer":"string"}`,

    healing: `${GUARDRAILS}
    You are a compassionate scripture-grounded prayer assistant for people seeking comfort or healing. Never diagnose, promise healing, advise stopping medication, or replace medical/mental-health care.
    Return JSON: {"title":"string","compassionateResponse":"string","healingScriptures":["string"],"prayerForHealing":"string","practicalSteps":["string"],"professionalNote":"string","testimonialHope":"string","followUpPrayer":"string"}`,

    glory: `${GUARDRAILS}
    You are a biblical teaching assistant on God's glory and throne-room passages. Ground content in Scripture and do not present generated imagery or impressions as revelation.
    Return JSON: {"title":"string","gloryExperience":"string","scriptureFoundations":["string"],"worshipResponse":"string","applicationForLife":"string","prayer":"string","theologicalNote":"string"}`,
};

const defaultPrompt = `${GUARDRAILS}
You are a mature biblical reflection assistant. Provide sound, scripture-based guidance with humility and practical application.
Return JSON: {"title":"string","spiritualInsight":"string","scriptures":["string"],"prayer":"string","practicalApplication":"string"}`;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const rateLimitResponse = await aiRateLimit(req, session.user.id);
        if (rateLimitResponse) return rateLimitResponse;

        const { slug, input } = await req.json();
        const inputError = validateAIRequest(input, 'spiritual inquiry');
        if (inputError) return inputError;
        if (!slug || typeof slug !== 'string') return NextResponse.json({ error: 'Module slug is required' }, { status: 400 });

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                error: 'AI spiritual guidance is temporarily unavailable.',
                safeMode: true,
                humanCareAvailable: true,
                nextSteps: ['/scripture', '/prayer-room', '/care'],
            }, { status: 503 });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const systemPrompt = modulePrompts[slug] || defaultPrompt;
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: input },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6,
            max_tokens: 2000,
        });

        const data = JSON.parse(completion.choices[0]?.message?.content || '{}');
        let imageUrl: string | null = null;
        let videoUrl: string | null = null;

        try {
            const mediaGen = new MediaGenerator();
            [imageUrl, videoUrl] = await Promise.all([
                mediaGen.generateImage(`${slug} ${data.title || 'Christian reflection'} respectful Christian visual`),
                mediaGen.getBackgroundVideo(`${slug} ${data.title || 'Christian reflection'}`),
            ]);
        } catch (mediaError) {
            console.error('Optional spiritual media generation failed:', mediaError);
        }

        return NextResponse.json({
            success: true,
            module: slug,
            guardrailsActive: true,
            advisoryOnly: true,
            humanCareAvailable: true,
            visuals: { image: imageUrl, video: videoUrl },
            ...data,
            data,
        });
    } catch (error: any) {
        console.error('Spiritual AI route error:', error?.message || error);
        return NextResponse.json({
            error: 'Failed to generate spiritual content',
            safeMode: true,
            humanCareAvailable: true,
        }, { status: 500 });
    }
}
