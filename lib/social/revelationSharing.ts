import { OpenAI } from 'openai';

export class RevelationSharingEngine {
    async createShareableRevelation(revelation: any, userId: string) {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a Viral Faith Social Media Strategist. Create shareable content based on a scripture revelation. Provide formats for Twitter (short/punchy), Instagram (visual card text), and WhatsApp (medium/personal). Include catchy hashtags."
                },
                {
                    role: "user",
                    content: `Revelation: ${JSON.stringify(revelation)}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');

        return {
            short: data.twitter || {},
            medium: data.whatsapp || {},
            visual: data.instagram || {},
            challenge: data.viral_challenge || {}
        };
    }
}
