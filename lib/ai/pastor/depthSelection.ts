import { OpenAI } from 'openai';

export class DepthAwarePastor {
    async selectPreachingDepth(params: {
        congregationSize: number;
        occasion: 'sunday' | 'bible-study' | 'conference' | 'one-on-one';
        desiredImpact: 'encouragement' | 'challenge' | 'revelation' | 'transformation';
    }) {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a Depth-Aware AI Pastor. Select the optimal preaching depth for the given congregation and occasion. Structure the sermon depth progressively (Entry level to Deepest level). Provide multiple entry points for different understanding levels."
                },
                {
                    role: "user",
                    content: `Congregation: ${params.congregationSize}, Occasion: ${params.occasion}, Impact: ${params.desiredImpact}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');

        return {
            selectedDepth: data.selected_depth || 3,
            progression: data.progression || [],
            entryPoints: data.entry_points || {},
            application: data.application_at_every_level || {}
        };
    }
}
