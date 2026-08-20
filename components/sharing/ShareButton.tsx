'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export type ShareKind = 'prayer' | 'apologist' | 'devotional' | 'verse' | 'default';

interface ShareButtonProps {
    kind?: ShareKind;
    title: string;
    text?: string;
    reference?: string;
    author?: string;
    label?: string;
    compact?: boolean;
    className?: string;
}

/**
 * ShareButton
 * -----------
 * Generates a branded "faith card" image (/api/share/card) and shares it via the
 * native share sheet where available, otherwise copies the card link and opens
 * the image. Turns any prayer, apologetics answer, devotional, or verse into a
 * shareable, viral-ready graphic.
 */
export function ShareButton({
    kind = 'default',
    title,
    text,
    reference,
    author,
    label = 'Share',
    compact = false,
    className = '',
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const buildUrl = () => {
        const params = new URLSearchParams();
        params.set('kind', kind);
        params.set('title', title || 'A Word of Hope');
        if (text) params.set('text', text);
        if (reference) params.set('reference', reference);
        if (author) params.set('author', author);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/api/share/card?${params.toString()}`;
    };

    const onShare = async () => {
        const url = buildUrl();
        const shareText = `${text || title}${reference ? ` — ${reference}` : ''}`;
        const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;

        if (nav?.share) {
            try {
                await nav.share({ title: title || 'Digital Church OS', text: shareText, url });
                return;
            } catch {
                /* user cancelled or share failed — fall through to copy */
            }
        }

        try {
            await nav?.clipboard?.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
        if (typeof window !== 'undefined') window.open(url, '_blank');
    };

    return (
        <button
            onClick={onShare}
            title="Share as a faith card"
            className={
                className ||
                `inline-flex items-center gap-1.5 ${
                    compact ? 'text-xs' : 'text-sm'
                } font-medium text-stone-400 hover:text-sky-500 transition-colors`
            }
        >
            {copied ? <Check size={compact ? 14 : 16} /> : <Share2 size={compact ? 14 : 16} />}
            {!compact && <span>{copied ? 'Link copied!' : label}</span>}
        </button>
    );
}
