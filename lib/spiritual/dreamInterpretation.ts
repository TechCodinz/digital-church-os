import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

interface DreamParams {
    userId: string;
    dream: string;
    recentLifeContext?: string;
}

interface DreamInterpretation {
    patterns: {
        biblicalThemes: string[];
        symbolicConnections: string[];
    };
    interpretation: {
        theme: string;
        explanation: string;
        scriptures: Array<{ reference: string; text: string }>;
    };
    actions: {
        pray: string;
        journal: string;
        share: string;
    };
    disclaimer: string;
}

export class DreamInterpretationCenter {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.guardrails = new TheologicalGuardrails();
    }

    async interpretDream(params: DreamParams): Promise<DreamInterpretation> {
        const startTime = Date.now();

        // 1. Generate Interpretation using OpenAI
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are a spiritually mature, biblically-grounded interpreter. 
                    Your task is to help the user understand their dream through a biblical lens, focusing on edification, encouragement, and comfort (1 Cor 14:3).
                    Do not act as a psychic or fortune teller. Focus on principles, metaphors, and scripture.
                    Return a JSON object: 
                    {
                        "patterns": { "biblicalThemes": [string], "symbolicConnections": [string] },
                        "interpretation": { "theme": string, "explanation": string, "scriptures": [ { "reference": string, "text": string } ] },
                        "actions": { "pray": string, "journal": string, "share": string }
                    }`
                },
                {
                    role: 'user',
                    content: `Dream: "${params.dream}"\nRecent Life Context: "${params.recentLifeContext || 'None provided'}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        // 2. Apply Theological Guardrails
        const safeExplanation = await this.guardrails.apply(responseData.interpretation?.explanation || '');
        responseData.interpretation.explanation = safeExplanation;

        const finalResponse: DreamInterpretation = {
            ...responseData,
            disclaimer: "Dream interpretation is subjective. Seek wisdom from mature spiritual leaders and always align with scripture."
        };

        // 3. Log Interaction to Database for Production Auditing
        try {
            // Find or create the corresponding AI Module
            const module = await prisma.aIModule.findFirst({
                where: { name: 'DreamInterpretationCenter' }
            });

            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.userId,
                        input: { dream: params.dream, context: params.recentLifeContext },
                        output: finalResponse as any,
                        duration: Date.now() - startTime,
                        metadata: { model: 'gpt-4-turbo-preview', tokens: completion.usage?.total_tokens }
                    }
                });
            }
        } catch (error) {
            console.error("Failed to log AI interaction:", error);
            // In production, we don't throw here to avoid failing the user request, but we would alert Sentry
        }

        return finalResponse;
    }
}

