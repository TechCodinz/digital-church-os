'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Heart, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || 'your email';

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-cream-50 to-sage-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-500 rounded-2xl shadow-lg mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-light text-stone-800">Digital Church OS</h1>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
                    {/* Email icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Mail className="w-8 h-8 text-blue-500" />
                    </motion.div>

                    <h2 className="text-2xl font-light text-stone-800 mb-3">Check your inbox</h2>
                    <p className="text-stone-500 text-sm mb-2 leading-relaxed">
                        A sign-in link has been sent to:
                    </p>
                    <p className="font-semibold text-stone-800 mb-6">{email}</p>

                    <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 mb-8 text-left space-y-3">
                        {[
                            'Open your email inbox',
                            'Look for an email from Digital Church OS',
                            'Click the "Sign In" button in the email',
                            'You will be signed in automatically',
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-sage-100 text-sage-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </div>
                                <span className="text-stone-600 text-sm">{step}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-stone-400 mb-6">
                        The link will expire in 24 hours. Check your spam folder if you don't see it.
                    </p>

                    <Link
                        href="/auth/signin"
                        className="inline-flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium"
                    >
                        <ArrowRight className="w-4 h-4" /> Use a different email
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
