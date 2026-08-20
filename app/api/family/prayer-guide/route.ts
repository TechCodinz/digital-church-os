import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { findVersesForQuery } from '@/lib/ai/shared/offlineWisdom';

function safeList(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20)
        .map((item) => item.slice(0, 500));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const familyName = typeof body?.familyName === 'string' && body.familyName.trim() ? body.familyName.trim().slice(0, 120) : 'Our Family';
        const culturalTradition = typeof body?.culturalTradition === 'string' ? body.culturalTradition.trim().slice(0, 160) : '';
        const doctrinalStyle = typeof body?.doctrinalStyle === 'string' ? body.doctrinalStyle.trim().slice(0, 160) : '';
        const lifestyleRhythm = typeof body?.lifestyleRhythm === 'string' ? body.lifestyleRhythm.trim().slice(0, 120) : 'A short family devotional';
        const familyNeeds = safeList(body?.familyBattles);

        let familyGuide: any = null;
        let generatedBy: 'openai' | 'offline-template' = 'offline-template';

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a bounded Christian family-devotional writing assistant.

Create a gentle household devotional plan. Do not claim to be a pastor, counselor, prophet, anointed guide, spiritual diagnostician, or representative of God. Do not infer hidden spiritual patterns, generational curses, divine messages, guaranteed healing, or specific promises about outcomes. Do not diagnose children or adults.

Use Scripture REFERENCES rather than silently fabricating Bible quotations. Treat private family needs carefully and phrase observations tentatively. The family, parents/guardians, and accountable church leaders remain responsible for sensitive decisions.

Return JSON exactly:
{
  "title": "string",
  "familyScriptureAnchor": "Book Chapter:Verse",
  "reflection": "brief, careful reflection based only on what was supplied",
  "familyPrayerScript": "short humble prayer without guaranteed outcomes",
  "peaceRoadmapSteps": ["3-5 practical family devotional steps"],
  "audioDevotionalScript": "short read-aloud devotional script"
}`
                        },
                        {
                            role: 'user',
                            content: `Family name: ${familyName}. Tradition/culture: ${culturalTradition || 'not specified'}. Doctrinal preference: ${doctrinalStyle || 'not specified'}. Family needs shared by the user: ${familyNeeds.join(' | ') || 'none supplied'}. Preferred rhythm: ${lifestyleRhythm}.`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.45,
                });

                familyGuide = JSON.parse(response.choices[0]?.message?.content || '{}');
                if (familyGuide?.title) generatedBy = 'openai';
            } catch (error) {
                console.error('Family devotional guide error:', error);
            }
        }

        if (!familyGuide?.title) {
            const reference = findVersesForQuery(familyNeeds.join(' ') || 'peace family wisdom', 1)[0]?.reference || 'Philippians 4:6-7';
            familyGuide = {
                title: `${familyName} — A Gentle Family Devotional`,
                familyScriptureAnchor: reference,
                reflection: familyNeeds.length
                    ? 'Your notes include concerns or hopes that could be brought into prayer, patient conversation, and Scripture reflection. This is a writing aid, not a diagnosis of your household.'
                    : 'A simple family devotional can begin with one Scripture reference, one gratitude, one honest concern, and one short prayer.',
                familyPrayerScript: 'God, give our household wisdom, patience, courage, and love. Help us listen to one another, remember what is true, and act with grace today. Amen.',
                peaceRoadmapSteps: [
                    'Read the Scripture reference together in your preferred Bible translation.',
                    'Invite each person to share one gratitude and one concern without pressure.',
                    'Choose one practical act of care the household can do today.',
                    'Close with a brief prayer in your own words.'
                ],
                audioDevotionalScript: `Welcome to a short devotional for ${familyName}. Begin by reading ${reference} in your preferred translation. Give each person space to share one gratitude and one concern, then close with a simple prayer for wisdom and love.`
            };
        }

        return NextResponse.json({
            success: true,
            generatedBy,
            boundaryNote: 'This is a devotional writing aid, not spiritual diagnosis, prophecy, counseling, or a guarantee about family outcomes.',
            ...familyGuide,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error?.message || 'Family guide error' }, { status: 500 });
    }
}
