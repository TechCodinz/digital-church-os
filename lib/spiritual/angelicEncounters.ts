// lib/spiritual/angelicEncounters.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class AngelicEncountersCenter {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.guardrails = new TheologicalGuardrails();
    }

    async teachAboutAngels(params: {
        user: any;
        level: 'basic' | 'advanced' | 'encounter';
        experiences?: string[];
    }) {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert biblical teacher specializing in angelology.
                    Generate a training module tailored for the requested level and user experiences.
                    Return a JSON object matching this schema:
                    {
                        "basics": {
                            "whatAreAngels": { "scripture": ["string"], "description": "string", "types": ["string"] },
                            "activities": ["string"]
                        },
                        "encounters": {
                            "biblical": [ { "person": "string", "encounter": "string", "lesson": "string" } ],
                            "discernment": { "tests": ["string"], "cautions": ["string"] }
                        },
                        "activation": { "awareness": ["string"], "protocol": ["string"] },
                        "disclaimer": "Angel encounters should always point to God, not the angels. Test everything against scripture."
                    }`
                },
                {
                    role: 'user',
                    content: `Level: "${params.level}"\nExperiences: "${params.experiences?.join(', ') || 'None'}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({
                where: { name: 'AngelicEncountersCenter' }
            });

            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.user?.id || 'demo_user',
                        input: { level: params.level, experiences: params.experiences },
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
