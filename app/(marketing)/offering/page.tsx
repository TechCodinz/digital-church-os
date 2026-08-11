'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { UnifiedPaymentForm } from '@/components/payments/UnifiedPaymentForm';
import { TransparencyLedger } from '@/components/offerings/TransparencyLedger';
import { Heart, ShieldCheck, Eye, ReceiptText, HandHeart, ArrowRight, LockKeyhole } from 'lucide-react';

type PublicLedger = {
    totalRaised?: number;
    recentTransactions?: unknown[];
    distribution?: unknown[];
};

const givingPurposes = [
    { id: 'general', label: 'General ministry', description: 'Support approved church ministry and operating priorities.' },
    { id: 'benevolence', label: 'Benevolence & care', description: 'Support reviewed assistance and pastoral-care needs.' },
    { id: 'missions', label: 'Missions & outreach', description: 'Support approved outreach, evangelism, and mission work.' },
    { id: 'children', label: 'Children & youth', description: 'Support age-appropriate ministry, safeguarding, and formation.' },
    { id: 'media', label: 'Worship & media', description: 'Support approved worship, broadcast, and ministry media work.' },
];

export default function OfferingPage() {
    const [ledger, setLedger] = useState<PublicLedger | null>(null);
    const [purpose, setPurpose] = useState('general');
    const [privateGift, setPrivateGift] = useState(false);
    const [receiptReminder, setReceiptReminder] = useState(true);

    useEffect(() => {
        fetch('/api/offerings/public')
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Offering ledger unavailable'))))
            .then((data) => setLedger(data))
            .catch(() => setLedger({ totalRaised: 0, recentTransactions: [], distribution: [] }));
    }, []);

    const selectedPurpose = useMemo(
        () => givingPurposes.find((item) => item.id === purpose) ?? givingPurposes[0],
        [purpose],
    );

    return (
        <div className="min-h-screen bg-cream-50 pb-24 pt-20 sm:pt-24">
            <section className="relative overflow-hidden border-b border-cream-200 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(120,155,100,0.18),_transparent_35%)]" />
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                    <div>
                        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                            <Heart className="mr-2 h-4 w-4" /> Stewardship workspace
                        </div>
                        <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-800 sm:text-5xl lg:text-6xl">
                            Give with purpose, privacy, and accountable stewardship.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                            Choose an intended ministry purpose, use the configured payment provider, keep your giving preferences private, and review public transparency data when it is available.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
                            <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1.5"><ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Human-governed funds</span>
                            <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1.5"><LockKeyhole className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Privacy-aware giving</span>
                            <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1.5"><Eye className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Public transparency where configured</span>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-xl sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Live public snapshot</p>
                        <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                                <p className="text-2xl font-semibold text-emerald-700">${Number(ledger?.totalRaised || 0).toLocaleString()}</p>
                                <p className="mt-1 text-[11px] text-stone-500">Reported total</p>
                            </div>
                            <div className="rounded-2xl bg-stone-50 p-4 text-center">
                                <p className="text-2xl font-semibold text-stone-800">{ledger?.recentTransactions?.length || 0}</p>
                                <p className="mt-1 text-[11px] text-stone-500">Recent entries</p>
                            </div>
                            <div className="rounded-2xl bg-stone-50 p-4 text-center">
                                <p className="text-2xl font-semibold text-stone-800">{ledger?.distribution?.length || 0}</p>
                                <p className="mt-1 text-[11px] text-stone-500">Impact areas</p>
                            </div>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-stone-500">These values reflect what the public offering API currently returns. Zero means no public data is available; it is not replaced with invented impact figures.</p>
                    </div>
                </div>
            </section>

            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="space-y-5">
                        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Giving intention</p>
                            <h2 className="mt-2 text-2xl font-light text-stone-800">Choose what you want to support</h2>
                            <div className="mt-5 space-y-2">
                                {givingPurposes.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setPurpose(item.id)}
                                        className={`w-full rounded-2xl border p-4 text-left transition ${purpose === item.id ? 'border-emerald-300 bg-emerald-50' : 'border-stone-200 bg-white hover:border-emerald-200'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${purpose === item.id ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300 bg-white'}`} />
                                            <div>
                                                <p className="font-semibold text-stone-800">{item.label}</p>
                                                <p className="mt-1 text-sm leading-5 text-stone-600">{item.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Privacy & records</p>
                            <div className="mt-4 space-y-3">
                                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-stone-50 p-4">
                                    <input type="checkbox" checked={privateGift} onChange={(event) => setPrivateGift(event.target.checked)} className="mt-1" />
                                    <span><strong className="block text-sm text-stone-800">Keep my giving preference private</strong><span className="mt-1 block text-xs leading-5 text-stone-500">Public transparency should never expose donor identity unless the donor explicitly chooses a supported public option.</span></span>
                                </label>
                                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-stone-50 p-4">
                                    <input type="checkbox" checked={receiptReminder} onChange={(event) => setReceiptReminder(event.target.checked)} className="mt-1" />
                                    <span><strong className="block text-sm text-stone-800">Remind me to keep the provider receipt</strong><span className="mt-1 block text-xs leading-5 text-stone-500">Tax or charitable treatment depends on the receiving organization and jurisdiction; this page does not assume eligibility.</span></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-xl sm:p-8">
                        <div className="flex flex-col gap-4 border-b border-stone-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Secure giving</p>
                                <h2 className="mt-2 text-3xl font-light text-stone-800">{selectedPurpose.label}</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{selectedPurpose.description}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><HandHeart className="h-6 w-6" /></div>
                        </div>
                        <div className="mt-6">
                            <UnifiedPaymentForm />
                        </div>
                        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                            The payment form is the transaction source of truth. A selected ministry intention on this screen should only be treated as a designation when the connected payment workflow is configured to persist it.
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-cream-200 bg-white/70 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Transparency ledger</p>
                            <h2 className="mt-2 text-3xl font-light text-stone-800">Review published stewardship records</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Only data actually published by the configured ledger should appear here. Sensitive donor information stays out of the public surface.</p>
                        </div>
                        <Link href="/transparency" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800">Open transparency center <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </div>
                    <TransparencyLedger />
                </div>
            </section>

            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
                    <div className="rounded-3xl border border-stone-200 bg-white p-6">
                        <ReceiptText className="h-6 w-6 text-emerald-600" />
                        <h3 className="mt-4 text-lg font-semibold text-stone-800">Receipts & history</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-600">Transaction receipts and recurring-gift management should come from the connected payment provider or member account history.</p>
                    </div>
                    <div className="rounded-3xl border border-stone-200 bg-white p-6">
                        <ShieldCheck className="h-6 w-6 text-emerald-600" />
                        <h3 className="mt-4 text-lg font-semibold text-stone-800">Human financial governance</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-600">AI may explain giving options or summarize published data, but it should not independently approve distributions, benevolence, or financial exceptions.</p>
                    </div>
                    <div className="rounded-3xl border border-stone-200 bg-white p-6">
                        <Heart className="h-6 w-6 text-emerald-600" />
                        <h3 className="mt-4 text-lg font-semibold text-stone-800">Need support instead?</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-600">Giving is never required to access prayer or care. Members who need assistance can use the support pathways instead.</p>
                        <Link href="/aid-request" className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700">Request support <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </div>
                </div>
            </section>
        </div>
    );
}