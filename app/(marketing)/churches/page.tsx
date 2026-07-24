'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';
import {
    Globe, Search, MapPin, Users, Radio, Plus, X, ShieldCheck, Sparkles, Building2, CheckCircle2
} from 'lucide-react';

interface Church {
    id: string;
    name: string;
    city: string;
    country: string;
    denomination: string;
    leadPastor: string;
    memberCount: number;
    streamUrl?: string;
    isLiveNow: boolean;
    activities: string[];
}

export default function GlobalChurchesPage() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [churches, setChurches] = useState<Church[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [onboardSuccess, setOnboardSuccess] = useState(false);

    // Form State
    const [churchName, setChurchName] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [denomination, setDenomination] = useState('Non-Denominational');
    const [leadPastor, setLeadPastor] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? theme : 'light';
    const isLight = activeTheme === 'light';

    const fetchChurches = async () => {
        setLoading(true);
        try {
            const url = selectedCountry !== 'All' ? `/api/churches/global?country=${selectedCountry}` : '/api/churches/global';
            const res = await fetch(url);
            const data = await res.json();
            setChurches(data.churches || []);
        } catch {
            setChurches([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChurches();
    }, [selectedCountry]);

    const handleOnboardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/churches/global', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: churchName,
                    city,
                    country,
                    denomination,
                    leadPastor
                })
            });

            if (res.ok) {
                setOnboardSuccess(true);
                fetchChurches();
                setTimeout(() => {
                    setShowOnboardModal(false);
                    setOnboardSuccess(false);
                    setChurchName('');
                    setCity('');
                    setCountry('');
                    setDenomination('Non-Denominational');
                    setLeadPastor('');
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to onboard church:', err);
        }
    };

    const filteredChurches = churches.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.city.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-24 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${
                            isLight
                                ? 'bg-sage-50 border-sage-200 text-sage-800'
                                : 'bg-slate-900 border-slate-800 text-emerald-400'
                        }`}>
                            <Globe className="w-4 h-4 animate-spin-slow" /> Global Multi-Church Network
                        </div>
                        <h1 className={`text-3xl md:text-5xl font-light tracking-tight ${isLight ? 'text-stone-800' : 'text-white'}`}>
                            Churches Across The World
                        </h1>
                        <p className={`text-sm max-w-2xl ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                            Discover local congregations, join live worship streams worldwide, and manage your church's activities with Digital Church OS.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowOnboardModal(true)}
                        className={`px-6 py-3.5 font-bold rounded-full text-xs flex items-center gap-2 transition-all shadow-md shrink-0 ${
                            isLight
                                ? 'bg-sage-500 hover:bg-sage-600 text-white shadow-sage-500/20'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                        }`}
                    >
                        <Plus className="w-4 h-4" /> Onboard Your Church
                    </button>
                </div>

                {/* Filter & Search Bar */}
                <div className={`border rounded-3xl p-4 mb-8 flex flex-col sm:flex-row items-center gap-4 ${
                    isLight ? 'bg-white border-cream-200 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl'
                }`}>
                    <div className="relative flex-1 w-full">
                        <Search className={`w-4 h-4 absolute left-4 top-3.5 ${isLight ? 'text-stone-400' : 'text-slate-500'}`} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by church name, city, or country..."
                            className={`w-full border rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none ${
                                isLight
                                    ? 'bg-cream-50 border-cream-200 text-stone-800 placeholder-stone-400 focus:border-sage-400'
                                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500/50'
                            }`}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {['All', 'United States', 'Japan', 'Nigeria', 'United Kingdom'].map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedCountry(c)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                                    selectedCountry === c
                                        ? isLight ? 'bg-sage-600 border-sage-600 text-white' : 'bg-emerald-500 border-emerald-500 text-slate-950'
                                        : isLight ? 'bg-cream-50 border-cream-200 text-stone-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Church Grid */}
                {loading ? (
                    <div className="py-20 text-center">
                        <Globe className={`w-8 h-8 animate-spin mx-auto mb-3 ${isLight ? 'text-sage-500' : 'text-emerald-400'}`} />
                        <span className={isLight ? 'text-stone-500' : 'text-slate-400'}>Loading global church directory...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChurches.map(c => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`border rounded-2xl p-6 transition-all space-y-4 flex flex-col justify-between ${
                                    isLight
                                        ? 'bg-white border-cream-200 shadow-sm hover:border-sage-300'
                                        : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40 shadow-xl'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className={`p-3 rounded-2xl border ${
                                            isLight ? 'bg-sage-50 border-sage-100 text-sage-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                            <Building2 className="w-6 h-6" />
                                        </div>

                                        {c.isLiveNow ? (
                                            <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-[10px] rounded-full flex items-center gap-1.5 animate-pulse">
                                                <Radio className="w-3 h-3" /> 🔴 LIVE NOW
                                            </span>
                                        ) : (
                                            <span className={`px-3 py-1 text-[10px] rounded-full border ${
                                                isLight ? 'bg-cream-100 border-cream-200 text-stone-500' : 'bg-slate-950 border-slate-800 text-slate-500'
                                            }`}>
                                                Offline
                                            </span>
                                        )}
                                    </div>

                                    <h3 className={`text-xl font-bold mb-1 ${isLight ? 'text-stone-800' : 'text-white'}`}>{c.name}</h3>

                                    <div className={`flex items-center gap-4 text-xs mb-3 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                                        <span className="flex items-center gap-1">
                                            <MapPin className={`w-3.5 h-3.5 ${isLight ? 'text-sage-600' : 'text-emerald-400'}`} /> {c.city}, {c.country}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className={`w-3.5 h-3.5 ${isLight ? 'text-sage-600' : 'text-indigo-400'}`} /> {c.memberCount} members
                                        </span>
                                    </div>

                                    <p className={`text-xs mb-3 font-mono ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
                                        Lead: {c.leadPastor} • {c.denomination}
                                    </p>

                                    <div className={`space-y-1.5 pt-3 border-t ${isLight ? 'border-cream-100' : 'border-slate-800'}`}>
                                        <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                                            Activities & Services
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {c.activities.map(act => (
                                                <span key={act} className={`px-2.5 py-1 border rounded-lg text-[10px] ${
                                                    isLight ? 'bg-cream-50 border-cream-200 text-stone-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                                                }`}>
                                                    {act}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={`pt-4 border-t flex gap-2 ${isLight ? 'border-cream-100' : 'border-slate-800'}`}>
                                    <a
                                        href="/live-service"
                                        className={`flex-1 py-2.5 border text-center text-xs font-semibold rounded-xl transition-all ${
                                            isLight
                                                ? 'bg-cream-50 hover:bg-cream-100 border-cream-200 text-stone-800'
                                                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200'
                                        }`}
                                    >
                                        View Activities
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Onboard Church Modal */}
            <AnimatePresence>
                {showOnboardModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 ${
                                isLight ? 'bg-white border-cream-200 text-stone-800' : 'bg-slate-900 border-slate-800 text-white'
                            }`}
                        >
                            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-cream-100' : 'border-slate-800'}`}>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Building2 className={`w-5 h-5 ${isLight ? 'text-sage-600' : 'text-emerald-400'}`} /> Onboard Church
                                </h3>
                                <button onClick={() => setShowOnboardModal(false)} className={isLight ? 'text-stone-500' : 'text-slate-400'}><X className="w-5 h-5" /></button>
                            </div>

                            {!onboardSuccess ? (
                                <form onSubmit={handleOnboardSubmit} className="space-y-4">
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Church Name</label>
                                        <input
                                            type="text"
                                            value={churchName}
                                            onChange={e => setChurchName(e.target.value)}
                                            placeholder="e.g. Hope Chapel"
                                            className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                                                isLight ? 'bg-cream-100 border-cream-200 text-stone-800' : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500/50'
                                            }`}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>City</label>
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={e => setCity(e.target.value)}
                                                placeholder="e.g. Sydney"
                                                className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                                                    isLight ? 'bg-cream-100 border-cream-200 text-stone-800' : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500/50'
                                                }`}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Country</label>
                                            <input
                                                type="text"
                                                value={country}
                                                onChange={e => setCountry(e.target.value)}
                                                placeholder="e.g. Australia"
                                                className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                                                    isLight ? 'bg-cream-100 border-cream-200 text-stone-800' : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500/50'
                                                }`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Denomination</label>
                                            <input
                                                type="text"
                                                value={denomination}
                                                onChange={e => setDenomination(e.target.value)}
                                                placeholder="e.g. Non-Denominational"
                                                className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                                                    isLight ? 'bg-cream-100 border-cream-200 text-stone-800' : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500/50'
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Senior Pastor Name</label>
                                            <input
                                                type="text"
                                                value={leadPastor}
                                                onChange={e => setLeadPastor(e.target.value)}
                                                placeholder="e.g. Pastor John Smith"
                                                className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                                                    isLight ? 'bg-cream-100 border-cream-200 text-stone-800' : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500/50'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`w-full py-3.5 font-bold rounded-xl text-xs transition-all shadow-lg ${
                                            isLight ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-sage-600/20' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                        }`}
                                    >
                                        Register Church Profile
                                    </button>
                                </form>
                            ) : (
                                <div className="py-8 text-center space-y-3">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                                    <h4 className="text-xl font-bold text-emerald-500">Church Onboarded!</h4>
                                    <p className="text-xs text-slate-400">Your church portal is active on Digital Church OS.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
