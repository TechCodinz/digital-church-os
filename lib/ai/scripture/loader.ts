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
    private pinecone: Pinecone;
    private embeddings: OpenAIEmbeddings;

    constructor() {
        this.pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });

        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: 'text-embedding-3-small',
        });
    }

    async loadBibleToVectorDB() {
        // 1. Load Bible JSON (expected in data/bible-kjv.json)
        const biblePath = path.join(process.cwd(), 'data/bible-kjv.json');
        if (!fs.existsSync(biblePath)) {
            console.error('Bible data not found at:', biblePath);
            return;
        }

        const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf-8'));
        const index = this.pinecone.index(process.env.PINECONE_INDEX || 'scripture');

        // 2. Process each verse
        for (const book of bibleData.books) {
            for (const chapter of book.chapters) {
                for (const verse of chapter.verses) {
                    const reference = `${book.name} ${chapter.chapter}:${verse.verse}`;

                    // Create embedding for this verse
                    const embedding = await this.embeddings.embedQuery(verse.text);

                    // Store in Pinecone
                    await index.upsert({
                        records: [{
                            id: `${book.name}_${chapter.chapter}_${verse.verse}`,
                            values: embedding,
                            metadata: {
                                reference,
                                text: verse.text,
                                book: book.name,
                                chapter: chapter.chapter,
                                verse: verse.verse,
                                translation: 'KJV',
                            },
                        }]
                    });

                    console.log(`Loaded: ${reference}`);
                }
            }
        }
    }

    async semanticSearch(query: string, limit: number = 10): Promise<BibleVerse[]> {
        const index = this.pinecone.index(process.env.PINECONE_INDEX || 'scripture');

        // Create query embedding
        const queryEmbedding = await this.embeddings.embedQuery(query);

        // Search
        const results = await index.query({
            vector: queryEmbedding,
            topK: limit,
            includeMetadata: true,
        });

        return results.matches.map((match: any) => ({
            reference: match.metadata?.reference as string,
            text: match.metadata?.text as string,
            book: match.metadata?.book as string,
            chapter: match.metadata?.chapter as number,
            verse: match.metadata?.verse as number,
            translation: match.metadata?.translation as string,
        }));
    }

    async getVerse(reference: string): Promise<BibleVerse | null> {
        const index = this.pinecone.index(process.env.PINECONE_INDEX || 'scripture');

        // References are stored in metadata, but IDs are book_chapter_verse
        // We can search by metadata or fetch by ID if we normalize the reference
        const normalizedId = reference.replace(/\s+/g, '_').replace(/:/g, '_');

        try {
            const result = await index.fetch({ ids: [normalizedId] });
            if (result.records[normalizedId]) {
                const metadata = result.records[normalizedId].metadata;
                return {
                    reference: metadata?.reference as string,
                    text: metadata?.text as string,
                    book: metadata?.book as string,
                    chapter: metadata?.chapter as number,
                    verse: metadata?.verse as number,
                    translation: metadata?.translation as string,
                };
            }
        } catch (error) {
            console.error('Failed to fetch explicit verse:', reference, error);
        }
        return null;
    }

    async getVerses(references: string[]): Promise<BibleVerse[]> {
        const verses: BibleVerse[] = [];
        for (const ref of references) {
            const verse = await this.getVerse(ref);
            if (verse) verses.push(verse);
        }
        return verses;
    }
}
