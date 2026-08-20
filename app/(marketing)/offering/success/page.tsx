import Link from 'next/link';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CheckCircle2, Clock3, HeartHandshake, ShieldCheck, TriangleAlert } from 'lucide-react';

type PageProps = {
  searchParams?: {
    session_id?: string;
  };
};

function formatAmount(amount: number | null, currency: string | null) {
  if (amount == null || !currency) return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export default async function OfferingSuccessPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const sessionId = typeof searchParams?.session_id === 'string' ? searchParams.session_id.trim() : '';

  let state: 'verified' | 'processing' | 'unverified' | 'unauthorized' | 'unconfigured' = 'unverified';
  let amount: string | null = null;
  let purpose = '';
  let recurring = false;

  if (!userId) {
    state = 'unauthorized';
  } else if (!process.env.STRIPE_SECRET_KEY) {
    state = 'unconfigured';
  } else if (/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const checkout = await stripe.checkout.sessions.retrieve(sessionId);
      const ownerId = checkout.client_reference_id || checkout.metadata?.userId || '';

      if (ownerId === userId) {
        amount = formatAmount(checkout.amount_total, checkout.currency);
        purpose = checkout.metadata?.designation || checkout.metadata?.purpose || '';
        recurring = checkout.mode === 'subscription';
        state = checkout.payment_status === 'paid' || checkout.payment_status === 'no_payment_required'
          ? 'verified'
          : 'processing';
      }
    } catch (error) {
      console.error('Stripe checkout receipt verification failed:', error);
      state = 'unverified';
    }
  }

  const verified = state === 'verified';
  const processing = state === 'processing';

  return (
    <main className="sanctuary-page-shell min-h-screen bg-stone-950 px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8">
      <div className="sanctuary-light-column pointer-events-none absolute inset-0 opacity-60" />
      <div className="sanctuary-vignette pointer-events-none absolute inset-0" />

      <section className="relative mx-auto max-w-4xl">
        <div className="sacred-panel-dark overflow-hidden p-7 sm:p-10 lg:p-12">
          <div className="sanctuary-section-label text-sage-300">Stewardship confirmation</div>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              {verified ? (
                <CheckCircle2 className="h-12 w-12 text-sage-300" />
              ) : processing ? (
                <Clock3 className="h-12 w-12 text-amber-300" />
              ) : (
                <TriangleAlert className="h-12 w-12 text-amber-300" />
              )}

              <h1 className="mt-5 text-4xl font-light leading-tight sm:text-5xl">
                {verified
                  ? 'Stripe has confirmed your checkout.'
                  : processing
                    ? 'Your checkout is still processing.'
                    : state === 'unauthorized'
                      ? 'Sign in to verify this giving receipt.'
                      : state === 'unconfigured'
                        ? 'Receipt verification is unavailable in this environment.'
                        : 'This checkout could not be verified for this account.'}
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
                {verified
                  ? 'The payment provider has confirmed the checkout state. Digital Church OS still waits for Stripe’s signed webhook before treating the gift as a recorded offering in the ledger.'
                  : processing
                    ? 'Stripe has not yet reported this checkout as paid. The page will not invent a successful gift while the provider still reports a pending state.'
                    : state === 'unauthorized'
                      ? 'Giving receipts are account-bound. Sign in with the account that started the checkout, then return through the provider redirect.'
                      : 'No payment success is inferred from the URL alone. Only a Stripe session that belongs to the signed-in account can produce a verified confirmation here.'}
              </p>
            </div>

            {(verified || processing) && (
              <div className="min-w-[240px] rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Provider state</p>
                <dl className="mt-4 space-y-4 text-sm">
                  {amount && <div><dt className="text-stone-500">Amount</dt><dd className="mt-1 text-xl font-light text-white">{amount}</dd></div>}
                  {purpose && <div><dt className="text-stone-500">Designation</dt><dd className="mt-1 text-stone-200">{purpose}</dd></div>}
                  <div><dt className="text-stone-500">Giving mode</dt><dd className="mt-1 text-stone-200">{recurring ? 'Monthly recurring' : 'One-time'}</dd></div>
                  <div><dt className="text-stone-500">Checkout</dt><dd className={`mt-1 font-semibold ${verified ? 'text-sage-300' : 'text-amber-300'}`}>{verified ? 'Provider confirmed' : 'Processing'}</dd></div>
                </dl>
              </div>
            )}
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-stone-300">
              <ShieldCheck className="mb-3 h-5 w-5 text-sage-300" />
              A checkout redirect is not the ledger authority. The signed Stripe webhook is what records successful giving and prevents duplicate payment events from becoming duplicate offerings.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-stone-300">
              <HeartHandshake className="mb-3 h-5 w-5 text-sage-300" />
              Giving does not affect spiritual ranking, pastoral access, prayer access, or the Personal Sanctuary’s formation recommendations.
            </div>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/offering" className="sacred-secondary-button">Return to Giving</Link>
            <Link href="/dashboard" className="sacred-primary-button">Open Personal Sanctuary</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
