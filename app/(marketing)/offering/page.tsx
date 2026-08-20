'use client';

import { useEffect, useState } from 'react';
import {
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Heart,
    HeartHandshake,
    Lock,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { UnifiedPaymentForm } from '@/components/payments/UnifiedPaymentForm';
import { TransparencyLedger } from '@/components/offerings/TransparencyLedger';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type LedgerSummary = {
    totalRaised: number;
    totalGifts: number;
    recentTransactions: unknown[];
    distribution: unknown[];
};

function FAQ({ question, answer, isLight }: { question: string; answer: string; isLight: boolean }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`rounded-2xl border ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.03]'}`}>
            <button onClick={() => setOpen((value) => !value)} className="sacred-focus-ring flex w-full items-center justify-between gap-4 p-5 text-left">
                <span className={`text-sm font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{question}</span>
                {open ? <ChevronUp className={`h-4 w-4 ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} /> : <ChevronDown className={`h-4 w-4 ${isLight ? 'text-stone-400' : 'text-slate-600'}`} />}
            </button>
            {open && <p className={`border-t px-5 py-4 text-xs leading-relaxed ${isLight ? 'border-stone-100 text-stone-500' : 'border-white/7 text-slate-500'}`}>{answer}</p>}
        </div>
    );
}

export default function OfferingPage() {
    const { theme } = useSanctuaryTheme();
    const [ledger, setLedger] = useState<LedgerSummary | null>(null);
    const [ledgerAvailable, setLedgerAvailable] = useState(true);
    const isLight = theme === 'light';

    useEffect(() => {
        fetch('/api/offerings/public', { cache: 'no-store' })
            .then(async (response) => {
                if (!response.ok) throw new Error('Ledger unavailable');
                return response.json();
            })
            .then((data) => setLedger(data))
            .catch(() => setLedgerAvailable(false));
    }, []);

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/25">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                                <Heart className="h-3.5 w-3.5" /> Giving & stewardship
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">Give without pressure. See what the system can actually prove.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">A secure giving journey with real provider handoff, recorded-gift transparency, and no fabricated impact totals, tax promises, spiritual scoring, or unconnected payment rails.</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a href="#give" className="sacred-primary-button">Give securely <ArrowRight className="h-4 w-4" /></a>
                                <a href="#ledger" className="sacred-secondary-button"><ShieldCheck className="h-4 w-4" /> View recorded ledger</a>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                                <p className="text-3xl font-light">{ledgerAvailable && ledger ? `$${Number(ledger.totalRaised || 0).toLocaleString()}` : '—'}</p>
                                <p className="mt-2 text-[9px] uppercase tracking-[0.17em] text-slate-500">Recorded giving</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                                <p className="text-3xl font-light">{ledgerAvailable && ledger ? Number(ledger.totalGifts || 0).toLocaleString() : '—'}</p>
                                <p className="mt-2 text-[9px] uppercase tracking-[0.17em] text-slate-500">Recorded gifts</p>
                            </div>
                            <div className="col-span-2 rounded-3xl border border-amber-300/14 bg-amber-300/[0.035] p-5">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                                    <p className="text-[11px] leading-relaxed text-slate-500">Giving is never used as a holiness, maturity, favor, or engagement score. Generosity stays between the giver, the receiving ministry, and appropriate accountability systems.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="give" className="mt-8 grid xl:grid-cols-[1fr_0.86fr] gap-6 items-start scroll-mt-28">
                    <div className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/85 shadow-xl shadow-stone-200/20' : 'border-white/8 bg-white/[0.03]'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Secure checkout</p>
                                <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Choose the purpose, amount, and rhythm.</h2>
                                <p className={`mt-3 max-w-2xl text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Only the verified Stripe card flow is presented as active in this branch. Other payment methods stay visibly unavailable until their real integrations are connected.</p>
                            </div>
                            <Lock className={`h-5 w-5 shrink-0 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                        </div>

                        <div className="mt-7 rounded-[1.75rem] bg-[#fbf8f3] p-4 sm:p-5 text-stone-900">
                            <UnifiedPaymentForm />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="sacred-panel-dark p-6 sm:p-7 text-white">
                            <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            <h3 className="mt-4 text-xl font-light">What “transparent” means here</h3>
                            <p className="mt-3 text-xs leading-relaxed text-slate-500">The public ledger summarizes records stored by the application. It does not claim an external audit, independent assurance, or perfect allocation tracing unless those systems are separately implemented and verified.</p>
                        </div>
                        <Link href="/aid-request/emergency" className={`group block rounded-3xl border p-6 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.03]'}`}>
                            <HeartHandshake className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-rose-300'}`} />
                            <h3 className={`mt-4 text-lg font-semibold ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>Need support rather than giving?</h3>
                            <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-600'}`}>Move into the aid-request journey instead of feeling pressure to contribute.</p>
                            <span className={`mt-5 inline-flex items-center gap-2 text-xs font-bold ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Open aid request <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></span>
                        </Link>
                    </div>
                </section>

                <section id="ledger" className="mt-8 scroll-mt-28">
                    <div className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.03]'}`}>
                        <div className="mb-6">
                            <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Recorded giving ledger</p>
                            <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Show the data, not a marketing number.</h2>
                        </div>
                        <div className="rounded-[1.75rem] bg-[#fbf8f3] p-4 sm:p-6 text-stone-900">
                            <TransparencyLedger />
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
                    <div>
                        <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Questions</p>
                        <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Clarity before contribution.</h2>
                        <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Important legal, tax, and allocation questions should be answered precisely rather than with blanket promises.</p>
                    </div>
                    <div className="space-y-3">
                        <FAQ isLight={isLight} question="Is a gift automatically tax-deductible?" answer="No blanket tax promise is made here. Deductibility depends on the receiving legal entity, jurisdiction, purpose, and the giver’s circumstances. Receipts can document transactions but do not by themselves determine tax treatment." />
                        <FAQ isLight={isLight} question="Do you support PayPal or crypto here?" answer="Those methods should only appear as active after a real provider integration, server-side verification, webhook/reconciliation flow, and operational review are connected. This branch currently presents the verified Stripe card path only." />
                        <FAQ isLight={isLight} question="Does the ledger prove where every dollar ultimately went?" answer="The current public ledger summarizes recorded offerings and their stored purposes. It should not be described as an independent audit or complete end-to-end allocation proof unless those additional systems are implemented and verified." />
                    </div>
                </section>
            </div>
        </div>
    );
}
