'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Home,
    LockKeyhole,
    RefreshCw,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
        title: 'Private access is not ready yet',
        description: 'The sanctuary is online, but member authentication is not fully configured in this deployment. Public spaces remain available while private access stays safely closed.',
    },
    AccessDenied: {
        title: 'This space is restricted',
        description: 'Your current account does not have permission to enter this private workspace.',
    },
    Verification: {
        title: 'That sign-in link is no longer valid',
        description: 'The verification link may have expired or already been used. Request a fresh sign-in link and try again.',
    },
    OAuthSignin: {
        title: 'Google sign-in could not begin',
        description: 'The external sign-in flow could not start. You can return to the sanctuary and try again later.',
    },
    OAuthCallback: {
        title: 'Sign-in could not be completed',
        description: 'The authentication provider returned an error before the session could be established.',
    },
    Default: {
        title: 'We could not open this private space',
        description: 'Something interrupted authentication. Public sanctuary areas are still available while private access remains protected.',
    },
};

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error') || 'Default';
    const errorInfo = errorMessages[error] || errorMessages.Default;
    const isConfiguration = error === 'Configuration';

    return (
        <div className="sanctuary-auth-shell">
            <div className="sanctuary-light-column" aria-hidden="true" />
            <div className="sanctuary-nave" aria-hidden="true" />
            <div className="sanctuary-vignette" aria-hidden="true" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative z-10 w-full max-w-3xl"
            >
                <div className="mb-7 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/18 bg-amber-100/8 text-amber-100 shadow-[0_14px_45px_rgba(245,201,120,.12)]">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200/55">Digital Church OS · Living Sanctuary</p>
                </div>

                <div className="sanctuary-auth-card overflow-hidden rounded-[2.2rem]">
                    <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                        <div className="border-b border-white/8 p-7 md:border-b-0 md:border-r md:p-9">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/15 bg-rose-300/8 text-rose-200">
                                {isConfiguration ? <LockKeyhole className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                            </div>
                            <p className="sanctuary-section-label mt-6 text-rose-200/55">Protected boundary</p>
                            <h1 className="mt-3 text-3xl font-light leading-tight text-white sm:text-4xl">{errorInfo.title}</h1>
                            <p className="mt-4 text-sm leading-7 text-white/48">{errorInfo.description}</p>
                        </div>

                        <div className="p-7 md:p-9">
                            <div className="rounded-2xl border border-emerald-200/12 bg-emerald-100/[0.045] p-4">
                                <div className="flex gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">The system is failing closed on purpose.</p>
                                        <p className="mt-1 text-xs leading-6 text-white/42">Private accounts and church records are never opened by weakening authentication just to avoid an error screen.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {!isConfiguration && (
                                    <Link href="/auth/signin" className="flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 to-amber-100 px-5 text-sm font-bold text-[#07110f]">
                                        <RefreshCw className="mr-2 h-4 w-4" /> Try sign-in again
                                    </Link>
                                )}
                                <Link href="/" className="flex min-h-13 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-white/82 transition hover:bg-white/[0.075]">
                                    <Home className="mr-2 h-4 w-4" /> Return to the Sanctuary
                                </Link>
                                <Link href="/prayer-room" className="flex min-h-12 items-center justify-center rounded-2xl border border-white/7 px-5 text-xs font-semibold text-emerald-200/80 transition hover:bg-white/[0.035]">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Continue to a public prayer space
                                </Link>
                            </div>

                            {isConfiguration && (
                                <p className="mt-5 text-center text-[11px] leading-5 text-white/30">Member authentication will become available as soon as the production deployment secret is configured.</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function AuthErrorFallback() {
    return (
        <div className="sanctuary-auth-shell">
            <div className="relative z-10 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-amber-100" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-white/45">Restoring sanctuary access</p>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<AuthErrorFallback />}>
            <AuthErrorContent />
        </Suspense>
    );
}
