'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Clock3, HeartHandshake, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

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
const localPrefix = 'digital-church-prayer-watch:v2';

function normalizeBlocks(value: unknown): WatchBlock[] {
  if (!Array.isArray(value)) return defaultBlocks;
  const blocks = value.slice(0, 48).map((item, index) => {
    const data = item && typeof item === 'object' ? item as Partial<WatchBlock> : {};
    return {
      id: typeof data.id === 'string' && data.id ? data.id : `watch-${index + 1}`,
      time: typeof data.time === 'string' ? data.time : '',
      theme: typeof data.theme === 'string' ? data.theme : '',
      scripture: typeof data.scripture === 'string' ? data.scripture : '',
      team: typeof data.team === 'string' ? data.team : '',
      handoff: typeof data.handoff === 'string' ? data.handoff : '',
      complete: data.complete === true,
    };
  });
  return blocks.length ? blocks : defaultBlocks;
}

function normalizeWatch(value: unknown): WatchState {
  const data = value && typeof value === 'object' ? value as Partial<WatchState> : {};
  return {
    title: typeof data.title === 'string' ? data.title : '',
    purpose: typeof data.purpose === 'string' ? data.purpose : '',
    blocks: normalizeBlocks(data.blocks),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
  };
}

export function PrayerWatchPlanner() {
  const [state, setState] = useState<WatchState>(emptyState);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Loading church prayer watch…');

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId);
    setSyncing(true);
    setSyncMessage(churchId ? 'Loading active church prayer watch…' : 'Waiting for an active church workspace…');
    try {
      const result = await loadChurchOperationalRecord({
        churchId,
        module: 'prayer-watch',
        recordKey: 'current',
        localStoragePrefix: localPrefix,
        defaultValue: emptyState,
        normalize: normalizeWatch,
      });
      setState(result.value);
      setSyncMessage(result.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // Workspace selection is the explicit reload boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = useMemo(() => state.blocks.filter((block) => block.complete).length, [state.blocks]);

  function updateBlock(id: string, patch: Partial<WatchBlock>) {
    setState((current) => ({ ...current, blocks: current.blocks.map((block) => block.id === id ? { ...block, ...patch } : block) }));
  }

  function addBlock() {
    setState((current) => ({
      ...current,
      blocks: current.blocks.length >= 48
        ? current.blocks
        : [...current.blocks, { id: `watch-${Date.now()}`, time: '', theme: '', scripture: '', team: '', handoff: '', complete: false }],
    }));
  }

  async function persist(next: WatchState, message: string) {
    setSyncing(true);
    setSyncMessage(message);
    try {
      const result = await saveChurchOperationalRecord({
        churchId: activeChurchId,
        module: 'prayer-watch',
        recordKey: 'current',
        title: 'Church prayer watch plan',
        classification: 'INTERNAL',
        localStoragePrefix: localPrefix,
        value: next,
      });
      setState(next);
      setSyncMessage(result.message);
    } finally {
      setSyncing(false);
    }
  }

  async function save() {
    await persist({ ...state, updatedAt: new Date().toISOString() }, 'Saving prayer watch…');
  }

  async function reset() {
    await persist({ ...emptyState, updatedAt: new Date().toISOString() }, 'Resetting prayer watch…');
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Prayer watch planner</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Build a sustainable church watch with clear handoffs.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Plan time windows, Scripture references, approved themes, teams, and non-confidential handoff notes for the selected church. Personal prayer remains available in Prayer Practice and the Prayer Room.</p>
          </div>
          <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"><Clock3 className="mr-2 inline h-4 w-4" /> {complete}/{state.blocks.length} periods complete</div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
          <span>{syncing ? 'Syncing…' : syncMessage}</span>
          <span>{activeChurchId ? 'Active church workspace' : 'No active church selected'}</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">Watch title<input value={state.title} onChange={(e) => setState((current) => ({ ...current, title: e.target.value }))} maxLength={160} placeholder="e.g. 24-hour church prayer watch" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Purpose<input value={state.purpose} onChange={(e) => setState((current) => ({ ...current, purpose: e.target.value }))} maxLength={300} placeholder="What is this church watch praying toward?" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label>
            </div>

            <div className="mt-6 space-y-4">{state.blocks.map((block, index) => <article key={block.id} className={`rounded-2xl border p-4 ${block.complete ? 'border-sage-200 bg-sage-50' : 'border-stone-200 bg-white'}`}><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Watch {index + 1}</p><label className="flex items-center gap-2 text-xs font-semibold text-stone-600"><input type="checkbox" checked={block.complete} onChange={(e) => updateBlock(block.id, { complete: e.target.checked })} /> Complete</label></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-stone-600">Time<input type="time" value={block.time} onChange={(e) => updateBlock(block.id, { time: e.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label><label className="text-xs font-medium text-stone-600">Team / person<input value={block.team} onChange={(e) => updateBlock(block.id, { team: e.target.value })} maxLength={160} placeholder="Assigned intercessor/team" className="mt-1 min-h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label></div><label className="mt-3 block text-xs font-medium text-stone-600">Prayer theme<input value={block.theme} onChange={(e) => updateBlock(block.id, { theme: e.target.value })} maxLength={300} className="mt-1 min-h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label><label className="mt-3 block text-xs font-medium text-stone-600">Scripture reference<input value={block.scripture} onChange={(e) => updateBlock(block.id, { scripture: e.target.value })} maxLength={160} placeholder="Reference only unless licensed text is available" className="mt-1 min-h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label><label className="mt-3 block text-xs font-medium text-stone-600">Handoff note<textarea value={block.handoff} onChange={(e) => updateBlock(block.id, { handoff: e.target.value })} rows={2} maxLength={500} placeholder="Short non-confidential summary for the next watch." className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3" /></label></article>)}</div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={addBlock} disabled={state.blocks.length >= 48} className="min-h-11 rounded-xl border border-sage-200 bg-sage-50 px-4 text-sm font-semibold text-sage-700 disabled:opacity-50">Add watch period</button>
              <button type="button" onClick={() => void save()} disabled={syncing || !activeChurchId} className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Save className="mr-2 h-4 w-4" /> Save watch</button>
              <button type="button" onClick={() => void reset()} disabled={syncing || !activeChurchId} className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600 disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw className="mr-2 h-4 w-4" /> Reset shared watch</button>
            </div>
            <p className="mt-3 text-xs text-stone-500">Old unscoped browser watches are deliberately not auto-imported into a church workspace.</p>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl"><HeartHandshake className="h-6 w-6 text-sage-300" /><h3 className="mt-4 text-xl font-semibold">Healthy watch rhythm</h3><div className="mt-4 space-y-3 text-sm leading-6 text-stone-300"><p>Use realistic shifts and encourage rest rather than pressure-based participation.</p><p>Separate verified church prayer requests from general global concerns.</p><p>Keep confidential names, crises, medical details, abuse/safeguarding information, and pastoral narratives out of shared handoff notes.</p></div><div className="mt-5 flex flex-wrap gap-2"><Link href="/prayer-room" className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-stone-900">Prayer Room</Link><Link href="/prayer-practice" className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white">Private practice</Link></div></div>
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5 text-sm leading-6 text-sage-900"><ShieldCheck className="mb-2 h-5 w-5" /> AI may help structure a prayer watch, but it must not invent current emergencies, persecution reports, prophetic urgency, private revelation, or guaranteed outcomes.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
