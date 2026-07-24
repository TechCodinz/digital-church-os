import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { theme = 'Unshakeable Grace', key = 'C Major', tempo = '72 BPM', style = 'Contemporary Worship' } = body;

        let songData: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an AI Worship Master & Anointed Songwriter. Compose a complete worship song package. Return JSON:
                            {
                                "title": "string",
                                "key": "string",
                                "tempo": "string",
                                "structure": {
                                    "verse1": "string (lyrics with chord annotations in brackets like [C] [G] [Am] [F])",
                                    "chorus": "string",
                                    "bridge": "string"
                                },
                                "choirArrangement": {
                                    "soprano": "string",
                                    "alto": "string",
                                    "tenor": "string",
                                    "bass": "string"
                                },
                                "scriptureAnchors": ["string"]
                            }`
                        },
                        {
                            role: 'user',
                            content: `Theme: ${theme}, Desired Key: ${key}, Tempo: ${tempo}, Style: ${style}`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.7,
                });

                songData = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (err) {
                console.error('AI Choir compose error:', err);
            }
        }

        if (!songData || !songData.title) {
            songData = {
                title: `Anchor of My Soul (${theme})`,
                key: key,
                tempo: tempo,
                structure: {
                    verse1: `[${key[0] || 'C'}] In the stillness of the morning, [G] I lift my eyes to You\n[Am] Your unshakeable promise [F] makes all things new.`,
                    chorus: `[C] You are my fortress, [G] You are my strength\n[Am] Your love endures [F] through every age.`,
                    bridge: `[F] High above the storm, [G] Your name exalted\n[Am] Jesus the Savior, [Em] Faithful and True.`
                },
                choirArrangement: {
                    soprano: 'Melody lead ascending to High G on the final chorus bridge.',
                    alto: 'Warm inner harmony supporting 3rd intervals in the chorus.',
                    tenor: 'Counter-melody call and response on "Faithful and True".',
                    bass: 'Root note grounding foundation with rhythmic syncopation.'
                },
                scriptureAnchors: ['Hebrews 6:19', 'Psalm 46:1', 'Isaiah 40:31']
            };
        }

        return NextResponse.json({
            success: true,
            ...songData
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message || 'Composition failed'
        }, { status: 500 });
    }
}
