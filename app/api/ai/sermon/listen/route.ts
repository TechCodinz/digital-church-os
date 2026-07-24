import { NextResponse } from 'next/server';
import { LiveListenerEngine } from '@/lib/ai/sermon/liveListenerEngine';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { transcriptChunk, timestamp = new Date().toLocaleTimeString(), speakerName, sermonId } = body;

        if (!transcriptChunk || typeof transcriptChunk !== 'string') {
            return NextResponse.json({ error: 'transcriptChunk string is required' }, { status: 400 });
        }

        const listener = new LiveListenerEngine();
        const indexedChunk = await listener.processAudioChunk({
            sermonId,
            transcriptChunk,
            timestamp,
            speakerName,
        });

        return NextResponse.json({
            success: true,
            indexedChunk,
        });
    } catch (err: any) {
        console.error('Live Sermon Listener API error:', err);
        return NextResponse.json({
            success: false,
            indexedChunk: {
                timestamp: new Date().toLocaleTimeString(),
                speakerName: 'Pastor',
                transcript: 'Peace I leave with you; my peace I give to you.',
                detectedScriptures: ['John 14:27'],
                keyThematicPoints: ['Divine peace overcomes world anxiety.'],
                sentiment: 'teaching',
            }
        }, { status: 500 });
    }
}
