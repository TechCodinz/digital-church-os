import { NextResponse } from 'next/server';
import { findVersesForQuery, themeLabel, extractThemes } from '@/lib/ai/shared/offlineWisdom';
import { buildTheologicalInsight } from '@/lib/ai/shared/offlineTheology';

export const dynamic = 'force-dynamic';

/**
 * Pastor Study Desk
 * -----------------
 * Turns any topic or passage into a complete teaching kit in one call:
 * sermon outline, age-adapted Sunday-school lesson, small-group questions,
 * original-language word studies, and a cross-reference chain. Always-on
 * (no external keys required); grounded in the offline theology engine.
 */
export async function POST(req: Request) {
    try {
        const { topic = '' } = await req.json();
        const subject = String(topic).trim() || 'Hope';

        const themes = extractThemes(subject, 3);
        const label = themeLabel(themes[0]);
        const insight = buildTheologicalInsight(subject);
        const verses = findVersesForQuery(subject, 5);
        const [v1, v2, v3] = verses;
        const word = insight.wordStudies[0];

        const sermon = {
            title: `${subject}: A Word That Holds`,
            bigIdea: `Because of who God is, ${subject.toLowerCase()} is not fragile sentiment but solid ground for the believer.`,
            introduction:
                `We all reach for something steady. Today we anchor ${subject.toLowerCase()} in Scripture — ` +
                `and the original language shows its depth: the ${word.language} word "${word.translit}" (${word.gloss}) reveals that ${word.insight}`,
            points: [
                {
                    title: `The Source of ${label}`,
                    scripture: v1?.reference || 'John 3:16',
                    explanation: `According to scripture, ${subject.toLowerCase()} begins with God's initiative toward us, not our striving toward Him.`,
                    application: `Name one place you can receive rather than earn ${subject.toLowerCase()} this week.`,
                },
                {
                    title: `The Foundation of ${label}`,
                    scripture: v2?.reference || 'Romans 8:28',
                    explanation: `Biblical teaching suggests ${subject.toLowerCase()} rests on God's unchanging character, so it holds when feelings shift.`,
                    application: `Choose one truth from this passage to rehearse when doubt rises.`,
                },
                {
                    title: `The Fruit of ${label}`,
                    scripture: v3?.reference || 'Galatians 5:22-23',
                    explanation: `Scripture teaches that what we receive from God we extend to others; ${subject.toLowerCase()} is meant to overflow.`,
                    application: `Practice one concrete act that lets ${subject.toLowerCase()} bless someone else.`,
                },
            ],
            conclusion: `Leave anchored in ${subject.toLowerCase()} — trusting the God who keeps His promises, and watch Him prove faithful this week.`,
        };

        const sundaySchool = {
            title: `Big Truth: God Gives Us ${label}`,
            ageBand: 'Ages 6–10 (adaptable)',
            memoryVerse: v1?.reference || 'John 3:16',
            bigIdea: `God loves us and gives us ${subject.toLowerCase()} — we can trust Him like a good Father.`,
            opener: `Ask: "When was a time you felt worried or unsure? What helped you feel safe again?"`,
            story: `Tell today's key verse (${v1?.reference}) as a simple story: God sees us, God is with us, and God keeps His promises — every single time.`,
            activity: `Draw an anchor and write "${label}" on it. Explain that an anchor keeps a boat steady in a storm, just like God keeps our hearts steady.`,
            takeaway: `Say together: "God is with me, so I don't have to be afraid."`,
        };

        const smallGroup = {
            icebreaker: `Where do you most need ${subject.toLowerCase()} in this season of life?`,
            questions: [
                `Read ${v1?.reference}. What does this reveal about God's heart toward you?`,
                `The word "${word.translit}" means "${word.gloss}." How does that deepen your understanding of ${subject.toLowerCase()}?`,
                `Compare ${(verses.slice(0, 3).map((v) => v.reference)).join(', ')}. What single thread runs through them?`,
                `Where is it hardest for you to trust God with ${subject.toLowerCase()}, and why?`,
                `What is one step of obedience this passage is inviting you to take this week?`,
            ],
            challenge: `Memorize ${v1?.reference} and share it with one person before your next gathering.`,
        };

        return NextResponse.json({
            success: true,
            topic: subject,
            themeLabel: label,
            wordStudies: insight.wordStudies,
            crossReferences: insight.crossReferences,
            sermon,
            sundaySchool,
            smallGroup,
        });
    } catch (error) {
        console.error('Study Desk error:', error);
        return NextResponse.json({ error: 'Failed to build study' }, { status: 500 });
    }
}
