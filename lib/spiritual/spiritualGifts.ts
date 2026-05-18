// lib/spiritual/spiritualGifts.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class SpiritualGiftsCenter {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.guardrails = new TheologicalGuardrails();
    }

    async discoverGifts(user: any) {
        const startTime = Date.now();
        // In a real flow, you would pass the user's assessment answers in
        const answersContext = "User is empathetic, enjoys teaching, but feels drawn to praying for the sick.";

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert biblical profiler for spiritual gifts (1 Corinthians 12, Romans 12, Ephesians 4).
                    Analyze the user's profile and generate their spiritual gifts assessment.
                    Return a JSON object matching this schema:
                    {
                        "results": {
                            "primary": [ { "name": "string", "score": number, "description": "string", "biblicalBasis": "string" } ],
                            "secondary": ["string"]
                        },
                        "categories": {
                            "speaking": ["string"],
                            "serving": ["string"],
                            "signs": ["string"]
                        },
                        "development": [ { "gift": "string", "path": [ { "level": "string", "activities": "string" } ] } ],
                        "activation": {
                            "exercises": ["string"],
                            "challenges": ["string"]
                        },
                        "tracking": { "progress": "string", "milestones": ["string"] }
                    }`
                },
                {
                    role: 'user',
                    content: `User Context: "${answersContext}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({
                where: { name: 'SpiritualGiftsCenter' }
            });

            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: user?.id || 'demo_user',
                        input: { context: answersContext },
                        output: responseData,
                        duration: Date.now() - startTime,
                        metadata: { model: 'gpt-4o-mini' }
                    }
                });
            }
        } catch (error) {
            console.error("Failed to log AI interaction:", error);
        }

        return responseData;
    }
}
