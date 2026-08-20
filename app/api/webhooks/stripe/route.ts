import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/templates';
import { TransparencyLedger } from '@/lib/payments/transparencyLedger';
import { AidAllocationEngine } from '@/lib/payments/aidAllocation';

const ledger = new TransparencyLedger();
const aidAllocation = new AidAllocationEngine();
const PURPOSES = new Set(['PLATFORM_UPKEEP', 'COMMUNITY_AID', 'CONFERENCE_SUPPORT']);

function getStripe() {
    const secret = process.env.STRIPE_SECRET_KEY;
    return secret ? new Stripe(secret) : null;
}

function safePurpose(value: unknown) {
    return typeof value === 'string' && PURPOSES.has(value) ? value : 'COMMUNITY_AID';
}

export async function POST(req: NextRequest) {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !webhookSecret) {
        return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 503 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        return NextResponse.json({ error: 'Stripe signature missing.' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handleSuccessfulPayment(event.data.object as Stripe.PaymentIntent);
                break;
            case 'payment_intent.payment_failed':
                await handleFailedPayment(event.data.object as Stripe.PaymentIntent);
                break;
            case 'invoice.payment_succeeded':
                await handleRecurringPayment(stripe, event.data.object as Stripe.Invoice);
                break;
            default:
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook handler failed:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

async function recordOffering(params: {
    externalId: string;
    userId: string;
    amount: number;
    currency: string;
    purpose: string;
    recurring: boolean;
    recurringId?: string | null;
}) {
    const existing = await prisma.offering.findUnique({ where: { stripePaymentIntentId: params.externalId } });
    if (existing) return { offering: existing, created: false };

    const offering = await prisma.offering.create({
        data: {
            amount: params.amount,
            currency: params.currency,
            purpose: safePurpose(params.purpose) as any,
            stripePaymentIntentId: params.externalId,
            paymentMethod: 'stripe',
            transactionId: params.externalId,
            isRecurring: params.recurring,
            recurringId: params.recurringId || undefined,
            status: 'SUCCEEDED',
            userId: params.userId,
        },
    });

    return { offering, created: true };
}

async function runPostPaymentEffects(offering: any, userId: string, purpose: string, sendReceipt: boolean) {
    if (sendReceipt) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.email) {
                await sendEmail(user.email, 'offeringReceipt', [user.name || 'Community Member', offering.amount]);
            }
        } catch (error) {
            console.error('Offering receipt email failed after successful payment:', error);
        }
    }

    try {
        await ledger.updateLedger(offering);
    } catch (error) {
        console.error('Transparency ledger update failed after successful payment:', error);
    }

    if (purpose === 'COMMUNITY_AID') {
        try {
            await aidAllocation.allocateFunds();
        } catch (error) {
            console.error('Aid allocation pass failed after successful payment:', error);
        }
    }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
    const userId = paymentIntent.metadata.userId;
    if (!userId) return;

    const purpose = safePurpose(paymentIntent.metadata.purpose);
    const { offering, created } = await recordOffering({
        externalId: paymentIntent.id,
        userId,
        amount: paymentIntent.amount_received > 0 ? paymentIntent.amount_received / 100 : paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        purpose,
        recurring: false,
    });

    if (created) {
        await runPostPaymentEffects(offering, userId, purpose, true);
    }
}

async function handleRecurringPayment(stripe: Stripe, invoice: Stripe.Invoice) {
    const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : null;
    if (!subscriptionId || (invoice.amount_paid || 0) <= 0) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata.userId;
    if (!userId) return;

    const purpose = safePurpose(subscription.metadata.purpose);
    const paymentIntentId = typeof (invoice as any).payment_intent === 'string'
        ? (invoice as any).payment_intent
        : `stripe-invoice:${invoice.id}`;

    const { offering, created } = await recordOffering({
        externalId: paymentIntentId,
        userId,
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency,
        purpose,
        recurring: true,
        recurringId: subscriptionId,
    });

    if (created) {
        await runPostPaymentEffects(offering, userId, purpose, false);
    }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
    const userId = paymentIntent.metadata.userId;
    if (!userId) return;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) await sendEmail(user.email, 'paymentFailed', [user.name || 'Community Member']);
    } catch (error) {
        console.error('Payment-failed notification email failed:', error);
    }
}
