import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface GlobalChurchProfile {
    id: string;
    name: string;
    city: string;
    country: string;
    denomination?: string | null;
    leadPastor?: string | null;
    memberCount?: number | null;
    streamUrl?: string | null;
    isLiveNow?: boolean;
    bannerUrl?: string | null;
    activities?: string[];
}

/**
 * This Living Sanctuary branch does not own the authoritative church-tenant
 * registry. The previous implementation returned fabricated churches, member
 * counts, pastors, and live states. Returning an empty, explicit state is safer
 * than presenting synthetic institutions as real production data.
 *
 * The Phase 11 tenant-safe church_profiles registry should become the source of
 * truth when the experience branch is reconciled with the production lineage.
 */
export async function GET() {
    return NextResponse.json(
        {
            success: true,
            churches: [] as GlobalChurchProfile[],
            source: 'tenant_registry_required',
            directoryReady: false,
        },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
}

export async function POST() {
    return NextResponse.json(
        {
            success: false,
            code: 'CHURCH_DIRECTORY_PERSISTENCE_REQUIRED',
            error: 'Church onboarding requires the tenant-safe church registry before a church can be represented as live or publicly discoverable.',
        },
        { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
}
