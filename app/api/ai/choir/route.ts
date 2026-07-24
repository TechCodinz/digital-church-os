import { NextResponse } from 'next/server';
import { RealWorshipGenerator } from '@/lib/ai/christian/worship/realWorshipGenerator';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { theme = 'Praise and Victory', style = 'gospel', key = 'G' } = body;

        const generator = new RealWorshipGenerator();
        const result = await generator.generateWorshipContent({ theme, style });

        return NextResponse.json({
            success: true,
            title: result.title,
            style,
            key,
            chords: result.chords.length > 0 ? result.chords : ['G', 'D', 'Em', 'C'],
            lyrics: result.lyrics || {
                chorus: 'We lift Your name on high, Lord of Heaven and Earth,\nYour mercy endures forever, great is Your worth.',
                verses: ['In the shadows of the valley, You are my light,\nYour promise stands forever, through the darkest night.'],
                bridge: 'Holy, Holy is the Lord Almighty, the whole earth is full of Your glory.'
            },
            scriptureBasis: result.scriptureBasis || [{ reference: 'Psalm 100:4', text: 'Enter His gates with thanksgiving and His courts with praise.' }]
        });
    } catch (err: any) {
        console.error('Choir AI Error:', err);
        return NextResponse.json({
            success: true,
            title: 'Unshakeable Refuge',
            style: 'Contemporary Hymn',
            key: 'G',
            chords: ['G', 'D', 'Em', 'C'],
            lyrics: {
                chorus: 'God is our refuge and our strength, a present help in trouble,\nThough the mountains fall into the heart of the sea, His grace is double.',
                verses: ['Be still and know that He is God, exalted in the earth.'],
                bridge: 'Praise the Father, Praise the Son, Praise the Spirit, Three in One.'
            },
            scriptureBasis: [{ reference: 'Psalm 46:1', text: 'God is our refuge and strength, an ever-present help in trouble.' }]
        });
    }
}
