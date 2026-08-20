import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
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
        const themes = await this.analyzeThemes(request.content);
        const searchResults = await this.scriptureLoader.semanticSearch(
            `${themes.join(' ')} ${request.content}`,
            5
        );

        const rawRes = await this.composePrayer(request, searchResults);
        const rawPrayer = rawRes?.prayer && typeof rawRes.prayer === 'object' ? rawRes.prayer : {};
        const rawReadings = Array.isArray(rawPrayer.scriptureReadings) ? rawPrayer.scriptureReadings : [];

        const safeOpening = await this.guardrails.apply(String(rawPrayer.opening || ''));
        const safeIntercession = await this.guardrails.apply(String(rawPrayer.intercession || ''));
        const safeThanksgiving = await this.guardrails.apply(String(rawPrayer.thanksgiving || ''));
        const safeClosing = await this.guardrails.apply(String(rawPrayer.closing || ''));
        const safeEncouragement = await this.guardrails.apply(String(rawRes?.encouragement || ''));

        const references = rawReadings
            .map((reading: any) => typeof reading?.reference === 'string' ? reading.reference.trim() : '')
            .filter(Boolean)
            .slice(0, 5);
        const verifiedVerses = references.length ? await this.scriptureLoader.getVerses(references) : [];

        const scriptureReadings = rawReadings.slice(0, 5).map((reading: any, index: number) => ({
            reference: verifiedVerses[index]?.reference || String(reading?.reference || ''),
            text: verifiedVerses[index]?.text || '',
            reflection: String(reading?.reflection || ''),
        })).filter((reading: any) => reading.reference);

        return {
            prayer: {
                opening: safeOpening,
                intercession: safeIntercession,
                thanksgiving: safeThanksgiving,
                closing: safeClosing,
                scriptureReadings,
            },
            themes: themes.slice(0, 6),
            suggestedScriptures: verifiedVerses.map((verse) => verse.reference),
            encouragement: safeEncouragement,
        };
    }

    private async analyzeThemes(content: string): Promise<string[]> {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Extract a short list of broad Christian prayer themes. Do not diagnose, infer hidden spiritual causes, claim revelation, or add details not stated by the user. Return comma-separated themes only.'
                },
                { role: 'user', content }
            ],
            temperature: 0.2,
            max_tokens: 80,
        });

        return (completion.choices[0].message.content || '')
            .split(',')
            .map((theme) => theme.trim())
            .filter(Boolean)
            .slice(0, 6);
    }

    private async composePrayer(request: PrayerRequest, scriptures: any[]): Promise<any> {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `Compose a compassionate Christian prayer draft as a writing aid.

BOUNDARIES:
- Use only the user's stated situation and provided Scripture material.
- Do not claim to speak for God, receive revelation, prophesy, diagnose, identify demons/curses, promise healing, or guarantee outcomes.
- Do not impersonate a pastor, counselor, clinician, prophet, or emergency service.
- Do not present generated commentary as Scripture.
- Keep language humble, prayerful, and suitable for human review.
- Return JSON with: prayer.opening, prayer.scriptureReadings (array of {reference, reflection}), prayer.intercession, prayer.thanksgiving, prayer.closing, encouragement.`
                },
                {
                    role: 'user',
                    content: `Request: ${request.title} - ${request.content}\nScripture candidates: ${scriptures.map((item) => `${item.reference}: ${item.text}`).join('\n')}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6,
        });

        return JSON.parse(completion.choices[0].message.content || '{}');
    }
}
