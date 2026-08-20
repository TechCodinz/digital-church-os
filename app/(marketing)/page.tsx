'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    BookOpen,
    Building2,
    Compass,
    Feather,
    Flame,
    Globe,
    Heart,
    HeartHandshake,
    Lock,
    MessageSquare,
    Music,
    Play,
    Radio,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

const reveal = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

export default function HomePage() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [daypart, setDaypart] = useState('Welcome');

    useEffect(() => {
        setMounted(true);
        const hour = new Date().getHours();
        setDaypart(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
    }, []);

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';

    const intents = useMemo(
        () => [
            {
                icon: Heart,
                eyebrow: 'I need prayer',
                title: 'Enter the Prayer Room',
                copy: 'Private prayer, community intercession, and a Scripture-grounded guided-prayer companion.',
                href: '/prayer-room',
            },
            {
                icon: BookOpen,
                eyebrow: 'I need the Word',
                title: 'Open Scripture Immersion',
                copy: 'Read slowly, explore context, save reflection, and move from observation into response.',
                href: '/scripture/immersion',
            },
            {
                icon: Play,
                eyebrow: 'I want to worship',
                title: 'Enter Live Worship',
                copy: 'Join a configured church broadcast with a focused companion for notes, Scripture, and response.',
                href: '/live-service',
            },
            {
                icon: HeartHandshake,
                eyebrow: 'I need guidance',
                title: 'Pastoral Care Hub',
                copy: 'Begin with careful AI-assisted reflection and escalate to accountable human pastoral care when needed.',
                href: '/pastoral/hub',
            },
            {
                icon: Globe,
                eyebrow: 'I need community',
                title: 'Find a Church',
                copy: 'Discover congregations, services, conferences, prayer communities, and ministry pathways.',
                href: '/churches',
            },
            {
                icon: MessageSquare,
                eyebrow: 'I want to connect',
                title: 'Community Wall',
                copy: 'Share testimony, encouragement, prayer, and faith-centered community moments.',
                href: '/community-wall',
            },
        ],
        []
    );

    const pathways = [
        {
            step: '01',
            icon: Feather,
            title: 'Become still',
            copy: 'Enter without noise. Choose prayer, worship, Scripture, care, or community based on what you need now.',
            href: '/sanctuary-3d',
            label: 'Enter Sanctuary',
        },
        {
            step: '02',
            icon: BookOpen,
            title: 'Meet the Word',
            copy: 'Move from reading into context, reflection, notes, memory, sermon study, and a practical next step.',
            href: '/scripture/immersion',
            label: 'Open Scripture',
        },
        {
            step: '03',
            icon: HeartHandshake,
            title: 'Respond with people',
            copy: 'Pray, join worship, talk to a pastor, serve, encourage someone, or continue privately in your journal.',
            href: '/dashboard',
            label: 'Continue Your Journey',
        },
    ];

    const ministryWorlds = [
        { icon: Radio, title: '24/7 Prayer Watch', href: '/prayer-watch', copy: 'Continuous intercession organized by prayer watches.' },
        { icon: Music, title: 'Choir & Worship Studio', href: '/choir/studio', copy: 'Create, rehearse, arrange, and prepare worship together.' },
        { icon: Users, title: 'Family Altar', href: '/family/devotional', copy: 'Build a private rhythm of Scripture, prayer, reflection, and peace.' },
        { icon: Flame, title: 'Fasting Companion', href: '/spiritual/fasting', copy: 'Plan, reflect, journal, and stay Scripture-centered during a fast.' },
        { icon: Building2, title: 'Minister Portal', href: '/minister/onboard', copy: 'A structured workspace for ministers, teams, services, care, and teaching.' },
        { icon: Compass, title: 'Global Church Network', href: '/churches', copy: 'Move between local church life and a wider global Christian community.' },
    ];

    return (
        <div className={`min-h-screen overflow-hidden ${isLight ? 'text-stone-900' : 'text-white'}`}>
            <section className="sanctuary-cinematic-hero relative min-h-[92vh] flex items-center pt-28 pb-20">
                <div className="sanctuary-light-column" aria-hidden="true" />
                <div className="sanctuary-nave" aria-hidden="true" />
                <div className="sanctuary-vignette" aria-hidden="true" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-[1.18fr_0.82fr] gap-14 items-center">
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                            className="max-w-4xl"
                        >
                            <motion.div variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.23em] text-amber-100/90 backdrop-blur-xl">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                Living Sanctuary Experience
                            </motion.div>

                            <motion.p variants={reveal} className="mt-8 text-sm md:text-base font-medium text-amber-200/85">
                                {daypart}. Enter as you are.
                            </motion.p>

                            <motion.h1 variants={reveal} className="mt-4 text-5xl sm:text-6xl lg:text-8xl font-light tracking-[-0.045em] leading-[0.98] text-white">
                                A digital church that feels less like an app and more like a <span className="living-gradient-text font-normal">living sanctuary.</span>
                            </motion.h1>

                            <motion.p variants={reveal} className="mt-7 max-w-3xl text-base sm:text-lg lg:text-xl leading-relaxed text-slate-200/88 font-light">
                                Prayer, Scripture, worship, pastoral care, community, church life, and intelligent guidance woven into one reverent journey — with clear boundaries between AI assistance, Scripture, and accountable human ministry.
                            </motion.p>

                            <motion.div variants={reveal} className="mt-9 flex flex-wrap gap-3">
                                <Link href="/sanctuary-3d" className="sacred-primary-button group">
                                    Enter the Sanctuary
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link href="/prayer-room" className="sacred-secondary-button group">
                                    <Heart className="w-4 h-4" />
                                    I need prayer
                                </Link>
                            </motion.div>

                            <motion.div variants={reveal} className="mt-10 grid sm:grid-cols-3 gap-3 max-w-3xl">
                                {[
                                    [ShieldCheck, 'Scripture-grounded', 'AI assists; it does not claim revelation.'],
                                    [Lock, 'Private by design', 'Personal reflection stays personal.'],
                                    [HeartHandshake, 'Human care matters', 'Pastoral escalation remains visible.'],
                                ].map(([Icon, title, copy]) => {
                                    const IconComponent = Icon as typeof ShieldCheck;
                                    return (
                                        <div key={String(title)} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
                                            <IconComponent className="w-4 h-4 text-amber-300 mb-3" />
                                            <p className="text-xs font-semibold text-white">{String(title)}</p>
                                            <p className="text-[11px] leading-relaxed text-slate-400 mt-1">{String(copy)}</p>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.18 }}
                            className="relative"
                        >
                            <div className="presence-orbit" aria-hidden="true" />
                            <div className="sacred-panel-dark relative overflow-hidden p-6 sm:p-7">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-300/80">Presence Compass</p>
                                        <h2 className="mt-2 text-2xl font-light text-white">What do you need right now?</h2>
                                        <p className="mt-2 text-xs leading-relaxed text-slate-400">Choose the need, not the feature. Digital Church OS routes you into the right spiritual experience.</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl border border-amber-300/20 bg-amber-300/10 flex items-center justify-center shrink-0">
                                        <Compass className="w-5 h-5 text-amber-300" />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2.5">
                                    {intents.slice(0, 4).map((intent, index) => {
                                        const Icon = intent.icon;
                                        return (
                                            <Link key={intent.title} href={intent.href} className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 hover:bg-white/[0.08] hover:border-amber-300/20 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200 group-hover:scale-105 transition-transform">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{intent.eyebrow}</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-100">{intent.title}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="mt-5 pt-5 border-t border-white/8 flex items-center justify-between gap-4">
                                    <p className="text-[11px] text-slate-500">Or press <span className="text-slate-300 font-mono">⌘/Ctrl + K</span> anywhere for Sanctuary Guide.</p>
                                    <Sparkles className="w-4 h-4 text-amber-300/70" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className={`relative py-24 ${isLight ? 'bg-[#f7f2ea]/92' : 'bg-slate-950/78'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <p className={`text-[11px] uppercase tracking-[0.24em] font-semibold ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Start with the person, not the menu</p>
                        <h2 className={`mt-4 text-4xl sm:text-5xl font-light tracking-tight ${isLight ? 'text-stone-900' : 'text-white'}`}>One front door. Many sacred journeys.</h2>
                        <p className={`mt-5 text-base leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>The homepage now works like an intelligent spiritual foyer: it listens to intent and takes people directly to the experience that fits their moment.</p>
                    </div>

                    <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {intents.map((intent, index) => {
                            const Icon = intent.icon;
                            return (
                                <motion.div key={intent.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: index * 0.04 }}>
                                    <Link href={intent.href} className={`group block h-full rounded-3xl border p-6 transition-all duration-300 ${isLight ? 'bg-white/80 border-stone-200/80 hover:border-sage-300 hover:shadow-2xl hover:shadow-stone-300/20' : 'bg-white/[0.035] border-white/8 hover:bg-white/[0.06] hover:border-emerald-300/20'}`}>
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${isLight ? 'bg-sage-50 border-sage-100 text-sage-700' : 'bg-emerald-300/8 border-emerald-300/15 text-emerald-300'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <p className={`mt-6 text-[10px] uppercase tracking-[0.2em] ${isLight ? 'text-stone-400' : 'text-slate-500'}`}>{intent.eyebrow}</p>
                                        <h3 className={`mt-2 text-xl font-medium ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>{intent.title}</h3>
                                        <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{intent.copy}</p>
                                        <div className={`mt-6 flex items-center gap-2 text-xs font-semibold ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>
                                            Enter experience <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="relative py-24 bg-slate-950 text-white overflow-hidden">
                <div className="absolute inset-0 sanctuary-radiance opacity-80" aria-hidden="true" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-[0.72fr_1.28fr] gap-14 items-start">
                        <div className="lg:sticky lg:top-28">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-amber-300">A sacred flow, not a dashboard maze</p>
                            <h2 className="mt-4 text-4xl sm:text-5xl font-light tracking-tight">Stillness → Word → Response</h2>
                            <p className="mt-5 text-slate-400 leading-relaxed">Each core experience should lead naturally into the next: not endless features competing for attention, but a coherent rhythm a believer can understand immediately.</p>
                        </div>

                        <div className="space-y-4">
                            {pathways.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.step} href={item.href} className="group block sacred-panel-dark p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                            <div className="text-5xl font-light text-white/10 tracking-tighter">{item.step}</div>
                                            <div className="w-12 h-12 rounded-2xl border border-amber-300/15 bg-amber-300/8 flex items-center justify-center text-amber-300 shrink-0">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-medium text-white">{item.title}</h3>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.copy}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 sm:ml-4">
                                                {item.label}<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className={`relative py-24 ${isLight ? 'bg-[#fbf8f3]' : 'bg-slate-950/92'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        <div className="max-w-3xl">
                            <p className={`text-[11px] uppercase tracking-[0.24em] font-semibold ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>The wider church world</p>
                            <h2 className={`mt-4 text-4xl sm:text-5xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Deep enough for a believer. Powerful enough for a church.</h2>
                        </div>
                        <Link href="/churches" className={`inline-flex items-center gap-2 text-sm font-semibold ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Explore the global network <ArrowRight className="w-4 h-4" /></Link>
                    </div>

                    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ministryWorlds.map((world) => {
                            const Icon = world.icon;
                            return (
                                <Link key={world.title} href={world.href} className={`group rounded-3xl border p-6 transition-all ${isLight ? 'bg-white border-stone-200 hover:border-sage-300 hover:-translate-y-1 hover:shadow-xl' : 'bg-white/[0.035] border-white/8 hover:bg-white/[0.06] hover:border-emerald-300/20'}`}>
                                    <Icon className={`w-5 h-5 ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} />
                                    <h3 className={`mt-5 text-lg font-medium ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>{world.title}</h3>
                                    <p className={`mt-2 text-sm leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{world.copy}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="relative py-24 bg-[#07110f] text-white overflow-hidden">
                <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <div className="mx-auto w-14 h-14 rounded-2xl border border-amber-300/20 bg-amber-300/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-amber-300" />
                    </div>
                    <h2 className="mt-7 text-4xl sm:text-6xl font-light tracking-tight">The intelligence should feel quiet.</h2>
                    <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-3xl mx-auto">Digital Church OS can remember where a user left off, surface the right next action, explain Scripture, support prayer, and connect people to ministry — without pretending the AI is God, a prophet, or a substitute for human spiritual care.</p>
                    <div className="mt-9 flex flex-wrap justify-center gap-3">
                        <Link href="/dashboard" className="sacred-primary-button group">Open Personal Sanctuary <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
                        <Link href="/pastoral/hub" className="sacred-secondary-button"><HeartHandshake className="w-4 h-4" />Pastoral Care</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
