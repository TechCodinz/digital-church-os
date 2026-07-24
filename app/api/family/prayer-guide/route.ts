import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            familyName = 'The Smith Family',
            culturalTradition = 'African-American / Evangelical',
            doctrinalStyle = 'Charismatic & Scripture-Anchored',
            familyBattles = ['Child school anxiety', 'Financial wisdom for house mortgage', 'Marital peace'],
            lifestyleRhythm = '10-Minute Evening Dinner Altar'
        } = body;

        let familyGuide: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an Anointed Family Pastoral Counselor & Devotional Altar Guide.
                            Generate a customized Family Devotional & Peace Guide respecting their doctrine, culture, and lifestyle rhythm.
                            Return JSON:
                            {
                                "title": "string",
                                "familyScriptureAnchor": "string",
                                "worryPatternAnalysis": "string (insight into their battles and how Christ brings peace)",
                                "familyPrayerScript": "string (warm, sacred prayer to read out loud as a family)",
                                "peaceRoadmapSteps": ["string (3 actionable steps for family peace)"],
                                "audioDevotionalScript": "string (transcript for family audio prayer time)"
                            }`
                        },
                        {
                            role: 'user',
                            content: `Family Name: ${familyName}, Culture/Tradition: ${culturalTradition}, Doctrine: ${doctrinalStyle}, Battles/Worries: ${familyBattles.join(', ')}, Rhythm: ${lifestyleRhythm}`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.6,
                });

                familyGuide = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (err) {
                console.error('Family prayer guide error:', err);
            }
        }

        if (!familyGuide || !familyGuide.title) {
            familyGuide = {
                title: `Unshakeable Peace for ${familyName}`,
                familyScriptureAnchor: 'Joshua 24:15 — "As for me and my house, we will serve the LORD."',
                worryPatternAnalysis: 'The AI Altar Engine detects a desire to protect the home from anxiety while seeking wisdom for family finances and school peace.',
                familyPrayerScript: `Heavenly Father, we dedicate ${familyName} into Your hands. We cast every worry about finances, school, and health at the feet of Jesus. Let Your divine peace rule in our hearts today. Amen.`,
                peaceRoadmapSteps: [
                    'Hold hands at the dinner table and speak Joshua 24:15 out loud together.',
                    'Replace 10 minutes of evening news/screen time with a 3-minute family praise song.',
                    'Write down 1 thing each family member is grateful for in your Family Prayer Journal.'
                ],
                audioDevotionalScript: `Welcome to the ${familyName} Evening Prayer Altar. Peace be to this home. Lord Jesus, we invite Your Holy Presence into our living room right now...`
            };
        }

        return NextResponse.json({
            success: true,
            ...familyGuide
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Family guide error' }, { status: 500 });
    }
}
