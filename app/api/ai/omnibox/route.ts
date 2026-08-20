import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { findVersesForQuery } from '@/lib/ai/shared/offlineWisdom';

export async function POST(req: Request) {
    try {
        const { query, mode } = await req.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        let systemPrompt = 'You are Sanctuary AI, an ultra-intelligent, grounded theological assistant.';
        if (mode === 'prayer') {
            systemPrompt = 'You are Sanctuary AI Prayer Intercessor. Generate a deeply moving, scripture-saturated intercessory prayer for the user request.';
        } else if (mode === 'scripture') {
            systemPrompt = 'You are Sanctuary AI Exegete. Provide original Hebrew/Greek etymological insight, historical context, and practical application for the provided passage or topic.';
        }

        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                max_tokens: 600,
                temperature: 0.7,
            });

            const content = completion.choices[0]?.message?.content || '';
            return NextResponse.json({
                title: mode === 'prayer' ? 'Custom Intercessory Prayer' : mode === 'scripture' ? 'Scripture Exegesis' : 'Theological Guidance',
                content,
                scripture: mode === 'prayer' ? 'Be anxious for nothing, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. — Philippians 4:6' : undefined,
                actionUrl: mode === 'scripture' ? '/spiritual' : mode === 'prayer' ? '/prayer-room' : '/live-service'
            });
        }

        // Fallback intelligent response when API key is unconfigured or in offline mode.
        // Ground the answer in a relevant verse so the reference is tappable in the UI.
        const verses = findVersesForQuery(query, 2);
        const primary = verses[0];
        const secondary = verses[1];
        const content =
            mode === 'prayer'
                ? `Father, concerning "${query}", we bring this before You in faith. Anchor this heart in Your promise from ${primary?.reference}: "${primary?.text}" Let Your peace stand guard today. Amen.`
                : `On "${query}", Scripture speaks with clarity. Consider ${primary?.reference}: "${primary?.text}"` +
                  (secondary ? ` See also ${secondary.reference}. Meditate on these words and let them anchor your heart today.` : '');
        return NextResponse.json({
            title: mode === 'prayer' ? 'Sanctuary Intercessory Prayer' : mode === 'scripture' ? 'Scripture Insight' : 'Spiritual Insight',
            content,
            scripture: primary ? `${primary.reference} — ${primary.text}` : undefined,
            actionUrl: mode === 'scripture' ? '/spiritual' : '/prayer-room'
        });
    } catch (error) {
        console.error('Omnibox AI API error:', error);
        return NextResponse.json({
            title: 'Sanctuary Guidance',
            content: 'Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths. — Proverbs 3:5-6',
            actionUrl: '/live-service'
        });
    }
}
