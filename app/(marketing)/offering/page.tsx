'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { UnifiedPaymentForm } from '@/components/payments/UnifiedPaymentForm';
import { TransparencyLedger } from '@/components/offerings/TransparencyLedger';
import { Heart, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function ImpactStory({ title, story, amount, category }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <div className="text-sm font-medium text-emerald-600 mb-2">{category}</div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">{title}</h3>
            <p className="text-stone-600 mb-4">{story}</p>
            <div className="text-sm text-stone-500 font-medium">Funded with {amount}</div>
        </div>
    );
}

function FAQ({ question, answer }: any) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-4">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-left font-medium text-stone-800"
            >
                {question}
                {open ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
            </button>
            {open && <div className="mt-4 text-stone-600">{answer}</div>}
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
                // Fallback gracefully without hardcoded fake data
                setLedger({ totalRaised: 0, recentTransactions: [], distribution: [] });
            });
    }, []);

    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-b from-emerald-50 to-cream-50">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <Heart className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4">
                        Give with Purpose, Track with Transparency
                    </h1>
                    <p className="text-xl text-stone-600 mb-8">
                        Your generosity fuels spiritual growth and helps those in need
                    </p>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                        <div className="bg-white/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-emerald-600">
                                ${ledger?.totalRaised?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-stone-500">Total Given</div>
                        </div>
                        <div className="bg-white/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-emerald-600">
                                {ledger?.recentTransactions?.length || 0}
                            </div>
                            <div className="text-sm text-stone-500">Gifts This Month</div>
                        </div>
                        <div className="bg-white/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-emerald-600">
                                {ledger?.distribution?.length || 0}
                            </div>
                            <div className="text-sm text-stone-500">Impact Areas</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Giving Options */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* One-time Giving */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                            <h2 className="text-2xl font-light mb-4">Unified Payment Gateway</h2>
                            <p className="text-stone-600 mb-6">
                                Make a secure one-time or recurring gift using traditional cards, Apple Pay, PayPal, or 400+ Cryptocurrencies.
                            </p>
                            <UnifiedPaymentForm />
                        </div>

                        {/* Monthly Giving */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-emerald-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-light">Give Monthly</h2>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                                    Most Impactful
                                </span>
                            </div>
                            <p className="text-stone-600 mb-6">
                                Provide sustainable support with monthly gifts
                            </p>
                            <UnifiedPaymentForm recurring={true} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Transparency Ledger */}
            <section className="py-12 bg-cream-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-light text-center mb-8">
                        Complete Transparency
                    </h2>
                    <p className="text-center text-stone-600 mb-12 max-w-2xl mx-auto">
                        Every dollar is tracked. Every distribution is public.
                        You can see exactly how your giving makes a difference.
                    </p>

                    <TransparencyLedger />
                </div>
            </section>

            {/* Impact Stories */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-light text-center mb-8">
                        Your Giving Changes Lives
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <ImpactStory
                            title="Family Received Aid"
                            story="Your giving helped the Johnson family keep their home during a difficult transitional season."
                            amount="$2,500"
                            category="Community Aid"
                        />
                        <ImpactStory
                            title="Youth Conference"
                            story="50 teenagers encountered God at our latest conference thanks to scholarship funds."
                            amount="$8,000"
                            category="Conference Support"
                        />
                        <ImpactStory
                            title="Platform Upgrade"
                            story="Better streaming quality for thousands of users around the global digital campus."
                            amount="$5,000"
                            category="Platform Upkeep"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-12 bg-cream-50">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-light text-center mb-8">
                        Questions About Giving
                    </h2>
                    <div className="space-y-4">
                        <FAQ
                            question="Where does my money go?"
                            answer="100% transparent breakdown available in our public ledger. Platform upkeep (30%), Community Aid (40%), Conference Support (30%)."
                        />
                        <FAQ
                            question="Is my gift tax-deductible?"
                            answer="Yes, we are a registered 501(c)(3). You'll receive a receipt for your records."
                        />
                        <FAQ
                            question="Can I change my monthly gift?"
                            answer="Absolutely. You can adjust or cancel anytime from your dashboard."
                        />
                        <FAQ
                            question="How do I know my gift helps real people?"
                            answer="We publish regular impact stories and maintain a public ledger of all aid distributed."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
