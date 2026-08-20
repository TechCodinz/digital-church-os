import { OpenAI } from 'openai';
import { TranslationIntelligenceEngine } from '../../scripture/translationEngine';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const translationEngine = new TranslationIntelligenceEngine();

export class DepthSermonGenerator {
    async generateDepthSermon(params: {
        verse: string;
        targetDepth: 1 | 2 | 3 | 4 | 5;
        userLevel: 'beginner' | 'intermediate' | 'advanced' | 'scholar';
        focusAreas: string[];
    }) {
        // 1. Excavate all possible depths
        const depths = await this.excavateVerseDepths(params.verse);

        // 2. Multi-Level Generation via AI
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a Depth Sermon Architect. Create a progressive sermon for ${params.verse} targeting depth level ${params.targetDepth}. Structure it into Levels 1 (Milk/Surface) through 5 (Hidden Manna/Eternal Reality). Include "Wow Moments" and progressive application.`
                },
                {
                    role: "user",
                    content: `Reference: ${params.verse}\nExcavated Depths: ${JSON.stringify(depths)}\nUser Level: ${params.userLevel}\nFocus Areas: ${params.focusAreas.join(', ')}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const sermonData = JSON.parse(response.choices[0].message.content || '{}');

        return {
            verse: params.verse,
            fullTranslations: await translationEngine.getVerseWithAllTranslations(params.verse),
            ...sermonData
        };
    }

    private async excavateVerseDepths(verse: string) {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Perform a multi-dimensional excavation of this verse. Include: Linguistic, Historical, Literary, Theological, Prophetic, Mystical, Connection, and Numerical depths. Return JSON."
                },
                {
                    role: "user",
                    content: `Verse: ${verse}`
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content || '{}');
    }
}
