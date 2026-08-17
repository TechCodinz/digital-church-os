import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { AILogger } from '@/lib/audit/aiLogger';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';
import { hasOpenAI, extractThemes, findVersesForQuery, themeLabel } from '@/lib/ai/shared/offlineWisdom';

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
        // Construct the client only when a key exists; the offline path never uses it.
        this.openai = process.env.OPENAI_API_KEY
            ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            : (null as unknown as OpenAI);
        this.scriptureLoader = new ScriptureLoader();
        this.guardrails = new TheologicalGuardrails();
    }

    async generatePrayer(request: PrayerRequest): Promise<PrayerResponse> {
        // Offline / no-key mode: compose a scripture-grounded prayer locally so the
        // Prayer Warrior always performs beautifully without an external provider.
        if (!hasOpenAI()) {
            return this.composeOfflinePrayer(request);
        }

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

    /** Deterministic, scripture-grounded prayer used when no LLM is configured. */
    private composeOfflinePrayer(request: PrayerRequest): PrayerResponse {
        const themes = extractThemes(`${request.title} ${request.content}`, 3);
        const verses = findVersesForQuery(`${request.title} ${request.content}`, 3);
        const focus = themeLabel(themes[0]);

        const scriptureReadings = verses.map((v) => ({
            reference: v.reference,
            text: v.text,
            reflection: `This word anchors your heart in ${focus.toLowerCase()} — carry it with you as a promise you can return to today.`,
        }));

        return {
            prayer: {
                opening:
                    `Heavenly Father, we come before You concerning ${request.title.toLowerCase()}. ` +
                    `You are near to all who call on You in truth, and You already know the depths of this need.`,
                scriptureReadings,
                intercession:
                    `Lord, we lift up this request for ${focus.toLowerCase()}. Where there is worry, grant Your peace; ` +
                    `where there is weakness, be strength; where there is confusion, give clear direction. ` +
                    `Move by Your Spirit in ways seen and unseen, and let Your will be done.`,
                thanksgiving:
                    `We thank You that You hear us, that Your compassions never fail, and that they are new every morning. ` +
                    `Thank You for being a very present help in this moment.`,
                closing: `We rest in Your faithfulness and commit this into Your hands. In Jesus\u2019 name, Amen.`,
            },
            themes,
            suggestedScriptures: verses.map((v) => v.reference),
            encouragement:
                `Be encouraged: you are not carrying this alone. Return to these scriptures through the day, ` +
                `and let the peace of God guard your heart and mind.`,
        };
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
