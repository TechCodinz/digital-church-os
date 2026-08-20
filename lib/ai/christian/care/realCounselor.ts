import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { AILogger } from '@/lib/audit/aiLogger';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';
import { hasOpenAI, extractThemes, findVersesForQuery, themeLabel } from '@/lib/ai/shared/offlineWisdom';
import { buildTheologicalInsight, detectTone, toneVoice } from '@/lib/ai/shared/offlineTheology';

interface CounselingSession {
    userId: string;
    concern: string;
}

interface CounselingResponse {
    type: 'crisis' | 'counseling' | 'encouragement';
    content: {
        reflection: string;
        scriptures: Array<{
            reference: string;
            text: string;
            application: string;
        }>;
        practicalSteps: string[];
        resources?: any;
    };
    disclaimer: string;
}

export class RealCounselor {
    private openai: OpenAI;
    private scriptureLoader: ScriptureLoader;
    private guardrails: TheologicalGuardrails;

    private crisisKeywords = [
        'suicide', 'kill myself', 'end my life', 'want to die',
        'self-harm', 'cut myself', 'hurt myself', 'emergency',
    ];

    constructor() {
        // Construct the client only when a key exists; the offline path never uses it.
        this.openai = process.env.OPENAI_API_KEY
            ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            : (null as unknown as OpenAI);
        this.scriptureLoader = new ScriptureLoader();
        this.guardrails = new TheologicalGuardrails();
    }

    async processSession(session: CounselingSession): Promise<CounselingResponse> {
        const isCrisis = this.detectCrisis(session.concern);

        if (isCrisis) {
            return this.handleCrisis();
        }

        // Offline / no-key mode: provide scripture-based encouragement locally.
        if (!hasOpenAI()) {
            return this.composeOfflineCounsel(session);
        }

        const searchResults = await this.scriptureLoader.semanticSearch(session.concern, 8);
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are providing spiritual encouragement and scripture-based counsel. 
          Return JSON object: { reflection, scriptureReferences: [string], practicalSteps: [string] }`
                },
                {
                    role: 'user',
                    content: `Concern: ${session.concern}\nContextual Scriptures:\n${searchResults.map(s => `${s.reference}: ${s.text}`).join('\n')}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const responseData = JSON.parse(completion.choices[0].message.content || '{}');
        const verifiedVerses = await this.scriptureLoader.getVerses(responseData.scriptureReferences || []);

        // Apply guardrails to reflection
        const safeReflection = await this.guardrails.apply(responseData.reflection || '');

        await AILogger.logCounselingSession({
            userId: session.userId,
            concern: session.concern,
            riskLevel: 'low',
            responseType: 'counseling',
        });

        return {
            type: 'counseling',
            content: {
                reflection: safeReflection,
                scriptures: verifiedVerses.filter((v): v is { reference: string; text: string } => v !== null).map(v => ({
                    reference: v.reference,
                    text: v.text,
                    application: "This direct word from scripture speaks to the heart of your concern."
                })),
                practicalSteps: responseData.practicalSteps || []
            },
            disclaimer: "This AI provides spiritual support and does not replace professional therapy."
        };
    }

    /**
     * Scripture-grounded pastoral counsel used when no LLM is configured.
     * Reads emotional tone, then answers with original-language depth and a
     * cross-reference chain — using verses more richly than a surface reply.
     */
    private composeOfflineCounsel(session: CounselingSession): CounselingResponse {
        const themes = extractThemes(session.concern, 3);
        const focus = themeLabel(themes[0]);
        const tone = detectTone(session.concern);
        const voice = toneVoice(tone);
        const insight = buildTheologicalInsight(session.concern);
        const word = insight.wordStudies[0];

        const reflection =
            `${voice.opener} ` +
            `What you\u2019re carrying touches on ${focus.toLowerCase()}, and Scripture meets it with more than sentiment. ` +
            `In the original language, the ${word.language} word \u201C${word.translit}\u201D (${word.gloss}) shows us that ${word.insight} ` +
            `${insight.exegesis} ` +
            `You don\u2019t have to resolve everything today \u2014 take the next faithful step, and let His presence steady you.`;

        return {
            type: 'counseling',
            content: {
                reflection,
                // Cross-reference chain (Scripture interpreting Scripture).
                scriptures: insight.crossReferences.map((v) => ({
                    reference: v.reference,
                    text: v.text,
                    application: `Part of the thread on ${focus.toLowerCase()} \u2014 let it interpret the others.`,
                })),
                practicalSteps: [
                    `Pray this back to God in your own words, naming ${focus.toLowerCase()} honestly.`,
                    `Meditate on \u201C${word.translit}\u201D today \u2014 ask God to make that wholeness real in you.`,
                    'Reach out to one trusted person in your community this week \u2014 you were not meant to carry this alone.',
                    'If the weight is heavy or persistent, speak with a pastor or licensed counselor for ongoing support.',
                ],
            },
            disclaimer: 'This AI provides spiritual support and does not replace professional therapy.',
        };
    }

    private detectCrisis(text: string): boolean {
        return this.crisisKeywords.some(kw => text.toLowerCase().includes(kw));
    }

    private handleCrisis(): CounselingResponse {
        return {
            type: 'crisis',
            content: {
                reflection: "I hear that you're going through an extremely difficult time. Please reach out for help immediately.",
                scriptures: [{ reference: "Psalm 34:18", text: "The LORD is close to the brokenhearted...", application: "God is with you now." }],
                practicalSteps: ["Call 988 (Crisis Lifeline)", "Text HOME to 741741", "Call 911 if in immediate danger"],
                resources: { emergency: "911", suicideLifeline: "988" }
            },
            disclaimer: "CRISIS RESPONSE: Seek immediate professional help."
        };
    }
}
