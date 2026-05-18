import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';
import { AILogger } from '@/lib/audit/aiLogger';

interface SermonParams {
    theme: string;
    scriptureRefs: string[];
    style: 'expository' | 'topical' | 'narrative';
    denomination?: 'general' | 'reformed' | 'baptist' | 'catholic';
    audience?: 'general' | 'youth' | 'scholars';
    userId: string;
}

interface SermonResponse {
    title: string;
    theme: string;
    scriptureRefs: string[];
    outline: {
        introduction: string;
        points: Array<{
            title: string;
            scripture: string;
            explanation: string;
            application: string;
        }>;
        conclusion: string;
    };
    fullSermon?: string;
    discussionQuestions?: string[];
    visuals?: {
        image?: string | null;
        video?: string | null;
    };
}

export class RealSermonEngine {
    private openai: OpenAI;
    private scriptureLoader: ScriptureLoader;
    private guardrails: TheologicalGuardrails;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.scriptureLoader = new ScriptureLoader();
        this.guardrails = new TheologicalGuardrails();
    }

    async generateSermon(params: SermonParams): Promise<SermonResponse> {
        const startTime = Date.now();

        try {
            // 1. Retrieve relevant scriptures using semantic search
            const searchResults = await this.scriptureLoader.semanticSearch(
                params.theme,
                15
            );

            // 2. Get theological context based on denomination
            const theologicalContext = this.getTheologicalContext(
                params.denomination || 'general'
            );

            // 3. Build prompt
            const prompt = this.buildSermonPrompt(params, searchResults, theologicalContext);

            // 4. Generate with OpenAI (JSON Mode)
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: `You are a theologically trained assistant helping to generate sermons.
            
            CRITICAL RULES:
            - Always ground responses in scripture
            - Never claim divine revelation or say "God told me"
            - Never promise specific outcomes or give prophecies
            - Use phrases like "According to scripture..." and "Biblical teaching suggests..."
            - Be compassionate and encouraging
            - If asked about sensitive topics, include crisis resources
            - Maintain theological accuracy
            
            You MUST return a JSON object with the following structure:
            {
              "title": "Sermon Title",
              "introduction": "Intro text...",
              "points": [
                {
                  "title": "Point Title",
                  "scripture": "Reference (e.g. John 3:16)",
                  "explanation": "Text...",
                  "application": "Text..."
                }
              ],
              "conclusion": "Conclusion text...",
              "discussionQuestions": ["Q1", "Q2", "Q3"],
              "fullSermon": "Complete formatted sermon text..."
            }`
                    },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
            });

            const rawJson = completion.choices[0].message.content || '{}';
            const sermonData = JSON.parse(rawJson);

            // 5. Verify and fetch explicit scriptures for the points
            const references = sermonData.points.map((p: any) => p.scripture);
            const verifiedVerses = await this.scriptureLoader.getVerses(references);

            // 6. Apply guardrails to the full sermon
            const safeSermon = await this.guardrails.apply(sermonData.fullSermon || '');

            const finalSermon: SermonResponse = {
                title: sermonData.title,
                theme: params.theme,
                scriptureRefs: verifiedVerses.map(v => v.reference),
                outline: {
                    introduction: sermonData.introduction,
                    points: sermonData.points.map((p: any, i: number) => ({
                        ...p,
                        scripture: verifiedVerses[i]?.text || p.scripture
                    })),
                    conclusion: sermonData.conclusion,
                },
                fullSermon: safeSermon,
                discussionQuestions: sermonData.discussionQuestions,
            };

            // 7. Log
            await AILogger.logInteraction({
                userId: params.userId,
                module: 'sermon-engine',
                input: params,
                output: finalSermon,
                duration: Date.now() - startTime,
                model: 'gpt-4-turbo-preview',
                tokens: completion.usage?.total_tokens,
            });

            return finalSermon;

        } catch (error) {
            console.error('Sermon generation error:', error);
            throw new Error('Failed to generate sermon');
        }
    }

    private getTheologicalContext(denomination: string): string {
        const contexts: Record<string, string> = {
            general: 'Focus on core Christian doctrines accepted across denominations',
            reformed: 'Emphasize sovereignty of God, covenant theology, TULIP',
            baptist: 'Include believer\'s baptism, local church autonomy, priesthood of believers',
            catholic: 'Include sacramentality, magisterium, apostolic succession',
        };
        return contexts[denomination] || contexts.general;
    }

    private buildSermonPrompt(
        params: SermonParams,
        scriptures: any[],
        theologicalContext: string
    ): string {
        return `
      Generate a ${params.style} sermon on "${params.theme}".
      
      CONTEXT:
      - Denomination: ${params.denomination || 'general'}
      - Audience: ${params.audience || 'general'}
      - Theological guidelines: ${theologicalContext}

      RELEVANT SCRIPTURE CONTEXT:
      ${scriptures.map(s => `${s.reference}: "${s.text}"`).join('\n')}

      Please provide 3 main points.
    `;
    }
}
