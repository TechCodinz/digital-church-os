import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const SITE_SETTINGS_KEY = 'admin_settings';

export const SECRET_SETTING_FIELDS = [
  'openaiApiKey',
  'elevenLabsApiKey',
  'stripeSecretKey',
  'stripeWebhookSecret',
  'paypalClientSecret',
  'coinbaseCommerceApiKey',
  'bitpayApiKey',
  'resendApiKey',
] as const;

const STRING_KEYS = new Set([
  'churchName',
  'churchEmail',
  'churchWebsite',
  'streamUrl',
  'streamTitle',
]);

const BOOLEAN_KEYS = new Set([
  'aiPastorEnabled',
  'voiceEnabled',
  'paymentsEnabled',
  'emailNotificationsEnabled',
  'rateLimitEnabled',
  'allowRegistration',
]);

export type SafeSiteSettings = Record<string, string | boolean>;

export class SiteSettingsMigrationRequiredError extends Error {
  migrationRequired = true;

  constructor() {
    super('Persistent site settings require the site_config migration.');
    this.name = 'SiteSettingsMigrationRequiredError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isMissingSiteConfigTable(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; meta?: { code?: string; message?: string }; message?: string };
  return candidate.code === 'P2021'
    || candidate.meta?.code === '42P01'
    || candidate.message?.includes('relation "site_config" does not exist') === true;
}

function canonicalizeStoredValue(value: unknown): SafeSiteSettings {
  if (!isRecord(value)) return {};

  // Backward compatibility for the old { settings: { ... } } envelope.
  const legacy = isRecord(value.settings) ? value.settings : {};
  const merged: Record<string, unknown> = { ...legacy, ...value };
  delete merged.settings;

  for (const secret of SECRET_SETTING_FIELDS) delete merged[secret];
  return sanitizeSiteSettingsPatch(merged);
}

export function unwrapSettingsPayload(value: unknown) {
  if (!isRecord(value)) return null;
  return isRecord(value.settings) ? value.settings : value;
}

export function sanitizeSiteSettingsPatch(value: unknown): SafeSiteSettings {
  if (!isRecord(value)) return {};
  const safe: SafeSiteSettings = {};

  for (const [key, raw] of Object.entries(value)) {
    if (STRING_KEYS.has(key) && typeof raw === 'string') {
      const maxLength = key === 'streamUrl' || key === 'churchWebsite' ? 2048 : 240;
      safe[key] = raw.trim().slice(0, maxLength);
    } else if (BOOLEAN_KEYS.has(key) && typeof raw === 'boolean') {
      safe[key] = raw;
    }
  }

  return safe;
}

export async function readSiteSettings(): Promise<SafeSiteSettings> {
  try {
    const rows = await prisma.$queryRaw<Array<{ value: unknown }>>(Prisma.sql`
      SELECT value
      FROM site_config
      WHERE key = ${SITE_SETTINGS_KEY}
      LIMIT 1
    `);
    return canonicalizeStoredValue(rows[0]?.value);
  } catch (error) {
    if (isMissingSiteConfigTable(error)) throw new SiteSettingsMigrationRequiredError();
    throw error;
  }
}

export async function writeSiteSettingsPatch(patch: SafeSiteSettings): Promise<SafeSiteSettings> {
  const serialized = JSON.stringify(patch);

  try {
    const rows = await prisma.$queryRaw<Array<{ value: unknown }>>(Prisma.sql`
      INSERT INTO site_config (key, value)
      VALUES (${SITE_SETTINGS_KEY}, ${serialized}::jsonb)
      ON CONFLICT (key)
      DO UPDATE SET
        value = (
          (
            CASE
              WHEN jsonb_typeof(site_config.value -> 'settings') = 'object'
                THEN (site_config.value -> 'settings') || (site_config.value - 'settings')
              ELSE site_config.value
            END
          ) - ARRAY[
            'openaiApiKey',
            'elevenLabsApiKey',
            'stripeSecretKey',
            'stripeWebhookSecret',
            'paypalClientSecret',
            'coinbaseCommerceApiKey',
            'bitpayApiKey',
            'resendApiKey'
          ]::text[]
        ) || EXCLUDED.value,
        updated_at = now()
      RETURNING value
    `);

    return canonicalizeStoredValue(rows[0]?.value);
  } catch (error) {
    if (isMissingSiteConfigTable(error)) throw new SiteSettingsMigrationRequiredError();
    throw error;
  }
}
