// lib/children/prayerRoom.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

export class ChildrenPrayerRoom {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.guardrails = new TheologicalGuardrails();
    }

    async createChildPrayerSpace(params: {
        childId: string;
        age: number;
        mood: 'happy' | 'sad' | 'scared' | 'excited' | 'worried';
        prayerType: 'thanks' | 'help' | 'sorry' | 'someone' | 'anything';
    }) {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert children's pastor. Design a magical, age-appropriate digital prayer experience.
                    Return a JSON object:
                    {
                        "environment": { "theme": "string", "background": "string", "music": "string", "characters": ["string"] },
                        "guidance": {
                            "format": "string", "method": "string", "duration": "string",
                            "prompts": [ { "image": "string (optional emoji)", "start": "string (optional)", "prayer": "string (short prayer prompt)" } ]
                        },
                        "tracking": { "prayerStreak": number, "prayerGarden": "string" },
                        "rewards": { "points": number, "badge": "string", "gardenFlower": "string" }
                    }`
                },
                {
                    role: 'user',
                    content: `Child Age: ${params.age}\nMood: "${params.mood}"\nPrayer Type: "${params.prayerType}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({ where: { name: 'ChildrenPrayerRoom' } });
            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.childId || 'demo_child',
                        input: { age: params.age, mood: params.mood, prayerType: params.prayerType },
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
