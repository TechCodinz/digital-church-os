import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

interface WorshipParams {
    theme: string;
    style: 'gospel' | 'contemporary' | 'hymn' | 'worship';
    mood?: string;
}

interface WorshipResponse {
    title: string;
    lyrics: any;
    chords: string[];
    scriptureBasis: any[];
}

export class RealWorshipGenerator {
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

    async generateWorshipContent(params: WorshipParams): Promise<WorshipResponse> {
        const searchResults = await this.scriptureLoader.semanticSearch(params.theme, 5);
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are a worship songwriter. 
          Return JSON object: { title, lyrics: { chorus, verses: [string], bridge }, chordProgression: [string], scriptureReferences: [string] }`
                },
                {
                    role: 'user',
                    content: `Theme: ${params.theme}\nStyle: ${params.style}\nContextual Scriptures:\n${searchResults.map(s => `${s.reference}: ${s.text}`).join('\n')}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
        });

        const worshipData = JSON.parse(completion.choices[0].message.content || '{}');

        // Apply guardrails to lyrics
        if (worshipData.lyrics) {
            if (worshipData.lyrics.chorus) worshipData.lyrics.chorus = await this.guardrails.apply(worshipData.lyrics.chorus);
            if (worshipData.lyrics.bridge) worshipData.lyrics.bridge = await this.guardrails.apply(worshipData.lyrics.bridge);
            if (worshipData.lyrics.verses) {
                worshipData.lyrics.verses = await Promise.all(
                    worshipData.lyrics.verses.map((v: string) => this.guardrails.apply(v))
                );
            }
        }

        const verifiedVerses = await this.scriptureLoader.getVerses(worshipData.scriptureReferences || []);

        return {
            title: worshipData.title || `${params.theme} (${params.style})`,
            lyrics: worshipData.lyrics,
            chords: worshipData.chordProgression || [],
            scriptureBasis: verifiedVerses.filter((v): v is { reference: string; text: string } => v !== null).map(v => ({ reference: v.reference, text: v.text })),
        };
    }
}
