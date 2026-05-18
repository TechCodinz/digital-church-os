// lib/spiritual/eternityFocus.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class EternityFocusCenter {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.guardrails = new TheologicalGuardrails();
    }

    async createEternityJourney(user: any) {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an encouraging pastoral guide helping users maintain an eternal perspective.
                    Generate a biblical meditation on heaven, legacy, and eternal living.
                    Return a JSON object:
                    {
                        "perspective": {
                            "timeVsEternity": { "lesson": "string", "scripture": ["string"] },
                            "treasuresInHeaven": { "lesson": "string", "scripture": ["string"] }
                        },
                        "heaven": {
                            "whatWeKnow": ["string"],
                            "scripture": [ { "reference": "string", "text": "string" } ],
                            "testimonies": "string"
                        },
                        "eternalLiving": { "dailyPractices": ["string"], "investments": "string" },
                        "legacy": { "spiritual": "string", "family": "string", "ministry": "string" },
                        "readiness": { "signs": "string", "preparedness": "string" },
                        "grief": { "hope": "string", "reunion": "string" },
                        "community": { "heavenFocused": "string", "griefSupport": "string" }
                    }`
                },
                {
                    role: 'user',
                    content: `Generate an eternity focus journey for meditation.`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({ where: { name: 'EternityFocusCenter' } });
            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: user?.id || 'demo_user',
                        input: { action: 'eternity_meditation' },
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
