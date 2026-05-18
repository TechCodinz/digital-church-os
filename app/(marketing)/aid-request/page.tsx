'use client';

import { motion } from 'framer-motion';
import { AidRequestForm } from '@/components/aid/AidRequestForm';
import { Heart, ShieldCheck, Info } from 'lucide-react';

export default function AidRequestPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4">
                <header className="max-w-3xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-emerald-200">
                            <Heart size={32} className="text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4">Request Assistance</h1>
                        <p className="text-stone-600 text-lg leading-relaxed">
                            Our community is built on mutual support and radical transparency. If you are facing a hardship, please let us know so we can walk with you.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2">
                        <AidRequestForm />
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <section className="sanctuary-card bg-emerald-600 text-white border-none shadow-xl shadow-emerald-200">
                            <h3 className="text-xl font-medium mb-4 flex items-center">
                                <ShieldCheck size={20} className="mr-2" /> Our Commitment
                            </h3>
                            <p className="text-emerald-50 text-sm leading-relaxed mb-6">
                                Every request is reviewed by our community care team with the utmost dignity and confidentiality. We aim to respond to all non-urgent requests within 72 hours.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center text-xs bg-white/10 p-3 rounded-xl">
                                    <div className="w-2 h-2 bg-emerald-300 rounded-full mr-3 animate-pulse" />
                                    Total Anonymity Available
                                </div>
                                <div className="flex items-center text-xs bg-white/10 p-3 rounded-xl">
                                    <div className="w-2 h-2 bg-emerald-300 rounded-full mr-3" />
                                    Verified Fund Allocation
                                </div>
                            </div>
                        </section>

                        <section className="sanctuary-card">
                            <h3 className="text-lg font-medium text-stone-800 mb-4 flex items-center">
                                <Info size={18} className="mr-2 text-stone-400" /> How it works
                            </h3>
                            <ol className="space-y-4">
                                {[
                                    { step: 1, title: 'Submit Request', desc: 'Detail your specific need and the amount required.' },
                                    { step: 2, title: 'Confidential Review', desc: 'Our team verifies the request against available resources.' },
                                    { step: 3, title: 'Direct Allocation', desc: 'Funds are disbursed directly to you or the service provider.' },
                                ].map((s) => (
                                    <li key={s.step} className="flex gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 bg-cream-100 text-stone-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                                            {s.step}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-stone-800">{s.title}</p>
                                            <p className="text-xs text-stone-500 mt-1">{s.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
