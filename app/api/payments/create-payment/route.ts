import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getOrCreateProduct(purpose: string) {
    const products = await stripe.products.search({ query: `name:'${purpose}'` });
    if (products.data.length > 0) return products.data[0].id;

    const newProduct = await stripe.products.create({ name: purpose });
    return newProduct.id;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        let userId = session?.user?.id;

        // Allow demo usage fallback
        if (!userId && process.env.NODE_ENV === 'development') {
            userId = "demo_user_id";
        }

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { amount, purpose, isRecurring, currency = 'usd' } = await req.json();

        // Create Stripe payment
        if (isRecurring) {
            // Create subscription
            const price = await stripe.prices.create({
                unit_amount: amount * 100,
                currency,
                recurring: { interval: 'month' },
                product: await getOrCreateProduct(purpose),
            });

            const subscription = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{
                    price: price.id,
                    quantity: 1,
                }],
                success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/offering/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/offering`,
                metadata: {
                    userId,
                    purpose,
                },
            });

            return NextResponse.json({ url: subscription.url });
        } else {
            // One-time payment
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100,
                currency,
                metadata: {
                    userId,
                    purpose,
                },
            });

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            });
        }
    } catch (error) {
        console.error('Payment error:', error);
        return new NextResponse('Payment failed', { status: 500 });
    }
}
