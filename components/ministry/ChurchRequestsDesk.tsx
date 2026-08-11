'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, ClipboardCheck, Plus, Trash2 } from 'lucide-react';

type RequestType = 'baptism' | 'membership' | 'volunteer' | 'event' | 'facility' | 'letter' | 'care' | 'benevolence' | 'other';
type Status = 'submitted' | 'assigned' | 'waiting' | 'completed' | 'declined';
type Item = { id: string; type: RequestType; requester: string; owner: string; status: Status; due: string; consent: boolean; summary: string; nextAction: string };

const key = 'digital-church-requests-desk';
const seed: Item[] = [{ id: 'req-1', type: 'membership', requester: 'New request', owner: '', status: 'submitted', due: '', consent: false, summary: '', nextAction: '' }];

export function ChurchRequestsDesk() {
  const [items, setItems] = useState<Item[]>(seed);
  const [saved, setSaved] = useState(false);
  useEffect(() => { try { const raw = window.localStorage.getItem(key); if (raw) setItems(JSON.parse(raw)); } catch {} }, []);

  const open = useMemo(() => items.filter((item) => !['completed', 'declined'].includes(item.status)).length, [items]);
  const unowned = useMemo(() => items.filter((item) => !item.owner && !['completed', 'declined'].includes(item.status)).length, [items]);
  const update = (id: string, patch: Partial<Item>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const add = () => setItems((current) => [...current, { id: `${Date.now()}`, type: 'other', requester: 'New request', owner: '', status: 'submitted', due: '', consent: false, summary: '', nextAction: '' }]);
  const save = () => { try { window.localStorage.setItem(key, JSON.stringify(items)); setSaved(true); window.setTimeout(() => setSaved(false), 1500); } catch { setSaved(false); } };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div><div className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700"><ClipboardCheck className="mr-2 h-4 w-4" /> Church requests desk</div><h1 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-5xl">Give everyday church requests an owner, status, due date, and clear next action.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Coordinate baptism, membership, volunteering, events, facility requests, letters, care handoffs, benevolence, and other administrative requests without losing them in chat threads.</p></div>
            <div className="grid min-w-[180px] grid-cols-2 gap-2 text-center"><div className="rounded-2xl bg-stone-950 p-3 text-white"><p className="text-2xl font-light">{open}</p><p className="text-[9px] uppercase tracking-wider text-stone-400">Open</p></div><div className="rounded-2xl bg-amber-50 p-3"><p className="text-2xl font-light text-amber-800">{unowned}</p><p className="text-[9px] uppercase tracking-wider text-amber-700">Unowned</p></div></div>
          </div>

          <div className="mt-7 space-y-4">
            {items.map((item) => <article key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Request type</span><select value={item.type} onChange={(e) => update(item.id, { type: e.target.value as RequestType })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="baptism">Baptism</option><option value="membership">Membership</option><option value="volunteer">Volunteer</option><option value="event">Event</option><option value="facility">Facility</option><option value="letter">Letter / certificate</option><option value="care">Care handoff</option><option value="benevolence">Benevolence</option><option value="other">Other</option></select></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Requester</span><input value={item.requester} onChange={(e) => update(item.id, { requester: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Owner</span><input value={item.owner} onChange={(e) => update(item.id, { owner: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Status</span><select value={item.status} onChange={(e) => update(item.id, { status: e.target.value as Status })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="submitted">Submitted</option><option value="assigned">Assigned</option><option value="waiting">Waiting</option><option value="completed">Completed</option><option value="declined">Declined</option></select></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Due</span><input type="date" value={item.due} onChange={(e) => update(item.id, { due: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label className="md:col-span-3"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Summary</span><input value={item.summary} onChange={(e) => update(item.id, { summary: e.target.value })} placeholder="Minimal operational summary" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label className="md:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Next action</span><input value={item.nextAction} onChange={(e) => update(item.id, { nextAction: e.target.value })} placeholder="Who should do what next?" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
            </div><div className="mt-4 flex items-center justify-between"><label className="inline-flex items-center gap-2 text-xs text-stone-600"><input type="checkbox" checked={item.consent} onChange={(e) => update(item.id, { consent: e.target.checked })} /> Permission to contact is recorded where needed</label><button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="rounded-xl border border-rose-100 bg-white p-2 text-rose-600"><Trash2 className="h-4 w-4" /></button></div></article>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={add} className="inline-flex items-center rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white"><Plus className="mr-2 h-4 w-4" /> Add request</button><button type="button" onClick={save} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Check className="mr-2 h-4 w-4" /> {saved ? 'Saved' : 'Save request desk'}</button></div>
        </div>
        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10"><ClipboardCheck className="h-8 w-8 text-cyan-300" /><h2 className="mt-5 text-3xl font-light">One intake desk, specialized handoffs.</h2><p className="mt-4 text-sm leading-6 text-stone-300">Keep this board administrative. Counseling detail belongs in care, baptism/membership preparation belongs in formation, facility work belongs in facilities, and outreach follow-up belongs in the outreach CRM.</p><div className="mt-6 grid gap-3"><Link href="/formation" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open formation →</Link><Link href="/care" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open care →</Link><Link href="/facilities" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open facilities →</Link></div></aside>
      </div>
    </section>
  );
}
