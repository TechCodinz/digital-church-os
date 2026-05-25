import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { formatAmountForStripe, getStripeClient } from '@/lib/stripe';
import { AuditLogger } from '@/lib/audit/logger';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';

const OfferingSchema = z.object({
  amount: z.coerce.number().min(1).max(100000),
  currency: z.string().trim().toLowerCase().regex(/^[a-z]{3}$/).default('usd'),
  purpose: z.enum(['PLATFORM_UPKEEP', 'COMMUNITY_AID', 'CONFERENCE_SUPPORT']).default('COMMUNITY_AID'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = `offerings:${session.user.id}:${getClientKey(req.headers)}`;
  const limit = rateLimit(key, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many payment attempts. Please wait before trying again.' }, { status: 429, headers: rateLimitHeaders(limit) });
  }

  try {
    const body = await req.json();
    const validation = OfferingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid offering payload', details: validation.error.flatten() }, { status: 400, headers: rateLimitHeaders(limit) });
    }

    const { amount, currency, purpose } = validation.data;
    const stripe = getStripeClient();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
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
        currency: currency.toUpperCase(),
        purpose,
        userId: session.user.id,
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'OFFERING_PAYMENT_INTENT_CREATED',
      entityType: 'Offering',
      entityId: offering.id,
      metadata: { amount, currency, purpose, provider: 'stripe' },
      req,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, offeringId: offering.id }, { headers: rateLimitHeaders(limit) });
  } catch (error: any) {
    console.error('Error recording offering:', error);
    const message = error?.message?.includes('STRIPE_SECRET_KEY')
      ? 'Giving is not configured yet. Please add STRIPE_SECRET_KEY before accepting offerings.'
      : 'Failed to record offering';
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders(limit) });
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
        user: { select: { name: true, email: true } },
      },
      take: 250,
    });

    return NextResponse.json(offerings);
  } catch (error) {
    console.error('Failed to fetch offerings:', error);
    return NextResponse.json({ error: 'Failed to fetch offerings' }, { status: 500 });
  }
}
