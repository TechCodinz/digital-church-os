import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const PaymentSchema = z.object({
    amount: z.coerce.number().finite().min(1).max(100000),
    purpose: z.enum(['PLATFORM_UPKEEP', 'COMMUNITY_AID', 'CONFERENCE_SUPPORT']),
    isRecurring: z.boolean().optional().default(false),
    currency: z.enum(['usd']).optional().default('usd'),
});

function getStripe() {
    const secret = process.env.STRIPE_SECRET_KEY;
    return secret ? new Stripe(secret) : null;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id as string | undefined;
        if (!userId) {
            return NextResponse.json({ error: 'Sign in is required before giving.' }, { status: 401 });
        }

        const stripe = getStripe();
        if (!stripe) {
            return NextResponse.json({ error: 'Stripe giving is not configured in this environment.' }, { status: 503 });
        }

        const validation = PaymentSchema.safeParse(await req.json());
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid giving request.', details: validation.error.flatten() }, { status: 400 });
        }

        const { amount, purpose, isRecurring, currency } = validation.data;
        const unitAmount = Math.round(amount * 100);
        const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
        const label = purpose === 'COMMUNITY_AID'
            ? 'Community Aid'
            : purpose === 'CONFERENCE_SUPPORT'
            ? 'Conference Support'
            : 'Platform Upkeep';

        const checkout = await stripe.checkout.sessions.create({
            mode: isRecurring ? 'subscription' : 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency,
                    unit_amount: unitAmount,
                    product_data: { name: `Digital Church OS — ${label}` },
                    ...(isRecurring ? { recurring: { interval: 'month' as const } } : {}),
                },
                quantity: 1,
            }],
            success_url: `${baseUrl}/offering/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/offering`,
            client_reference_id: userId,
            metadata: { userId, purpose },
            ...(isRecurring
                ? { subscription_data: { metadata: { userId, purpose } } }
                : { payment_intent_data: { metadata: { userId, purpose } } }),
        });

        if (!checkout.url) {
            return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 502 });
        }

        return NextResponse.json({
            provider: 'stripe',
            mode: isRecurring ? 'subscription' : 'payment',
            url: checkout.url,
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json({ error: 'Unable to start secure checkout.' }, { status: 500 });
    }
}
