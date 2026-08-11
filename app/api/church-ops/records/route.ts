import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import {
  canAdminChurchWorkspace,
  canWriteChurchOps,
  resolveChurchWorkspaceAccess,
} from '@/lib/church-ops/access';

const ModuleSchema = z.string().trim().min(2).max(64).regex(/^[a-z0-9][a-z0-9_-]*$/);
const KeySchema = z.string().trim().min(1).max(120).regex(/^[a-z0-9][a-z0-9:_-]*$/);

const PutRecordSchema = z.object({
  churchId: z.string().trim().min(3).optional(),
  module: ModuleSchema,
  key: KeySchema,
  title: z.string().trim().max(180).optional(),
  classification: z.enum(['INTERNAL', 'SENSITIVE_OPERATIONAL']).default('INTERNAL'),
  payload: z.record(z.any()),
});

const forbiddenGenericModules = new Set([
  'counseling',
  'counseling-notes',
  'crisis',
  'abuse',
  'safeguarding-case',
  'medical',
  'clinical',
  'credentials',
]);

function selectionError(requiresSelection: boolean) {
  if (requiresSelection) {
    return NextResponse.json(
      { error: 'Select a church workspace before reading or writing shared operations.', code: 'CHURCH_SELECTION_REQUIRED' },
      { status: 409 }
    );
  }
  return NextResponse.json(
    { error: 'No accessible church workspace was found.', code: 'NO_CHURCH_WORKSPACE' },
    { status: 404 }
  );
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const moduleResult = ModuleSchema.safeParse(searchParams.get('module'));
  const keyParam = searchParams.get('key');
  const keyResult = keyParam ? KeySchema.safeParse(keyParam) : null;
  const churchId = searchParams.get('churchId');

  if (!moduleResult.success || (keyResult && !keyResult.success)) {
    return NextResponse.json({ error: 'Invalid module or record key.' }, { status: 400 });
  }

  try {
    const resolved = await resolveChurchWorkspaceAccess(session.user.id, churchId);
    if (!resolved.access) return selectionError(resolved.requiresSelection);

    const rows = keyResult
      ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT id, church_id, module, record_key, title, classification, payload, version, updated_by, created_at, updated_at
          FROM church_operational_records
          WHERE church_id = ${resolved.access.id}
            AND module = ${moduleResult.data}
            AND record_key = ${keyResult.data}
            AND archived_at IS NULL
          LIMIT 1
        `)
      : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT id, church_id, module, record_key, title, classification, payload, version, updated_by, created_at, updated_at
          FROM church_operational_records
          WHERE church_id = ${resolved.access.id}
            AND module = ${moduleResult.data}
            AND archived_at IS NULL
          ORDER BY updated_at DESC
          LIMIT 100
        `);

    if (keyResult && !rows[0]) {
      return NextResponse.json({ error: 'Operational record not found.' }, { status: 404 });
    }

    return NextResponse.json({
      church: resolved.access,
      record: keyResult ? rows[0] : undefined,
      records: keyResult ? undefined : rows,
    });
  } catch (error: any) {
    console.error('Church operations record read failed:', error?.message || error);
    return NextResponse.json({ error: 'Church operations persistence is unavailable.', migrationRequired: true }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = PutRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid operational record payload.', details: parsed.error.flatten() }, { status: 400 });
  }

  if (forbiddenGenericModules.has(parsed.data.module)) {
    return NextResponse.json(
      { error: 'Restricted care, safeguarding, medical, crisis, or credential data cannot use the generic church operations store.' },
      { status: 400 }
    );
  }

  const serializedPayload = JSON.stringify(parsed.data.payload);
  if (Buffer.byteLength(serializedPayload, 'utf8') > 250_000) {
    return NextResponse.json({ error: 'Operational payload is too large.' }, { status: 413 });
  }

  try {
    const resolved = await resolveChurchWorkspaceAccess(session.user.id, parsed.data.churchId);
    if (!resolved.access) return selectionError(resolved.requiresSelection);
    if (!canWriteChurchOps(resolved.access.role)) {
      return NextResponse.json({ error: 'This church role does not have operations write access.' }, { status: 403 });
    }

    const previous = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT id, version, archived_at
      FROM church_operational_records
      WHERE church_id = ${resolved.access.id}
        AND module = ${parsed.data.module}
        AND record_key = ${parsed.data.key}
      LIMIT 1
    `);

    const action = previous[0]?.archived_at ? 'RESTORE' : previous[0] ? 'UPDATE' : 'CREATE';

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO church_operational_records (
        church_id, module, record_key, title, classification, payload, version, created_by, updated_by
      ) VALUES (
        ${resolved.access.id},
        ${parsed.data.module},
        ${parsed.data.key},
        ${parsed.data.title || null},
        ${parsed.data.classification},
        ${serializedPayload}::jsonb,
        1,
        ${session.user.id},
        ${session.user.id}
      )
      ON CONFLICT (church_id, module, record_key)
      DO UPDATE SET
        title = EXCLUDED.title,
        classification = EXCLUDED.classification,
        payload = EXCLUDED.payload,
        version = church_operational_records.version + 1,
        updated_by = EXCLUDED.updated_by,
        archived_at = NULL,
        updated_at = now()
      RETURNING id, church_id, module, record_key, title, classification, payload, version, updated_by, created_at, updated_at
    `);

    const record = rows[0];

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO church_operational_record_history (
        record_id, church_id, module, record_key, action, version, changed_by, metadata
      ) VALUES (
        ${record.id},
        ${resolved.access.id},
        ${parsed.data.module},
        ${parsed.data.key},
        ${action},
        ${record.version},
        ${session.user.id},
        ${JSON.stringify({ classification: parsed.data.classification })}::jsonb
      )
    `);

    await AuditLogger.log({
      actorId: session.user.id,
      action: `CHURCH_OPS_${action}`,
      entityType: 'church_operational_records',
      entityId: record.id,
      metadata: {
        churchId: resolved.access.id,
        module: parsed.data.module,
        key: parsed.data.key,
        version: record.version,
        classification: parsed.data.classification,
        payloadStoredInAudit: false,
      },
      req,
    });

    return NextResponse.json({ church: resolved.access, record });
  } catch (error: any) {
    console.error('Church operations record write failed:', error?.message || error);
    return NextResponse.json({ error: 'Church operations persistence is unavailable.', migrationRequired: true }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const moduleResult = ModuleSchema.safeParse(searchParams.get('module'));
  const keyResult = KeySchema.safeParse(searchParams.get('key'));
  const churchId = searchParams.get('churchId');

  if (!moduleResult.success || !keyResult.success) {
    return NextResponse.json({ error: 'Invalid module or record key.' }, { status: 400 });
  }

  try {
    const resolved = await resolveChurchWorkspaceAccess(session.user.id, churchId);
    if (!resolved.access) return selectionError(resolved.requiresSelection);
    if (!canAdminChurchWorkspace(resolved.access.role)) {
      return NextResponse.json({ error: 'Only a church owner or admin can archive shared operational records.' }, { status: 403 });
    }

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      UPDATE church_operational_records
      SET archived_at = now(),
          version = version + 1,
          updated_by = ${session.user.id},
          updated_at = now()
      WHERE church_id = ${resolved.access.id}
        AND module = ${moduleResult.data}
        AND record_key = ${keyResult.data}
        AND archived_at IS NULL
      RETURNING id, version
    `);

    if (!rows[0]) return NextResponse.json({ error: 'Operational record not found.' }, { status: 404 });

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO church_operational_record_history (
        record_id, church_id, module, record_key, action, version, changed_by, metadata
      ) VALUES (
        ${rows[0].id},
        ${resolved.access.id},
        ${moduleResult.data},
        ${keyResult.data},
        'ARCHIVE',
        ${rows[0].version},
        ${session.user.id},
        '{}'::jsonb
      )
    `);

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'CHURCH_OPS_ARCHIVE',
      entityType: 'church_operational_records',
      entityId: rows[0].id,
      metadata: { churchId: resolved.access.id, module: moduleResult.data, key: keyResult.data, payloadStoredInAudit: false },
      req,
    });

    return NextResponse.json({ success: true, archived: true });
  } catch (error: any) {
    console.error('Church operations record archive failed:', error?.message || error);
    return NextResponse.json({ error: 'Church operations persistence is unavailable.', migrationRequired: true }, { status: 503 });
  }
}
