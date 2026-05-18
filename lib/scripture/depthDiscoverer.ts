import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class MindBlowingVerseDiscoverer {
    async discoverMindBlowingVerses(params: {
        userId: string;
        currentUnderstanding: 'basic' | 'intermediate' | 'advanced' | 'scholar';
        desireForDepth: number; // 1-10
        favoriteThemes: string[];
        recentStruggles: string[];
    }) {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a Spiritual Depth Discoverer. Find verses that will absolutely "blow the mind" of a user with a ${params.currentUnderstanding} understanding level. Search across dimensions: Progressive revelation, Prophetic layers, Typology, Numerical significance, Chiastic masterpieces, and Christological revelations. Rank by "Wow Factor".`
                },
                {
                    role: "user",
                    content: `Themes: ${params.favoriteThemes.join(', ')}\nStruggles: ${params.recentStruggles.join(', ')}\nDepth Desire: ${params.desireForDepth}/10`
                }
            ],
            response_format: { type: "json_object" }
        });

        const discoveries = JSON.parse(response.choices[0].message.content || '{}').discoveries || [];

        return discoveries.map((d: any) => ({
            verse: d.verse,
            surfaceReading: d.surface,
            mindBlowingInsight: d.deepInsight,
            whyItMatters: d.significance,
            howToApply: d.application,
            discussionStarters: d.questions,
            furtherExploration: d.deepDives
        }));
    }
}
