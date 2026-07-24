'use client';

import { useSanctuaryTheme, SanctuaryTheme } from './ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Moon, ChevronDown, Check, Scroll } from 'lucide-react';

export function ThemeToggle() {
    const { theme, setTheme } = useSanctuaryTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const themes: { id: SanctuaryTheme; name: string; icon: any; color: string; desc: string }[] = [
        {
            id: 'light',
            name: 'Sacred Sanctuary Linen',
            icon: Scroll,
            color: 'text-sage-700 bg-cream-100 border-cream-300',
            desc: 'Original warm cream paper texture, sage green & stone',
        },
        {
            id: 'emerald',
            name: 'Holy Spirit Emerald',
            icon: Sparkles,
            color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
            desc: 'Living green, Holy Spirit peace & emerald aura',
        },
        {
            id: 'dark',
            name: 'Midnight Celestial',
            icon: Moon,
            color: 'text-indigo-400 bg-slate-800 border-slate-700',
            desc: 'Deep obsidian night prayer watch',
        },
    ];

    const current = themes.find(t => t.id === theme) || themes[0];
    const CurrentIcon = current.icon;

    return (
        <div className="relative" ref={ref}>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(!open)}
                className={`px-3 py-2 rounded-xl border transition-all flex items-center space-x-2 text-xs font-bold ${
                    theme === 'light'
                        ? 'bg-cream-100/90 border-sage-300 text-stone-800 hover:bg-cream-200/90 shadow-sm'
                        : theme === 'emerald'
                        ? 'bg-slate-900 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-amber-400 hover:border-amber-500/50'
                }`}
            >
                <CurrentIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{current.name}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className={`absolute right-0 mt-2 w-68 rounded-2xl border p-2 shadow-2xl z-50 text-xs ${
                            theme === 'light' ? 'bg-cream-50 border-cream-300 text-stone-800' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                    >
                        <div className={`px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider border-b mb-1 ${
                            theme === 'light' ? 'text-sage-700 border-cream-200' : 'text-emerald-400 border-slate-800'
                        }`}>
                            Sanctuary Theme Presets
                        </div>

                        <div className="space-y-1">
                            {themes.map((t) => {
                                const Icon = t.icon;
                                const isSelected = theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setTheme(t.id);
                                            setOpen(false);
                                        }}
                                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start space-x-3 ${
                                            isSelected
                                                ? t.id === 'light'
                                                    ? 'bg-cream-100 border-sage-400 text-stone-900 font-bold shadow-sm'
                                                    : t.id === 'emerald'
                                                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                                                    : 'bg-slate-800 border-slate-700 text-white font-bold'
                                                : 'border-transparent hover:bg-cream-200/50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg shrink-0 ${t.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-grow space-y-0.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold">{t.name}</span>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-sage-600 dark:text-emerald-400" />}
                                            </div>
                                            <p className={`text-[10px] leading-tight ${
                                                theme === 'light' ? 'text-stone-500' : 'text-slate-400'
                                            }`}>{t.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
