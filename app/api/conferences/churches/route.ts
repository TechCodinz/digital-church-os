import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { conferenceTenantMigrationRequired } from '@/lib/church-ops/conference-access';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const churches = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      slug: string;
      city: string | null;
      country: string | null;
      conferenceCount: number;
    }>>(Prisma.sql`
      SELECT
        cp.id,
        cp.name,
        cp.slug,
        cp.city,
        cp.country,
        COUNT(c.id)::int AS "conferenceCount"
      FROM church_profiles cp
      JOIN "Conference" c ON c.church_profile_id = cp.id
      WHERE cp.visibility = 'PUBLIC'
      GROUP BY cp.id, cp.name, cp.slug, cp.city, cp.country
      HAVING COUNT(c.id) > 0
      ORDER BY cp.name ASC
      LIMIT 250
    `);

    return NextResponse.json({ churches });
  } catch (error) {
    if (conferenceTenantMigrationRequired(error)) {
      return NextResponse.json(
        { error: 'Conference tenant storage is waiting for the database migration.', migrationRequired: true },
        { status: 503 },
      );
    }
    console.error('Conference church discovery failed:', error);
    return NextResponse.json({ error: 'Conference calendars are unavailable.' }, { status: 500 });
  }
}
