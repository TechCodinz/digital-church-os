import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/templates';
import { TransparencyLedger } from '@/lib/payments/transparencyLedger';
import { AidAllocationEngine } from '@/lib/payments/aidAllocation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const ledger = new TransparencyLedger();
const aidAllocation = new AidAllocationEngine();

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handleSuccessfulPayment(paymentIntent);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object as Stripe.PaymentIntent;
                await handleFailedPayment(failedPayment);
                break;

            case 'customer.subscription.created':
                // const subscription = event.data.object as Stripe.Subscription;
                // handleSubscriptionCreated(subscription);
                break;

            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                await handleRecurringPayment(invoice);
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler failed:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
    const userId = paymentIntent.metadata.userId;
    const purpose = paymentIntent.metadata.purpose as any;

    if (!userId) return;

    // Create offering record
    const offering = await prisma.offering.create({
        data: {
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            purpose: purpose || 'COMMUNITY_AID',
            stripePaymentIntentId: paymentIntent.id,
            userId: userId,
        },
    });

    // Send receipt email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.email) {
        await sendEmail(user.email, 'offeringReceipt', [user.name || 'Community Member', paymentIntent.amount / 100]);
    }

    // Update transparency ledger
    await ledger.updateLedger(offering);

    // Check if aid allocation
    if (purpose === 'COMMUNITY_AID') {
        await aidAllocation.allocateFunds();
    }
}

async function handleRecurringPayment(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription) return;

    const userId = subscription.metadata.userId;
    const purpose = subscription.metadata.purpose;

    if (!userId) return;

    // Record recurring offering
    const offering = await prisma.offering.create({
        data: {
            amount: (invoice.amount_paid || 0) / 100,
            currency: invoice.currency,
            purpose: (purpose || 'COMMUNITY_AID') as any,
            stripePaymentIntentId: invoice.payment_intent as string,
            userId,
            // isRecurring: true, // Prisma schema doesn't have this field as per earlier code, omitting to prevent errors
            // recurringId: subscriptionId, // Omitted
        },
    });

    // Update transparency ledger
    await ledger.updateLedger(offering);

    if (purpose === 'COMMUNITY_AID') {
        await aidAllocation.allocateFunds();
    }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
    const userId = paymentIntent.metadata.userId;
    if (!userId) return;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.email) {
        await sendEmail(user.email, 'paymentFailed', [user.name || 'Community Member']);
    }
}
