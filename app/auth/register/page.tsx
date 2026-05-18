'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, User, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to register');
            }

            // Success - redirect to signin
            router.push('/auth/signin?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-cream-50 to-sage-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-500 rounded-2xl shadow-lg mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-light text-stone-800">Join the Community</h1>
                    <p className="text-stone-500 mt-2 text-sm">Create your Digital Church OS account</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 flex items-center gap-2">
                                <User className="w-4 h-4" /> Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 mt-2 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-stone-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Your data is encrypted and secure.
                    </div>
                </motion.div>

                <p className="text-center text-sm text-stone-500 mt-8">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-sage-600 font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
