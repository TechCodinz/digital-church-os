import { ScriptureLoader } from '@/lib/ai/scripture/loader';

export interface ScriptureReading {
    reference: string;
    text: string;
    context?: string;
}

export class RealScriptureReader {
    private scriptureLoader: ScriptureLoader;

    constructor() {
        this.scriptureLoader = new ScriptureLoader();
    }

    async readScripture(reference: string): Promise<ScriptureReading> {
        try {
            const verse = await this.scriptureLoader.getVerse(reference);
            if (!verse) {
                // Fallback to semantic search if direct reference fails
                const searchResults = await this.scriptureLoader.semanticSearch(reference, 1);
                if (searchResults.length > 0) {
                    return {
                        reference: (searchResults[0].reference as string) || reference,
                        text: (searchResults[0].text as string) || '',
                        context: "Provided based on thematic relevance to your search."
                    };
                }
                throw new Error("Scripture not found");
            }

            return {
                reference: verse.reference,
                text: verse.text,
                context: "Direct biblical citation."
            };
        } catch (error) {
            console.error("ScriptureReader error:", error);
            throw error;
        }
    }

    async getThemedVerses(theme: string, count: number = 3): Promise<ScriptureReading[]> {
        const searchResults = await this.scriptureLoader.semanticSearch(theme, count);
        return searchResults.map(s => ({
            reference: (s.reference as string) || theme,
            text: (s.text as string) || '',
            context: "Semantically matched to your theme."
        }));
    }
}
