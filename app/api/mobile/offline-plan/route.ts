import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const OfflineSyncSchema = z.object({
  deviceId: z.string().trim().min(3).max(160),
  entityType: z.enum(['prayer_draft', 'journal_draft', 'sermon_note', 'devotional_progress', 'voice_prayer_note']),
  entityId: z.string().trim().optional(),
  payload: z.record(z.any()),
});

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.record(z.string()),
  enabled: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const action = body.action || 'sync';

  try {
    if (action === 'push-subscription') {
      const parsed = PushSubscriptionSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid push subscription payload', details: parsed.error.flatten() }, { status: 400 });

      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO push_notification_subscriptions (user_id, endpoint, keys, enabled)
        VALUES (${session.user.id}, ${parsed.data.endpoint}, ${JSON.stringify(parsed.data.keys)}::jsonb, ${parsed.data.enabled})
        ON CONFLICT (endpoint) DO UPDATE SET user_id = EXCLUDED.user_id, keys = EXCLUDED.keys, enabled = EXCLUDED.enabled, updated_at = now()
        RETURNING id, endpoint, enabled, created_at, updated_at
      `);

      await AuditLogger.log({ actorId: session.user.id, action: 'PUSH_SUBSCRIPTION_UPSERTED', entityType: 'push_notification_subscriptions', entityId: rows[0].id, req });
      return NextResponse.json({ subscription: rows[0] });
    }

    const parsed = OfflineSyncSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid offline sync payload', details: parsed.error.flatten() }, { status: 400 });

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO offline_sync_items (user_id, device_id, entity_type, entity_id, payload, status)
      VALUES (${session.user.id}, ${parsed.data.deviceId}, ${parsed.data.entityType}, ${parsed.data.entityId || null}, ${JSON.stringify(parsed.data.payload)}::jsonb, 'QUEUED')
      RETURNING id, user_id, device_id, entity_type, entity_id, status, created_at
    `);

    await AuditLogger.log({ actorId: session.user.id, action: 'OFFLINE_SYNC_ITEM_QUEUED', entityType: 'offline_sync_items', entityId: rows[0].id, metadata: { entityType: parsed.data.entityType }, req });
    return NextResponse.json({ item: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Mobile/offline persistence failed:', error);
    return NextResponse.json({ error: 'Failed to save mobile/offline data' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      offlineCapabilities: ['Prayer drafts saved locally', 'Journal drafts saved locally', 'Cached devotional plan', 'Low-data sermon notes', 'Queued sync when connection returns'],
      notificationRoadmap: ['Prayer reminder', 'Event reminder', 'Care follow-up reminder', 'Daily devotional nudge', 'Giving receipt notification'],
      lowDataMode: true,
      nativeAppRoadmap: ['Push notifications', 'Audio sermon downloads', 'Voice prayer notes', 'Family devotional reminders', 'Local language packs'],
    });
  }

  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId');

  const syncItems = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, device_id, entity_type, entity_id, payload, status, synced_at, created_at
    FROM offline_sync_items
    WHERE user_id = ${session.user.id} AND (${deviceId || null}::text IS NULL OR device_id = ${deviceId || null})
    ORDER BY created_at DESC
    LIMIT 100
  `);

  const subscriptions = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, endpoint, enabled, created_at, updated_at
    FROM push_notification_subscriptions
    WHERE user_id = ${session.user.id}
    ORDER BY updated_at DESC
    LIMIT 20
  `);

  return NextResponse.json({
    syncItems,
    subscriptions,
    offlineCapabilities: ['Prayer drafts saved locally', 'Journal drafts saved locally', 'Cached devotional plan', 'Low-data sermon notes', 'Queued sync when connection returns'],
    notificationRoadmap: ['Prayer reminder', 'Event reminder', 'Care follow-up reminder', 'Daily devotional nudge', 'Giving receipt notification'],
    lowDataMode: true,
    nativeAppRoadmap: ['Push notifications', 'Audio sermon downloads', 'Voice prayer notes', 'Family devotional reminders', 'Local language packs'],
  });
}
