import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const MediaSchema = z.object({
  title: z.string().trim().min(2).max(180),
  artist: z.string().trim().max(140).optional(),
  mediaType: z.enum(['AUDIO', 'VIDEO', 'LYRIC_VIDEO', 'INSTRUMENTAL', 'AMBIENCE']).default('AUDIO'),
  category: z.enum(['WORSHIP', 'PRAISE', 'PRAYER_ATMOSPHERE', 'MEDITATION', 'CHOIR', 'SERMON_CLIP', 'CHILDREN', 'YOUTH']).default('WORSHIP'),
  sourceUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  durationSeconds: z.coerce.number().int().min(0).max(86400).optional(),
  language: z.string().trim().max(80).default('English'),
  scriptureRefs: z.array(z.string().trim().max(80)).max(20).optional().default([]),
  moodTags: z.array(z.string().trim().max(60)).max(20).optional().default([]),
  licenseType: z.enum(['USER_UPLOADED', 'OWNED', 'LICENSED', 'PUBLIC_DOMAIN', 'CC', 'EXTERNAL_LINK']).default('USER_UPLOADED'),
  visibility: z.enum(['PRIVATE', 'CHURCH_ONLY', 'PUBLIC']).default('PRIVATE'),
  rewardEnabled: z.boolean().default(true),
  acceptedMediaTerms: z.boolean().default(false),
  rightsOwnerName: z.string().trim().max(180).optional(),
  rightsOwnerContact: z.string().trim().max(220).optional(),
  licenseDocumentUrl: z.string().url().optional(),
  providerKey: z.string().trim().max(80).optional(),
  providerItemId: z.string().trim().max(180).optional(),
  publicDistributionNotes: z.string().trim().max(1000).optional(),
});

const ReviewSchema = z.object({
  mediaItemId: z.string().trim().min(3),
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING_REVIEW']),
  rightsStatus: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'LICENSE_REQUIRED', 'TAKEDOWN_HOLD']).optional(),
  distributionAllowed: z.boolean().optional(),
  notes: z.string().trim().max(1500).optional(),
});

function publicDistributionRequested(visibility: string) {
  return visibility === 'PUBLIC' || visibility === 'CHURCH_ONLY';
}

function safePublicLicense(licenseType: string) {
  return ['OWNED', 'LICENSED', 'PUBLIC_DOMAIN', 'CC', 'EXTERNAL_LINK'].includes(licenseType);
}

async function featureEnabled(flagKey: string) {
  const rows = await prisma.$queryRaw<Array<{ enabled: boolean; rollout_percent: number }>>(Prisma.sql`
    SELECT enabled, rollout_percent FROM platform_feature_flags WHERE flag_key = ${flagKey} LIMIT 1
  `);
  return Boolean(rows[0]?.enabled && Number(rows[0]?.rollout_percent || 0) > 0);
}

