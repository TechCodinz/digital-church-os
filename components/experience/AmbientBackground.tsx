'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

/**
 * AmbientBackground
 * -----------------
 * A global, GPU-friendly "living" backdrop mounted behind every page. It renders
 * slowly drifting aurora orbs, a faint sanctuary pattern, and gently twinkling
 * light particles that adapt to the active sanctuary theme. Purely decorative and
 * non-interactive (pointer-events: none), and it fully respects the shared
 * prefers-reduced-motion rules defined in globals.css.
 */
export function AmbientBackground() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Deterministic particle field (stable across renders to avoid hydration churn).
    const particles = useMemo(
        () =>
            Array.from({ length: 18 }).map((_, i) => ({
                left: (i * 53) % 100,
                top: (i * 29 + 7) % 100,
                delay: (i % 9) * 0.7,
                duration: 9 + (i % 6) * 2,
                size: 3 + (i % 4),
            })),
        []
    );

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';

    const palette = isLight
        ? {
              orbA: 'rgba(120, 155, 100, 0.30)', // sage
              orbB: 'rgba(210, 180, 140, 0.28)', // warm gold
              orbC: 'rgba(160, 190, 170, 0.24)',
              particle: 'rgba(120, 155, 100, 0.55)',
          }
        : activeTheme === 'dark'
        ? {
              orbA: 'rgba(99, 102, 241, 0.28)', // indigo
              orbB: 'rgba(56, 189, 248, 0.22)', // sky
              orbC: 'rgba(139, 92, 246, 0.24)', // violet
              particle: 'rgba(199, 210, 254, 0.8)',
          }
        : {
              orbA: 'rgba(16, 185, 129, 0.30)', // emerald
              orbB: 'rgba(45, 212, 191, 0.24)', // teal
              orbC: 'rgba(52, 211, 153, 0.22)',
              particle: 'rgba(167, 243, 208, 0.85)',
          };

    return (
        <div className="ambient-root" aria-hidden="true">
            {/* Faint sanctuary pattern wash */}
            <div
                className="absolute inset-0 opacity-[0.5]"
                style={{
                    backgroundImage: "url('/sanctuary-pattern.svg')",
                    backgroundSize: '160px 160px',
                    maskImage: 'radial-gradient(ellipse at 50% 30%, black 0%, transparent 75%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 0%, transparent 75%)',
                }}
            />

            {/* Drifting aurora orbs */}
            <div
                className="ambient-orb ambient-orb--a"
                style={{ top: '-8%', left: '-6%', width: '46vw', height: '46vw', background: palette.orbA }}
            />
            <div
                className="ambient-orb ambient-orb--b"
                style={{ top: '20%', right: '-10%', width: '40vw', height: '40vw', background: palette.orbB }}
            />
            <div
                className="ambient-orb ambient-orb--c"
                style={{ bottom: '-12%', left: '25%', width: '38vw', height: '38vw', background: palette.orbC }}
            />

            {/* Twinkling light particles */}
            {particles.map((p, i) => (
                <span
                    key={i}
                    className="ambient-particle"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: p.size,
                        height: p.size,
                        background: palette.particle,
                        animationDelay: `${p.delay}s, ${p.delay}s`,
                        animationDuration: `${p.duration}s, ${p.duration * 0.6}s`,
                    }}
                />
            ))}
        </div>
    );
}
