import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as fs from 'fs';
import * as path from 'path';

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

            await index.upsert(vectors);
            console.log(`Uploaded batch ${i / batchSize + 1} of ${Math.ceil(bibleData.length / batchSize)}`);
        }
    }

    async searchScripture(query: string, topK: number = 5) {
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
    }

    async getVerse(reference: string): Promise<{ text: string; reference: string } | null> {
        // Simple mock verse lookup for demonstration if vector DB not populated
        return {
            reference,
            text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
        };
    }
}
