import { NextRequest, NextResponse } from 'next/server';
import { getLocalVerse, hasVerse } from '@/lib/ai/shared/offlineWisdom';

export const dynamic = 'force-dynamic';

/**
 * Instant scripture lookup.
 * Public, fast, and always-on: resolves a reference to verse text from the
 * curated local library (with a graceful thematic fallback). Powers the
 * tap-to-read ScriptureReference popover across the app. No external keys needed.
 */
function resolve(reference: string) {
    const ref = (reference || '').trim();
    if (!ref) {
        return { error: 'Reference required' as const };
    }
    const verse = getLocalVerse(ref);
    return {
        reference: verse.reference,
        requested: ref,
        text: verse.text,
        exact: hasVerse(ref),
        translation: 'KJV',
    };
}

export async function GET(req: NextRequest) {
    const reference = req.nextUrl.searchParams.get('ref') || req.nextUrl.searchParams.get('reference') || '';
    const result = resolve(reference);
    if ('error' in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
    let reference = '';
    try {
        const body = await req.json();
        reference = body.reference || body.ref || '';
    } catch {
        /* ignore */
    }
    const result = resolve(reference);
    if ('error' in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
}
