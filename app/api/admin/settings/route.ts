import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  SiteSettingsMigrationRequiredError,
  normalizePublicHttpUrl,
  readSiteSettings,
  sanitizeSiteSettingsPatch,
  unwrapSettingsPayload,
  writeSiteSettingsPatch,
} from '@/lib/site-settings';

function environmentStreamFallback() {
  const streamUrl = normalizePublicHttpUrl(process.env.LIVE_STREAM_URL);
  const streamTitle = (process.env.LIVE_STREAM_TITLE || '').trim().slice(0, 180);
  return {
    ...(streamUrl ? { streamUrl } : {}),
    ...(streamTitle ? { streamTitle } : {}),
  };
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'CHURCH_ADMIN') return null;
  return session;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const persisted = await readSiteSettings();
    const environment = environmentStreamFallback();
    const settings = { ...environment, ...persisted };

    return NextResponse.json({
      settings,
      persistentStorageConfigured: true,
      credentialsManagedByEnvironment: true,
      streamConfiguredFromEnvironment: Boolean(environment.streamUrl || environment.streamTitle),
    });
  } catch (error) {
    if (error instanceof SiteSettingsMigrationRequiredError) {
      return NextResponse.json({
        settings: environmentStreamFallback(),
        persistentStorageConfigured: false,
        credentialsManagedByEnvironment: true,
        migrationRequired: true,
        error: 'Persistent site settings are waiting for database migration.',
      }, { status: 503 });
    }

    console.error('Admin settings load failed:', error);
    return NextResponse.json({
      settings: environmentStreamFallback(),
      persistentStorageConfigured: false,
      credentialsManagedByEnvironment: true,
      error: 'Persistent admin settings are unavailable.',
    }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 });
  }

  const unwrapped = unwrapSettingsPayload(rawBody);
  if (!unwrapped) {
    return NextResponse.json({ error: 'Settings payload must be an object.' }, { status: 400 });
  }

  if (JSON.stringify(unwrapped).length > 64_000) {
    return NextResponse.json({ error: 'Settings payload is too large.' }, { status: 413 });
  }

  for (const key of ['streamUrl', 'churchWebsite'] as const) {
    if (!Object.prototype.hasOwnProperty.call(unwrapped, key)) continue;
    const raw = unwrapped[key];
    if (typeof raw !== 'string' || normalizePublicHttpUrl(raw) === null) {
      return NextResponse.json({
        error: `${key === 'streamUrl' ? 'Stream URL' : 'Website URL'} must be a public HTTP(S) URL without embedded credentials.`,
      }, { status: 400 });
    }
  }

  const patch = sanitizeSiteSettingsPatch(unwrapped);
  const changedKeys = Object.keys(patch);
  if (changedKeys.length === 0) {
    return NextResponse.json({
      error: 'No supported non-secret settings were provided. Provider credentials must be configured through deployment environment secrets.',
      credentialsManagedByEnvironment: true,
    }, { status: 400 });
  }

  try {
    const settings = await writeSiteSettingsPatch(patch);

    // Audit setting names only. Values, stream URLs, contacts, and credentials are not copied into the generic audit log.
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'SETTINGS_UPDATE',
          entityType: 'SiteConfig',
          entityId: 'admin_settings',
          metadata: { changedKeys, valuesStoredInAudit: false, credentialsManagedByEnvironment: true },
        },
      });
    } catch (auditError) {
      console.error('Admin settings audit write failed:', auditError);
    }

    return NextResponse.json({
      success: true,
      settings,
      persistentStorageConfigured: true,
      credentialsManagedByEnvironment: true,
    });
  } catch (error) {
    if (error instanceof SiteSettingsMigrationRequiredError) {
      return NextResponse.json({
        error: 'Persistent site settings are waiting for database migration.',
        persistentStorageConfigured: false,
        credentialsManagedByEnvironment: true,
        migrationRequired: true,
      }, { status: 503 });
    }

    console.error('Admin settings save failed:', error);
    return NextResponse.json({ error: 'Settings could not be persisted.' }, { status: 500 });
  }
}
