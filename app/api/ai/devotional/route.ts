import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { focusTopic = 'Unshakeable Peace & Trust', userMood = 'hopeful' } = body;

        let devotionalData: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a Sanctified Audio Devotional Author. Generate a 3-minute morning audio devotional package. Return JSON:
                            {
                                "title": "string",
                                "scriptureVerse": "string",
                                "reflection": "string (3 paragraphs)",
                                "morningPrayer": "string",
                                "audioNarrativeScript": "string (transcript structured for Web Speech TTS playback)",
                                "actionChallenge": "string"
                            }`
                        },
                        {
                            role: 'user',
                            content: `Focus Topic: ${focusTopic}, User Current Mood: ${userMood}`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.7,
                });

                devotionalData = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (err) {
                console.error('AI Devotional generation error:', err);
            }
        }

        if (!devotionalData || !devotionalData.title) {
            devotionalData = {
                title: `Morning Light: ${focusTopic}`,
                scriptureVerse: 'Psalm 118:24 — This is the day that the LORD has made; let us rejoice and be glad in it.',
                reflection: 'As the sun rises today, remember that God\'s mercies are new every morning. No mistake from yesterday can dim the grace available to you right now. Anchor your mind in His unshakeable love.',
                morningPrayer: 'Lord, thank You for another day of life. Guide my steps, guard my heart, and let Your light shine through me today. Amen.',
                audioNarrativeScript: 'Good morning. Welcome to your daily Sanctuary Devotional. Today we anchor our hearts in Psalm 118 verse 24. Take a deep breath and receive God\'s fresh mercy...',
                actionChallenge: 'Share one word of encouragement with someone today.'
            };
        }

        return NextResponse.json({
            success: true,
            ...devotionalData
        });
    } catch (err: any) {
        console.error('Devotional API error:', err);
        return NextResponse.json({
            title: 'Morning Light: Divine Rest',
            scriptureVerse: 'Matthew 11:28 — Come to me, all who labor and are heavy laden, and I will give you rest.',
            reflection: 'Jesus invites you to cast every worry upon Him. You do not have to carry today\'s burdens in your own strength.',
            morningPrayer: 'Heavenly Father, I surrender my worries into Your hands. Fill me with Your peace today.',
            audioNarrativeScript: 'Good morning. Cast your worries on Him today, for He cares for you.',
            actionChallenge: 'Spend 2 minutes in quiet meditation before starting work.'
        });
    }
}
