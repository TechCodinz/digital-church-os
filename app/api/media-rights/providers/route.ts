import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ProviderSchema = z.object({
  providerKey: z.string().trim().min(2).max(80),
  providerName: z.string().trim().min(2).max(160),
  providerType: z.enum(['LICENSED_CATALOG', 'MANUAL_REVIEW', 'EXTERNAL_LINK']).default('LICENSED_CATALOG'),
  apiBaseUrl: z.string().url().optional(),
  enabled: z.boolean().default(false),
  requiresApiKey: z.boolean().default(true),
  secretRef: z.string().trim().max(180).optional(),
  licenseSummary: z.string().trim().max(2000).optional(),
  allowedUsage: z.array(z.string().trim().max(80)).max(20).default([]),
  territoryRules: z.record(z.any()).optional().default({}),
  config: z.record(z.any()).optional().default({}),
});

const CatalogItemSchema = z.object({
  providerKey: z.string().trim().min(2).max(80),
  providerItemId: z.string().trim().min(2).max(180),
  title: z.string().trim().min(2).max(180),
  artist: z.string().trim().max(160).optional(),
  mediaType: z.enum(['AUDIO', 'VIDEO', 'LYRIC_VIDEO', 'INSTRUMENTAL', 'AMBIENCE']).default('AUDIO'),
  sourceUrl: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  durationSeconds: z.coerce.number().int().min(0).max(86400).optional(),
  licenseScope: z.enum(['STREAM_ONLY', 'DOWNLOAD_ALLOWED', 'EMBED_ONLY', 'LINK_ONLY']).default('STREAM_ONLY'),
  allowedUsage: z.array(z.string().trim().max(80)).max(20).default([]),
  territories: z.array(z.string().trim().max(80)).max(200).default([]),
  metadata: z.record(z.any()).optional().default({}),
  active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const body = await req.json();
  const action = body.action || 'provider';

  try {
    if (action === 'catalog-item') {
      const parsed = CatalogItemSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid provider catalog item payload', details: parsed.error.flatten() }, { status: 400 });
      const d = parsed.data;
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO media_provider_catalog_items (provider_key, provider_item_id, title, artist, media_type, source_url, preview_url, thumbnail_url, duration_seconds, license_scope, allowed_usage, territories, metadata, active)
        VALUES (${d.providerKey}, ${d.providerItemId}, ${d.title}, ${d.artist || null}, ${d.mediaType}, ${d.sourceUrl || null}, ${d.previewUrl || null}, ${d.thumbnailUrl || null}, ${d.durationSeconds || null}, ${d.licenseScope}, ${d.allowedUsage}, ${d.territories}, ${JSON.stringify(d.metadata)}::jsonb, ${d.active})
        ON CONFLICT (provider_key, provider_item_id) DO UPDATE SET
          title = EXCLUDED.title,
          artist = EXCLUDED.artist,
          media_type = EXCLUDED.media_type,
          source_url = EXCLUDED.source_url,
          preview_url = EXCLUDED.preview_url,
          thumbnail_url = EXCLUDED.thumbnail_url,
          duration_seconds = EXCLUDED.duration_seconds,
          license_scope = EXCLUDED.license_scope,
          allowed_usage = EXCLUDED.allowed_usage,
          territories = EXCLUDED.territories,
          metadata = EXCLUDED.metadata,
          active = EXCLUDED.active,
          synced_at = now()
        RETURNING *
      `);
      return NextResponse.json({ catalogItem: rows[0] }, { status: 201 });
    }

    const parsed = ProviderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid provider payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO media_provider_configs (provider_key, provider_name, provider_type, api_base_url, enabled, requires_api_key, secret_ref, license_summary, allowed_usage, territory_rules, config)
      VALUES (${d.providerKey}, ${d.providerName}, ${d.providerType}, ${d.apiBaseUrl || null}, ${d.enabled}, ${d.requiresApiKey}, ${d.secretRef || null}, ${d.licenseSummary || null}, ${d.allowedUsage}, ${JSON.stringify(d.territoryRules)}::jsonb, ${JSON.stringify(d.config)}::jsonb)
      ON CONFLICT (provider_key) DO UPDATE SET
        provider_name = EXCLUDED.provider_name,
        provider_type = EXCLUDED.provider_type,
        api_base_url = EXCLUDED.api_base_url,
        enabled = EXCLUDED.enabled,
        requires_api_key = EXCLUDED.requires_api_key,
        secret_ref = EXCLUDED.secret_ref,
        license_summary = EXCLUDED.license_summary,
        allowed_usage = EXCLUDED.allowed_usage,
        territory_rules = EXCLUDED.territory_rules,
        config = EXCLUDED.config,
        updated_at = now()
      RETURNING *
    `);
    return NextResponse.json({ provider: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Media provider operation failed:', error);
    return NextResponse.json({ error: 'Failed to process media provider request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerKey = searchParams.get('providerKey');
  const catalog = searchParams.get('catalog') === 'true';

  const providers = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT provider_key, provider_name, provider_type, api_base_url, enabled, requires_api_key, license_summary, allowed_usage, territory_rules, updated_at
    FROM media_provider_configs
    WHERE (${providerKey || null}::text IS NULL OR provider_key = ${providerKey || null})
    ORDER BY provider_name ASC
  `);

  const items = catalog
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT * FROM media_provider_catalog_items
        WHERE active = true AND (${providerKey || null}::text IS NULL OR provider_key = ${providerKey || null})
        ORDER BY synced_at DESC LIMIT 150
      `)
    : [];

  return NextResponse.json({ providers, catalogItems: items });
}
