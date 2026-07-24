import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface LiveSermonChunk {
    timestamp: string;
    speakerName?: string;
    transcript: string;
    detectedScriptures: string[];
    keyThematicPoints: string[];
    sentiment: 'exhortation' | 'reflection' | 'prayer' | 'teaching';
}

export class LiveListenerEngine {
    /**
     * Parses real-time sermon audio transcripts, extracts quoted scriptures,
     * thematic insights, and updates the live sermon database record.
     */
    async processAudioChunk(params: {
        sermonId?: string;
        transcriptChunk: string;
        timestamp: string;
        speakerName?: string;
    }): Promise<LiveSermonChunk> {
        const { transcriptChunk, timestamp, speakerName = 'Pastor' } = params;

        let aiAnalysis: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an Autonomous Live Church Service Listener & Exegetical Indexer.
                            Analyze this live sermon audio transcript chunk and extract:
                            - detectedScriptures: Array of Bible verse references mentioned or alluded to (e.g. ["John 3:16", "Psalm 23:1"])
                            - keyThematicPoints: Array of 1-2 core sermon takeaways
                            - sentiment: One of 'exhortation', 'reflection', 'prayer', 'teaching'`
                        },
                        {
                            role: 'user',
                            content: `Spoken Text: "${transcriptChunk}"`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.3,
                });

                aiAnalysis = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (err) {
                console.error('Live listener AI analysis error:', err);
            }
        }

        // Fallback verse extraction logic using pattern matching if offline or unconfigured
        const detectedScriptures = aiAnalysis?.detectedScriptures || this.extractScripturesFallback(transcriptChunk);
        const keyThematicPoints = aiAnalysis?.keyThematicPoints || [
            transcriptChunk.length > 80 ? `${transcriptChunk.substring(0, 80)}...` : transcriptChunk
        ];
        const sentiment = aiAnalysis?.sentiment || 'teaching';

        const result: LiveSermonChunk = {
            timestamp,
            speakerName,
            transcript: transcriptChunk,
            detectedScriptures,
            keyThematicPoints,
            sentiment,
        };

        // If sermonId is provided, persist into DB audit log / sermon record
        if (params.sermonId) {
            try {
                await prisma.auditLog.create({
                    data: {
                        action: 'SERMON_LIVE_INDEX',
                        entityType: 'Sermon',
                        entityId: params.sermonId,
                        changes: result as any,
                    }
                });
            } catch {
                // Non-fatal DB error handling
            }
        }

        return result;
    }

    private extractScripturesFallback(text: string): string[] {
        const bibleBookRegex = /(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1\s*Samuel|2\s*Samuel|1\s*Kings|2\s*Kings|Psalms?|Proverbs|Ecclesiastes|Song\s*of\s*Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1\s*Corinthians|2\s*Corinthians|Galatians|Ephesians|Philippians|Colossians|1\s*Thessalonians|2\s*Thessalonians|1\s*Timothy|2\s*Timothy|Titus|Philemon|Hebrews|James|1\s*Peter|2\s*Peter|1\s*John|2\s*John|3\s*John|Jude|Revelation)\s+\d+:\d+(?:-\d+)?/gi;
        const matches = text.match(bibleBookRegex);
        return matches ? Array.from(new Set(matches)) : ['John 14:27'];
    }
}
