'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type SanctuaryTheme = 'emerald' | 'light' | 'dark';

interface ThemeContextType {
    theme: SanctuaryTheme;
    setTheme: (theme: SanctuaryTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'emerald',
    setTheme: () => {}
});

export function SanctuaryThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<SanctuaryTheme>('emerald');

    useEffect(() => {
        const savedTheme = localStorage.getItem('dc_os_sanctuary_theme') as SanctuaryTheme;
        if (savedTheme === 'emerald' || savedTheme === 'light' || savedTheme === 'dark') {
            applyTheme(savedTheme);
        } else {
            applyTheme('emerald');
        }
    }, []);

    const applyTheme = (newTheme: SanctuaryTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('dc_os_sanctuary_theme', newTheme);
        
        document.documentElement.classList.remove('theme-emerald', 'theme-light', 'theme-dark', 'light', 'dark');
        document.documentElement.classList.add(`theme-${newTheme}`);
        
        if (newTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.add('dark');
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useSanctuaryTheme() {
    return useContext(ThemeContext);
}
