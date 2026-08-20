'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

/**
 * Global decorative atmosphere for the Living Sanctuary experience.
 * It never captures interaction, uses deterministic particles to avoid
 * hydration churn, and respects the app-wide reduced-motion rules.
 */
export function AmbientBackground() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const particles = useMemo(
        () =>
            Array.from({ length: 24 }).map((_, i) => ({
                left: (i * 47 + 9) % 100,
                top: (i * 31 + 11) % 100,
                delay: (i % 10) * 0.65,
                duration: 10 + (i % 7) * 1.8,
                size: 2 + (i % 4),
                opacity: 0.28 + (i % 5) * 0.1,
            })),
        []
    );

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';

    const palette = isLight
        ? {
              orbA: 'rgba(120, 155, 100, 0.24)',
              orbB: 'rgba(210, 180, 140, 0.22)',
              orbC: 'rgba(160, 190, 170, 0.20)',
              particle: 'rgba(120, 155, 100, 0.44)',
              halo: 'rgba(210, 180, 140, 0.12)',
          }
        : activeTheme === 'dark'
        ? {
              orbA: 'rgba(99, 102, 241, 0.20)',
              orbB: 'rgba(56, 189, 248, 0.16)',
              orbC: 'rgba(139, 92, 246, 0.18)',
              particle: 'rgba(199, 210, 254, 0.58)',
              halo: 'rgba(129, 140, 248, 0.10)',
          }
        : {
              orbA: 'rgba(16, 185, 129, 0.22)',
              orbB: 'rgba(45, 212, 191, 0.18)',
              orbC: 'rgba(245, 201, 120, 0.12)',
              particle: 'rgba(167, 243, 208, 0.62)',
              halo: 'rgba(245, 201, 120, 0.10)',
          };

    return (
        <div className="ambient-root" aria-hidden="true">
            <div
                className="absolute inset-0 opacity-[0.34]"
                style={{
                    backgroundImage: "url('/sanctuary-pattern.svg')",
                    backgroundSize: '180px 180px',
                    maskImage: 'radial-gradient(ellipse at 50% 28%, black 0%, transparent 76%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at 50% 28%, black 0%, transparent 76%)',
                }}
            />

            <div
                className="absolute -top-[20vh] left-1/2 h-[58vh] w-[28vw] min-w-[260px] -translate-x-1/2 blur-3xl"
                style={{
                    background: `linear-gradient(180deg, ${palette.halo}, transparent)`,
                    clipPath: 'polygon(43% 0, 57% 0, 88% 100%, 12% 100%)',
                }}
            />

            <div
                className="ambient-orb ambient-orb--a"
                style={{ top: '-10%', left: '-8%', width: '44vw', height: '44vw', background: palette.orbA }}
            />
            <div
                className="ambient-orb ambient-orb--b"
                style={{ top: '18%', right: '-12%', width: '42vw', height: '42vw', background: palette.orbB }}
            />
            <div
                className="ambient-orb ambient-orb--c"
                style={{ bottom: '-14%', left: '20%', width: '40vw', height: '40vw', background: palette.orbC }}
            />

            {particles.map((p, i) => (
                <span
                    key={i}
                    className="ambient-particle"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: p.size,
                        height: p.size,
                        opacity: p.opacity,
                        background: palette.particle,
                        animationDelay: `${p.delay}s, ${p.delay}s`,
                        animationDuration: `${p.duration}s, ${p.duration * 0.62}s`,
                    }}
                />
            ))}
        </div>
    );
}
