'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Heart, TrendingUp, PieChart, Activity, ShieldCheck, Download, ChevronRight, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function TransparencyPage() {
    const { data: session } = useSession();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            const res = await fetch('/api/aid/transparency/report');
            const data = await res.json();
            setReport(data);
        } catch (err) {
            console.error('Error fetching transparency report:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream-50">
                <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4">
                            Radical Transparency
                        </h1>
                        <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                            Every cent tracked. Every life impacted. Our commitment to faithful stewardship.
                        </p>
                    </motion.div>
                </header>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="sanctuary-card bg-sage-500 text-white"
                    >
                        <DollarSign className="w-10 h-10 mb-4 opacity-80" />
                        <p className="text-sm uppercase tracking-wider opacity-90 mb-1">Total Offerings</p>
                        <h2 className="text-4xl font-light">
                            ${report?.totalOfferings?.toLocaleString() || '0'}
                        </h2>
                        <div className="mt-4 flex items-center text-xs opacity-75">
                            <TrendingUp size={14} className="mr-1" /> Updated hourly
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="sanctuary-card"
                    >
                        <Heart className="w-10 h-10 text-rose-400 mb-4" />
                        <p className="text-sm text-stone-500 uppercase tracking-wider mb-1">Aid Distributed</p>
                        <h2 className="text-4xl font-light text-stone-800">
                            ${report?.totalAidDistributed?.toLocaleString() || '0'}
                        </h2>
                        <p className="mt-4 text-xs text-stone-400 flex items-center">
                            <Activity size={14} className="mr-1" /> {report?.distributionPercentage || 0}% efficiency
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="sanctuary-card"
                    >
                        <ShieldCheck className="w-10 h-10 text-blue-400 mb-4" />
                        <p className="text-sm text-stone-500 uppercase tracking-wider mb-1">Allocated Support</p>
                        <h2 className="text-4xl font-light text-stone-800">
                            ${report?.allocatedSupport?.toLocaleString() || '0'}
                        </h2>
                        <p className="mt-4 text-xs text-stone-400">Reserved for ongoing aid</p>
                    </motion.div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="sanctuary-card">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-light text-stone-800 flex items-center">
                                <PieChart className="mr-2 text-sage-500" /> Category Impact
                            </h3>
                            <button className="text-sage-600 flex items-center text-sm hover:underline">
                                View Full Ledger <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(report?.breakdown || {}).map(([category, amount]: [string, any]) => (
                                <div key={category}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-stone-700 font-medium capitalize">{category.toLowerCase()}</span>
                                        <span className="text-stone-500">${amount.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-2 bg-cream-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-sage-400"
                                            style={{ width: `${(amount / report.totalAidDistributed) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {Object.keys(report?.breakdown || {}).length === 0 && (
                                <p className="text-stone-400 italic">No aid data recorded for this period.</p>
                            )}
                        </div>
                    </div>

                    <div className="sanctuary-card">
                        <h3 className="text-2xl font-light text-stone-800 mb-8 flex items-center">
                            <Download className="mr-2 text-sage-500" /> Reports &amp; Audits
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Q4 2025 Impact Report', size: '2.4 MB', type: 'PDF' },
                                { title: 'Annual Spiritual Stewardship 2024', size: '5.1 MB', type: 'PDF' },
                                { title: 'Third-Party Financial Audit', size: '1.2 MB', type: 'DOCX' },
                            ].map((doc) => (
                                <div key={doc.title} className="p-4 bg-cream-50 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sage-500 font-bold text-xs mr-4 shadow-sm">
                                            {doc.type}
                                        </div>
                                        <div>
                                            <p className="font-medium text-stone-800">{doc.title}</p>
                                            <p className="text-xs text-stone-500">{doc.size}</p>
                                        </div>
                                    </div>
                                    <a
                                        href="mailto:transparency@digitalchurchos.com?subject=Report Request"
                                        className="text-stone-400 hover:text-sage-500 transition-colors flex items-center gap-1 text-xs"
                                    >
                                        <Mail size={14} /> Request
                                    </a>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-stone-400 mt-4 italic">Full audit reports available upon request. Email us at transparency@digitalchurchos.com</p>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="sanctuary-card bg-stone-800 text-white text-center py-12">
                    <h3 className="text-3xl font-light mb-4">Want to help more?</h3>
                    <p className="text-stone-400 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                        Your contributions go exactly where they are needed most. Join us in making a real difference.
                    </p>
                    <Link href="/offering" className="inline-block px-10 py-4 bg-sage-500 rounded-full hover:bg-sage-600 transition-all font-medium">
                        Make an Offering
                    </Link>
                </div>
            </div>
        </div>
    );
}
