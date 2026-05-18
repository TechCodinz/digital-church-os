// lib/curriculum/curriculumEngine.ts
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';

export class CurriculumEngine {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async createCurriculum(params: any) {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert digital theologian. Construct a comprehensive curriculum for the requested level and focus.
                    Return a JSON object matching this schema:
                    {
                        "overview": { "title": "string", "duration": "string", "outcomes": ["string"], "prerequisites": "string" },
                        "modules": [ { "id": "string", "title": "string", "duration": "string", "lessons": number } ],
                        "learningPaths": { "visual": "string", "auditory": "string", "reading": "string", "kinesthetic": "string" },
                        "content": { "videos": number, "audios": number, "readings": number, "exercises": number, "quizzes": number, "projects": number },
                        "liveSessions": ["string"],
                        "community": { "studyGroups": ["string"], "discussionForums": "string", "mentorship": "string", "peerReview": boolean },
                        "progress": { "milestones": ["string"], "achievements": ["string"], "badges": ["string"], "certificates": ["string"] },
                        "assessment": { "quizzes": "string", "exams": "string", "projects": "string", "presentations": "string", "finalExam": "string" },
                        "certification": { "requirements": "string", "exam": "string", "project": "string", "interview": "string", "certificate": "string" }
                    }`
                },
                {
                    role: 'user',
                    content: `Level: "${params.level}"\nFocus: "${params.focus?.join(', ')}"\nDuration: "${params.duration}"\nCertification Required: ${params.certification}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        const responseData = JSON.parse(rawResponse);
        responseData.overview.lessons = await this.generateLessons(params);

        return responseData;
    }

    async generateLessons(params: any) {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Generate a list of 5 progressive lessons for a curriculum focused on: ${params.focus?.join(', ')}.
                    Return JSON: { "lessons": [ { "title": "string", "objectives": ["string"], "scriptures": ["string"], "content": "string", "activities": ["string"], "assessment": "string", "resources": ["string"] } ] }`
                },
                { role: 'user', content: 'Generate the curriculum lessons.' }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        return JSON.parse(completion.choices[0].message.content || '{"lessons":[]}').lessons;
    }
}
