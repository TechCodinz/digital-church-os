'use client';

import { motion } from 'framer-motion';
import { Quote, Share2, Heart, MessageSquare, Instagram, Facebook, Twitter } from 'lucide-react';
import { useState } from 'react';

interface Testimony {
    id: string;
    content: string;
    user: {
        name: string;
        avatar: string;
    };
    scriptureRef?: string;
    likes: number;
}

export const TestimonyCard = ({ testimony }: { testimony: Testimony }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative group p-[2px] rounded-[32px] bg-gradient-to-br from-cream-200 via-stone-200 to-cream-200 transition-all duration-500 hover:shadow-2xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="bg-white rounded-[30px] p-8 h-full relative overflow-hidden">
                {/* Decorative Quote Icon */}
                <div className="absolute -top-4 -right-4 opacity-[0.03] transform rotate-12">
                    <Quote size={160} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <img
                            src={testimony.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimony.user.name}`}
                            className="w-12 h-12 rounded-2xl shadow-sm"
                            alt={testimony.user.name}
                        />
                        <div>
                            <p className="font-bold text-stone-800 text-sm">{testimony.user.name}</p>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Shared Testimony</p>
                        </div>
                    </div>

                    <p className="text-xl font-light text-stone-700 leading-relaxed mb-8 italic">
                        "{testimony.content}"
                    </p>

                    {testimony.scriptureRef && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-50 text-sage-600 rounded-full text-xs font-medium mb-8">
                            <Quote size={12} /> {testimony.scriptureRef}
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-stone-50 pt-6">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5 text-stone-400 font-bold text-[10px] uppercase tracking-wider">
                                <Heart size={14} className="text-rose-400" /> {testimony.likes}
                            </span>
                            <span className="flex items-center gap-1.5 text-stone-400 font-bold text-[10px] uppercase tracking-wider">
                                <MessageSquare size={14} className="text-blue-400" /> Community Cheers
                            </span>
                        </div>

                        <button className="p-3 bg-stone-50 text-stone-600 rounded-xl hover:bg-stone-800 hover:text-white transition-all shadow-sm">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Social Share Overlay on Hover */}
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 z-20 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center gap-4 rounded-[30px]"
                    >
                        <SocialBtn icon={Instagram} color="bg-pink-500" label="Instagram" />
                        <SocialBtn icon={Facebook} color="bg-blue-600" label="Facebook" />
                        <SocialBtn icon={Twitter} color="bg-stone-800" label="Twitter" />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const SocialBtn = ({ icon: Icon, color, label }: any) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`${color} text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all`}
        title={`Share to ${label}`}
    >
        <Icon size={24} />
    </motion.button>
);

const ChevronRight = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);
