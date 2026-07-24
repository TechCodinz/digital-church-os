'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Home, Heart, Users, User, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
    const pathname = usePathname();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted ? theme === 'dark' : true;

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Pray', href: '/prayer-room', icon: Heart },
        { name: 'Give', href: '/offering', icon: DollarSign },
        { name: 'Community', href: '/community-wall', icon: Users },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <nav className={`fixed bottom-0 left-0 right-0 md:hidden z-50 transition-colors duration-300 border-t pb-safe ${
            isDark
                ? 'bg-slate-950/95 backdrop-blur-xl border-slate-800 text-white shadow-2xl'
                : 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900 shadow-lg'
        }`}>
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all",
                                isActive
                                    ? isDark ? "text-amber-400 font-bold" : "text-amber-700 font-bold"
                                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <Icon size={18} className={cn("transition-transform", isActive && "scale-110")} />
                            <span className="text-[10px] tracking-tight">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
