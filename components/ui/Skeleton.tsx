'use client';

import React from 'react';

/**
 * Skeleton
 * --------
 * A shared shimmer loading primitive for a premium, "living" loading state.
 * Use in place of bare spinners while intelligent content is being composed.
 */
export function Skeleton({
    className = '',
    style,
}: {
    className?: string;
    style?: React.CSSProperties;
}) {
    return <div className={`skeleton-shimmer ${className}`} style={style} aria-hidden="true" />;
}

/**
 * A ready-made "AI is thinking" block: a labeled shimmer stack that communicates
 * the system is composing a response. Great for AI chat / generation surfaces.
 */
export function ThinkingSkeleton({ label = 'Composing a Spirit-led response…' }: { label?: string }) {
    return (
        <div className="w-full space-y-3 animate-fade-in" role="status" aria-live="polite">
            <div className="flex items-center gap-2 text-sm text-emerald-500">
                <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-pulse" style={{ animationDelay: '0.4s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-pulse" style={{ animationDelay: '0.8s' }} />
                </span>
                <span>{label}</span>
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-24 w-full" />
        </div>
    );
}
