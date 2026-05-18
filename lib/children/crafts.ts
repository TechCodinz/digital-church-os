// lib/children/crafts.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';

export class ChildrenCrafts {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async createBibleCraft(params: {
        story: string;
        ageGroup: string;
        materials: 'household' | 'basic' | 'advanced';
        timeAvailable: number;
    }) {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert children's ministry craft designer.
                    Generate a biblical craft perfectly tailored for the given story, age group, available materials, and time constraint. Ensure it's safe and practical.
                    Return a JSON object:
                    {
                        "craftName": "string",
                        "materialsNeeded": ["string"],
                        "steps": ["string"],
                        "estimatedTime": "string",
                        "biblicalLearning": "string",
                        "safetyWarning": "string (if any, else none)"
                    }`
                },
                {
                    role: 'user',
                    content: `Story: "${params.story}"\nAge Group: "${params.ageGroup}"\nAvailable Materials: "${params.materials}"\nTime Available: ${params.timeAvailable} minutes`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        return JSON.parse(rawResponse);
    }

    async generateActivityIdeas(params: any) {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert children's pastor. Generate quick family-friendly biblical activities.
                    Return JSON: {"solo": ["string"], "group": ["string"], "family": ["string"], "outdoor": ["string"], "quiet": ["string"], "active": ["string"]}`
                },
                { role: 'user', content: 'Generate new activities for this week.' }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.9,
        });

        return JSON.parse(completion.choices[0].message.content || '{}');
    }
}
