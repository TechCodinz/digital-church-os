import { NextResponse } from 'next/server';
import { SiteSettingsMigrationRequiredError, readSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type PublicStreamConfig = {
  streamUrl: string;
  streamTitle: string;
  configured: boolean;
  source: 'site-config' | 'environment' | 'none';
};

function sanitizeUrl(value: unknown) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
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
  try {
    const persisted = await readSiteSettings();
    const streamUrl = sanitizeUrl(persisted.streamUrl);
    const streamTitle = normalizeTitle(persisted.streamTitle);
    if (streamUrl || streamTitle) return response(streamUrl, streamTitle, 'site-config');
  } catch (error) {
    // The public service can still use deployment environment configuration while the settings migration is pending.
    if (!(error instanceof SiteSettingsMigrationRequiredError)) {
      console.error('Live-service persisted config load failed:', error);
    }
  }

  const environmentUrl = sanitizeUrl(process.env.LIVE_STREAM_URL);
  const environmentTitle = normalizeTitle(process.env.LIVE_STREAM_TITLE);
  if (environmentUrl || environmentTitle) return response(environmentUrl, environmentTitle, 'environment');

  return response('', 'Live Worship Service', 'none');
}
