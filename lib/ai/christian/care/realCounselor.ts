import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { AILogger } from '@/lib/audit/aiLogger';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

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
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.scriptureLoader = new ScriptureLoader();
        this.guardrails = new TheologicalGuardrails();
    }

    async processSession(session: CounselingSession): Promise<CounselingResponse> {
        const isCrisis = this.detectCrisis(session.concern);

        if (isCrisis) {
            return this.handleCrisis();
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
