// lib/spiritual/propheticTraining.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class PropheticMinistryCenter {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.guardrails = new TheologicalGuardrails();
    }

    async trainProphetic(params: {
        user: any;
        level: 'beginner' | 'intermediate' | 'advanced' | 'mentor';
        gifts: string[];
    }) {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert, biblically-grounded prophetic ministry trainer. 
                    Generate a training module tailored for the requested level and spiritual gifts.
                    Return a JSON object: 
                    {
                        "foundation": { "whatIsProphecy": { "definition": "string", "purpose": ["string"] }, "biblicalExamples": [ { "prophet": "string", "lesson": "string" } ], "newTestament": { "everyone": "string", "desire": "string" } },
                        "training": { "hearingGod": ["string"], "delivering": ["string"], "practice": "string" },
                        "safety": { "rules": ["string"], "testing": [ { "test": "string", "passage": "string" } ] },
                        "community": { "teams": "string", "schools": "string" },
                        "disclaimer": "Prophecy is for encouragement and edification. Always test and submit to leadership."
                    }`
                },
                {
                    role: 'user',
                    content: `Level: "${params.level}"\nGifts: "${params.gifts.join(', ')}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({
                where: { name: 'PropheticMinistryCenter' }
            });

            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.user?.id || 'demo_user',
                        input: { level: params.level, gifts: params.gifts },
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
