'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake, BookOpen, Activity, Sparkles, TrendingUp, AlertTriangle, Users } from 'lucide-react';

export default function PastoralAnalyticsDashboardPage() {
    const metrics = {
        activeMembersCount: 1420,
        answeredPrayersThisMonth: 184,
        topPrayerCategories: [
            { category: 'Unshakeable Peace & Anxiety Support', percentage: 38, count: 540 },
            { category: 'Physical Healing & Health', percentage: 26, count: 370 },
            { category: 'Family & Marriage Restoration', percentage: 20, count: 284 },
            { category: 'Financial Breakthrough & Aid', percentage: 16, count: 226 }
        ],
        pastoralActionPlan: [
            { title: 'Series Recommendation', detail: 'Launch a 3-week sermon series focusing on Philippians 4 (Overcoming Anxiety with Peace).' },
            { title: 'Emergency Aid Dispatch', detail: 'Increase emergency housing relief fund allocation by 20% for upcoming winter intake.' },
            { title: 'Small Group Focus', detail: 'Deploy "Marriage & Covenantal Trust" study guide to all small group co-hosts.' }
        ]
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 mb-3">
                            <Activity className="w-4 h-4 animate-pulse" /> Privacy-Preserving Pastoral Intelligence
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Pastoral Health Analytics Radar</h1>
                        <p className="text-slate-400 text-sm">Aggregated anonymous congregation spiritual health trends & AI pastoral recommendations</p>
                    </div>
                </div>

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
                        <span className="text-xs text-slate-500 font-mono uppercase">Active Worshippers</span>
                        <h3 className="text-3xl font-bold text-white flex items-center gap-2">
                            <Users className="w-6 h-6 text-indigo-400" /> {metrics.activeMembersCount}
                        </h3>
                    </div>

                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
                        <span className="text-xs text-slate-500 font-mono uppercase">Answered Prayers (This Month)</span>
                        <h3 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
                            <HeartHandshake className="w-6 h-6 text-emerald-400" /> {metrics.answeredPrayersThisMonth}
                        </h3>
                    </div>

                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
                        <span className="text-xs text-slate-500 font-mono uppercase">Pastoral Index Score</span>
                        <h3 className="text-3xl font-bold text-amber-400 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-amber-400" /> 94.2 / 100
                        </h3>
                    </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Top Prayer Trends */}
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-400" /> Congregation Prayer Trends
                        </h3>
                        <div className="space-y-4">
                            {metrics.topPrayerCategories.map(cat => (
                                <div key={cat.category} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-300">{cat.category}</span>
                                        <span className="text-emerald-400">{cat.percentage}% ({cat.count})</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Pastoral Action Plan */}
                    <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-3xl space-y-4 shadow-xl">
                        <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-400" /> AI Pastoral Care Recommendations
                        </h3>

                        <div className="space-y-3">
                            {metrics.pastoralActionPlan.map((plan, idx) => (
                                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{plan.title}</span>
                                    <p className="text-xs text-slate-300 leading-relaxed">{plan.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
