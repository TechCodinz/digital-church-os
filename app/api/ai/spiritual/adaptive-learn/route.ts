import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

function safeTopics(value: unknown): string[] {
    if (!Array.isArray(value)) return ['Peace', 'Faith', 'Prayer'];
    return value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const recentRhythmDays = Number.isFinite(Number(body.recentRhythmDays)) ? Math.max(0, Math.min(90, Number(body.recentRhythmDays))) : 0;
        const favoriteTopics = safeTopics(body.favoriteTopics);
        const preferredStudyDepth = Number.isFinite(Number(body.preferredStudyDepth)) ? Math.max(1, Math.min(5, Number(body.preferredStudyDepth))) : 3;

        let formationProfile: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a Scripture-bounded formation reflection assistant for Digital Church OS.
Do not score holiness, spiritual maturity, faithfulness, divine favor, or closeness to God. Do not classify the user into spiritual ranks or levels. Do not claim revelation, prophecy, divine messages, diagnosis, or certainty about God's specific will for the user.

Use the supplied preferences only to suggest a private, gentle rhythm of prayer, Scripture, reflection, community, and service. Return JSON exactly in this shape:
{
  "focusTheme": "short descriptive theme, not a rank",
  "formationObservation": "descriptive observation phrased tentatively, not a spiritual judgment",
  "personalizedDailyRhythm": {
    "morningFocus": "short practice",
    "scriptureReflection": "short practice using a Bible reference rather than fabricating quotation text",
    "eveningReflection": "short practice"
  },
  "nextPractice": "one optional practical step, without unlocks, XP, streak pressure, or breakthrough promises",
  "careNote": "brief reminder that formation is not a score and human pastoral care is available when needed"
}`
                        },
                        {
                            role: 'user',
                            content: `Recent rhythm days: ${recentRhythmDays}. Topics of interest: ${favoriteTopics.join(', ') || 'None supplied'}. Preferred study depth: ${preferredStudyDepth}/5.`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.35,
                });

                formationProfile = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (error) {
                console.error('Formation reflection error:', error);
            }
        }

        if (!formationProfile?.personalizedDailyRhythm) {
            formationProfile = {
                focusTheme: favoriteTopics[0] || 'Steady faithfulness',
                formationObservation: recentRhythmDays > 0
                    ? 'You have returned to a spiritual rhythm recently. Treat that pattern as information for reflection, not a measure of spiritual worth.'
                    : 'A simple spiritual rhythm can begin with one honest practice rather than a large set of goals.',
                personalizedDailyRhythm: {
                    morningFocus: 'Begin with two quiet minutes of prayer before opening your usual stream of notifications.',
                    scriptureReflection: 'Read Philippians 4:4–9 slowly and write down one observation before moving to application.',
                    eveningReflection: 'Journal one moment of gratitude, one burden, and one person you want to remember in prayer.'
                },
                nextPractice: 'Choose one of today’s practices and repeat it only if it remains meaningful; consistency is useful, but it is not a spiritual score.',
                careNote: 'This reflection does not measure holiness or maturity. For personal spiritual direction or sensitive concerns, use accountable human pastoral care.'
            };
        }

        return NextResponse.json({ success: true, ...formationProfile });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error?.message || 'Formation reflection error' }, { status: 500 });
    }
}
