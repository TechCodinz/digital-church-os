import { OpenAI } from 'openai';

export class MindBlowingRevelationEngine {
    async revealVerseDepth(params: {
        verse: string;
        userLevel: 'beginner' | 'intermediate' | 'advanced' | 'scholar';
        revealLayer: 'surface' | 'meaning' | 'connection' | 'hidden' | 'eternal';
    }) {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return {
                verse: params.verse,
                revelation: '',
                insightMoment: {},
                visualizationData: {},
                sharePrompt: '',
                available: false,
                message: 'AI-assisted depth study is unavailable because the provider is not configured. Read the passage in context and use the available licensed or public-domain translations instead.',
            };
        }

        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a Christian Bible-study assistant. Help the user examine the supplied Scripture reference at the "${params.revealLayer}" study layer for a ${params.userLevel} learner. Treat every output as study guidance, not divine revelation, prophecy, secret knowledge, or God's private will. Do not invent or quote a named Bible translation unless its exact text was supplied. Distinguish observation, historical/literary context, interpretation questions, canonical connections, and practical application. If the requested layer says "hidden" or "eternal", interpret that only as deeper literary/theological themes that can be responsibly tested from Scripture and accountable Christian scholarship. Return JSON with revelation (a clearly labeled study insight), insight_moment, and visualization.`
                },
                {
                    role: 'user',
                    content: `Scripture reference: ${params.verse}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
        });

        const data = JSON.parse(response.choices[0]?.message?.content || '{}');

        return {
            verse: params.verse,
            revelation: typeof data.revelation === 'string' ? data.revelation : '',
            insightMoment: data.insight_moment && typeof data.insight_moment === 'object' ? data.insight_moment : {},
            visualizationData: data.visualization && typeof data.visualization === 'object' ? data.visualization : {},
            sharePrompt: `Study ${params.verse} in context and compare what you notice.`,
            available: true,
            message: 'AI-generated study guidance should be checked against Scripture in context, trustworthy scholarship, and accountable church teaching.',
        };
    }
}
