import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { buildApologetic } from '@/lib/ai/shared/offlineTheology';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt = '', requestedPersona } = body;

        if (!prompt.trim()) {
            return NextResponse.json({ error: 'Prompt is required for triage' }, { status: 400 });
        }

        let triageResult: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an Intelligent Pastoral Triage & Companion Dispatcher for Digital Church OS.
                            Analyze the user's message and determine the best spiritual companion:
                            - "counselor": for emotional pain, anxiety, depression, trauma, marriage, mental health, grief.
                            - "prayer_warrior": for urgent intercession, spiritual warfare, physical healing, immediate crisis prayer.
                            - "pastor": for biblical doctrine, exegesis, discipling, general spiritual direction, leadership.

                            Return JSON:
                            {
                                "recommendedPersona": "counselor" | "prayer_warrior" | "pastor",
                                "triageReason": "Short 1-sentence reason for this selection",
                                "initialResponse": "The initial compassionate response from that specific persona",
                                "suggestedVerses": ["Book Chapter:Verse"],
                                "escalateToHumanPastor": boolean (true if severe crisis/suicidal ideation/severe abuse)
                            }`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.5,
                });

                triageResult = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (err) {
                console.error('Triage AI error:', err);
            }
        }

        // Fallback Triage Logic if API key missing or error
        if (!triageResult || !triageResult.recommendedPersona) {
            const lower = prompt.toLowerCase();

            // Apologetics / viral faith-conversation detection -> "Will" the AI Apologist.
            const apologeticsCue =
                /\b(prove|proof|debate|argue|argument|objection|skeptic|atheis|contradict|why (does|would|is) god|doesn'?t exist|isn'?t real|no evidence|science|evolution|other religions|hypocrit|resurrection|problem of evil|refute|apolog)\b/i.test(prompt);

            if (requestedPersona === 'apologist' || apologeticsCue) {
                const apol = buildApologetic(prompt);
                triageResult = {
                    recommendedPersona: 'apologist',
                    triageReason: `Detected a faith conversation on "${apol.label}" -> Routed to Will, the AI Apologist.`,
                    initialResponse: `${apol.response}\n\n💬 To turn the conversation: ${apol.turningQuestion}`,
                    suggestedVerses: apol.scriptures,
                    escalateToHumanPastor: false,
                };
                return NextResponse.json({ success: true, ...triageResult });
            }

            let persona: 'counselor' | 'prayer_warrior' | 'pastor' = 'pastor';
            let reason = 'General spiritual inquiry routed to your Lead AI Pastor.';
            let responseText = 'Grace and peace to you. I am here to shepherd your heart and explore God\'s word together.';
            let verses = ['Psalm 23:1', 'Proverbs 3:5-6'];

            if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('depress') || lower.includes('sad') || lower.includes('lonely') || lower.includes('marriage') || lower.includes('grief')) {
                persona = 'counselor';
                reason = 'Detected emotional burden and need for heart healing -> Routed to AI Biblical Counselor.';
                responseText = 'I hear the weight in your words. God draws near to the brokenhearted (Psalm 34:18). Let us process this gently in the light of Christ\'s love.';
                verses = ['Psalm 34:18', '1 Peter 5:7'];
            } else if (lower.includes('pray') || lower.includes('heal') || lower.includes('sick') || lower.includes('warfare') || lower.includes('urgent') || lower.includes('battle')) {
                persona = 'prayer_warrior';
                reason = 'Detected urgent prayer request & spiritual warfare -> Routed to AI Prayer Warrior.';
                responseText = 'Hallelujah! We stand together on the authority of Jesus\' name. Let us wage a good warfare in prayer right now!';
                verses = ['Ephesians 6:12', 'James 5:16'];
            }

            triageResult = {
                recommendedPersona: requestedPersona || persona,
                triageReason: reason,
                initialResponse: responseText,
                suggestedVerses: verses,
                escalateToHumanPastor: lower.includes('suicide') || lower.includes('kill myself') || lower.includes('abuse'),
            };
        }

        return NextResponse.json({
            success: true,
            ...triageResult
        });
    } catch (err: any) {
        console.error('Triage route error:', err);
        return NextResponse.json({
            success: true,
            recommendedPersona: 'pastor',
            triageReason: 'Default pastoral care assigned.',
            initialResponse: 'Welcome. I am ready to listen and walk alongside you.',
            suggestedVerses: ['John 14:27'],
            escalateToHumanPastor: false,
        });
    }
}
