'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Heart, Home, Radio, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

export const MobileBottomNav = () => {
    const pathname = usePathname();
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Word', href: '/scripture/immersion', icon: BookOpen },
        { name: 'Pray', href: '/prayer-room', icon: Heart, primary: true },
        { name: 'Worship', href: '/live-service', icon: Radio },
        { name: 'Me', href: '/profile', icon: User },
    ];

    return (
        <nav
            aria-label="Primary mobile navigation"
            className={`fixed bottom-0 left-0 right-0 md:hidden z-50 border-t pb-safe transition-colors duration-300 ${
                isLight
                    ? 'bg-[#fbf8f3]/94 border-stone-200/80 text-stone-900 shadow-[0_-12px_40px_rgba(60,45,30,.08)] backdrop-blur-2xl'
                    : 'bg-[#04100e]/94 border-white/8 text-white shadow-[0_-16px_50px_rgba(0,0,0,.35)] backdrop-blur-2xl'
            }`}
        >
            <div className="mx-auto flex h-[70px] max-w-lg items-end justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                    if (item.primary) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                className="sacred-focus-ring -mt-6 flex min-w-[64px] flex-col items-center justify-end gap-1 pb-2"
                            >
                                <span
                                    className={cn(
                                        'flex h-14 w-14 items-center justify-center rounded-full border shadow-2xl transition-all',
                                        isActive
                                            ? 'border-amber-200/70 bg-gradient-to-br from-amber-200 to-amber-300 text-slate-950 shadow-amber-300/25'
                                            : isLight
                                            ? 'border-sage-200 bg-white text-sage-700 shadow-stone-300/25'
                                            : 'border-amber-300/25 bg-[#0a1c18] text-amber-300 shadow-black/40'
                                    )}
                                >
                                    <Icon size={21} className={cn('transition-transform', isActive && 'scale-110')} />
                                </span>
                                <span className={cn('text-[9px] font-bold tracking-wide', isActive ? isLight ? 'text-sage-700' : 'text-amber-300' : isLight ? 'text-stone-500' : 'text-slate-500')}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'sacred-focus-ring flex h-full min-w-[54px] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 text-[9px] font-semibold tracking-wide transition-all',
                                isActive
                                    ? isLight
                                        ? 'text-sage-700'
                                        : 'text-emerald-300'
                                    : isLight
                                    ? 'text-stone-500 hover:text-stone-900'
                                    : 'text-slate-500 hover:text-white'
                            )}
                        >
                            <span className={cn('relative flex h-7 w-10 items-center justify-center rounded-full transition-all', isActive && (isLight ? 'bg-sage-100' : 'bg-emerald-300/10'))}>
                                <Icon size={18} className={cn('transition-transform', isActive && 'scale-105')} />
                                {isActive && <span className={cn('absolute -bottom-1 h-1 w-1 rounded-full', isLight ? 'bg-sage-600' : 'bg-emerald-300')} />}
                            </span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
