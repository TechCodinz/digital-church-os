import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface GlobalChurchProfile {
    id: string;
    name: string;
    city: string;
    country: string;
    denomination: string;
    leadPastor: string;
    memberCount: number;
    streamUrl?: string;
    isLiveNow: boolean;
    bannerUrl?: string;
    activities: string[];
}

const DEFAULT_GLOBAL_CHURCHES: GlobalChurchProfile[] = [
    {
        id: 'c-1',
        name: 'Grace Cathedral International',
        city: 'New York',
        country: 'United States',
        denomination: 'Non-Denominational',
        leadPastor: 'Pastor David Evans',
        memberCount: 4200,
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=grace',
        isLiveNow: true,
        activities: ['Sunday Live Streaming', 'Community Emergency Food Bank', 'Youth Discipleship']
    },
    {
        id: 'c-2',
        name: 'Tokyo Grace & Hope Chapel',
        city: 'Tokyo',
        country: 'Japan',
        denomination: 'Evangelical',
        leadPastor: 'Pastor Kenji Sato',
        memberCount: 1800,
        isLiveNow: false,
        activities: ['Bilingual Service', 'Scripture Memory Club', 'Small Group Fellowships']
    },
    {
        id: 'c-3',
        name: 'Redeemed Assembly of Praise',
        city: 'Lagos',
        country: 'Nigeria',
        denomination: 'Pentecostal',
        leadPastor: 'Pastor Emmanuel Adebayo',
        memberCount: 12500,
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=lagos',
        isLiveNow: true,
        activities: ['Global Intercession Hour', 'Emergency Aid Fund', 'Worship Choir Studio']
    },
    {
        id: 'c-4',
        name: 'St. Paul’s Sanctuary',
        city: 'London',
        country: 'United Kingdom',
        denomination: 'Anglican / Episcopal',
        leadPastor: 'Rev. Elizabeth Taylor',
        memberCount: 3100,
        isLiveNow: false,
        activities: ['Traditional Choir', '3D Sanctuary Prayer Wall', 'Pastoral Counseling']
    }
];

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const country = searchParams.get('country');
        const denomination = searchParams.get('denomination');
        const query = searchParams.get('query')?.toLowerCase();

        let filtered = [...DEFAULT_GLOBAL_CHURCHES];

        if (country) {
            filtered = filtered.filter(c => c.country.toLowerCase() === country.toLowerCase());
        }
        if (denomination) {
            filtered = filtered.filter(c => c.denomination.toLowerCase() === denomination.toLowerCase());
        }
        if (query) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.city.toLowerCase().includes(query) ||
                c.country.toLowerCase().includes(query)
            );
        }

        return NextResponse.json({
            success: true,
            churches: filtered
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, churches: DEFAULT_GLOBAL_CHURCHES });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, city, country, denomination, leadPastor } = body;

        if (!name || !city || !country) {
            return NextResponse.json({ error: 'Name, City, and Country are required' }, { status: 400 });
        }

        const newChurch: GlobalChurchProfile = {
            id: `c-${Date.now()}`,
            name,
            city,
            country,
            denomination: denomination || 'Non-Denominational',
            leadPastor: leadPastor || 'Senior Pastor',
            memberCount: 100,
            isLiveNow: false,
            activities: ['Sunday Service', 'Pastoral Care', 'Sanctuary AI Integration']
        };

        return NextResponse.json({
            success: true,
            message: 'Church onboarded to Digital Church OS Global Network!',
            church: newChurch
        });
    } catch (err: any) {
        return NextResponse.json({ error: 'Failed to onboard church' }, { status: 500 });
    }
}
