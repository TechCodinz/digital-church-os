import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OpenAI } from 'openai';
import { aiRateLimit, validateAIRequest } from '@/lib/ai-middleware';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const modulePrompts: Record<string, string> = {
    prayer: `You are a compassionate children's ministry leader helping a child pray. 
    Generate a warm, simple, and encouraging prayer guide for a child based on their input.
    Use language appropriate for ages 5-12. Be joyful, loving, and scriptural.
    Return a JSON object: {
        "title": "string",
        "opening": "string (simple prayer opening sentence)",
        "points": ["string (each is a praise/request point to pray about)"],
        "closing": "string (simple prayer closing sentence)",
        "scripture": "string (one encouraging scripture)",
        "funFact": "string (one fun Bible fact related to prayer)"
    }`,

    stories: `You are a master biblical storyteller for children.
    Generate an interactive, engaging Bible story or adventure based on the child's request.
    Adapt vocabulary and complexity for ages 5-12. Include questions for discussion.
    Return a JSON object: {
        "title": "string",
        "story": "string (the full narrative, 3-4 paragraphs)",
        "mainCharacter": "string",
        "keyLesson": "string",
        "bibleReference": "string",
        "discussionQuestions": ["string"],
        "memoryVerse": "string"
    }`,

    memory: `You are a fun children's Bible memory coach.
    Create a memory game, activity, or creative way to memorize the scripture or biblical truth the child provides.
    Return a JSON object: {
        "verse": "string",
        "reference": "string",
        "memoryHook": "string (creative way to remember it)",
        "actionGame": "string (a physical action game to help memorize)",
        "song": "string (short song or rhyme with the verse)",
        "reward": "string (encouraging badge or reward description)",
        "practiceChallenge": "string"
    }`,

    worship: `You are a joyful children's worship leader.
    Create an age-appropriate worship experience or song idea based on the child's theme.
    Return a JSON object: {
        "songTitle": "string",
        "lyrics": "string (simple, fun chorus and verse)",
        "motions": ["string (action for each lyric section)"],
        "instruments": ["string (household instruments they can use)"],
        "worshipTip": "string",
        "bibleConnection": "string"
    }`,

    crafts: `You are an expert children's ministry craft designer.
    Generate a fun, safe Bible craft idea based on the child's theme or available materials.
    Return a JSON object: {
        "craftName": "string",
        "ageGroup": "string",
        "materialsNeeded": ["string"],
        "steps": ["string"],
        "estimatedTime": "string",
        "biblicalLearning": "string",
        "displayIdea": "string (how to display or use the finished craft)"
    }`,

    parents: `You are a family discipleship specialist.
    Generate a comprehensive family devotional plan and spiritual milestone tracker based on the parent's request.
    Return a JSON object: {
        "familyDevotional": {
            "title": "string",
            "scripture": "string",
            "discussion": ["string"],
            "activity": "string",
            "prayer": "string"
        },
        "milestones": ["string (age-appropriate spiritual milestones)"],
        "weeklyPlan": ["string (one activity per day of the week)"],
        "safetyTip": "string"
    }`,
};

const defaultPrompt = `You are a friendly children's ministry specialist.
Help the child with their biblical question or request in an age-appropriate, encouraging way.
Return a JSON object: {
    "title": "string",
    "response": "string",
    "scripture": "string",
    "activity": "string",
    "prayerPrompt": "string"
}`;

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

        if (!slug) {
            return NextResponse.json({ error: 'Module slug is required' }, { status: 400 });
        }

        const systemPrompt = modulePrompts[slug] || defaultPrompt;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Age Group: ${ageGroup}\n\nRequest: "${input}"` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 1500,
        });

        const data = JSON.parse(completion.choices[0].message.content || '{}');

        return NextResponse.json({
            success: true,
            module: slug,
            ageGroup,
            data,
        });

    } catch (error: any) {
        console.error('Children AI route complete error stack:', error);
        console.error('Error name:', error?.name);
        console.error('Error message:', error?.message);
        if (error?.response) {
            console.error('OpenAI Response Error:', error.response?.data || error.response);
        }
        return NextResponse.json(
            { error: 'Failed to generate content', details: error?.message || 'Unknown error' },
            { status: 500 }
        );
    }
}
