'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copyright,
  Mic2,
  Music2,
  Plus,
  Radio,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UsersRound,
} from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type RightsPosture = 'original' | 'public-domain' | 'licensed' | 'provider-cleared';
type SegmentKind = 'welcome' | 'praise' | 'worship' | 'scripture' | 'prayer' | 'response' | 'sending';
type WorshipSegment = { id: string; kind: SegmentKind; title: string; reference: string; key: string; minutes: number; rights: RightsPosture; leader: string; notes: string };
type WorshipPlanState = { serviceName: string; theme: string; scriptureAnchor: string; segments: WorshipSegment[] };

const segmentOptions: Array<{ id: SegmentKind; label: string }> = [
  { id: 'welcome', label: 'Welcome / call to worship' }, { id: 'praise', label: 'Praise' }, { id: 'worship', label: 'Worship / adoration' }, { id: 'scripture', label: 'Scripture reading' }, { id: 'prayer', label: 'Prayer / intercession' }, { id: 'response', label: 'Response / ministry' }, { id: 'sending', label: 'Sending / benediction' },
];

const defaultSegments: WorshipSegment[] = [
  { id: 'welcome', kind: 'welcome', title: 'Call to worship', reference: '', key: '', minutes: 3, rights: 'original', leader: '', notes: 'Welcome, Scripture call, service direction.' },
  { id: 'praise', kind: 'praise', title: 'Praise movement', reference: '', key: 'G', minutes: 12, rights: 'licensed', leader: '', notes: 'Begin accessible; build energy without rushing the congregation.' },
  { id: 'worship', kind: 'worship', title: 'Adoration movement', reference: '', key: 'G', minutes: 14, rights: 'licensed', leader: '', notes: 'Create space for congregational singing and reflection.' },
  { id: 'response', kind: 'response', title: 'Message response', reference: '', key: '', minutes: 8, rights: 'original', leader: '', notes: 'Prayer, silence, response song, or pastoral invitation.' },
];
const defaultState: WorshipPlanState = { serviceName: 'Sunday Worship Gathering', theme: '', scriptureAnchor: '', segments: defaultSegments };
const localPrefix = 'digital-church-worship-plan:v2';

function legacyKey() { return `digital-church-worship-plan:${new Date().toISOString().slice(0, 10)}`; }
function normalizePlan(value: unknown): WorshipPlanState {
  const data = value && typeof value === 'object' ? value as any : {};
  const kinds: SegmentKind[] = ['welcome', 'praise', 'worship', 'scripture', 'prayer', 'response', 'sending'];
  const rights: RightsPosture[] = ['original', 'public-domain', 'licensed', 'provider-cleared'];
  const segments: WorshipSegment[] = Array.isArray(data.segments)
    ? data.segments.filter((item: unknown) => item && typeof item === 'object').map((item: any, index: number) => ({
        id: typeof item.id === 'string' ? item.id : `segment-${index}`,
        kind: kinds.includes(item.kind) ? item.kind : 'prayer',
        title: typeof item.title === 'string' ? item.title : 'Worship moment',
        reference: typeof item.reference === 'string' ? item.reference : '',
        key: typeof item.key === 'string' ? item.key : '',
        minutes: Number.isFinite(Number(item.minutes)) ? Math.max(0, Number(item.minutes)) : 0,
        rights: rights.includes(item.rights) ? item.rights : 'original',
        leader: typeof item.leader === 'string' ? item.leader : '',
        notes: typeof item.notes === 'string' ? item.notes : '',
      }))
    : defaultSegments;
  return { serviceName: typeof data.serviceName === 'string' ? data.serviceName : defaultState.serviceName, theme: typeof data.theme === 'string' ? data.theme : '', scriptureAnchor: typeof data.scriptureAnchor === 'string' ? data.scriptureAnchor : '', segments };
}

