'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpenText,
    Chrome,
    HeartHandshake,
    Loader2,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthRuntime } from '@/app/providers';

function SignInContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const error = searchParams.get('error');
    const reason = searchParams.get('reason');
    const { configured } = useAuthRuntime();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState('');

    const authAvailable = configured && reason !== 'auth-unavailable';

    const handleGoogleSignIn = async () => {
        if (!authAvailable) return;
        setIsLoading('google');
        await signIn('google', { callbackUrl });
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authAvailable || !email.trim() || !password.trim()) return;
        setIsLoading('credentials');

        const result = await signIn('credentials', {
            email: email.trim().toLowerCase(),
            password,
            callbackUrl,
            redirect: false,
        });

        if (result?.error) {
            window.location.href = `/auth/signin?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`;
        } else if (result?.url) {
            window.location.href = result.url;
        }
        setIsLoading('');
    };

    return (
        <div className="sanctuary-auth-shell">
            <div className="sanctuary-light-column" aria-hidden="true" />
            <div className="sanctuary-nave" aria-hidden="true" />
            <div className="sanctuary-vignette" aria-hidden="true" />

            <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.92fr_0.72fr] lg:items-center">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl"
                >
                    <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 backdrop-blur-xl">
                        <Sparkles className="mr-2 h-4 w-4" /> Sanctuary entrance
                    </div>
                    <h1 className="mt-7 text-5xl font-light leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                        Return to a quieter place for Word, prayer, worship and care.
                    </h1>
                    <p className="mt-6 max-w-xl text-base leading-8 text-white/58 sm:text-lg">
                        Your member account opens private prayer memory, personal journeys, church workspaces and pastoral follow-up. The experience stays grounded in Scripture and human ministry.
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        {[
                            [BookOpenText, 'Word', 'Study and reflection'],
                            [HeartHandshake, 'Care', 'Human follow-up'],
                            [ShieldCheck, 'Private', 'Tenant-safe records'],
                        ].map(([Icon, title, copy]: any) => (
                            <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 backdrop-blur-xl">
                                <Icon className="h-5 w-5 text-emerald-200" />
                                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                                <p className="mt-1 text-xs leading-5 text-white/42">{copy}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 24, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.08 }}
                    className="sanctuary-auth-card rounded-[2rem] p-6 sm:p-8"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="sanctuary-section-label text-emerald-200/65">Member access</p>
                            <h2 className="mt-2 text-3xl font-light text-white">Enter the Sanctuary</h2>
                            <p className="mt-2 text-sm leading-6 text-white/45">Use the account connected to your personal or church workspace.</p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/15 bg-amber-100/8 text-amber-100">
                            <LockKeyhole className="h-5 w-5" />
                        </div>
                    </div>

                    {!authAvailable && (
                        <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-100/8 p-4 text-sm leading-6 text-amber-50">
                            <strong className="block text-amber-100">Member sign-in is temporarily unavailable.</strong>
                            Public sanctuary spaces remain open. The deployment needs its production authentication secret before private accounts can be entered.
                        </div>
                    )}

                    {searchParams.get('registered') === 'true' && authAvailable && (
                        <div className="mt-6 rounded-2xl border border-emerald-200/20 bg-emerald-100/8 p-4 text-sm text-emerald-100">
                            Account created successfully. You can sign in now.
                        </div>
                    )}

                    {error && authAvailable && (
                        <div className="mt-6 rounded-2xl border border-rose-200/20 bg-rose-300/8 p-4 text-sm text-rose-100">
                            {error === 'OAuthSignin' && 'Google sign-in could not start. Please try again.'}
                            {error === 'OAuthCallback' && 'Authentication could not be completed. Please try again.'}
                            {error === 'CredentialsSignin' && 'The email or password was not accepted.'}
                            {error === 'EmailSignin' && 'The sign-in email could not be sent.'}
                            {!['OAuthSignin', 'OAuthCallback', 'EmailSignin', 'CredentialsSignin'].includes(error) && 'Sign-in could not be completed.'}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={!!isLoading || !authAvailable}
                        className="mt-7 flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3.5 text-sm font-semibold text-white transition hover:border-white/18 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isLoading === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5 text-sky-300" />}
                        Continue with Google
                    </button>

                    <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/8" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">or email & password</span>
                        <div className="h-px flex-1 bg-white/8" />
                    </div>

                    <form onSubmit={handleEmailSignIn}>
                        <div className="space-y-3">
                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold text-white/55">Email address</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    disabled={!authAvailable}
                                    className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/24 focus:border-amber-200/30 focus:ring-2 focus:ring-amber-200/10 disabled:opacity-40"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold text-white/55">Password</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={!authAvailable}
                                    className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/24 focus:border-amber-200/30 focus:ring-2 focus:ring-amber-200/10 disabled:opacity-40"
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!!isLoading || !authAvailable || !email.trim() || !password.trim()}
                            className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 to-amber-100 px-4 py-3.5 text-sm font-bold text-[#07110f] shadow-[0_18px_50px_rgba(245,201,120,.14)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isLoading === 'credentials' ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-white/42">
                        New here?{' '}
                        <Link href="/auth/register" className="font-semibold text-emerald-200 hover:text-emerald-100">
                            Create an account
                        </Link>
                    </div>

                    <div className="mt-6 flex items-start gap-2 rounded-2xl border border-white/7 bg-white/[0.025] p-4 text-[11px] leading-5 text-white/36">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200/70" />
                        Authentication protects private ministry records. Public sanctuary pages remain explorable without pretending that a session exists.
                    </div>
                </motion.section>
            </div>
        </div>
    );
}

function SignInFallback() {
    return (
        <div className="sanctuary-auth-shell">
            <div className="relative z-10 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-amber-100" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-white/45">Preparing sanctuary entrance</p>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<SignInFallback />}>
            <SignInContent />
        </Suspense>
    );
}
