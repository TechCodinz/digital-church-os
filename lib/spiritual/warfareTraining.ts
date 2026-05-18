// lib/spiritual/warfareTraining.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class SpiritualWarfareTraining {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.guardrails = new TheologicalGuardrails();
    }

    async createWarfareTraining(params: {
        user: any;
        level: 'beginner' | 'intermediate' | 'advanced' | 'warrior';
        battles: string[];
    }) {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert biblical teacher on spiritual warfare (Ephesians 6).
                    Generate a training module tailored for the requested level and specific spiritual battles.
                    Return a JSON object matching this schema:
                    {
                        "armorOfGod": {
                            "beltOfTruth": { "lessons": ["string"], "exercises": ["string"] },
                            "breastplateOfRighteousness": { "lessons": ["string"], "exercises": ["string"] },
                            "shoesOfPeace": { "lessons": ["string"], "exercises": ["string"] },
                            "shieldOfFaith": { "lessons": ["string"], "exercises": ["string"] },
                            "helmetOfSalvation": { "lessons": ["string"], "exercises": ["string"] },
                            "swordOfSpirit": { "lessons": ["string"], "exercises": ["string"] }
                        },
                        "prayerTypes": {
                            "binding": { "scripture": "string", "examples": ["string"], "prayers": ["string"] },
                            "loosing": { "scripture": "string", "examples": ["string"], "prayers": ["string"] },
                            "standing": { "scripture": "string", "examples": ["string"], "prayers": ["string"] },
                            "intercession": { "scripture": "string", "examples": ["string"], "prayers": ["string"] }
                        },
                        "scenarios": [ { "name": "string", "training": ["string"], "simulations": "string" } ],
                        "declarations": ["string"],
                        "support": { "prayerPartners": "string", "accountability": "string", "emergencyPrayer": "string" }
                    }`
                },
                {
                    role: 'user',
                    content: `Level: "${params.level}"\nBattles: "${params.battles.join(', ')}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({
                where: { name: 'SpiritualWarfareTraining' }
            });

            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.user?.id || 'demo_user',
                        input: { level: params.level, battles: params.battles },
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
