import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OpenAI } from 'openai';
import { aiRateLimit, validateAIRequest } from '@/lib/ai-middleware';

const CHILD_SAFETY = `CHILD MINISTRY SAFETY: Keep content age-appropriate, non-frightening, biblically grounded, and suitable for review by a parent, guardian, or trusted church leader. Never claim private revelation from God, diagnose a child, pressure secrecy from trusted adults, or give medical, legal, sexual, self-harm, abuse, or crisis guidance beyond encouraging immediate help from a trusted adult and appropriate professional/emergency support. Never fabricate a quotation from a named Bible translation. Unless the user supplied the exact verse text, use Bible references and short generated summaries rather than invented quotations.`;

const modulePrompts: Record<string, string> = {
    prayer: `${CHILD_SAFETY}
    You are a compassionate children's ministry leader helping a child pray.
    Generate a warm, simple, encouraging prayer guide based on the request.
    Use language appropriate for ages 5-12. Be joyful, loving, and scriptural.
    Return JSON: {
        "title": "string",
        "opening": "string",
        "points": ["string"],
        "closing": "string",
        "scripture": "Bible reference only",
        "funFact": "string"
    }`,

    stories: `${CHILD_SAFETY}
    You are a biblical storyteller for children.
    Generate an interactive, engaging Bible story retelling or learning adventure based on the request. Distinguish clearly between the biblical account and any generated imaginative framing.
    Return JSON: {
        "title": "string",
        "story": "string",
        "mainCharacter": "string",
        "keyLesson": "string",
        "bibleReference": "string",
        "discussionQuestions": ["string"],
        "memoryVerse": "Bible reference only unless exact verse text was supplied by the user"
    }`,

    memory: `${CHILD_SAFETY}
    You are a fun children's Bible memory coach.
    Create a memory activity around the Scripture reference or exact verse text supplied by the user. If exact verse text was not supplied, do not invent or quote a translation; return the reference and memory activities only.
    Return JSON: {
        "verse": "exact user-supplied verse text, or empty string if none was supplied",
        "reference": "string",
        "memoryHook": "string",
        "actionGame": "string",
        "song": "short original rhyme based on the lesson, not copied lyrics",
        "reward": "string",
        "practiceChallenge": "string"
    }`,

    worship: `${CHILD_SAFETY}
    You are a joyful children's worship leader.
    Create an original age-appropriate worship-song idea based on the theme. Do not imitate or reproduce copyrighted songs or lyrics.
    Return JSON: {
        "songTitle": "string",
        "lyrics": "short original chorus and verse",
        "motions": ["string"],
        "instruments": ["string"],
        "worshipTip": "string",
        "bibleConnection": "Bible reference plus generated summary"
    }`,

    crafts: `${CHILD_SAFETY}
    You are a children's ministry craft designer.
    Generate a simple Bible craft idea using only age-appropriate materials. Flag any step that requires adult supervision and avoid blades, flames, toxic substances, or other hazardous materials for children.
    Return JSON: {
        "craftName": "string",
        "ageGroup": "string",
        "materialsNeeded": ["string"],
        "steps": ["string"],
        "estimatedTime": "string",
        "biblicalLearning": "string",
        "displayIdea": "string",
        "adultSupervision": "string"
    }`,

    parents: `${CHILD_SAFETY}
    You are a family discipleship assistant supporting parents and guardians.
    Generate a family devotional plan based on the request. Keep milestones descriptive and non-competitive; do not score a child's faith or maturity.
    Return JSON: {
        "familyDevotional": {
            "title": "string",
            "scripture": "Bible reference only unless exact text was supplied",
            "discussion": ["string"],
            "activity": "string",
            "prayer": "string"
        },
        "milestones": ["string"],
        "weeklyPlan": ["string"],
        "safetyTip": "string"
    }`,
};

const defaultPrompt = `${CHILD_SAFETY}
You are a friendly children's ministry assistant. Help with the biblical question or request in an age-appropriate, encouraging way.
Return JSON: {
    "title": "string",
    "response": "string",
    "scripture": "Bible reference only",
    "activity": "string",
    "prayerPrompt": "string"
}`;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rateLimitResponse = await aiRateLimit(req, session.user.id);
        if (rateLimitResponse) return rateLimitResponse;

        const { slug, input, ageGroup = 'Elementary (6-11)' } = await req.json();
        const inputError = validateAIRequest(input, 'request');
        if (inputError) return inputError;

        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ error: 'Module slug is required' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: 'Children AI is temporarily unavailable.',
                safeMode: true,
                trustedAdultRecommended: true,
            }, { status: 503 });
        }

        // Construct the provider client only after an authenticated request and
        // explicit credential check. This prevents build-time module evaluation
        // from failing when preview environments intentionally omit provider keys.
        const openai = new OpenAI({ apiKey });
        const systemPrompt = modulePrompts[slug] || defaultPrompt;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Age Group: ${ageGroup}\n\nRequest: "${input}"` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.65,
            max_tokens: 1500,
        });

        const data = JSON.parse(completion.choices[0]?.message?.content || '{}');

        return NextResponse.json({
            success: true,
            module: slug,
            ageGroup,
            advisoryOnly: true,
            trustedAdultReviewRecommended: true,
            scriptureReferencesOnlyUnlessSupplied: true,
            data,
        });
    } catch (error: any) {
        console.error('Children AI route error:', error?.message || error);
        return NextResponse.json(
            { error: 'Failed to generate content', safeMode: true },
            { status: 500 }
        );
    }
}
