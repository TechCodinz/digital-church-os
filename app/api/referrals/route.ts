import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReferralManager } from '@/lib/engagement/referral';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            // For demo purposes, we'll allow a mock user ID if session isn't available
            const mockUserId = 'demo-user-123';
            const referral = await ReferralManager.generateReferralLink(mockUserId);
            return NextResponse.json(referral);
        }

        const referral = await ReferralManager.generateReferralLink(session.user.id);
        return NextResponse.json(referral);
    } catch (error) {
        console.error('Referral Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate referral link' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    const validation = await ReferralManager.validateReferral(code);
    return NextResponse.json(validation);
}
