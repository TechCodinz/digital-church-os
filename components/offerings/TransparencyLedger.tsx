"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShieldCheck, Activity, Clock, Info, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface LedgerData {
    totalRaised: number;
    totalGifts: number;
    recentTransactions: { amount: number; purpose: string; date: string }[];
    distribution: { purpose: string; amount: number; count: number }[];
}

export function TransparencyLedger() {
    const [ledger, setLedger] = useState<LedgerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/offerings/public")
            .then(res => res.json())
            .then((data: LedgerData) => {
                setLedger(data);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    if (loading) return <div className="text-center p-12 text-stone-400">Auditing ledger...</div>;

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 mt-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-light text-stone-800 flex items-center">
                    <ShieldCheck className="mr-2 text-emerald-500" />
                    Transparent Ledger
                </h3>
                <div className="flex items-center gap-4">
                    {ledger && (
                        <span className="text-xl font-bold text-emerald-600">
                            ${ledger.totalRaised.toLocaleString()}
                        </span>
                    )}
                    <div className="flex items-center text-xs bg-emerald-50 px-3 py-1 rounded-full text-emerald-700">
                        <Activity size={12} className="mr-1" /> Live
                    </div>
                </div>
            </div>

            {/* Distribution Bars */}
            {ledger && ledger.distribution.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Fund Distribution</p>
                    <div className="space-y-3">
                        {ledger.distribution.map(d => (
                            <div key={d.purpose}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-stone-600 capitalize">{d.purpose.replace(/_/g, ' ').toLowerCase()}</span>
                                    <span className="text-stone-800 font-medium">${d.amount.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-emerald-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-400 rounded-full"
                                        style={{ width: `${Math.min(100, (d.amount / ledger.totalRaised) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="space-y-3 mb-6">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Recent Gifts</p>
                {ledger && ledger.recentTransactions.length > 0 ? ledger.recentTransactions.map((tx, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl hover:bg-cream-100 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-stone-800">Anonymous Gift</p>
                                <p className="text-xs text-stone-400 flex items-center">
                                    <Clock size={12} className="mr-1" />
                                    {new Date(tx.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-stone-900">${tx.amount.toLocaleString()}</p>
                            <p className="text-[10px] text-emerald-600 uppercase tracking-widest">{tx.purpose.replace(/_/g, ' ')}</p>
                        </div>
                    </motion.div>
                )) : (
                    <div className="text-center py-8 text-stone-400 italic">
                        <Info className="mx-auto mb-2 opacity-30" />
                        No public offering records yet.
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-cream-100 text-center">
                <p className="text-xs text-stone-400 px-8 leading-relaxed">
                    This ledger provides public accountability for all contributions. Personal identifiers are removed for privacy.
                </p>
            </div>
        </div>
    );
}
