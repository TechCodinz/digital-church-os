import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Branded "faith card" image generator.
 * Renders a shareable 1200x630 card (sanctuary aesthetic) for prayers, Will's
 * apologetics answers, devotionals, and verses — fuel for social sharing.
 *
 * Query params: kind, title, text, reference, author
 */

const THEMES: Record<string, { from: string; to: string; accent: string; glyph: string; kicker: string }> = {
    prayer: { from: '#0f172a', to: '#3b0764', accent: '#f0abfc', glyph: '🙏', kicker: 'A PRAYER FROM DIGITAL CHURCH OS' },
    apologist: { from: '#020617', to: '#0e7490', accent: '#67e8f9', glyph: '⚔️', kicker: 'WILL · AI APOLOGIST' },
    devotional: { from: '#1e1b4b', to: '#b45309', accent: '#fcd34d', glyph: '🌅', kicker: 'DAILY DEVOTIONAL' },
    verse: { from: '#052e16', to: '#065f46', accent: '#6ee7b7', glyph: '📖', kicker: 'HOLY SCRIPTURE' },
    default: { from: '#020617', to: '#064e3b', accent: '#6ee7b7', glyph: '🕊️', kicker: 'DIGITAL CHURCH OS' },
};

function clamp(s: string, n: number) {
    if (!s) return '';
    return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

export async function GET(req: NextRequest) {
    const p = req.nextUrl.searchParams;
    const kind = (p.get('kind') || 'default').toLowerCase();
    const t = THEMES[kind] || THEMES.default;
    const title = clamp(p.get('title') || 'A Word of Hope', 90);
    const text = clamp(p.get('text') || '', 260);
    const reference = clamp(p.get('reference') || '', 60);
    const author = clamp(p.get('author') || '', 48);

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '64px',
                    position: 'relative',
                    backgroundImage: `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`,
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Decorative accent glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-160px',
                        right: '-120px',
                        width: '460px',
                        height: '460px',
                        borderRadius: '9999px',
                        background: `${t.accent}22`,
                        display: 'flex',
                    }}
                />
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '72px',
                            height: '72px',
                            borderRadius: '20px',
                            background: 'rgba(255,255,255,0.10)',
                            border: `2px solid ${t.accent}55`,
                            fontSize: '38px',
                        }}
                    >
                        {t.glyph}
                    </div>
                    <div
                        style={{
                            fontSize: '22px',
                            letterSpacing: '4px',
                            fontWeight: 700,
                            color: t.accent,
                        }}
                    >
                        {t.kicker}
                    </div>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ fontSize: title.length > 48 ? '52px' : '64px', fontWeight: 800, lineHeight: 1.1 }}>
                        {title}
                    </div>
                    {text && (
                        <div style={{ fontSize: '32px', lineHeight: 1.4, color: 'rgba(255,255,255,0.88)' }}>
                            {text}
                        </div>
                    )}
                    {reference && (
                        <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700, color: t.accent }}>{`— ${reference}`}</div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '24px', color: 'rgba(255,255,255,0.65)' }}>
                    <div style={{ display: 'flex' }}>{author ? author : 'Digital Church OS'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '26px' }}>🕊️</span>
                        <span>digitalchurch.os</span>
                    </div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
