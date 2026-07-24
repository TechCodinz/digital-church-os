import { OpenAI } from 'openai';

export class MindBlowingRevelationEngine {
    async revealVerseDepth(params: {
        verse: string;
        userLevel: 'beginner' | 'intermediate' | 'advanced' | 'scholar';
        revealLayer: 'surface' | 'meaning' | 'connection' | 'hidden' | 'eternal';
    }) {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a Scripture Revelation Engine. Reveal the depth of the provided verse at the "${params.revealLayer}" layer for a user with ${params.userLevel} level. Create an "AHA!" moment (Setup, Reveal, Significance). Provide data for a visual representation (layers/mind-map).`
                },
                {
                    role: "user",
                    content: `Verse: ${params.verse}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');

        return {
            verse: params.verse,
            revelation: data.revelation || "",
            insightMoment: data.insight_moment || {},
            visualizationData: data.visualization || {},
            sharePrompt: `You won't believe what I just discovered in ${params.verse}! 🕯️`
        };
    }
}
