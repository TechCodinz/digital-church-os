import { NextResponse } from 'next/server';

export interface MinisterProfile {
    id: string;
    fullName: string;
    email: string;
    churchName: string;
    denomination: string;
    country: string;
    city: string;
    preferredWorshipStyle: 'Charismatic / Pentecostal' | 'Expositional / Evangelical' | 'Liturgical / Traditional' | 'Reformed' | 'Contemporary';
    aiPastorTone: 'Shepherd & Encourager' | 'Prophetic & Bold' | 'Scholarly & Exegetical' | 'Gentle Counselor';
    activeServicesCount: number;
    createdAt: string;
}

const REGISTERED_MINISTERS: MinisterProfile[] = [
    {
        id: 'min-1',
        fullName: 'Pastor John MacArthur',
        email: 'pastor.john@gracechurch.org',
        churchName: 'Grace Exegetical Assembly',
        denomination: 'Evangelical / Baptist',
        country: 'United States',
        city: 'Los Angeles',
        preferredWorshipStyle: 'Expositional / Evangelical',
        aiPastorTone: 'Scholarly & Exegetical',
        activeServicesCount: 3,
        createdAt: '2026-07-20'
    },
    {
        id: 'min-2',
        fullName: 'Evangelist Reinhard Bonnke Ministry',
        email: 'info@cfan.org',
        churchName: 'Global Gospel Crusade Assembly',
        denomination: 'Pentecostal / Charismatic',
        country: 'Nigeria',
        city: 'Lagos',
        preferredWorshipStyle: 'Charismatic / Pentecostal',
        aiPastorTone: 'Prophetic & Bold',
        activeServicesCount: 5,
        createdAt: '2026-07-22'
    }
];

export async function GET(req: Request) {
    try {
        return NextResponse.json({
            success: true,
            ministers: REGISTERED_MINISTERS
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, ministers: REGISTERED_MINISTERS });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fullName, email, churchName, denomination, country, city, preferredWorshipStyle, aiPastorTone } = body;

        if (!fullName || !email || !churchName || !denomination) {
            return NextResponse.json({ error: 'Full name, email, church name, and denomination are required' }, { status: 400 });
        }

        const newMinister: MinisterProfile = {
            id: `min-${Date.now()}`,
            fullName,
            email,
            churchName,
            denomination,
            country: country || 'Global',
            city: city || 'Online',
            preferredWorshipStyle: preferredWorshipStyle || 'Expositional / Evangelical',
            aiPastorTone: aiPastorTone || 'Shepherd & Encourager',
            activeServicesCount: 1,
            createdAt: new Date().toISOString().split('T')[0]
        };

        REGISTERED_MINISTERS.unshift(newMinister);

        return NextResponse.json({
            success: true,
            message: `Welcome Pastor ${fullName}! Your ${denomination} Digital Church instance is live on Digital Church OS.`,
            profile: newMinister
        });
    } catch (err: any) {
        return NextResponse.json({ error: 'Minister onboarding failed' }, { status: 500 });
    }
}
