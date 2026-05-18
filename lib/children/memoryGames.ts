// lib/children/memoryGames.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';

export class BibleMemoryGames {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async createMemoryGame(params: {
        childId: string;
        age: number;
        verse: string;
        difficulty: 'easy' | 'medium' | 'hard';
        gameType: 'match' | 'puzzle' | 'race' | 'challenge';
    }) {
        const startTime = Date.now();
        const ageGroup = this.getAgeGroup(params.age);

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert children's ministry game designer.
                    Design a Bible memory game for the given verse tailored to the child's age group, requested game type, and difficulty.
                    Return a JSON object:
                    {
                        "game": { "type": "string", "elements": [{"item": "string", "text": "string"}], "timeLimit": "string", "rewards": "string" },
                        "progress": { "attempts": number, "mastered": boolean },
                        "rewards": { "completion": "string", "streak": number, "mastery": "string" },
                        "nextVerse": "string (A good logical next verse to learn)"
                    }`
                },
                {
                    role: 'user',
                    content: `Verse: "${params.verse}"\nAge Group: "${ageGroup}"\nGame Type: "${params.gameType}"\nDifficulty: "${params.difficulty}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        try {
            const module = await prisma.aIModule.findFirst({ where: { name: 'BibleMemoryGames' } });
            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.childId || 'demo_child',
                        input: { age: params.age, verse: params.verse, gameType: params.gameType, difficulty: params.difficulty },
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

    private getAgeGroup(age: number) {
        if (age <= 3) return 'toddler';
        if (age <= 5) return 'preschool';
        if (age <= 8) return 'elementary';
        return 'preteen';
    }
}
