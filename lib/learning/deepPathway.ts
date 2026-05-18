import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class DeepLearningPathway {
    async generateDepthPathway(userId: string, focusArea: string) {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a Spiritual Education Director. Create a 90-day deep learning journey focused on a specific theological area. Structure it into 4 phases: Foundation, Exploration, Excavation, and Transformation. Provide daily and weekly rhythms."
                },
                {
                    role: "user",
                    content: `Focus Area: ${focusArea}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');

        return {
            focus: focusArea,
            duration: "90 days",
            phases: data.phases || [],
            dailyDepth: data.daily_rhythm || {},
            weeklyRevelations: data.weekly_highlights || [],
            milestones: data.milestones || []
        };
    }
}
