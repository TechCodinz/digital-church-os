'use client';

import { useEffect, useState } from 'react';
import { Brain, Loader2, TrendingUp } from 'lucide-react';

type ReportPayload = {
  report?: {
    healthScore: number;
    urgentPriorities: string[];
    recommendedActions: string[];
    sermonSuggestions: string[];
    outreachIdeas: string[];
    careTeamFocus: string[];
    signals: Array<{ label: string; value: number; trend: string; insight: string }>;
  };
  metrics?: Record<string, number>;
  scope?: string;
};

export function RaizionIntelligencePanel() {
  const [payload, setPayload] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch('/api/ministry/intelligence')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load ministry intelligence.');
        if (mounted) setPayload(data);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="sanctuary-card flex items-center justify-center p-10 text-stone-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Raizion Intelligence...</div>;
  }

  if (error) {
    return <div className="sanctuary-card border-red-100 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  const report = payload?.report;
  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="sanctuary-card p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-sage-600" />
            <div>
              <h2 className="text-2xl font-light text-stone-800">Raizion Ministry Intelligence</h2>
              <p className="text-sm text-stone-500">Scope: {payload?.scope || 'ministry'}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-sage-100 px-5 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Health</p>
            <p className="text-3xl font-light text-sage-800">{report.healthScore}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(payload?.metrics || {}).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-cream-200 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{key}</p>
              <p className="mt-2 text-2xl text-stone-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          ['Urgent priorities', report.urgentPriorities],
          ['Recommended actions', report.recommendedActions],
          ['Sermon suggestions', report.sermonSuggestions],
          ['Outreach ideas', report.outreachIdeas],
          ['Care team focus', report.careTeamFocus],
        ].map(([title, items]) => (
          <div key={title as string} className="sanctuary-card p-6">
            <h3 className="mb-4 text-xl font-medium text-stone-800">{title as string}</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-stone-600">
              {(items as string[]).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
        <div className="sanctuary-card p-6">
          <h3 className="mb-4 text-xl font-medium text-stone-800">Signals</h3>
          <div className="space-y-3">
            {report.signals.map((signal) => (
              <div key={signal.label} className="rounded-2xl border border-cream-200 bg-white/70 p-4">
                <div className="flex items-center justify-between"><p className="font-medium text-stone-800">{signal.label}</p><span className="inline-flex items-center text-sm text-sage-700"><TrendingUp className="mr-1 h-4 w-4" />{signal.value}</span></div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{signal.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
