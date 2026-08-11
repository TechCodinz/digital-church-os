import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

async function loadPersistedStream() {
  const delegate = (prisma as any).siteConfig;
  if (!delegate || typeof delegate.findUnique !== 'function') return null;

  try {
    const config = await delegate.findUnique({ where: { key: 'admin_settings' } });
    const value = config?.value;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const data = value as Record<string, unknown>;
    const streamUrl = sanitizeUrl(data.streamUrl);
    const streamTitle = normalizeTitle(data.streamTitle);
    if (!streamUrl && !streamTitle) return null;
    return { streamUrl, streamTitle };
  } catch (error) {
    console.error('Live-service persisted config load failed:', error);
    return null;
  }
}

export async function GET() {
  const persisted = await loadPersistedStream();
  if (persisted) {
    const response: PublicStreamConfig = {
      streamUrl: persisted.streamUrl,
      streamTitle: persisted.streamTitle || 'Live Worship Service',
      configured: Boolean(persisted.streamUrl),
      source: 'site-config',
    };
    return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
  }

  const environmentUrl = sanitizeUrl(process.env.LIVE_STREAM_URL);
  const environmentTitle = normalizeTitle(process.env.LIVE_STREAM_TITLE);
  if (environmentUrl || environmentTitle) {
    const response: PublicStreamConfig = {
      streamUrl: environmentUrl,
      streamTitle: environmentTitle || 'Live Worship Service',
      configured: Boolean(environmentUrl),
      source: 'environment',
    };
    return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
  }

  const response: PublicStreamConfig = {
    streamUrl: '',
    streamTitle: 'Live Worship Service',
    configured: false,
    source: 'none',
  };
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
