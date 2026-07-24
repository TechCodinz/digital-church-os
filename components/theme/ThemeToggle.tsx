'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = theme === 'dark';

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle Light/Dark Theme"
            className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                isDark
                    ? 'bg-slate-900 border-slate-800 text-amber-400 hover:border-amber-500/50'
                    : 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200/80'
            }`}
        >
            {isDark ? (
                <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Light Mode</span>
                </>
            ) : (
                <>
                    <Moon className="w-4 h-4 text-amber-800" />
                    <span className="hidden sm:inline">Dark Mode</span>
                </>
            )}
        </motion.button>
    );
}
