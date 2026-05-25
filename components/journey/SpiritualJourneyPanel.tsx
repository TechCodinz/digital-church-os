'use client';

import { useEffect, useState } from 'react';
import { Footprints, Loader2, Sparkles } from 'lucide-react';

type JourneyPayload = {
  spiritualScore: number;
  metrics: Record<string, number>;
  timeline: Array<{ type: string; title: string; date: string; meta?: string }>;
};

export function SpiritualJourneyPanel() {
  const [payload, setPayload] = useState<JourneyPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch('/api/journey')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load journey.');
        if (mounted) setPayload(data);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="sanctuary-card flex items-center justify-center p-10 text-stone-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading spiritual journey...</div>;
  if (error) return <div className="sanctuary-card border-red-100 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  if (!payload) return null;

  return (
    <div className="space-y-6">
      <div className="sanctuary-card p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Footprints className="h-8 w-8 text-sage-600" />
            <div>
              <h2 className="text-2xl font-light text-stone-800">Spiritual Journey Timeline</h2>
              <p className="text-sm text-stone-500">A private view of prayer, giving, reflection, goals, family, and AI guidance activity.</p>
            </div>
          </div>
          <div className="rounded-3xl bg-sage-100 px-5 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Growth</p>
            <p className="text-3xl font-light text-sage-800">{payload.spiritualScore}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(payload.metrics).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-cream-200 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{key}</p>
              <p className="mt-2 text-2xl text-stone-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sanctuary-card p-6">
        <h3 className="mb-5 flex items-center gap-2 text-xl font-medium text-stone-800"><Sparkles className="h-5 w-5 text-sage-600" /> Recent Journey Moments</h3>
        <div className="space-y-3">
          {payload.timeline.length === 0 ? <p className="text-sm text-stone-500">No journey moments yet. Start with prayer, journaling, giving, or AI Pastor guidance.</p> : payload.timeline.map((item, index) => (
            <div key={`${item.type}-${item.title}-${index}`} className="rounded-2xl border border-cream-200 bg-white/70 p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div><p className="font-medium text-stone-800">{item.title}</p><p className="text-sm text-stone-500">{item.type} · {item.meta}</p></div>
                <span className="text-xs text-stone-400">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
