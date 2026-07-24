import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { memoryStreak = 5, totalXp = 450, favoriteTopics = ['Peace', 'Faith', 'Healing'], preferredExegesisLevel = 3 } = body;

        let learningProfile: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an Evolving Self-Learning AI Spiritual Intelligence Engine for Digital Church OS.
                            Analyze the user's growth metrics and compute their Spiritual DNA Profile. Return JSON:
                            {
                                "growthScore": number (1-100),
                                "spiritualMaturityStage": "Neophyte" | "Disciple" | "Warrior" | "Mature Leader" | "Exegete",
                                "personalizedDailyRegimen": {
                                    "morningFocus": "string",
                                    "scriptureMeditation": "string",
                                    "eveningReflection": "string"
                                },
                                "nextLevelBreakthroughChallenge": "string",
                                "precisionInsight": "string (tailored deep revelation based on their current stage)"
                            }`
                        },
                        {
                            role: 'user',
                            content: `Streak: ${memoryStreak} days, XP: ${totalXp}, Topics: ${favoriteTopics.join(', ')}, Exegesis Depth Level: ${preferredExegesisLevel}`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.5,
                });

                learningProfile = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (err) {
                console.error('Adaptive learn error:', err);
            }
        }

        if (!learningProfile || !learningProfile.growthScore) {
            learningProfile = {
                growthScore: Math.min(95, 60 + memoryStreak * 3 + Math.floor(totalXp / 20)),
                spiritualMaturityStage: memoryStreak >= 7 ? 'Warrior' : 'Disciple',
                personalizedDailyRegimen: {
                    morningFocus: 'Anchor your mind in Philippians 4:7 before checking notifications.',
                    scriptureMeditation: 'Speak Psalm 23:1 out loud 3 times during lunch.',
                    eveningReflection: 'Write 3 specific answered prayers from this week in your journal.'
                },
                nextLevelBreakthroughChallenge: 'Complete 7 consecutive days of scripture memorization to unlock Level 4 Exegesis.',
                precisionInsight: 'Your spirit thrives when combining deep word study with intentional morning silence.'
            };
        }

        return NextResponse.json({
            success: true,
            ...learningProfile
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Adaptive engine error' }, { status: 500 });
    }
}
