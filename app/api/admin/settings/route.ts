import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SECRET_FIELDS = [
  'openaiApiKey',
  'elevenLabsApiKey',
  'stripeSecretKey',
  'stripeWebhookSecret',
  'paypalClientSecret',
  'coinbaseCommerceApiKey',
  'bitpayApiKey',
  'resendApiKey',
] as const;

function getSiteConfigDelegate() {
  const delegate = (prisma as any).siteConfig;
  return delegate && typeof delegate.findUnique === 'function' && typeof delegate.upsert === 'function'
    ? delegate
    : null;
}

function maskSecrets(value: Record<string, unknown>) {
  const data = { ...value };
  for (const field of SECRET_FIELDS) {
    const current = data[field];
    if (typeof current === 'string' && current) {
      data[field] = `••••••••${current.slice(-4)}`;
    }
  }
  return data;
}

function environmentStreamFallback() {
  const streamUrl = (process.env.LIVE_STREAM_URL || '').trim();
  const streamTitle = (process.env.LIVE_STREAM_TITLE || '').trim();
  return {
    ...(streamUrl ? { streamUrl } : {}),
    ...(streamTitle ? { streamTitle } : {}),
    streamConfiguredFromEnvironment: Boolean(streamUrl || streamTitle),
  };
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'CHURCH_ADMIN') return null;
  return session;
}

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const delegate = getSiteConfigDelegate();
    let persisted: Record<string, unknown> = {};

    if (delegate) {
      const config = await delegate.findUnique({ where: { key: 'admin_settings' } });
      if (config?.value && typeof config.value === 'object' && !Array.isArray(config.value)) {
        persisted = config.value as Record<string, unknown>;
      }
    }

    return NextResponse.json({
      ...environmentStreamFallback(),
      ...maskSecrets(persisted),
      persistentStorageConfigured: Boolean(delegate),
    });
  } catch (error) {
    console.error('Admin settings load failed:', error);
    return NextResponse.json({
      ...environmentStreamFallback(),
      persistentStorageConfigured: false,
      error: 'Persistent admin settings are unavailable.',
    }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Settings payload must be an object.' }, { status: 400 });
    }
    body = { ...(parsed as Record<string, unknown>) };
  } catch {
    return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 });
  }

  if (JSON.stringify(body).length > 64_000) {
    return NextResponse.json({ error: 'Settings payload is too large.' }, { status: 413 });
  }

  // Masked display values are never written back over real credentials.
  for (const key of Object.keys(body)) {
    if (typeof body[key] === 'string' && String(body[key]).startsWith('••••')) delete body[key];
  }

  const delegate = getSiteConfigDelegate();
  if (!delegate) {
    return NextResponse.json({
      error: 'Persistent site-settings storage is not configured. Use environment configuration until a settings store is provisioned.',
      persistentStorageConfigured: false,
    }, { status: 503 });
  }

  try {
    await delegate.upsert({
      where: { key: 'admin_settings' },
      update: { value: body, updatedAt: new Date() },
      create: { key: 'admin_settings', value: body },
    });

    const changedKeys = Object.keys(body).filter((key) => !SECRET_FIELDS.includes(key as typeof SECRET_FIELDS[number]));
    const credentialFieldsChanged = Object.keys(body).filter((key) => SECRET_FIELDS.includes(key as typeof SECRET_FIELDS[number]));

    // Audit names of changed settings only. Never copy credential values or the settings body.
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'SETTINGS_UPDATE',
          entityType: 'SiteConfig',
          entityId: 'admin_settings',
          metadata: { changedKeys, credentialFieldsChanged },
        },
      });
    } catch (auditError) {
      console.error('Admin settings audit write failed:', auditError);
    }

    return NextResponse.json({ success: true, persistentStorageConfigured: true });
  } catch (error) {
    console.error('Admin settings save failed:', error);
    return NextResponse.json({ error: 'Settings could not be persisted.' }, { status: 500 });
  }
}
