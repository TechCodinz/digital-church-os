// lib/spiritual/gloryRealms.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class GloryRealmsExperience {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.guardrails = new TheologicalGuardrails();
    }

    async createGloryJourney(params: {
        user: any;
        realm: 'throne' | 'courts' | 'mountain' | 'garden';
        depth: 'shallow' | 'deep' | 'deeper' | 'deepest';
    }) {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a reverent spiritual guide leading users into deep biblical meditation on God's glory.
                    Generate a meditation journey tailored for the requested realm and depth.
                    Return a JSON object matching this schema:
                    {
                        "realm": {
                            "throne": { "description": "string", "atmosphere": "string" },
                            "courts": { "description": "string", "atmosphere": "string" },
                            "mountain": { "description": "string", "atmosphere": "string" },
                            "garden": { "description": "string", "atmosphere": "string" }
                        },
                        "glory": {
                            "levels": { "shallow": "string", "deepest": "string" },
                            "manifestations": "string"
                        },
                        "journey": {
                            "preparation": "string",
                            "ascent": "string",
                            "encounter": "string",
                            "integration": "string"
                        },
                        "keys": ["string"],
                        "community": { "fellowTravelers": "string", "testimonies": "string" }
                    }`
                },
                {
                    role: 'user',
                    content: `Realm: "${params.realm}"\nDepth: "${params.depth}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({
                where: { name: 'GloryRealmsExperience' }
            });

            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.user?.id || 'demo_user',
                        input: { realm: params.realm, depth: params.depth },
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
