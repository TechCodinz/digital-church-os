'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle2, Send, Clock } from 'lucide-react';

export default function EmergencyAidPage() {
    const [submitted, setSubmitted] = useState(false);
    const [category, setCategory] = useState('EMERGENCY');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-950 text-slate-100">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-xl">
                        <ShieldAlert className="w-8 h-8 animate-pulse" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Emergency Aid & Crisis Relief</h1>
                    <p className="text-slate-400 text-sm">Rapid intake for immediate shelter, medical, food, or crisis support</p>
                </div>

                {!submitted ? (
                    <motion.form onSubmit={handleSubmit} className="bg-slate-900 border border-rose-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
                        <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-300">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                            <span>
                                For immediate life-threatening medical emergencies, please call emergency services (911 or local emergency numbers) immediately.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aid Category</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {['EMERGENCY', 'MEDICAL', 'HOUSING', 'FOOD'].map(cat => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                            category === cat ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Describe Your Immediate Need</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Explain the situation and what assistance is required..."
                                rows={4}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City / Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City, State"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(555) 000-0000"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" /> Submit Priority Emergency Relief Request
                        </button>
                    </motion.form>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                        <h3 className="text-2xl font-bold text-emerald-300">Emergency Dispatch Received</h3>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                            Your request has been prioritized in the Sanctuary Aid Ledger. A relief officer and local volunteer contact will reach out to you within the hour.
                        </p>
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-400" /> Response Time: Priority High (&lt; 60 mins)
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
