import { OpenAI } from 'openai';
import { prisma } from '../prisma';

export class PersonalizedDepthDiscovery {
    async discoverPersonalDepths(userId: string) {
        // 1. Analyze user's spiritual profile
        const spiritualProfile = await this.analyzeSpiritualProfile(userId);

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // 2. Identify gaps and find tailored verses via AI
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a Personal Spiritual Architect. Analyze the user's profile, identify knowledge gaps, and find mind-blowing verses that will fill those gaps with depth. Provide a learning path (translations, word studies, context) for each."
                },
                {
                    role: "user",
                    content: `User Profile: ${JSON.stringify(spiritualProfile)}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');

        return {
            currentLevel: spiritualProfile.level,
            discoveries: data.discoveries || [],
            progress: data.progress_summary || "",
        };
    }

    private async analyzeSpiritualProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                prayerRequests: true,
                journalEntries: true,
                aiInteractions: true,
                goals: true,
                activities: true
            }
        });

        if (!user) return { level: 1, interests: [] };

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Analyze the provided spiritual data of a user. Determine their maturity level (1-5), strengths, gaps, and areas of interest. Return JSON."
                },
                {
                    role: "user",
                    content: `Prayers: ${user.prayerRequests.length}, Journals: ${user.journalEntries.length}, AI Chats: ${user.aiInteractions.length}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content || '{}');
        return {
            level: analysis.level || 1,
            interests: analysis.interests || [],
            gaps: analysis.gaps || [],
            raw: analysis
        };
    }
}
