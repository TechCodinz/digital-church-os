'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, Heart } from 'lucide-react';
import Link from 'next/link';

const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
        title: 'Server Configuration Error',
        description: 'There is a problem with the server configuration. The team has been notified.',
    },
    AccessDenied: {
        title: 'Access Denied',
        description: 'You do not have permission to sign in to this account.',
    },
    Verification: {
        title: 'Token Expired or Invalid',
        description: 'The magic link you clicked has expired or was already used. Please request a new sign-in link.',
    },
    OAuthSignin: {
        title: 'OAuth Sign-In Error',
        description: 'There was a problem starting the OAuth sign-in process. Please try again.',
    },
    OAuthCallback: {
        title: 'OAuth Callback Error',
        description: 'There was a problem during authentication. Please try again or contact support.',
    },
    Default: {
        title: 'Authentication Error',
        description: 'An unexpected error occurred during sign-in. Please try again.',
    },
};

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error') || 'Default';
    const errorInfo = errorMessages[error] || errorMessages.Default;

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
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>

                    <h2 className="text-xl font-semibold text-stone-800 mb-3">{errorInfo.title}</h2>
                    <p className="text-stone-500 text-sm mb-8 leading-relaxed">{errorInfo.description}</p>

                    <div className="flex flex-col gap-3">
                        <Link
                            href="/auth/signin"
                            className="w-full py-3 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Try Again
                        </Link>
                        <Link
                            href="/"
                            className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" /> Return Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
