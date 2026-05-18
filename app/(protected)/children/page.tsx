'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Music, Star, BookOpen, Gift, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ChildrenDepartmentPage() {
    const { data: session } = useSession();

    const modules = [
        {
            title: "Magical Prayer Room",
            description: "A gentle, guided space for kids to learn how to talk with God.",
            icon: Heart,
            color: "bg-rose-500",
            lightColor: "bg-rose-50 border-rose-100",
            textColor: "text-rose-500",
            action: "/children/prayer"
        },
        {
            title: "Bible Story Adventures",
            description: "Interactive AI-powered Bible stories tailored specifically to your child's age group.",
            icon: BookOpen,
            color: "bg-blue-500",
            lightColor: "bg-blue-50 border-blue-100",
            textColor: "text-blue-500",
            action: "/children/stories"
        },
        {
            title: "Memory Verse Games",
            description: "Fun, gamified ways to memorize scripture with rewards and badges.",
            icon: Star,
            color: "bg-amber-400",
            lightColor: "bg-amber-50 border-amber-100",
            textColor: "text-amber-500",
            action: "/children/memory"
        },
        {
            title: "Joyful Worship",
            description: "Action songs, instruments, and musical worship perfectly suited for kids.",
            icon: Music,
            color: "bg-purple-500",
            lightColor: "bg-purple-50 border-purple-100",
            textColor: "text-purple-500",
            action: "/children/worship"
        },
        {
            title: "Crafts & Creativity",
            description: "Generate DIY Bible craft ideas based on materials you already have at home!",
            icon: Sparkles,
            color: "bg-emerald-500",
            lightColor: "bg-emerald-50 border-emerald-100",
            textColor: "text-emerald-500",
            action: "/children/crafts"
        },
        {
            title: "Parent Dashboard",
            description: "Track spiritual milestones, manage safeguards, and find family devotionals.",
            icon: Shield,
            color: "bg-slate-700",
            lightColor: "bg-slate-50 border-slate-200",
            textColor: "text-slate-700",
            action: "/children/parents"
        }
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#FDFBF7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-4 bg-amber-100 rounded-full mb-6"
                    >
                        <Sparkles className="text-amber-500 w-8 h-8" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-light text-stone-800 mb-4"
                    >
                        Children's Sanctuary
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-stone-500 max-w-2xl mx-auto"
                    >
                        "Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these." <br />
                        <span className="text-sm italic font-medium">— Matthew 19:14</span>
                    </motion.p>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {modules.map((mod, index) => (
                        <motion.div
                            key={mod.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className={`rounded-3xl p-8 border hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${mod.lightColor}`}
                        >
                            <div className={`${mod.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                                <mod.icon className="text-white w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-medium text-stone-800 mb-3">{mod.title}</h3>
                            <p className="text-stone-600 mb-8 leading-relaxed">
                                {mod.description}
                            </p>

                            <Link href={mod.action} className="inline-flex items-center font-semibold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity">
                                <span className={mod.textColor}>Launch Experience</span>
                                <ChevronRight className={`ml-1 w-4 h-4 ${mod.textColor}`} />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 bg-sage-50 border border-sage-200 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between"
                >
                    <div className="mb-6 md:mb-0 md:mr-8 text-center md:text-left">
                        <h2 className="text-2xl font-light text-stone-800 mb-2">Age-Specific Spiritual Formation</h2>
                        <p className="text-stone-600">Our engine automatically adapts stories, vocabulary, and theology depth for Toddlers (0-3), Preschoolers (4-5), and Elementary (6-11) kids.</p>
                    </div>
                    <Link href="/children/parents" className="shrink-0 px-8 py-4 bg-sage-600 text-white rounded-full font-medium hover:bg-sage-700 transition-colors shadow-sm">
                        Configure Child Profiles
                    </Link>
                </motion.div>

            </div>
        </div>
    );
}
