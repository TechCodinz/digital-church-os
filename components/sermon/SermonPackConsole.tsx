'use client';

import { useState } from 'react';
import { Boxes, Loader2, Sparkles } from 'lucide-react';

type Pack = Record<string, any>;

export function SermonPackConsole() {
  const [theme, setTheme] = useState('Faith under pressure');
  const [refs, setRefs] = useState('Matthew 11:28, Psalm 34:18');
  const [pack, setPack] = useState<Pack | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError('');
    setPack(null);

    try {
      const res = await fetch('/api/ministry/sermon-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, scriptureRefs: refs.split(',').map((ref) => ref.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate content pack.');
      setPack(data.pack);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sanctuary-card p-8 shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Boxes className="h-7 w-7 text-sage-600" />
        <div>
          <h2 className="text-2xl font-light text-stone-800">Sermon-to-Everything Engine</h2>
          <p className="text-sm text-stone-500">Turn one message into a full ministry content ecosystem.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <input className="soft-input" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Theme" />
        <input className="soft-input" value={refs} onChange={(e) => setRefs(e.target.value)} placeholder="Scripture refs" />
        <button onClick={generate} disabled={loading || theme.trim().length < 3} className="prayer-button inline-flex items-center justify-center disabled:opacity-60">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate Pack
        </button>
      </div>
      {error && <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {pack && (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {Object.entries(pack).filter(([key]) => !['theme', 'scriptureRefs'].includes(key)).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-cream-200 bg-white/70 p-5">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-sage-600">{key.replace(/([A-Z])/g, ' $1')}</p>
              {Array.isArray(value) ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-stone-600">
                  {value.slice(0, 6).map((item: any, index: number) => <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-stone-600">{String(value)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
