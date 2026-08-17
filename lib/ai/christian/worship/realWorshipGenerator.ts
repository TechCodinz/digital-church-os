import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';
import { hasOpenAI, findVersesForQuery } from '@/lib/ai/shared/offlineWisdom';

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
        // Construct the client only when a key exists; the offline path never uses it.
        this.openai = process.env.OPENAI_API_KEY
            ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            : (null as unknown as OpenAI);
        this.scriptureLoader = new ScriptureLoader();
        this.guardrails = new TheologicalGuardrails();
    }

    async generateWorshipContent(params: WorshipParams): Promise<WorshipResponse> {
        // Offline / no-key mode: craft a scripture-based song locally.
        if (!hasOpenAI()) {
            return this.composeOfflineWorship(params);
        }

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

    /** Scripture-based worship song used when no LLM is configured. */
    private composeOfflineWorship(params: WorshipParams): WorshipResponse {
        const verses = findVersesForQuery(params.theme, 3);
        const t = params.theme;
        const chordSets: Record<string, string[]> = {
            gospel: ['C', 'F', 'G', 'Am', 'Dm', 'G7'],
            contemporary: ['G', 'D', 'Em', 'C'],
            hymn: ['D', 'A', 'Bm', 'G', 'A7'],
            worship: ['E', 'B', 'C#m', 'A'],
        };

        return {
            title: `${t} Rising (${params.style})`,
            lyrics: {
                chorus:
                    `${t} is rising, like the morning sun\n` +
                    `In Your presence, Lord, my fears are undone\n` +
                    `I will lift my voice, I will not be afraid\n` +
                    `For Your love endures, and Your promise stays`,
                verses: [
                    `In the quiet of the morning, I remember who You are\n` +
                        `Faithful through the seasons, You have never been afar`,
                    `When the shadows gather \u2019round me, still my heart will testify\n` +
                        `That Your mercy meets me daily, and Your grace will not run dry`,
                ],
                bridge:
                    `Holy, holy, worthy is the Lamb\n` +
                    `Every breath within me sings of who You am\n` +
                    `${t} forever, anchored in Your name`,
            },
            chords: chordSets[params.style] || chordSets.worship,
            scriptureBasis: verses.map((v) => ({ reference: v.reference, text: v.text })),
        };
    }
}
