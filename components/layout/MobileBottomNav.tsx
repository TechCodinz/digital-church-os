'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BookOpen, Heart, Home, Radio, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthRuntime } from '@/app/providers';

export const MobileBottomNav = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { configured } = useAuthRuntime();

    const homeHref = configured && session ? '/dashboard' : '/';
    const navItems = [
        { name: 'Home', href: homeHref, icon: Home },
        { name: 'Word', href: '/scripture', icon: BookOpen },
        { name: 'Pray', href: '/prayer-room', icon: Heart, primary: true },
        { name: 'Worship', href: '/live-service', icon: Radio },
        { name: 'Me', href: '/profile', icon: User },
    ];

    const isRouteActive = (href: string) => {
        if (href === '/' && pathname === '/') return true;
        if (href === '/dashboard' && pathname === '/') return true;
        return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
    };

    return (
        <nav aria-label="Primary mobile sanctuary navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 text-white md:hidden pb-safe">
            <div className="mx-auto flex h-[70px] max-w-xl items-end justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isRouteActive(item.href);

                    if (item.primary) {
                        return (
                            <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined} className="sacred-focus-ring -mt-6 flex min-w-[64px] flex-col items-center justify-end gap-1 pb-2">
                                <span className={cn('flex h-14 w-14 items-center justify-center rounded-full border shadow-2xl transition-all', isActive ? 'border-amber-200/70 bg-gradient-to-br from-amber-200 to-amber-300 text-slate-950 shadow-amber-300/25' : 'border-amber-300/25 bg-[#0a1c18] text-amber-300 shadow-black/40')}>
                                    <Icon size={21} className={cn('transition-transform', isActive && 'scale-110')} />
                                </span>
                                <span className={cn('text-[9px] font-bold tracking-wide', isActive ? 'text-amber-300' : 'text-slate-500')}>{item.name}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link key={`${item.name}-${item.href}`} href={item.href} aria-current={isActive ? 'page' : undefined} className={cn('sacred-focus-ring flex h-full min-w-[54px] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 text-[9px] font-semibold tracking-wide transition-all', isActive ? 'text-emerald-300' : 'text-slate-400 hover:text-white')}>
                            <span className={cn('relative flex h-7 w-10 items-center justify-center rounded-full transition-all', isActive && 'bg-emerald-300/10')}>
                                <Icon size={18} className={cn('transition-transform', isActive && 'scale-105')} />
                                {isActive && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-emerald-300" />}
                            </span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
