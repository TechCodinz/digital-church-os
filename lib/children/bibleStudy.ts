import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

interface ChildStudyParams {
    userId: string;
    childName: string;
    ageGroup: 'toddler' | 'preschool' | 'early-elementary' | 'upper-elementary' | 'preteen';
    bibleStory: string;
}

interface InteractiveStoryData {
    storyText: string;
    choices: Array<{
        moment: string;
        options: string[];
        consequences: string;
        lesson: string;
    }>;
    activities: string[];
    parentGuide: string;
}

export class ChildrenBibleStudy {
    private openai: OpenAI;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.guardrails = new TheologicalGuardrails();
    }

    async generateInteractiveStory(params: ChildStudyParams): Promise<InteractiveStoryData> {
        const startTime = Date.now();

        // 1. Generate Interactive Story using OpenAI
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert children's pastor and storyteller. Your task is to generate an engaging, biblically accurate interactive story based on the requested Bible story.
                    The story must be perfectly tailored to the requested age group in language, complexity, and lesson depth.
                    Return a JSON object:
                    {
                        "storyText": "Full engaging story text with the child's name integrated",
                        "choices": [ { "moment": "A point in the story", "options": ["Choice A", "Choice B"], "consequences": "What happens", "lesson": "The biblical takeaway" } ],
                        "activities": ["Ages-appropriate craft or activity 1", "Activity 2"],
                        "parentGuide": "A short guide for parents on how to discuss this story with their child"
                    }`
                },
                {
                    role: 'user',
                    content: `Bible Story: "${params.bibleStory}"\nChild Name: "${params.childName}"\nAge Group: "${params.ageGroup}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);

        // 2. Apply Theological Guardrails to ensure biblical accuracy
        const safeStoryText = await this.guardrails.apply(responseData.storyText || '');
        responseData.storyText = safeStoryText;

        const finalResponse: InteractiveStoryData = responseData as InteractiveStoryData;

        // 3. Log Interaction to Database for Progress Tracking and Auditing
        try {
            const module = await prisma.aIModule.findFirst({
                where: { name: 'ChildrenBibleStudy' }
            });

            if (module) {
                await prisma.aIInteraction.create({
                    data: {
                        moduleId: module.id,
                        userId: params.userId,
                        input: { bibleStory: params.bibleStory, childName: params.childName, ageGroup: params.ageGroup },
                        output: finalResponse as any,
                        duration: Date.now() - startTime,
                        metadata: { model: 'gpt-4-turbo-preview', tracking: 'child_spiritual_growth' }
                    }
                });
            }
        } catch (error) {
            console.error("Failed to log AI story interaction:", error);
        }

        return finalResponse;
    }
}

