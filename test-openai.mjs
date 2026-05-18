import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const testSpiritual = async () => {
    console.log("Testing Spiritual Prompt 'guidance'...");
    const defaultPrompt = `You are a wise, compassionate Christian spiritual mentor.
    Provide biblical guidance based on the user's situation.
    Filter responses through sound theological guardrails for safety and biblically sound advice.
    Return a JSON object: {
        "title": "string",
        "guidance": "string",
        "scripture": "string",
        "actionStep": "string",
        "prayer": "string"
    }`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: defaultPrompt },
                { role: 'user', content: "i'm facing financial challenges" }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2000,
        });

        console.log("Raw Response:");
        console.log(completion.choices[0].message.content);

        const parsed = JSON.parse(completion.choices[0].message.content || '{}');
        console.log("Parsed JSON:", Object.keys(parsed));
    } catch (err) {
        console.error("OpenAI Call Failed:", err);
    }
};

const testChildren = async () => {
    console.log("\nTesting Children Prompt 'stories'...");
    const prompt = `You are a master biblical storyteller for children.
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
    }`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: "Age Group: Elementary (9-11)\n\nRequest: \"david\"" }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 1500,
        });

        console.log("Raw Response:");
        console.log(completion.choices[0].message.content);

        const parsed = JSON.parse(completion.choices[0].message.content || '{}');
        console.log("Parsed JSON:", Object.keys(parsed));
    } catch (err) {
        console.error("OpenAI Call Failed:", err);
    }
}

async function run() {
    await testSpiritual();
    await testChildren();
}

run();
