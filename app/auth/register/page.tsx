'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Loader2,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRuntime } from '@/app/providers';

export default function RegisterPage() {
    const router = useRouter();
    const { configured } = useAuthRuntime();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!configured) return;
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, email: formData.email.trim().toLowerCase() }),
            });

            const data = await res.json();
            if (!res.ok) {
                const detail = data.details?.fieldErrors
                    ? Object.values(data.details.fieldErrors).flat().join(' ')
                    : '';
                throw new Error(detail || data.message || 'Failed to register');
            }

            router.push('/auth/signin?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="sanctuary-auth-shell">
            <div className="sanctuary-light-column" aria-hidden="true" />
            <div className="sanctuary-nave" aria-hidden="true" />
            <div className="sanctuary-vignette" aria-hidden="true" />

            <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 backdrop-blur-xl">
                        <Sparkles className="mr-2 h-4 w-4" /> Begin your sanctuary journey
                    </div>
                    <h1 className="mt-6 text-5xl font-light leading-[1.03] text-white sm:text-6xl">Create a private member space without turning faith into a score.</h1>
                    <p className="mt-5 max-w-xl text-base leading-8 text-white/55">Your account can hold intentional reflections, prayer memory, formation notes and church-workspace access. Sensitive records stay protected behind authenticated boundaries.</p>
                    <div className="mt-7 rounded-2xl border border-white/8 bg-white/[0.035] p-5 text-xs leading-6 text-white/42">
                        <ShieldCheck className="mb-3 h-5 w-5 text-emerald-200" />
                        Activity, giving, attendance and prayer frequency are not used as holiness, favor or spiritual-rank measurements.
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="sanctuary-auth-card rounded-[2rem] p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="sanctuary-section-label text-emerald-200/60">Member account</p>
                            <h2 className="mt-2 text-3xl font-light text-white">Create your account</h2>
                            <p className="mt-2 text-sm leading-6 text-white/42">Use an email address you can access and a unique password.</p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/15 bg-amber-100/8 text-amber-100">
                            <LockKeyhole className="h-5 w-5" />
                        </div>
                    </div>

                    {!configured && (
                        <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-100/8 p-4 text-sm leading-6 text-amber-50">
                            Account creation is temporarily paused until production authentication is configured. Public sanctuary spaces remain available.
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 rounded-2xl border border-rose-200/20 bg-rose-300/8 p-4 text-sm text-rose-100">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/55"><User className="h-4 w-4" /> Full name</span>
                            <input
                                type="text"
                                required
                                disabled={!configured}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                                className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/24 focus:border-amber-200/30 focus:ring-2 focus:ring-amber-200/10 disabled:opacity-40"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/55"><Mail className="h-4 w-4" /> Email address</span>
                            <input
                                type="email"
                                required
                                disabled={!configured}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@example.com"
                                className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/24 focus:border-amber-200/30 focus:ring-2 focus:ring-amber-200/10 disabled:opacity-40"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/55"><LockKeyhole className="h-4 w-4" /> Password</span>
                            <input
                                type="password"
                                required
                                minLength={8}
                                disabled={!configured}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="At least 8 characters"
                                className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/24 focus:border-amber-200/30 focus:ring-2 focus:ring-amber-200/10 disabled:opacity-40"
                            />
                            <span className="mt-2 block text-[10px] leading-5 text-white/28">Use at least 8 characters with a letter and a number.</span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading || !configured}
                            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 to-amber-100 px-4 py-3.5 text-sm font-bold text-[#07110f] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-white/40">
                        Already have an account?{' '}
                        <Link href="/auth/signin" className="font-semibold text-emerald-200 hover:text-emerald-100">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