export function WorshipServicePlanner() {
  const [serviceName, setServiceName] = useState(defaultState.serviceName);
  const [theme, setTheme] = useState('');
  const [scriptureAnchor, setScriptureAnchor] = useState('');
  const [segments, setSegments] = useState<WorshipSegment[]>(defaultSegments);
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Private browser draft');

  const applyState = (state: WorshipPlanState) => { setServiceName(state.serviceName); setTheme(state.theme); setScriptureAnchor(state.scriptureAnchor); setSegments(state.segments); };
  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId); setSaved(false); setSyncing(true);
    setSyncMessage(churchId ? 'Loading church worship flow…' : 'Loading private worship draft…');
    try {
      const result = await loadChurchOperationalRecord({ churchId, module: 'worship-service-plan', recordKey: 'current', localStoragePrefix: localPrefix, legacyLocalStorageKey: legacyKey(), defaultValue: defaultState, normalize: normalizePlan });
      applyState(result.value); setSyncMessage(result.message);
    } finally { setSyncing(false); }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalMinutes = useMemo(() => segments.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0), [segments]);
  const clearedCount = useMemo(() => segments.filter((item) => ['original', 'public-domain', 'licensed', 'provider-cleared'].includes(item.rights)).length, [segments]);

  const persist = async () => {
    setSyncing(true); setSyncMessage(activeChurchId ? 'Saving worship flow to active church…' : 'Saving private worship draft…');
    try {
      const result = await saveChurchOperationalRecord({ churchId: activeChurchId, module: 'worship-service-plan', recordKey: 'current', title: `${serviceName} worship flow`, localStoragePrefix: localPrefix, value: { serviceName, theme, scriptureAnchor, segments } });
      setSaved(true); setSyncMessage(result.message); window.setTimeout(() => setSaved(false), 1500);
    } finally { setSyncing(false); }
  };

  const updateSegment = (id: string, patch: Partial<WorshipSegment>) => setSegments((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const addSegment = () => setSegments((current) => [...current, { id: `${Date.now()}`, kind: 'prayer', title: 'New ministry moment', reference: '', key: '', minutes: 5, rights: 'original', leader: '', notes: '' }]);
  const moveSegment = (index: number, direction: -1 | 1) => setSegments((current) => { const target = index + direction; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const removeSegment = (id: string) => setSegments((current) => current.filter((item) => item.id !== id));

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-purple-700"><Music2 className="mr-2 h-4 w-4" /> Worship service planner</div><h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Shape worship as a pastoral flow—not a random playlist.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Plan Scripture, praise, adoration, prayer, response, leaders, timing, keys, transitions, and media-rights posture in one service flow. With an active church workspace, the flow is shared only with authorized leaders for that church.</p><div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-purple-700" /> {syncing ? 'Syncing…' : syncMessage}</div></div><div className="min-w-[170px] rounded-2xl bg-stone-950 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Planned worship flow</p><p className="mt-1 text-3xl font-light">{totalMinutes} min</p><p className="mt-2 text-xs text-stone-400">{segments.length} moments · {clearedCount} rights postures set</p></div></div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3"><label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Gathering</span><input value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" /></label><label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Theme</span><input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Grace, mission, resurrection…" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" /></label><label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture anchor</span><input value={scriptureAnchor} onChange={(e) => setScriptureAnchor(e.target.value)} placeholder="Reference only" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" /></label></div>

          <div className="mt-7 space-y-3">{segments.map((segment, index) => <article key={segment.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start"><div className="flex gap-1 lg:flex-col"><button type="button" onClick={() => moveSegment(index, -1)} disabled={index === 0} className="rounded-lg bg-white p-2 text-stone-500 disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button><button type="button" onClick={() => moveSegment(index, 1)} disabled={index === segments.length - 1} className="rounded-lg bg-white p-2 text-stone-500 disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button></div><div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><label className="sm:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Moment</span><input value={segment.title} onChange={(e) => updateSegment(segment.id, { title: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Type</span><select value={segment.kind} onChange={(e) => updateSegment(segment.id, { kind: e.target.value as SegmentKind })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">{segmentOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Minutes</span><input type="number" min="0" max="90" value={segment.minutes} onChange={(e) => updateSegment(segment.id, { minutes: Number(e.target.value) })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Scripture / reference</span><input value={segment.reference} onChange={(e) => updateSegment(segment.id, { reference: e.target.value })} placeholder="Reference or source title" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Key</span><input value={segment.key} onChange={(e) => updateSegment(segment.id, { key: e.target.value })} placeholder="G / Em" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Leader</span><input value={segment.leader} onChange={(e) => updateSegment(segment.id, { leader: e.target.value })} placeholder="Worship leader / pastor" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Rights posture</span><select value={segment.rights} onChange={(e) => updateSegment(segment.id, { rights: e.target.value as RightsPosture })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="original">Original</option><option value="public-domain">Public domain</option><option value="licensed">Licensed</option><option value="provider-cleared">Provider-cleared</option></select></label><label className="sm:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Transition / prayer / tech notes</span><textarea value={segment.notes} onChange={(e) => updateSegment(segment.id, { notes: e.target.value })} className="min-h-[76px] w-full resize-y rounded-xl border border-stone-200 bg-white p-3 text-sm leading-5" /></label></div><button type="button" onClick={() => removeSegment(segment.id)} className="rounded-xl border border-rose-100 bg-white p-2.5 text-rose-500" aria-label="Remove moment"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>

          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={addSegment} className="inline-flex items-center rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"><Plus className="mr-2 h-4 w-4" /> Add worship moment</button><button type="button" onClick={() => void persist()} disabled={syncing} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 disabled:opacity-60">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{syncing ? 'Syncing…' : saved ? 'Worship flow saved' : activeChurchId ? 'Save to active church' : 'Save private worship flow'}</button></div>
        </div>

        <aside className="border-t border-stone-100 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0"><Sparkles className="h-7 w-7 text-purple-300" /><h3 className="mt-5 text-2xl font-light">Worship intelligence for the whole service.</h3><div className="mt-6 space-y-3 text-sm leading-6 text-stone-300"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><BookOpenText className="mb-2 h-5 w-5 text-purple-300" /><strong className="text-white">Scripture coherence.</strong> Let songs, readings, prayer and response support the message rather than compete with it.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Clock3 className="mb-2 h-5 w-5 text-purple-300" /><strong className="text-white">Flow & transitions.</strong> Track timing, keys, leaders and cues so spiritual attentiveness is not lost to preventable coordination problems.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="mb-2 h-5 w-5 text-purple-300" /><strong className="text-white">Congregation first.</strong> Design for participation, singability, prayer, accessibility and people—not stage performance alone.</div></div><div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><Copyright className="mb-2 h-4 w-4" /> Rights posture is planning metadata, not proof of permission. Verify licenses, public-domain status, upload rights, stream rights and provider terms before public performance or distribution.</div><div className="mt-5 rounded-2xl border border-sage-300/20 bg-sage-300/10 p-4 text-xs leading-5 text-sage-100"><ShieldCheck className="mb-2 h-4 w-4" /> AI suggestions should support pastoral/worship leadership, not automatically control service flow.</div><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><Link href="/choir" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"><Mic2 className="mr-2 h-4 w-4 text-purple-300" /> Choir & composition studio</Link><Link href="/media-rights" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"><Copyright className="mr-2 h-4 w-4 text-purple-300" /> Media rights workflow</Link><Link href="/live-service" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"><Radio className="mr-2 h-4 w-4 text-purple-300" /> Live service</Link></div></aside>
      </div>
    </section>
  );
}
