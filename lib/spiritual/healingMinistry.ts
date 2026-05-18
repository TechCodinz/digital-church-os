// lib/spiritual/healingMinistry.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class HealingMinistryCenter {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.guardrails = new TheologicalGuardrails();
    }

    async createHealingJourney(params: {
        user: any;
        need: 'physical' | 'emotional' | 'spiritual' | 'deliverance';
        condition: string;
        history: any[];
    }) {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a compassionate, deeply biblical healing ministry guide. 
                    Generate a healing journey tailored to the user's condition and need. Always emphasize that this complements, but does not replace, medical care.
                    Return a JSON object matching this schema:
                    {
                        "foundation": {
                            "godsWill": { "scripture": ["string"], "truth": "string" },
                            "faithAndHealing": { "role": "string", "examples": ["string"] }
                        },
                        "physical": {
                            "prayers": ["string"],
                            "scriptures": [ { "reference": "string", "text": "string" } ],
                            "declarations": ["string"]
                        },
                        "emotional": {
                            "process": ["string"],
                            "prayers": ["string"]
                        },
                        "deliverance": {
                            "process": ["string"],
                            "aftercare": "string"
                        },
                        "professional": { "medical": "string", "disclaimer": "string" },
                        "disclaimer": "This ministry supports but does not replace professional medical care. Always continue medical treatment."
                    }`
                },
                {
                    role: 'user',
                    content: `Need: "${params.need}"\nCondition: "${params.condition}"\nHistory: "${params.history?.join(', ') || 'None'}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({
                where: { name: 'HealingMinistryCenter' }
            });

            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.user?.id || 'demo_user',
                        input: { need: params.need, condition: params.condition, history: params.history },
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
