'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Heart,
    DollarSign,
    Calendar,
    TrendingUp,
    Activity,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30days');

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?period=${period}`);
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !analytics) {
        return <div className="min-h-screen pt-24 text-center text-stone-400 italic">Gathering insights...</div>;
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="text-sm text-stone-400 hover:text-sage-600 flex items-center mb-2 transition-colors">
                            <ArrowLeft size={14} className="mr-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-light text-stone-800 tracking-tight">Analytics & Insights</h1>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-stone-100">
                        {['7days', '30days', '90days', 'year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${period === p
                                        ? 'bg-sage-500 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                {p.replace('days', ' Days')}
                            </button>
                        ))}
                    </div>
                </header>

                {analytics && (
                    <div className="space-y-12">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Members', value: analytics.summary.totalUsers, icon: Users, color: 'text-blue-500' },
                                { label: 'Active (24h)', value: analytics.summary.activeUsers, icon: Activity, color: 'text-sage-500' },
                                { label: 'Total Aid Disbursed', value: `$${analytics.summary.offeringAmount.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
                                { label: 'Prayer Requests', value: analytics.summary.totalPrayers, icon: Heart, color: 'text-rose-400' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="sanctuary-card"
                                >
                                    <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
                                    <p className="text-3xl font-light text-stone-800">{stat.value}</p>
                                    <p className="text-stone-500 text-sm mt-1">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Trends */}
                            <div className="lg:col-span-2 sanctuary-card">
                                <h3 className="text-xl font-medium text-stone-800 mb-6 flex items-center">
                                    <TrendingUp className="mr-2 text-sage-500" size={20} /> Growth Trends
                                </h3>
                                <div className="h-64 flex items-end justify-between gap-2 px-4">
                                    {/* Simplified visual representation */}
                                    {[40, 60, 45, 70, 85, 65, 90, 100].map((h, i) => (
                                        <div key={i} className="flex-1 bg-sage-100 rounded-t-lg transition-all hover:bg-sage-200" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 px-4 text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                                    <span>Beginning of Period</span>
                                    <span>Current</span>
                                </div>
                            </div>

                            {/* Top Contributors */}
                            <div className="sanctuary-card">
                                <h3 className="text-xl font-medium text-stone-800 mb-6 flex items-center">
                                    <DollarSign className="mr-2 text-emerald-500" size={20} /> Top Contributors
                                </h3>
                                <div className="space-y-4">
                                    {analytics.topContributors?.map((user: any, i: number) => (
                                        <div key={user.email} className="flex items-center justify-between p-3 bg-cream-50 rounded-2xl border border-stone-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[10px] font-bold text-stone-400 border border-stone-100">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-800 line-clamp-1">{user.name || 'Anonymous'}</p>
                                                    <p className="text-[10px] text-stone-400">{user._count.offerings} gifts</p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
