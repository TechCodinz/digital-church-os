'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, Building2, UserCheck, CheckCircle2, Globe, Radio, BookOpen, Layers } from 'lucide-react';

const DENOMINATIONS = [
    'Evangelical', 'Pentecostal / Charismatic', 'Baptist', 'Reformed / Presbyterian',
    'Anglican / Episcopal', 'Methodist', 'Lutheran', 'Catholic', 'Orthodox', 'Non-Denominational'
];

const WORSHIP_STYLES = [
    'Expositional / Evangelical', 'Charismatic / Pentecostal', 'Liturgical / Traditional', 'Reformed', 'Contemporary'
];

const AI_TONES = [
    'Scholarly & Exegetical', 'Prophetic & Bold', 'Shepherd & Encourager', 'Gentle Counselor'
];

export default function MinisterOnboardPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [churchName, setChurchName] = useState('');
    const [denomination, setDenomination] = useState('Evangelical');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [worshipStyle, setWorshipStyle] = useState('Expositional / Evangelical');
    const [aiTone, setAiTone] = useState('Scholarly & Exegetical');
    const [loading, setLoading] = useState(false);
    const [successProfile, setSuccessProfile] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/minister/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName,
                    email,
                    churchName,
                    denomination,
                    country,
                    city,
                    preferredWorshipStyle: worshipStyle,
                    aiPastorTone: aiTone
                })
            });

            const data = await res.json();
            if (data.profile) {
                setSuccessProfile(data.profile);
            }
        } catch (err) {
            console.error('Onboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Evangelical & Multi-Denominational Minister Portal</h1>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto">
                        Launch your digital church platform, customize your denomination's liturgy, and empower your congregation with Digital Church OS.
                    </p>
                </div>

                {!successProfile ? (
                    <motion.form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Minister Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="e.g. Pastor David MacArthur"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ministry Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="pastor@church.org"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Church / Ministry Name</label>
                                <input
                                    type="text"
                                    value={churchName}
                                    onChange={e => setChurchName(e.target.value)}
                                    placeholder="e.g. Grace Assembly International"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Denomination</label>
                                <select
                                    value={denomination}
                                    onChange={e => setDenomination(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                >
                                    {DENOMINATIONS.map(d => (
                                        <option key={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Country</label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={e => setCountry(e.target.value)}
                                    placeholder="e.g. United States / Nigeria / Japan"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    placeholder="e.g. Dallas / Lagos / Tokyo"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Denom. Worship Style</label>
                                <select
                                    value={worshipStyle}
                                    onChange={e => setWorshipStyle(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                >
                                    {WORSHIP_STYLES.map(w => (
                                        <option key={w}>{w}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Pastor Tone</label>
                                <select
                                    value={aiTone}
                                    onChange={e => setAiTone(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                >
                                    {AI_TONES.map(t => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" /> Launch Minister Digital Church OS Instance
                        </button>
                    </motion.form>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                        <h3 className="text-2xl font-bold text-emerald-300">Welcome Pastor {successProfile.fullName}!</h3>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                            Your <strong>{successProfile.denomination}</strong> Digital Church platform is live for <strong>{successProfile.churchName}</strong> in {successProfile.city}, {successProfile.country}.
                        </p>
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex flex-wrap items-center justify-around gap-2">
                            <span>Worship Style: <strong className="text-amber-400">{successProfile.preferredWorshipStyle}</strong></span>
                            <span>AI Tone: <strong className="text-amber-400">{successProfile.aiPastorTone}</strong></span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
