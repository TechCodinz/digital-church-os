import { NextResponse } from 'next/server';
import {
  SiteSettingsMigrationRequiredError,
  normalizePublicHttpUrl,
  readSiteSettings,
} from '@/lib/site-settings';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type PublicStreamConfig = {
  streamUrl: string;
  streamTitle: string;
  configured: boolean;
  source: 'site-config' | 'environment' | 'none';
};

function sanitizeUrl(value: unknown) {
  return normalizePublicHttpUrl(value) ?? '';
}

function normalizeTitle(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 180);
}

function response(streamUrl: string, streamTitle: string, source: PublicStreamConfig['source']) {
  const body: PublicStreamConfig = {
    streamUrl,
    streamTitle: streamTitle || 'Live Worship Service',
    configured: Boolean(streamUrl),
    source,
  };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}

export async function GET() {
  const environmentUrl = sanitizeUrl(process.env.LIVE_STREAM_URL);
  const environmentTitle = normalizeTitle(process.env.LIVE_STREAM_TITLE);

  let persistedUrl = '';
  let persistedTitle = '';

  // Persistence is optional for the public live-service endpoint. On deployments that
  // intentionally have no DATABASE_URL, skip Prisma entirely and fall back to the
  // environment-managed stream configuration instead of emitting a runtime error.
  if (process.env.DATABASE_URL?.trim()) {
    try {
      const persisted = await readSiteSettings();
      persistedUrl = sanitizeUrl(persisted.streamUrl);
      persistedTitle = normalizeTitle(persisted.streamTitle);
    } catch (error) {
      // The public service can still use deployment environment configuration while the settings migration is pending.
      if (!(error instanceof SiteSettingsMigrationRequiredError)) {
        console.error('Live-service persisted config load failed:', error);
      }
    }
  }

  // Resolve each field independently so a persisted title cannot accidentally hide a valid
  // environment-managed provider URL (and vice versa). Persisted non-secret values win only
  // for the fields they actually provide.
  const streamUrl = persistedUrl || environmentUrl;
  const streamTitle = persistedTitle || environmentTitle;

  const source: PublicStreamConfig['source'] = persistedUrl
    ? 'site-config'
    : environmentUrl
      ? 'environment'
      : persistedTitle
        ? 'site-config'
        : environmentTitle
          ? 'environment'
          : 'none';

  return response(streamUrl, streamTitle, source);
}
