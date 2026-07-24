import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fastType = 'Daniel Fast', currentHour = 14, intention = 'Breakthrough & Spiritual Clarity' } = body;

        let fastingGuide: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an Anointed AI Fasting Coach & Spiritual Companion (Isaiah 58).
                            Generate an encouraging, scripturally grounded fasting guide for Hour ${currentHour} of a ${fastType}.
                            Return JSON:
                            {
                                "hourTitle": "string",
                                "scriptureFocus": "string",
                                "spiritualExhortation": "string",
                                "hungerConqueringDeclaration": "string",
                                "healthSafeguardTip": "string"
                            }`
                        },
                        {
                            role: 'user',
                            content: `Fast Type: ${fastType}, Hour: ${currentHour}, Intention: ${intention}`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.5,
                });

                fastingGuide = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (err) {
                console.error('Fasting guide error:', err);
            }
        }

        if (!fastingGuide || !fastingGuide.hourTitle) {
            fastingGuide = {
                hourTitle: `Hour ${currentHour}: Pressing Past the Flesh into Spiritual Anointing`,
                scriptureFocus: 'Isaiah 58:6 — "Is not this the fast that I choose: to loose the bonds of wickedness?"',
                spiritualExhortation: 'As physical hunger arises, let it remind you of your soul’s deeper hunger for the presence of God. You are breaking through generational barriers right now.',
                hungerConqueringDeclaration: 'My body is the temple of the Holy Spirit. Man does not live by bread alone, but by every word from God’s mouth!',
                healthSafeguardTip: 'Drink plenty of water and rest your mind. If feeling lightheaded, take deep breaths while meditating on Psalm 23.'
            };
        }

        return NextResponse.json({
            success: true,
            ...fastingGuide
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Fasting guide failed' }, { status: 500 });
    }
}