async function ensureActiveTermsAccepted(userId: string, req: NextRequest, acceptedNow: boolean) {
  const terms = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, version, title FROM media_terms_versions WHERE active = true ORDER BY effective_at DESC LIMIT 1
  `);
  const active = terms[0];
  if (!active) return { ok: false, error: 'No active media upload terms are configured.' };

  const accepted = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id FROM media_terms_acceptances WHERE user_id = ${userId} AND terms_version_id = ${active.id} LIMIT 1
  `);
  if (accepted[0]) return { ok: true, terms: active };

  if (!acceptedNow) {
    return { ok: false, error: `Media upload terms must be accepted before upload. Active version: ${active.version}` };
  }

  const userAgent = req.headers.get('user-agent') || 'unknown';
  const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO media_terms_acceptances (user_id, terms_version_id, ip_hash, user_agent_hash)
    VALUES (${userId}, ${active.id}, md5(${forwarded}), md5(${userAgent}))
    ON CONFLICT (user_id, terms_version_id) DO NOTHING
  `);
  return { ok: true, terms: active };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const action = body.action || 'create';

  try {
    if (action === 'review') {
      if (session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      const parsed = ReviewSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid media review payload', details: parsed.error.flatten() }, { status: 400 });

      const currentRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM worship_media_items WHERE id = ${parsed.data.mediaItemId} LIMIT 1`);
      const current = currentRows[0];
      if (!current) return NextResponse.json({ error: 'Media item not found' }, { status: 404 });

      const nextRights = parsed.data.rightsStatus || (parsed.data.status === 'APPROVED' ? 'APPROVED' : current.rights_status || 'PENDING_REVIEW');
      const allowDistribution = parsed.data.distributionAllowed ?? (parsed.data.status === 'APPROVED' && nextRights === 'APPROVED' && current.takedown_status === 'CLEAR');

      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        UPDATE worship_media_items
        SET status = ${parsed.data.status},
            rights_status = ${nextRights},
            distribution_allowed = ${allowDistribution},
            public_distribution_notes = COALESCE(${parsed.data.notes || null}, public_distribution_notes),
            updated_at = now()
        WHERE id = ${parsed.data.mediaItemId}
        RETURNING *
      `);

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO media_license_audit_events (media_item_id, actor_id, event_type, from_status, to_status, notes)
        VALUES (${parsed.data.mediaItemId}, ${session.user.id}, 'MEDIA_REVIEW', ${current.rights_status || null}, ${nextRights}, ${parsed.data.notes || null})
      `);
      return NextResponse.json({ media: rows[0] || null });
    }

    const parsed = MediaSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid worship media payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;

    const terms = await ensureActiveTermsAccepted(session.user.id, req, d.acceptedMediaTerms);
    if (!terms.ok) return NextResponse.json({ error: terms.error }, { status: 428 });

    if (publicDistributionRequested(d.visibility) && !safePublicLicense(d.licenseType)) {
      return NextResponse.json({ error: 'Public or church-wide distribution requires OWNED, LICENSED, PUBLIC_DOMAIN, CC, or EXTERNAL_LINK rights declaration.' }, { status: 400 });
    }

    if (['LICENSED', 'OWNED'].includes(d.licenseType) && !d.licenseDocumentUrl && !d.providerKey) {
      return NextResponse.json({ error: 'Licensed or owned media requires licenseDocumentUrl or providerKey before upload.' }, { status: 400 });
    }

    const initialRightsStatus = publicDistributionRequested(d.visibility) ? 'PENDING_REVIEW' : 'PRIVATE_ONLY';
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO worship_media_items (
        uploaded_by, title, artist, media_type, category, source_url, thumbnail_url, duration_seconds, language,
        scripture_refs, mood_tags, license_type, visibility, status, reward_enabled,
        rights_status, distribution_allowed, rights_owner_name, rights_owner_contact, license_document_url,
        provider_key, provider_item_id, public_distribution_notes
      ) VALUES (
        ${session.user.id}, ${d.title}, ${d.artist || null}, ${d.mediaType}, ${d.category}, ${d.sourceUrl}, ${d.thumbnailUrl || null}, ${d.durationSeconds || null}, ${d.language},
        ${d.scriptureRefs}, ${d.moodTags}, ${d.licenseType}, ${d.visibility}, ${session.user.role === 'CHURCH_ADMIN' && !publicDistributionRequested(d.visibility) ? 'APPROVED' : 'PENDING_REVIEW'}, ${d.rewardEnabled},
        ${initialRightsStatus}, false, ${d.rightsOwnerName || null}, ${d.rightsOwnerContact || null}, ${d.licenseDocumentUrl || null},
        ${d.providerKey || null}, ${d.providerItemId || null}, ${d.publicDistributionNotes || null}
      ) RETURNING *
    `);

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO media_license_audit_events (media_item_id, actor_id, event_type, to_status, notes, metadata)
      VALUES (${rows[0].id}, ${session.user.id}, 'MEDIA_UPLOADED', ${initialRightsStatus}, ${'Media uploaded with terms accepted and rights declaration recorded.'}, ${JSON.stringify({ licenseType: d.licenseType, visibility: d.visibility, termsVersion: terms.terms?.version })}::jsonb)
    `);

    await AuditLogger.log({ actorId: session.user.id, action: 'WORSHIP_MEDIA_UPLOADED', entityType: 'worship_media_items', entityId: rows[0].id, metadata: { mediaType: d.mediaType, category: d.category, licenseType: d.licenseType, visibility: d.visibility }, req });
    return NextResponse.json({ media: rows[0], terms: terms.terms }, { status: 201 });
  } catch (error) {
    console.error('Worship media operation failed:', error);
    return NextResponse.json({ error: 'Failed to process worship media request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const mediaType = searchParams.get('mediaType');
  const mine = searchParams.get('mine') === 'true';
  const review = searchParams.get('review') === 'true';

  if (mine && !session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (review && session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  if (!mine && !review && !(await featureEnabled('public_worship_media')) && session?.user?.role !== 'CHURCH_ADMIN') {
    return NextResponse.json({ media: [], rollout: { publicWorshipMedia: false, message: 'Public worship media is disabled until media-rights clearance and staged rollout are enabled by an admin.' } });
  }

  const media = review
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT wmi.*, u.name AS uploader_name, u.email AS uploader_email
        FROM worship_media_items wmi
        LEFT JOIN "User" u ON u.id = wmi.uploaded_by
        WHERE wmi.status = 'PENDING_REVIEW' OR wmi.rights_status = 'PENDING_REVIEW' OR wmi.takedown_status <> 'CLEAR'
        ORDER BY wmi.created_at DESC LIMIT 150
      `)
    : mine
      ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT * FROM worship_media_items WHERE uploaded_by = ${session!.user.id} ORDER BY created_at DESC LIMIT 100
        `)
      : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT wmi.*, u.name AS uploader_name
          FROM worship_media_items wmi
          LEFT JOIN "User" u ON u.id = wmi.uploaded_by
          WHERE wmi.status = 'APPROVED'
            AND wmi.distribution_allowed = true
            AND wmi.rights_status = 'APPROVED'
            AND wmi.takedown_status = 'CLEAR'
            AND wmi.visibility IN ('PUBLIC', 'CHURCH_ONLY')
            AND (${category || null}::text IS NULL OR wmi.category = ${category || null})
            AND (${mediaType || null}::text IS NULL OR wmi.media_type = ${mediaType || null})
          ORDER BY wmi.created_at DESC
          LIMIT 150
        `);

  return NextResponse.json({ media });
}
