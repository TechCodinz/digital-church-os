import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

import { stripe } from '@/lib/stripe';

const OfferingSchema = z.object({
    amount: z.number().min(1),
    currency: z.string().default('USD'),
    purpose: z.enum(['PLATFORM_UPKEEP', 'COMMUNITY_AID', 'CONFERENCE_SUPPORT']).default('COMMUNITY_AID'),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validation = OfferingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
        }

        const { amount, currency, purpose } = validation.data;

        // Create a real Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency,
            metadata: {
                userId: session.user.id,
                purpose,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        const offering = await prisma.offering.create({
            data: {
                amount,
                currency,
                purpose,
                userId: session.user.id,
                stripePaymentIntentId: paymentIntent.id,
                status: 'PENDING',
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            offeringId: offering.id
        });
    } catch (error) {
        console.error('Error recording offering:', error);
        return NextResponse.json({ error: 'Failed to record offering' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const offerings = await prisma.offering.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        return NextResponse.json(offerings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch offerings' }, { status: 500 });
    }
}
