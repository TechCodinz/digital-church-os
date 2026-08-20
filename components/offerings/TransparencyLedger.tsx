'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, DollarSign, Info, Loader2, ShieldCheck } from 'lucide-react';

interface LedgerData {
    totalRaised: number;
    totalGifts: number;
    recentTransactions: { amount: number; purpose: string; date: string }[];
    distribution: { purpose: string; amount: number; count: number }[];
}

function purposeLabel(value: string) {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function TransparencyLedger() {
    const [ledger, setLedger] = useState<LedgerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [available, setAvailable] = useState(true);

    useEffect(() => {
        fetch('/api/offerings/public', { cache: 'no-store' })
            .then(async (response) => {
                if (!response.ok) throw new Error('Ledger unavailable');
                return response.json();
            })
            .then((data: LedgerData) => setLedger(data))
            .catch(() => setAvailable(false))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center gap-2 py-10 text-xs text-stone-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading published giving records…</div>;
    }

    if (!available || !ledger) {
        return <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-400"><Info className="mx-auto mb-3 h-5 w-5" /> Published giving records are unavailable right now.</div>;
    }

    const safeTotal = Number.isFinite(ledger.totalRaised) ? ledger.totalRaised : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-2xl font-light text-stone-900">${safeTotal.toLocaleString()}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-stone-400">Recorded giving total</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-2xl font-light text-stone-900">{ledger.totalGifts || 0}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-stone-400">Recorded gifts</p>
                </div>
            </div>

            {ledger.distribution.length > 0 && safeTotal > 0 && (
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Recorded purpose distribution</p>
                        <Activity className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="mt-4 space-y-4">
                        {ledger.distribution.map((item) => {
                            const percentage = Math.min(100, Math.max(0, (item.amount / safeTotal) * 100));
                            return (
                                <div key={item.purpose}>
                                    <div className="flex items-center justify-between gap-4 text-xs">
                                        <span className="text-stone-600">{purposeLabel(item.purpose)}</span>
                                        <span className="font-semibold text-stone-800">${item.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Recent recorded gifts</p>
                <div className="mt-3 space-y-2">
                    {ledger.recentTransactions.length > 0 ? ledger.recentTransactions.map((transaction, index) => (
                        <motion.div key={`${transaction.date}-${index}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.15) }} className="flex items-center justify-between gap-4 rounded-2xl border border-stone-100 bg-white p-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><DollarSign className="h-4 w-4" /></span>
                                <div>
                                    <p className="text-xs font-semibold text-stone-700">{purposeLabel(transaction.purpose)}</p>
                                    <p className="mt-1 flex items-center gap-1 text-[10px] text-stone-400"><Clock className="h-3 w-3" /> {new Date(transaction.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-stone-900">${transaction.amount.toLocaleString()}</p>
                        </motion.div>
                    )) : (
                        <div className="rounded-2xl border border-dashed border-stone-200 p-7 text-center text-xs text-stone-400">
                            <Info className="mx-auto mb-2 h-4 w-4" /> No public giving records are stored yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-start gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-[10px] leading-relaxed text-stone-500">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>This view summarizes giving records available in this application database. It is a transparency surface, not an independent financial audit or assurance statement.</span>
            </div>
        </div>
    );
}
