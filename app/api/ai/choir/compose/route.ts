import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { findVersesForQuery } from '@/lib/ai/shared/offlineWisdom';

const ALLOWED_KEYS = new Set(['C Major', 'G Major', 'D Major', 'E Major', 'F# Major']);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const theme = typeof body?.theme === 'string' ? body.theme.trim().slice(0, 500) : 'Grace and peace';
        const key = ALLOWED_KEYS.has(body?.key) ? body.key : 'C Major';
        const tempo = typeof body?.tempo === 'string' ? body.tempo.trim().slice(0, 80) : '72 BPM';
        const style = typeof body?.style === 'string' ? body.style.trim().slice(0, 120) : 'Contemporary Worship';

        let songData: any = null;
        let generatedBy: 'openai' | 'offline-template' = 'offline-template';

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a Christian worship composition assistant. Create an ORIGINAL draft for a church worship team.

Rules:
- Do not claim anointing, revelation, prophecy, divine authorship, or that God gave you the song.
- Do not imitate a named living artist or reproduce copyrighted lyrics.
- Treat all lyrics, chord choices, and choir arrangements as creative drafts requiring human ministry review.
- Use Scripture REFERENCES as anchors rather than fabricating quotation text or claiming the lyrics are Scripture.
- Keep the theology broadly Christian and avoid promises that every worshipper will receive healing, wealth, deliverance, or a guaranteed outcome.

Return JSON exactly:
{
  "title": "string",
  "key": "string",
  "tempo": "string",
  "structure": {
    "verse1": "original lyrics with simple chord annotations like [C] [G] [Am] [F]",
    "chorus": "original lyrics with chord annotations",
    "bridge": "original lyrics with chord annotations"
  },
  "choirArrangement": {
    "soprano": "practical arrangement note",
    "alto": "practical arrangement note",
    "tenor": "practical arrangement note",
    "bass": "practical arrangement note"
  },
  "scriptureAnchors": ["Book Chapter:Verse"]
}`
                        },
                        { role: 'user', content: `Theme: ${theme}. Desired Key: ${key}. Tempo: ${tempo}. Style: ${style}.` }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.65,
                });

                songData = JSON.parse(response.choices[0]?.message?.content || '{}');
                if (songData?.title) generatedBy = 'openai';
            } catch (error) {
                console.error('AI Choir compose error:', error);
            }
        }

        if (!songData?.title) {
            const anchors = findVersesForQuery(theme, 3).map((verse) => verse.reference);
            songData = {
                title: `Worship Draft — ${theme.slice(0, 70)}`,
                key,
                tempo,
                structure: {
                    verse1: `[C] We come with open hands, [G] remembering Your grace\n[Am] Teach us to walk in truth, [F] and seek Your face.`,
                    chorus: `[C] Keep our hearts in Your word, [G] steady in Your love\n[Am] Form us into people [F] who reflect Your grace.`,
                    bridge: `[F] In every season, [G] teach us to remain\n[Am] Faithful in the waiting, [Em] grateful in Your name.`
                },
                choirArrangement: {
                    soprano: 'Carry the primary melody; keep the final phrase within the comfortable range of the team.',
                    alto: 'Support the chorus with thirds and stepwise inner movement rather than constant parallel harmony.',
                    tenor: 'Use a restrained counter-line on the final chorus, leaving space under the lead melody.',
                    bass: 'Anchor roots and fifths with a simple rhythmic pulse that supports congregational singing.'
                },
                scriptureAnchors: anchors,
            };
        }

        return NextResponse.json({
            success: true,
            generatedBy,
            draftStatus: 'HUMAN_REVIEW_REQUIRED',
            boundaryNote: 'This is a generated creative draft, not Scripture, revelation, prophecy, or divine authorship. Review theology, singability, originality, and church fit before use.',
            ...songData,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error?.message || 'Composition failed' }, { status: 500 });
    }
}
