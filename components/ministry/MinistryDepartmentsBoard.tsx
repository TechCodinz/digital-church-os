'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, Church, Plus, Trash2, UsersRound } from 'lucide-react';

type Department = {
  id: string;
  name: string;
  leader: string;
  deputy: string;
  purpose: string;
  meetingRhythm: string;
  activeWorkers: number;
  openRoles: number;
  nextPriority: string;
  status: 'healthy' | 'attention' | 'rebuilding' | 'paused';
};

const key = 'digital-church-departments';
const seed: Department[] = [
  { id: 'worship', name: 'Worship & Choir', leader: '', deputy: '', purpose: 'Lead congregational worship and rehearsals.', meetingRhythm: 'Weekly', activeWorkers: 0, openRoles: 0, nextPriority: '', status: 'healthy' },
  { id: 'media', name: 'Media & Production', leader: '', deputy: '', purpose: 'Support sound, slides, streaming, and media operations.', meetingRhythm: 'Service-based', activeWorkers: 0, openRoles: 0, nextPriority: '', status: 'healthy' },
  { id: 'children', name: 'Children & Family', leader: '', deputy: '', purpose: 'Coordinate age-aware children and family ministry.', meetingRhythm: 'Weekly', activeWorkers: 0, openRoles: 0, nextPriority: '', status: 'healthy' },
  { id: 'care', name: 'Prayer & Care', leader: '', deputy: '', purpose: 'Coordinate prayer, care ownership, and human follow-up.', meetingRhythm: 'Weekly', activeWorkers: 0, openRoles: 0, nextPriority: '', status: 'healthy' },
];

export function MinistryDepartmentsBoard() {
  const [items, setItems] = useState<Department[]>(seed);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const leadershipGaps = useMemo(() => items.filter((item) => !item.leader || !item.deputy).length, [items]);
  const roleGaps = useMemo(() => items.reduce((sum, item) => sum + Math.max(0, Number(item.openRoles) || 0), 0), [items]);

  const update = (id: string, patch: Partial<Department>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const add = () => setItems((current) => [...current, { id: `${Date.now()}`, name: 'New ministry department', leader: '', deputy: '', purpose: '', meetingRhythm: '', activeWorkers: 0, openRoles: 0, nextPriority: '', status: 'healthy' }]);
  const save = () => {
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    } catch { setSaved(false); }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div><div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><Church className="mr-2 h-4 w-4" /> Ministry departments</div><h1 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-5xl">Give every ministry a purpose, accountable leadership, capacity view, and next priority.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Department structure connects the church’s operating system to real human ownership without ranking ministries or turning volunteer counts into spiritual status.</p></div>
            <div className="grid min-w-[190px] grid-cols-2 gap-2 text-center"><div className="rounded-2xl bg-amber-50 p-3"><p className="text-2xl font-light text-amber-800">{leadershipGaps}</p><p className="text-[9px] uppercase tracking-wider text-amber-700">Leadership gaps</p></div><div className="rounded-2xl bg-stone-950 p-3 text-white"><p className="text-2xl font-light">{roleGaps}</p><p className="text-[9px] uppercase tracking-wider text-stone-400">Open roles</p></div></div>
          </div>

          <div className="mt-7 space-y-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Department</span><input value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Leader</span><input value={item.leader} onChange={(e) => update(item.id, { leader: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Deputy / apprentice</span><input value={item.deputy} onChange={(e) => update(item.id, { deputy: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Status</span><select value={item.status} onChange={(e) => update(item.id, { status: e.target.value as Department['status'] })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="healthy">Healthy</option><option value="attention">Needs attention</option><option value="rebuilding">Rebuilding</option><option value="paused">Paused</option></select></label>
                  <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Purpose</span><input value={item.purpose} onChange={(e) => update(item.id, { purpose: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Meeting rhythm</span><input value={item.meetingRhythm} onChange={(e) => update(item.id, { meetingRhythm: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Workers</span><input type="number" min="0" value={item.activeWorkers} onChange={(e) => update(item.id, { activeWorkers: Number(e.target.value) })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Open roles</span><input type="number" min="0" value={item.openRoles} onChange={(e) => update(item.id, { openRoles: Number(e.target.value) })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label></div>
                  <label className="md:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Next ministry priority</span><input value={item.nextPriority} onChange={(e) => update(item.id, { nextPriority: e.target.value })} placeholder="What should this department accomplish next?" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                </div>
                <div className="mt-4 flex justify-end"><button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="rounded-xl border border-rose-100 bg-white p-2 text-rose-600" aria-label="Remove department"><Trash2 className="h-4 w-4" /></button></div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={add} className="inline-flex items-center rounded-xl bg-sage-700 px-5 py-3 text-sm font-semibold text-white"><Plus className="mr-2 h-4 w-4" /> Add department</button><button type="button" onClick={save} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Check className="mr-2 h-4 w-4" /> {saved ? 'Saved' : 'Save department board'}</button></div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10"><UsersRound className="h-8 w-8 text-sage-300" /><h2 className="mt-5 text-3xl font-light">Leadership depth matters more than one heroic leader.</h2><p className="mt-4 text-sm leading-6 text-stone-300">A deputy or apprentice makes continuity visible and helps the church avoid single-person dependency. Worker counts are capacity signals only, never spiritual rankings.</p><div className="mt-6 grid gap-3"><Link href="/workers" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open volunteer rota →</Link><Link href="/events" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open events →</Link></div></aside>
      </div>
    </section>
  );
}
