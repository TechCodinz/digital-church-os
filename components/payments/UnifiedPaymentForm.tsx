'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, Heart, Loader2, Lock, Repeat2, ShieldCheck, WalletCards } from 'lucide-react';

type Purpose = 'PLATFORM_UPKEEP' | 'COMMUNITY_AID' | 'CONFERENCE_SUPPORT';

const PURPOSES: Array<{ id: Purpose; label: string; description: string }> = [
    { id: 'COMMUNITY_AID', label: 'Community Aid', description: 'Support approved aid and community-care work.' },
    { id: 'CONFERENCE_SUPPORT', label: 'Conference Support', description: 'Support published gatherings and conference operations.' },
    { id: 'PLATFORM_UPKEEP', label: 'Platform Upkeep', description: 'Support the infrastructure and operations behind Digital Church OS.' },
];

export const UnifiedPaymentForm = ({ purpose: externalPurpose, amount: externalAmount, setAmount: externalSetAmount, onSuccess }: any) => {
    const [internalAmount, setInternalAmount] = useState('50');
    const [internalPurpose, setInternalPurpose] = useState<Purpose>('COMMUNITY_AID');
    const [isRecurring, setIsRecurring] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const amount = externalAmount !== undefined ? String(externalAmount) : internalAmount;
    const setAmount = externalSetAmount || setInternalAmount;
    const purpose = (externalPurpose || internalPurpose) as Purpose;

    const startCheckout = async () => {
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount < 1) {
            setError('Enter an amount of at least $1.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const response = await fetch('/api/payments/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: numericAmount, purpose, isRecurring, currency: 'usd' }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to start checkout.');
            if (!data.url) throw new Error('Checkout URL was not returned.');

            onSuccess?.({ provider: data.provider, amount: numericAmount, purpose, mode: data.mode, pending: true });
            window.location.assign(data.url);
        } catch (checkoutError: any) {
            setError(checkoutError?.message || 'Unable to start secure checkout.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <label htmlFor="giving-amount" className="text-xs font-semibold text-stone-700">Amount (USD)</label>
                <div className="mt-2 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg">$</span>
                    <input
                        id="giving-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        className="w-full rounded-2xl border border-stone-200 bg-white py-4 pl-9 pr-4 text-2xl font-light text-stone-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/20"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {!externalPurpose && (
                <div>
                    <p className="text-xs font-semibold text-stone-700">Purpose</p>
                    <div className="mt-2 grid gap-2">
                        {PURPOSES.map((item) => {
                            const selected = purpose === item.id;
                            return (
                                <button key={item.id} type="button" onClick={() => setInternalPurpose(item.id)} className={`rounded-2xl border p-4 text-left transition-all ${selected ? 'border-emerald-300 bg-emerald-50' : 'border-stone-200 bg-white hover:border-emerald-200'}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-50 text-stone-400'}`}><Heart className="h-4 w-4" /></span>
                                        <span className="flex-1">
                                            <span className="block text-sm font-semibold text-stone-800">{item.label}</span>
                                            <span className="mt-1 block text-[11px] leading-relaxed text-stone-500">{item.description}</span>
                                        </span>
                                        {selected && <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-stone-700"><CreditCard className="h-4 w-4" /></span>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-stone-800">Secure card checkout</p>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">Stripe connected path</span>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-stone-500">You will leave this page for Stripe Checkout. A gift is not recorded as successful until the payment provider confirms it through the server webhook.</p>
                    </div>
                </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={isRecurring} onChange={(event) => setIsRecurring(event.target.checked)} className="mt-1 h-4 w-4 rounded border-stone-300 text-emerald-600" />
                <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-stone-800"><Repeat2 className="h-4 w-4 text-emerald-600" /> Monthly recurring gift</span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-stone-500">Recurring checkout is created by Stripe only when you select this option.</span>
                </span>
            </label>

            <div className="grid sm:grid-cols-2 gap-2">
                <div className="rounded-2xl border border-dashed border-stone-200 p-4 text-stone-400">
                    <WalletCards className="h-4 w-4" />
                    <p className="mt-3 text-xs font-semibold text-stone-600">PayPal & alternate rails</p>
                    <p className="mt-1 text-[10px] leading-relaxed">Not presented as active until a production provider integration is connected and verified.</p>
                </div>
                <div className="rounded-2xl border border-dashed border-stone-200 p-4 text-stone-400">
                    <Lock className="h-4 w-4" />
                    <p className="mt-3 text-xs font-semibold text-stone-600">Crypto giving</p>
                    <p className="mt-1 text-[10px] leading-relaxed">No wallet, network, custody, fee, KYC, or tax claim is made until the corresponding provider flow exists.</p>
                </div>
            </div>

            {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">{error}</p>}

            <button type="button" onClick={startCheckout} disabled={submitting || !amount} className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-4 text-sm font-bold text-white transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-45">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening secure checkout…</> : <>Continue to Stripe <ArrowRight className="h-4 w-4" /></>}
            </button>

            <div className="flex items-start gap-2 text-[10px] leading-relaxed text-stone-500">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>Tax treatment depends on the receiving organization, your jurisdiction, and your circumstances. This interface does not promise deductibility or provide tax advice.</span>
            </div>
        </div>
    );
};
