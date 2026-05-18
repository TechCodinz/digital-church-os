// lib/spiritual/holySpiritGuidance.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class HolySpiritGuidanceSystem {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.guardrails = new TheologicalGuardrails();
    }

    async provideGuidance(params: {
        user: any;
        situation: string;
        prayerHistory: any[];
        scriptureEngagement: any[];
        spiritualGifts: string[];
    }) {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a spiritually mature, biblically-grounded guidance counselor.
                    Help the user discern the Holy Spirit's guidance in their situation using biblical principles.
                    DO NOT act as a psychic or give definitive prescriptive commands. Offer wise counsel and promptings.
                    Return a JSON object:
                    {
                        "scriptureGuidance": { "verse": { "reference": "string", "text": "string" }, "principle": "string", "application": "string", "caution": "string" },
                        "promptings": ["string"],
                        "peaceCheck": { "question": "string", "indicators": ["string"] },
                        "confirmations": ["string"],
                        "prayerFocus": "string",
                        "steps": ["string"]
                    }`
                },
                {
                    role: 'user',
                    content: `Situation: "${params.situation}"\nSpiritual Gifts: "${params.spiritualGifts.join(', ')}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({ where: { name: 'HolySpiritGuidanceSystem' } });
            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.user?.id || 'demo_user',
                        input: { situation: params.situation, gifts: params.spiritualGifts },
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
