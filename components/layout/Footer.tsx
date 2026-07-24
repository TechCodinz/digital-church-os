'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Heart, Shield } from 'lucide-react';

export const Footer = () => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted ? theme === 'dark' : true;

    const links = [
        {
            label: 'Ministry & Altar',
            items: [
                { href: '/family/devotional', label: 'Family Altar' },
                { href: '/spiritual/fasting', label: 'Fasting Companion' },
                { href: '/spiritual/dreams', label: 'Dream Discernment' },
                { href: '/prayer-watch', label: '24/7 Prayer Watch' },
            ],
        },
        {
            label: 'Giving & Aid',
            items: [
                { href: '/offering', label: 'Give Tithe & Offering' },
                { href: '/transparency', label: 'Transparency Ledger' },
                { href: '/aid-request/emergency', label: 'Emergency Aid Request' },
            ],
        },
        {
            label: 'Growth & Worship',
            items: [
                { href: '/children/sunday-school', label: "Sunday School & Kids" },
                { href: '/profile/growth-dna', label: 'Spiritual Growth DNA' },
                { href: '/choir/studio', label: 'Choir Composition Studio' },
                { href: '/minister/onboard', label: 'Evangelical Minister Hub' },
            ],
        },
    ];

    return (
        <footer className={`pt-16 pb-20 md:pb-8 transition-colors duration-300 border-t ${
            isDark
                ? 'bg-slate-950 border-slate-800 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center text-amber-500 font-bold">
                                ✝
                            </div>
                            <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Digital Church OS
                            </span>
                        </div>
                        <p className="text-xs leading-relaxed">
                            A sanctuary for digital worship, global community, and spiritual growth — available 24/7, from anywhere in the world.
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500 font-bold">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Secure · Private · Scripture-Grounded</span>
                        </div>
                    </div>

                    {/* Link Groups */}
                    {links.map((group) => (
                        <div key={group.label}>
                            <p className={`font-mono text-xs uppercase font-bold tracking-widest mb-4 ${
                                isDark ? 'text-amber-400' : 'text-amber-700'
                            }`}>
                                {group.label}
                            </p>
                            <ul className="space-y-2 text-xs">
                                {group.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`transition-colors ${
                                                isDark ? 'hover:text-amber-400' : 'hover:text-amber-700'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className={`pt-8 border-t text-center text-xs ${
                    isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
                }`}>
                    <p>© {currentYear} Digital Church OS. Operating System for the Global Church.</p>
                </div>
            </div>
        </footer>
    );
};
