'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Eye, HandHeart, Heart, LockKeyhole, ReceiptText, ShieldCheck, Sparkles } from 'lucide-react';
import { UnifiedPaymentForm } from '@/components/payments/UnifiedPaymentForm';
import { TransparencyLedger } from '@/components/offerings/TransparencyLedger';

type PublicLedger = {
  totalRaised?: number;
  totalGifts?: number;
  recentTransactions?: unknown[];
  distribution?: unknown[];
};

type PaymentPurpose = 'PLATFORM_UPKEEP' | 'COMMUNITY_AID' | 'CONFERENCE_SUPPORT';
type GivingDesignation = 'GENERAL_MINISTRY' | 'BENEVOLENCE_CARE' | 'MISSIONS_OUTREACH' | 'CHILDREN_YOUTH' | 'WORSHIP_MEDIA';

type GivingPurpose = {
  id: string;
  label: string;
  description: string;
  paymentPurpose: PaymentPurpose;
  designation: GivingDesignation;
};

const givingPurposes: GivingPurpose[] = [
  { id: 'general', label: 'General ministry', description: 'Support approved ministry operations, digital sanctuary infrastructure, and shared ministry priorities.', paymentPurpose: 'PLATFORM_UPKEEP', designation: 'GENERAL_MINISTRY' },
  { id: 'benevolence', label: 'Benevolence & care', description: 'Support reviewed assistance, pastoral-care needs, and community aid.', paymentPurpose: 'COMMUNITY_AID', designation: 'BENEVOLENCE_CARE' },
  { id: 'missions', label: 'Missions & outreach', description: 'Support approved outreach, evangelism, and mission work.', paymentPurpose: 'COMMUNITY_AID', designation: 'MISSIONS_OUTREACH' },
  { id: 'children', label: 'Children & youth', description: 'Support age-appropriate ministry, safeguarding, teaching, and formation.', paymentPurpose: 'COMMUNITY_AID', designation: 'CHILDREN_YOUTH' },
  { id: 'media', label: 'Worship & media', description: 'Support worship, broadcast, media production, and ministry technology.', paymentPurpose: 'PLATFORM_UPKEEP', designation: 'WORSHIP_MEDIA' },
];

export default function OfferingPage() {
  const [ledger, setLedger] = useState<PublicLedger | null>(null);
  const [purpose, setPurpose] = useState('general');
  const [privateGift, setPrivateGift] = useState(false);

  useEffect(() => {
    fetch('/api/offerings/public', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Offering ledger unavailable'))))
      .then((data) => setLedger(data))
      .catch(() => setLedger({ totalRaised: 0, totalGifts: 0, recentTransactions: [], distribution: [] }));
  }, []);

  const selectedPurpose = useMemo(
    () => givingPurposes.find((item) => item.id === purpose) ?? givingPurposes[0],
    [purpose],
  );

  return (
    <div className="sanctuary-page-shell bg-[#06110f] pb-24 pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-semibold text-amber-100 backdrop-blur-xl">
              <Heart className="mr-2 h-4 w-4" /> Stewardship, without pressure
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-light leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Give quietly. Give purposefully. Let every recorded gift tell the truth.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
              Choose a ministry designation, continue through the configured payment provider, and review only the stewardship data the system can actually verify.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/65">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-emerald-300" /> Provider-confirmed records</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2"><LockKeyhole className="mr-1.5 inline h-3.5 w-3.5 text-emerald-300" /> Persisted anonymous preference</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2"><Eye className="mr-1.5 inline h-3.5 w-3.5 text-emerald-300" /> No invented impact totals</span>
            </div>
          </div>

          <div className="sacred-panel-dark relative z-10 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="sanctuary-section-label text-emerald-200/65">Published snapshot</p>
                <h2 className="mt-2 text-2xl font-light text-white">What the ledger currently knows</h2>
              </div>
              <Sparkles className="h-6 w-6 text-amber-200" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.045] p-4 text-center">
                <p className="text-2xl font-semibold text-amber-100">${Number(ledger?.totalRaised || 0).toLocaleString()}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-white/40">Recorded total</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.045] p-4 text-center">
                <p className="text-2xl font-semibold text-white">{Number(ledger?.totalGifts ?? ledger?.recentTransactions?.length ?? 0)}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-white/40">Recorded gifts</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.045] p-4 text-center">
                <p className="text-2xl font-semibold text-white">{ledger?.distribution?.length || 0}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-white/40">Purpose groups</p>
              </div>
            </div>
            <p className="mt-5 text-xs leading-6 text-white/45">Zero means no published record is available. The interface never substitutes demo revenue, fabricated donors, or an “audited” claim.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
              <p className="sanctuary-section-label text-emerald-700">Giving intention</p>
              <h2 className="mt-2 text-3xl font-light text-stone-800">Where should this gift be designated?</h2>
              <div className="mt-6 space-y-2">
                {givingPurposes.map((item) => {
                  const selected = purpose === item.id;
                  return (
                    <button key={item.id} type="button" onClick={() => setPurpose(item.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-stone-200 bg-white hover:border-emerald-200'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${selected ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300 bg-white'}`} />
                        <div>
                          <p className="font-semibold text-stone-800">{item.label}</p>
                          <p className="mt-1 text-sm leading-5 text-stone-600">{item.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
              <p className="sanctuary-section-label text-emerald-700">Privacy</p>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-stone-50 p-4">
                <input type="checkbox" checked={privateGift} onChange={(event) => setPrivateGift(event.target.checked)} className="mt-1" />
                <span>
                  <strong className="block text-sm text-stone-800">Record my gift as anonymous</strong>
                  <span className="mt-1 block text-xs leading-5 text-stone-500">This preference is carried through Stripe metadata and persisted on the confirmed offering. Stripe still retains the information required to process payment.</span>
                </span>
              </label>
              <p className="mt-4 text-xs leading-5 text-stone-500">Public transparency never needs donor identity to show aggregate stewardship data.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-col gap-4 border-b border-stone-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="sanctuary-section-label text-emerald-700">Secure giving</p>
                <h2 className="mt-2 text-3xl font-light text-stone-800">{selectedPurpose.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{selectedPurpose.description}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><HandHeart className="h-6 w-6" /></div>
            </div>
            <div className="mt-6">
              <UnifiedPaymentForm
                purpose={selectedPurpose.paymentPurpose}
                designation={selectedPurpose.designation}
                designationLabel={selectedPurpose.label}
                isAnonymous={privateGift}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="sanctuary-section-label text-emerald-700">Transparency ledger</p>
              <h2 className="mt-2 text-3xl font-light text-stone-800">Published stewardship records, not marketing numbers</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">This surface reflects records the application actually stores. It does not claim independent audit assurance.</p>
            </div>
            <Link href="/transparency" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800">Open transparency center <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </div>
          <TransparencyLedger />
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <ReceiptText className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-stone-800">Provider-confirmed history</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">A successful offering is recorded only after the signed Stripe webhook confirms the payment.</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-stone-800">Human financial governance</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">AI can explain options or summarize published records, but it does not independently approve distributions, benevolence, or exceptions.</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <Heart className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-stone-800">Need support instead?</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Giving is never required to access prayer or care.</p>
            <Link href="/aid-request" className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700">Request support <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
