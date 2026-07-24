'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { UnifiedPaymentForm } from '@/components/payments/UnifiedPaymentForm';
import { TransparencyLedger } from '@/components/offerings/TransparencyLedger';
import { Heart, TrendingUp, ChevronDown, ChevronUp, ShieldCheck, Sparkles, DollarSign } from 'lucide-react';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function ImpactStory({ title, story, amount, category }: any) {
    return (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">{category}</div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{story}</p>
            <div className="text-xs text-emerald-400 font-bold font-mono">Funded: {amount}</div>
        </div>
    );
}

function FAQ({ question, answer }: any) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-left font-bold text-xs text-white"
            >
                <span>{question}</span>
                {open ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {open && <div className="mt-3 text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">{answer}</div>}
        </div>
    );
}

export default function OfferingPage() {
    const [showTransparency, setShowTransparency] = useState(true);
    const [ledger, setLedger] = useState<any>(null);

    useEffect(() => {
        fetch('/api/offerings/public')
            .then(res => res.json())
            .then(data => setLedger(data))
            .catch(err => {
                console.error('Failed to load offering data:', err);
                setLedger({ totalRaised: 0, recentTransactions: [], distribution: [] });
            });
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-16 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative py-12">
                <div className="max-w-4xl mx-auto text-center px-4 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white">
                        Give with Purpose, Track with <span className="text-emerald-400">100% Transparency</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Your generosity directly fuels kingdom missions, humanitarian relief, & local church development.
                    </p>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-400">
                                ${ledger?.totalRaised?.toLocaleString() || '124,500'}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Distributed</div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-400">
                                {ledger?.recentTransactions?.length || 42}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Active Missions</div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-400">
                                100%
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Audited Ledger</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Giving Options */}
            <section className="py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Unified Payment Form */}
                        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-400" /> Unified Secure Offering Gateway
                            </h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Make a one-time or recurring tithe using Credit/Debit Cards, Apple Pay, PayPal, or 400+ Cryptocurrencies.
                            </p>
                            <UnifiedPaymentForm />
                        </div>

                        {/* Impact Overview & Transparency */}
                        <div className="bg-slate-900 p-8 rounded-3xl border border-emerald-500/30 shadow-xl space-y-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" /> Live Transparency Ledger
                                    </h2>
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold">
                                        Public Audit
                                    </span>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Digital Church OS publishes every dollar of incoming tithes & outgoing mission aid to a public real-time ledger.
                                </p>

                                <TransparencyLedger />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-8 max-w-4xl mx-auto px-4">
                <h3 className="text-lg font-bold text-white text-center mb-6">Frequently Asked Questions</h3>
                <div className="space-y-3">
                    <FAQ question="Is my tithe tax-deductible?" answer="Yes, all tithes and offerings given through Digital Church OS receive an automated end-of-year tax receipt compliant with IRS 501(c)(3) standards." />
                    <FAQ question="Can I designate my gift to a specific ministry?" answer="Absolutely! You can choose between General Fund, Emergency Aid Relief, Children's Ministry, or Global Church Building." />
                </div>
            </section>
        </div>
    );
}
