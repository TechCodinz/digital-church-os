'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Eye, HeartHandshake, CloudLightning, Activity, Moon, Sun, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SpiritualGrowthCenters() {
    const centers = [
        {
            title: "Holy Spirit Guidance",
            description: "Receive scripture-based guidance, promptings, and peace-check indicators for profound spiritual discernment.",
            icon: Zap,
            color: "text-blue-500",
            bg: "bg-blue-50 border-blue-100",
            href: "/spiritual/guidance"
        },
        {
            title: "Spiritual Warfare Training",
            description: "Armor up! Learn about binding/loosing prayer types and engage in guided battle simulations.",
            icon: Shield,
            color: "text-slate-700",
            bg: "bg-slate-50 border-slate-200",
            href: "/spiritual/warfare"
        },
        {
            title: "Dreams & Visions Interpretation",
            description: "Analyze Biblical symbols and apply discernment protocols to understand your supernatural communications.",
            icon: Moon,
            color: "text-indigo-500",
            bg: "bg-indigo-50 border-indigo-100",
            href: "/spiritual/dreams"
        },
        {
            title: "Angelic Encounters",
            description: "A secure teaching center exploring angelology, hierarchies, and activities with strict Biblical safety guardrails.",
            icon: Eye,
            color: "text-amber-500",
            bg: "bg-amber-50 border-amber-100",
            href: "/spiritual/angels"
        },
        {
            title: "Prophetic Ministry Training",
            description: "Journey from foundation to multiplication in prophetic ministry with rigorous safety and testing guidelines.",
            icon: Sparkles,
            color: "text-purple-500",
            bg: "bg-purple-50 border-purple-100",
            href: "/spiritual/prophetic"
        },
        {
            title: "Supernatural Encounters",
            description: "A guided simulator for heavenly and worship encounters set in immersive virtual environments.",
            icon: CloudLightning,
            color: "text-cyan-500",
            bg: "bg-cyan-50 border-cyan-100",
            href: "/spiritual/encounters"
        },
        {
            title: "Spiritual Gifts Discovery",
            description: "Uncover your divine design! Take specialized assessments and track your developmental progress.",
            icon: Activity,
            color: "text-rose-500",
            bg: "bg-rose-50 border-rose-100",
            href: "/spiritual/gifts"
        },
        {
            title: "Healing & Deliverance",
            description: "A compassionate center for physical, emotional, and inner healing with professional integration.",
            icon: HeartHandshake,
            color: "text-emerald-500",
            bg: "bg-emerald-50 border-emerald-100",
            href: "/spiritual/healing"
        },
        {
            title: "Glory Realms Experience",
            description: "Explore the Throne Room, Courts of Heaven, and the Mountain of God through progressive depth journeys.",
            icon: Sun,
            color: "text-yellow-500",
            bg: "bg-yellow-50 border-yellow-100",
            href: "/spiritual/glory"
        }
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex py-1 px-4 rounded-full bg-sage-100 text-sage-700 text-xs font-bold tracking-widest uppercase mb-6"
                    >
                        Advanced Spiritual Formation
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-light text-stone-800 mb-6"
                    >
                        Supernatural & Eternal Focus Centers
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-stone-500 leading-relaxed"
                    >
                        "But eagerly desire the greater gifts. And now I will show you the most excellent way." — 1 Corinthians 12:31. Step into the deep waters of faith with specialized AI-powered training centers securely bound by Theological Guardrails.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {centers.map((center, idx) => (
                        <motion.div
                            key={center.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 + 0.3 }}
                            className={`p-8 rounded-3xl border border-transparent hover:border-sage-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden`}
                        >
                            {/* Decorative Background Blob */}
                            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700 ${center.bg.split(' ')[0]}`} />

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm border ${center.bg}`}>
                                    <center.icon className={`w-6 h-6 ${center.color}`} />
                                </div>
                                <h3 className="text-xl font-medium text-stone-800 mb-2">{center.title}</h3>
                                <p className="text-stone-500 text-sm leading-relaxed mb-6">
                                    {center.description}
                                </p>

                                <Link href={center.href} className="flex items-center text-sm font-semibold uppercase tracking-wider text-sage-600 hover:text-sage-700 transition-colors">
                                    Enter Center
                                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}
