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
  lyrics: {
    chorus?: string;
    verses?: string[];
    bridge?: string;
  };
  chords: string[];
  scriptureBasis: Array<{ reference: string; text: string }>;
}

const DEFAULT_SCRIPTURES = [
  { reference: 'Psalm 95:1', text: 'Come, let us sing for joy to the LORD; let us shout aloud to the Rock of our salvation.' },
  { reference: 'Colossians 3:16', text: 'Let the message of Christ dwell among you richly... singing to God with gratitude in your hearts.' },
];

export class RealWorshipGenerator {
  private openai: OpenAI | null;
  private scriptureLoader: ScriptureLoader;
  private guardrails: TheologicalGuardrails;

  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    this.scriptureLoader = new ScriptureLoader();
    this.guardrails = new TheologicalGuardrails();
  }

  async generateWorshipContent(params: WorshipParams): Promise<WorshipResponse> {
    if (!this.openai) return this.fallbackWorship(params);

    try {
      const searchResults = await this.safeScriptureSearch(params.theme, 5);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a careful worship songwriting assistant. Return JSON only: { title, lyrics: { chorus, verses: [string], bridge }, chordProgression: [string], scriptureReferences: [string] }. Keep lyrics original, congregational, scripture-informed, and theologically humble.`,
          },
          {
            role: 'user',
            content: `Theme: ${params.theme}\nStyle: ${params.style}\nMood: ${params.mood || 'reverent'}\nContextual Scriptures:\n${searchResults.map((s: any) => `${s.reference}: ${s.text}`).join('\n')}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.75,
      });

      const worshipData = JSON.parse(completion.choices[0].message.content || '{}');
      const rawLyrics = worshipData.lyrics || {};
      const safeLyrics = {
        chorus: rawLyrics.chorus ? await this.guardrails.apply(rawLyrics.chorus) : undefined,
        bridge: rawLyrics.bridge ? await this.guardrails.apply(rawLyrics.bridge) : undefined,
        verses: Array.isArray(rawLyrics.verses)
          ? await Promise.all(rawLyrics.verses.slice(0, 6).map((verse: string) => this.guardrails.apply(verse)))
          : undefined,
      };

      const verifiedVerses = await this.safeGetVerses(worshipData.scriptureReferences || []);

      return {
        title: worshipData.title || `${params.theme} (${params.style})`,
        lyrics: safeLyrics,
        chords: Array.isArray(worshipData.chordProgression) ? worshipData.chordProgression.slice(0, 12) : this.defaultChords(params.style),
        scriptureBasis: verifiedVerses.length ? verifiedVerses.map((v: any) => ({ reference: v.reference, text: v.text })) : DEFAULT_SCRIPTURES,
      };
    } catch (error) {
      console.error('Worship generation failed:', error);
      return this.fallbackWorship(params);
    }
  }

  private async safeScriptureSearch(theme: string, count: number) {
    try {
      return await this.scriptureLoader.semanticSearch(theme, count);
    } catch (error) {
      console.error('Worship scripture search failed:', error);
      return [];
    }
  }

  private async safeGetVerses(refs: string[]) {
    try {
      return await this.scriptureLoader.getVerses(refs);
    } catch (error) {
      console.error('Worship verse lookup failed:', error);
      return [];
    }
  }

  private fallbackWorship(params: WorshipParams): WorshipResponse {
    return {
      title: `${params.theme} — ${params.style} worship draft`,
      lyrics: {
        verses: [
          `We come with open hearts, remembering Your mercy in ${params.theme}.`,
          'We lift our voice together, not in pride but grateful surrender.',
        ],
        chorus: `According to scripture, we sing with gratitude; let our lives become worship, let our hearts return to You.`,
        bridge: 'Teach us to love, teach us to serve, teach us to walk humbly in Your light.',
      },
      chords: this.defaultChords(params.style),
      scriptureBasis: DEFAULT_SCRIPTURES,
    };
  }

  private defaultChords(style: string) {
    if (style === 'hymn') return ['I', 'IV', 'V', 'I'];
    if (style === 'gospel') return ['I', 'vi', 'IV', 'V', 'I'];
    return ['I', 'V', 'vi', 'IV'];
  }
}
