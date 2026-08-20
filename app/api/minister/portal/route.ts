import { NextResponse } from 'next/server';

export interface MinisterProfile {
    id: string;
    fullName: string;
    email: string;
    churchName: string;
    denomination: string;
    country: string;
    city: string;
    preferredWorshipStyle?: string | null;
    guidanceStyle?: string | null;
    createdAt: string;
}

/**
 * Minister/church onboarding must persist into the authoritative tenant-safe
 * church registry before the product can claim an instance exists. This branch
 * previously held an in-memory list with invented ministers and returned a false
 * "instance is live" success. The public API now fails closed until the real
 * church-profile persistence layer is reconciled from the production lineage.
 */
export async function GET() {
    return NextResponse.json(
        {
            success: true,
            ministers: [] as MinisterProfile[],
            source: 'tenant_registry_required',
            onboardingReady: false,
        },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
}

export async function POST() {
    return NextResponse.json(
        {
            success: false,
            code: 'MINISTER_TENANT_PERSISTENCE_REQUIRED',
            error: 'Minister onboarding requires the tenant-safe church workspace registry before an account or church workspace can be represented as created.',
        },
        { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
}
