'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Chrome, Heart, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const error = searchParams.get('error');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState('');

    const handleGoogleSignIn = async () => {
        setIsLoading('google');
        await signIn('google', { callbackUrl });
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        setIsLoading('credentials');

        const result = await signIn('credentials', {
            email,
            password,
            callbackUrl,
            redirect: false
        });

        if (result?.error) {
            // Force error reload to show the NextAuth error block
            window.location.href = `/auth/signin?error=CredentialsSignin`;
        } else if (result?.url) {
            window.location.href = result.url;
        }
        setIsLoading('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-cream-50 to-sage-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-500 rounded-2xl shadow-lg mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-light text-stone-800">Digital Church OS</h1>
                    <p className="text-stone-500 mt-2 text-sm">
                        "Come to me, all who are weary...I will give you rest." — Matthew 11:28
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8"
                >
                    <h2 className="text-xl font-semibold text-stone-800 mb-1">Welcome back</h2>
                    <p className="text-stone-500 text-sm mb-8">Sign in to continue your spiritual journey.</p>

                    {/* Error and Success States */}
                    {searchParams.get('registered') === 'true' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-sm text-emerald-700 font-medium text-center">
                            Account created successfully! Please sign in below.
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
                            {error === 'OAuthSignin' && 'There was an issue with Google sign-in. Please try again.'}
                            {error === 'OAuthCallback' && 'Authentication failed. Please try again.'}
                            {error === 'CredentialsSignin' && 'Invalid email or password. Please try again.'}
                            {error === 'EmailSignin' && 'There was an issue sending the email. Please try again.'}
                            {!['OAuthSignin', 'OAuthCallback', 'EmailSignin', 'CredentialsSignin'].includes(error) && 'An unexpected error occurred. Please try again.'}
                        </div>
                    )}

                    <>
                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={!!isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all font-medium text-stone-700 mb-4 disabled:opacity-50"
                        >
                            {isLoading === 'google' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Chrome className="w-5 h-5 text-blue-500" />
                            )}
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px bg-stone-100" />
                            <span className="text-xs text-stone-400 uppercase tracking-wide">or sign in with email</span>
                            <div className="flex-1 h-px bg-stone-100" />
                        </div>

                        {/* Credentials Sign In */}
                        <form onSubmit={handleEmailSignIn}>
                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 mb-1.5">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-sm font-medium text-stone-600">
                                            Password
                                        </label>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!!isLoading || !email.trim() || !password.trim()}
                                className="w-full py-3.5 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading === 'credentials' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-5 text-center text-sm text-stone-500">
                            Don't have an account?{' '}
                            <Link href="/auth/register" className="text-sage-600 font-medium hover:underline">
                                Create one now
                            </Link>
                        </div>
                    </>

                    {/* Security note */}
                    <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-stone-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Secure sign-in. No password required.
                    </div>
                </motion.div>

                <p className="text-center text-xs text-stone-400 mt-6">
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="text-sage-600 hover:underline">Terms</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-sage-600 hover:underline">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}
