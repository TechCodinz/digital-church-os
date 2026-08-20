import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRUSTED_STREAM_HOSTS = new Set([
    'youtube.com',
    'www.youtube.com',
    'youtu.be',
    'vimeo.com',
    'www.vimeo.com',
    'player.vimeo.com',
    'twitch.tv',
    'www.twitch.tv',
    'player.twitch.tv',
]);

function sanitizeStreamUrl(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;

    try {
        const url = new URL(value.trim());
        if (url.protocol !== 'https:') return null;
        if (url.username || url.password) return null;
        if (!TRUSTED_STREAM_HOSTS.has(url.hostname.toLowerCase())) return null;
        return url.toString();
    } catch {
        return null;
    }
}

function providerFor(url: string | null) {
    if (!url) return null;
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('youtube') || hostname === 'youtu.be') return 'youtube';
    if (hostname.includes('vimeo')) return 'vimeo';
    if (hostname.includes('twitch')) return 'twitch';
    return null;
}

export async function GET() {
    try {
        const config = await (prisma as any).siteConfig?.findUnique?.({ where: { key: 'admin_settings' } }).catch(() => null);
        const stored = config?.value && typeof config.value === 'object' ? (config.value as Record<string, unknown>) : {};
        const streamUrl = sanitizeStreamUrl(stored.streamUrl);
        const streamTitle = typeof stored.streamTitle === 'string' && stored.streamTitle.trim()
            ? stored.streamTitle.trim().slice(0, 180)
            : 'Digital Church Worship';

        return NextResponse.json(
            {
                configured: Boolean(streamUrl),
                streamUrl,
                streamTitle,
                provider: providerFor(streamUrl),
            },
            { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
    } catch {
        return NextResponse.json(
            {
                configured: false,
                streamUrl: null,
                streamTitle: 'Digital Church Worship',
                provider: null,
            },
            { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
    }
}
