'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Heart, Users, Music, DollarSign, MessageCircle } from 'lucide-react';

export default function HomePage() {
    const features = [
        {
            icon: Calendar,
            title: 'Conferences',
            description: 'Join virtual conferences, RSVP, and access replays',
            href: '/conferences',
            color: 'text-sage-600',
        },
        {
            icon: Heart,
            title: 'Prayer Room',
            description: 'Share prayer requests publicly or privately',
            href: '/prayer-room',
            color: 'text-rose-400',
        },
        {
            icon: Users,
            title: 'Live Service',
            description: 'Join live worship services from anywhere',
            href: '/live-service',
            color: 'text-blue-400',
        },
        {
            icon: Music,
            title: 'Choir',
            description: 'Virtual choir and worship music',
            href: '/choir',
            color: 'text-purple-400',
        },
        {
            icon: DollarSign,
            title: 'Transparent Giving',
            description: 'Support with complete transparency',
            href: '/offering',
            color: 'text-emerald-500',
        },
        {
            icon: MessageCircle,
            title: 'Community Wall',
            description: 'Share testimonies and encouragement',
            href: '/community-wall',
            color: 'text-amber-500',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cream-100 to-cream-200" />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-light text-stone-800 mb-6">
                            Digital Church OS
                        </h1>
                        <p className="text-xl md:text-2xl text-stone-600 mb-8">
                            A sanctuary for digital worship and spiritual community
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/conferences"
                                className="px-8 py-4 bg-sage-500 text-white rounded-full hover:bg-sage-600 transition-all transform hover:scale-105"
                            >
                                Join a Conference
                            </Link>
                            <Link
                                href="/prayer-room"
                                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-stone-700 rounded-full hover:bg-white transition-all"
                            >
                                Enter Prayer Room
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-sage-400 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-sage-400 rounded-full mt-2 animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-cream-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-light text-center text-stone-800 mb-12">
                        A Place for Every Soul
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link href={feature.href}>
                                    <div className="sanctuary-card group cursor-pointer h-full">
                                        <feature.icon className={`w-12 h-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                                        <h3 className="text-xl font-medium text-stone-800 mb-2">{feature.title}</h3>
                                        <p className="text-stone-600">{feature.description}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
