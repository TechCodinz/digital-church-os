import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { AILogger } from '@/lib/audit/aiLogger';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

interface PrayerRequest {
    userId: string;
    title: string;
    content: string;
    urgency?: 'low' | 'medium' | 'high';
}

interface PrayerResponse {
    prayer: {
        opening: string;
        scriptureReadings: Array<{
            reference: string;
            text: string;
            reflection: string;
        }>;
        intercession: string;
        thanksgiving: string;
        closing: string;
    };
    themes: string[];
    suggestedScriptures: string[];
    encouragement: string;
    visuals?: {
        image?: string | null;
        video?: string | null;
    };
}

export class RealPrayerWarrior {
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

    async generatePrayer(request: PrayerRequest): Promise<PrayerResponse> {
        // 1. Analyze themes
        const themes = await this.analyzeThemes(request.content);

        // 2. Find scriptures
        const searchResults = await this.scriptureLoader.semanticSearch(
            `${themes.join(' ')} ${request.content}`,
            5
        );

        // 3. Compose prayer (JSON Mode)
        const rawRes = await this.composePrayer(request, searchResults);

        // Apply guardrails to blocks
        const safeOpening = await this.guardrails.apply(rawRes.prayer.opening || '');
        const safeIntercession = await this.guardrails.apply(rawRes.prayer.intercession || '');
        const safeThanksgiving = await this.guardrails.apply(rawRes.prayer.thanksgiving || '');
        const safeClosing = await this.guardrails.apply(rawRes.prayer.closing || '');
        const safeEncouragement = await this.guardrails.apply(rawRes.encouragement || '');

        // 4. Verify and fetch explicit scriptures
        const references = rawRes.prayer.scriptureReadings.map((r: any) => r.reference);
        const verifiedVerses = await this.scriptureLoader.getVerses(references);

        const finalResponse: PrayerResponse = {
            prayer: {
                opening: safeOpening,
                intercession: safeIntercession,
                thanksgiving: safeThanksgiving,
                closing: safeClosing,
                scriptureReadings: rawRes.prayer.scriptureReadings.map((r: any, i: number) => ({
                    ...r,
                    text: verifiedVerses[i]?.text || r.text
                }))
            },
            themes,
            suggestedScriptures: verifiedVerses.filter((v): v is { reference: string; text: string } => v !== null).map(v => v.reference),
            encouragement: safeEncouragement
        };

        // 5. Log
        await AILogger.logInteraction({
            userId: request.userId,
            module: 'prayer-warrior',
            input: request,
            output: finalResponse,
        });

        return finalResponse;
    }

    private async analyzeThemes(content: string): Promise<string[]> {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Extract spiritual prayer themes from this request. Return as comma-separated list.'
                },
                { role: 'user', content }
            ],
            temperature: 0.3,
            max_tokens: 100,
        });

        return completion.choices[0].message.content?.split(',').map(t => t.trim()) || [];
    }

    private async composePrayer(
        request: PrayerRequest,
        scriptures: any[]
    ): Promise<any> {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are composing a structured, compassionate prayer.
          
          RULES:
          - Use provided scriptures
          - Be personal and grounded
          - Return JSON format with: opening, scriptureReadings (array), intercession, thanksgiving, closing, encouragement.`
                },
                {
                    role: 'user',
                    content: `
            Request: ${request.title} - ${request.content}
            Scriptures: ${scriptures.map(s => `${s.reference}: ${s.text}`).join('\n')}
          `
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        return JSON.parse(completion.choices[0].message.content || '{}');
    }
}
