import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured. Add it to your hosting environment before enabling offerings.');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }

  return stripeClient;
}

export const formatAmountForStripe = (amount: number) => {
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number) => {
  return amount / 100;
};
