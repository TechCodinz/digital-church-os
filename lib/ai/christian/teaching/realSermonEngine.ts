import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';
import { AILogger } from '@/lib/audit/aiLogger';
import { hasOpenAI, findVersesForQuery } from '@/lib/ai/shared/offlineWisdom';

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
        // Construct the client only when a key exists; the offline path never uses it.
        this.openai = process.env.OPENAI_API_KEY
            ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            : (null as unknown as OpenAI);
        this.scriptureLoader = new ScriptureLoader();
        this.guardrails = new TheologicalGuardrails();
    }

    async generateSermon(params: SermonParams): Promise<SermonResponse> {
        const startTime = Date.now();

        // Offline / no-key mode: build a structured, scripture-anchored sermon locally.
        if (!hasOpenAI()) {
            return this.composeOfflineSermon(params);
        }

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
                scriptureRefs: verifiedVerses.filter((v): v is { reference: string; text: string } => v !== null).map(v => v.reference),
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

    /** Structured, scripture-anchored sermon used when no LLM is configured. */
    private composeOfflineSermon(params: SermonParams): SermonResponse {
        const verses = findVersesForQuery(params.theme, 4);
        const [v1, v2, v3] = verses;
        const title = `${params.theme}: Anchored in the Word`;

        const points = [
            {
                title: `The Invitation of ${params.theme}`,
                scripture: v1?.text || '',
                explanation:
                    `According to scripture, ${params.theme.toLowerCase()} begins with God\u2019s initiative toward us. ` +
                    `The passage reminds us that we respond to a God who first reached out in love.`,
                application:
                    `This week, name one area where you can respond to God\u2019s invitation regarding ${params.theme.toLowerCase()}.`,
            },
            {
                title: `The Foundation Beneath ${params.theme}`,
                scripture: v2?.text || '',
                explanation:
                    `Biblical teaching suggests that ${params.theme.toLowerCase()} is not built on feelings but on the ` +
                    `unchanging character of God. When circumstances shift, His faithfulness does not.`,
                application: 'Identify one truth from this passage to rehearse when doubt or pressure rises.',
            },
            {
                title: `Living Out ${params.theme}`,
                scripture: v3?.text || '',
                explanation:
                    `Scripture teaches that genuine faith produces fruit. ${params.theme} is meant to be lived ` +
                    `in community, shaping how we love God and neighbor.`,
                application: 'Choose one concrete act of obedience or generosity to practice before next gathering.',
            },
        ];

        const introduction =
            `Every heart longs for something steady. Today we explore ${params.theme.toLowerCase()} \u2014 not as an ` +
            `abstract idea, but as a living reality rooted in Scripture and available to every believer.`;
        const conclusion =
            `May you leave anchored in ${params.theme.toLowerCase()}, trusting the God who keeps His promises. ` +
            `Take these truths into your week and watch how He proves faithful.`;

        const fullSermon = [
            `# ${title}`,
            '',
            `## Introduction`,
            introduction,
            '',
            ...points.flatMap((p) => [`## ${p.title}`, `> ${p.scripture}`, p.explanation, `**Application:** ${p.application}`, '']),
            `## Conclusion`,
            conclusion,
        ].join('\n');

        return {
            title,
            theme: params.theme,
            scriptureRefs: verses.map((v) => v.reference),
            outline: { introduction, points, conclusion },
            fullSermon,
            discussionQuestions: [
                `Where do you most need ${params.theme.toLowerCase()} in this season?`,
                'Which of today\u2019s passages spoke to you most, and why?',
                'What is one practical step you\u2019ll take this week in response?',
            ],
        };
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
