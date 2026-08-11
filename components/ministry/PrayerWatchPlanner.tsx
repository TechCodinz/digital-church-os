'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock3, HeartHandshake, RotateCcw, Save, ShieldCheck } from 'lucide-react';

type WatchBlock = {
  id: string;
  time: string;
  theme: string;
  scripture: string;
  team: string;
  handoff: string;
  complete: boolean;
};

type WatchState = {
  title: string;
  purpose: string;
  blocks: WatchBlock[];
  updatedAt: string;
};

const defaultBlocks: WatchBlock[] = [
  { id: 'watch-1', time: '06:00', theme: 'Adoration & thanksgiving', scripture: '', team: '', handoff: '', complete: false },
  { id: 'watch-2', time: '12:00', theme: 'Church, families & community', scripture: '', team: '', handoff: '', complete: false },
  { id: 'watch-3', time: '18:00', theme: 'Mission, leaders & global concerns', scripture: '', team: '', handoff: '', complete: false },
];

const emptyState: WatchState = { title: '', purpose: '', blocks: defaultBlocks, updatedAt: '' };

export function PrayerWatchPlanner() {
  const [state, setState] = useState<WatchState>(emptyState);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('digital-church-os:prayer-watch');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<WatchState>;
      const saved: WatchState = { ...emptyState, ...parsed, blocks: Array.isArray(parsed.blocks) && parsed.blocks.length ? parsed.blocks : defaultBlocks };
      setState(saved);
      setSavedAt(saved.updatedAt || null);
    } catch {
      // Private browser recovery is best-effort.
    }
  }, []);

  const complete = useMemo(() => state.blocks.filter((block) => block.complete).length, [state.blocks]);

  function updateBlock(id: string, patch: Partial<WatchBlock>) {
    setState((current) => ({ ...current, blocks: current.blocks.map((block) => block.id === id ? { ...block, ...patch } : block) }));
  }

  function addBlock() {
    setState((current) => ({ ...current, blocks: [...current.blocks, { id: `watch-${Date.now()}`, time: '', theme: '', scripture: '', team: '', handoff: '', complete: false }] }));
  }

  function save() {
    const updatedAt = new Date().toISOString();
    const next = { ...state, updatedAt };
    window.localStorage.setItem('digital-church-os:prayer-watch', JSON.stringify(next));
    setState(next);
    setSavedAt(updatedAt);
  }

  function reset() {
    setState(emptyState);
    setSavedAt(null);
    window.localStorage.removeItem('digital-church-os:prayer-watch');
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Prayer watch planner</p><h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Build a sustainable watch with clear handoffs.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Plan time windows, Scripture references, approved themes, teams, and handoff notes. This planner does not create breaking-news prayer claims or expose private prayer requests.</p></div>
          <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"><Clock3 className="mr-2 inline h-4 w-4" /> {complete}/{state.blocks.length} periods complete</div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-stone-700">Watch title<input value={state.title} onChange={(e) => setState((current) => ({ ...current, title: e.target.value }))} placeholder="e.g. 24-hour church prayer watch" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label><label className="text-sm font-medium text-stone-700">Purpose<input value={state.purpose} onChange={(e) => setState((current) => ({ ...current, purpose: e.target.value }))} placeholder="What are we praying toward?" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label></div>

            <div className="mt-6 space-y-4">{state.blocks.map((block, index) => <article key={block.id} className={`rounded-2xl border p-4 ${block.complete ? 'border-sage-200 bg-sage-50' : 'border-stone-200 bg-white'}`}><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Watch {index + 1}</p><label className="flex items-center gap-2 text-xs font-semibold text-stone-600"><input type="checkbox" checked={block.complete} onChange={(e) => updateBlock(block.id, { complete: e.target.checked })} /> Complete</label></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-stone-600">Time<input type="time" value={block.time} onChange={(e) => updateBlock(block.id, { time: e.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label><label className="text-xs font-medium text-stone-600">Team / person<input value={block.team} onChange={(e) => updateBlock(block.id, { team: e.target.value })} placeholder="Assigned intercessor/team" className="mt-1 min-h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label></div><label className="mt-3 block text-xs font-medium text-stone-600">Prayer theme<input value={block.theme} onChange={(e) => updateBlock(block.id, { theme: e.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label><label className="mt-3 block text-xs font-medium text-stone-600">Scripture reference<input value={block.scripture} onChange={(e) => updateBlock(block.id, { scripture: e.target.value })} placeholder="Reference only unless licensed text is available" className="mt-1 min-h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label><label className="mt-3 block text-xs font-medium text-stone-600">Handoff note<textarea value={block.handoff} onChange={(e) => updateBlock(block.id, { handoff: e.target.value })} rows={2} placeholder="Short non-confidential summary for the next watch." className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3" /></label></article>)}</div>

            <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={addBlock} className="min-h-11 rounded-xl border border-sage-200 bg-sage-50 px-4 text-sm font-semibold text-sage-700">Add watch period</button><button type="button" onClick={save} className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white"><Save className="mr-2 h-4 w-4" /> Save watch</button><button type="button" onClick={reset} className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600"><RotateCcw className="mr-2 h-4 w-4" /> Reset</button></div><p className="mt-3 text-xs text-stone-500">{savedAt ? `Private browser plan saved ${new Date(savedAt).toLocaleString()}.` : 'Watch plan is private to this browser until deliberately shared.'}</p>
          </div>

          <div className="space-y-5"><div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl"><HeartHandshake className="h-6 w-6 text-sage-300" /><h3 className="mt-4 text-xl font-semibold">Healthy watch rhythm</h3><div className="mt-4 space-y-3 text-sm leading-6 text-stone-300"><p>Use realistic shifts and encourage rest rather than pressure-based participation.</p><p>Separate verified church prayer requests from general global concerns.</p><p>Keep confidential names, crises, medical details, and pastoral information out of shared handoff notes.</p></div><div className="mt-5 flex flex-wrap gap-2"><Link href="/prayer-room" className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-stone-900">Prayer Room</Link><Link href="/prayer-practice" className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white">Private practice</Link></div></div><div className="rounded-2xl border border-sage-200 bg-sage-50 p-5 text-sm leading-6 text-sage-900"><ShieldCheck className="mb-2 h-5 w-5" /> AI may help structure a prayer watch, but it must not invent current emergencies, persecution reports, prophetic urgency, or guaranteed outcomes.</div></div>
        </div>
      </div>
    </section>
  );
}
