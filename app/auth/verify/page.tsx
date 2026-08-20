'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Clock3, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

function VerifyRequestContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || 'your email address';

    return (
        <div className="sanctuary-auth-shell">
            <div className="sanctuary-light-column" aria-hidden="true" />
            <div className="sanctuary-nave" aria-hidden="true" />
            <div className="sanctuary-vignette" aria-hidden="true" />

            <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative z-10 w-full max-w-2xl"
            >
                <div className="mb-7 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/18 bg-amber-100/8 text-amber-100 shadow-[0_14px_45px_rgba(245,201,120,.12)]">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200/55">Digital Church OS · Living Sanctuary</p>
                </div>

                <div className="sanctuary-auth-card rounded-[2.2rem] p-7 text-center sm:p-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.08 }}
                        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-200/15 bg-sky-300/8 text-sky-200"
                    >
                        <Mail className="h-7 w-7" />
                    </motion.div>

                    <p className="sanctuary-section-label mt-6 text-emerald-200/60">Secure sign-in link</p>
                    <h1 className="mt-3 text-4xl font-light text-white">Check your inbox</h1>
                    <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/48">
                        If email sign-in is configured, a secure link has been sent to <span className="font-semibold text-white/80">{email}</span>. Open the message and follow the sign-in link to continue.
                    </p>

                    <div className="mx-auto mt-7 grid max-w-xl gap-3 text-left sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                            <Clock3 className="h-5 w-5 text-amber-100" />
                            <p className="mt-3 text-sm font-semibold text-white">Time-limited access</p>
                            <p className="mt-1 text-xs leading-5 text-white/38">Use the newest link. Older or already-used links may no longer be accepted.</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                            <ShieldCheck className="h-5 w-5 text-emerald-200" />
                            <p className="mt-3 text-sm font-semibold text-white">Private by design</p>
                            <p className="mt-1 text-xs leading-5 text-white/38">The link establishes only your authenticated session; it does not expose another member’s records.</p>
                        </div>
                    </div>

                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link href="/auth/signin" className="sacred-primary-button">
                            Use another sign-in method <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/" className="sacred-secondary-button">Return to Sanctuary</Link>
                    </div>

                    <p className="mt-6 text-[11px] leading-5 text-white/28">If no message arrives, email sign-in may not yet be configured for this deployment. You can return and use another available sign-in method.</p>
                </div>
            </motion.div>
        </div>
    );
}

function VerifyRequestFallback() {
    return (
        <div className="sanctuary-auth-shell">
            <div className="relative z-10 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-amber-100" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-white/45">Preparing verification</p>
            </div>
        </div>
    );
}

export default function VerifyRequestPage() {
    return (
        <Suspense fallback={<VerifyRequestFallback />}>
            <VerifyRequestContent />
        </Suspense>
    );
}
