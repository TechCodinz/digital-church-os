import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as fs from 'fs';
import * as path from 'path';
import { hasOpenAI, findVersesForQuery, getLocalVerse } from '@/lib/ai/shared/offlineWisdom';

interface BibleVerse {
    reference: string;
    text: string;
    book: string;
    chapter: number;
    verse: number;
    translation: string;
}

export class ScriptureLoader {
    private pinecone: Pinecone | null = null;
    private embeddings: OpenAIEmbeddings | null = null;

    private getPinecone(): Pinecone {
        if (!this.pinecone) {
            this.pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY || 'dummy-key',
            });
        }
        return this.pinecone;
    }

    private getEmbeddings(): OpenAIEmbeddings {
        if (!this.embeddings) {
            this.embeddings = new OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY || 'dummy-key',
                modelName: 'text-embedding-3-small',
            });
        }
        return this.embeddings;
    }

    async loadBibleToVectorDB() {
        // 1. Load Bible JSON (expected in data/bible-kjv.json)
        const biblePath = path.join(process.cwd(), 'data/bible-kjv.json');
        if (!fs.existsSync(biblePath)) {
            console.error('Bible data not found at:', biblePath);
            return;
        }

        const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf-8'));
        const index = this.getPinecone().index(process.env.PINECONE_INDEX || 'scripture');

        // Batch embed & upload
        const batchSize = 100;
        for (let i = 0; i < bibleData.length; i += batchSize) {
            const batch = bibleData.slice(i, i + batchSize);

            const vectors = await Promise.all(batch.map(async (v: BibleVerse) => {
                const embedding = await this.getEmbeddings().embedQuery(`${v.reference}: ${v.text}`);

                return {
                    id: v.reference.replace(/\s+/g, '-'),
                    values: embedding,
                    metadata: {
                        reference: v.reference,
                        text: v.text,
                        book: v.book,
                        chapter: v.chapter,
                        verse: v.verse,
                        translation: v.translation
                    }
                };
            }));

            await index.upsert(vectors as any);
            console.log(`Uploaded batch ${i / batchSize + 1} of ${Math.ceil(bibleData.length / batchSize)}`);
        }
    }

    async searchScripture(query: string, topK: number = 5) {
        // Offline / no-key mode: use the curated local scripture library so
        // scripture retrieval always works instead of throwing on a dummy key.
        if (!hasOpenAI() || !process.env.PINECONE_API_KEY) {
            return findVersesForQuery(query, topK).map(v => ({
                reference: v.reference,
                text: v.text,
                score: v.score,
            }));
        }

        try {
            const queryEmbedding = await this.getEmbeddings().embedQuery(query);
            const index = this.getPinecone().index(process.env.PINECONE_INDEX || 'scripture');

            const searchResults = await index.query({
                vector: queryEmbedding,
                topK,
                includeMetadata: true
            });

            return searchResults.matches.map(m => ({
                reference: m.metadata?.reference,
                text: m.metadata?.text,
                score: m.score
            }));
        } catch (error) {
            console.error('Vector scripture search failed; using local library:', error);
            return findVersesForQuery(query, topK).map(v => ({
                reference: v.reference,
                text: v.text,
                score: v.score,
            }));
        }
    }

    async semanticSearch(query: string, topK: number = 5) {
        return this.searchScripture(query, topK);
    }

    async getVerse(reference: string): Promise<{ text: string; reference: string } | null> {
        // Resolve from the curated local library (with graceful thematic fallback)
        // so references render real text even when the vector DB is unpopulated.
        const verse = getLocalVerse(reference);
        return { reference: verse.reference, text: verse.text };
    }

    async getVerses(references: string[]): Promise<({ text: string; reference: string } | null)[]> {
        return Promise.all(references.map(r => this.getVerse(r)));
    }
}
