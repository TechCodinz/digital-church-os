import { NextResponse } from 'next/server';
import {
    SiteSettingsMigrationRequiredError,
    normalizePublicHttpUrl,
    readSiteSettings,
} from '@/lib/site-settings';

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
    const normalized = normalizePublicHttpUrl(value);
    if (!normalized) return null;

    try {
        const url = new URL(normalized);
        if (url.protocol !== 'https:') return null;
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

function environmentFallback() {
    return {
        streamUrl: sanitizeStreamUrl(process.env.LIVE_STREAM_URL),
        streamTitle: (process.env.LIVE_STREAM_TITLE || '').trim().slice(0, 180),
    };
}

export async function GET() {
    const environment = environmentFallback();

    try {
        const stored = await readSiteSettings();
        const streamUrl = sanitizeStreamUrl(stored.streamUrl) || environment.streamUrl;
        const streamTitle = (stored.streamTitle || environment.streamTitle || 'Digital Church Worship').trim().slice(0, 180);

        return NextResponse.json(
            {
                configured: Boolean(streamUrl),
                streamUrl,
                streamTitle,
                provider: providerFor(streamUrl),
                configurationSource: stored.streamUrl ? 'safe_site_settings' : environment.streamUrl ? 'environment' : 'none',
            },
            { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
    } catch (error) {
        if (!(error instanceof SiteSettingsMigrationRequiredError)) {
            console.error('Live-service config load failed:', error);
        }

        const streamUrl = environment.streamUrl;
        return NextResponse.json(
            {
                configured: Boolean(streamUrl),
                streamUrl,
                streamTitle: environment.streamTitle || 'Digital Church Worship',
                provider: providerFor(streamUrl),
                configurationSource: streamUrl ? 'environment' : 'none',
            },
            { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
    }
}
