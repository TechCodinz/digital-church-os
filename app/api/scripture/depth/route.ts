import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TranslationIntelligenceEngine } from '@/lib/scripture/translationEngine';
import { MindBlowingRevelationEngine } from '@/lib/scripture/revelationEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { reference, layer, level } = await req.json();

        if (!reference) {
            return NextResponse.json({ error: 'Reference required' }, { status: 400 });
        }

        const userLevel = level || 'beginner';
        const revealLayer = layer || 'surface';

        const translationEngine = new TranslationIntelligenceEngine();
        const revelationEngine = new MindBlowingRevelationEngine();

        // 1. Get translations
        const translations = await translationEngine.getVerseWithAllTranslations(reference);

        // 2. Reveal depth
        const revelation = await revelationEngine.revealVerseDepth({
            verse: reference,
            userLevel,
            revealLayer
        });

        return NextResponse.json({
            translations,
            revelation
        });
    } catch (error) {
        console.error('Scripture Depth API Error:', error);
        return NextResponse.json({ error: 'Failed to excavate scripture depth' }, { status: 500 });
    }
}
