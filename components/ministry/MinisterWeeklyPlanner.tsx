'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ClipboardList, Save, ShieldCheck } from 'lucide-react';

type ReadinessKey = 'sermon' | 'worship' | 'teams' | 'communications' | 'response' | 'followup';

type PlannerState = {
  serviceFocus: string;
  scripture: string;
  priority: string;
  risk: string;
  win: string;
  readiness: Record<ReadinessKey, boolean>;
  updatedAt: string;
};

const initial: PlannerState = {
  serviceFocus: '', scripture: '', priority: '', risk: '', win: '', updatedAt: '',
  readiness: { sermon: false, worship: false, teams: false, communications: false, response: false, followup: false },
};

const items: { key: ReadinessKey; label: string; note: string; href: string }[] = [
  { key: 'sermon', label: 'Sermon & Scripture', note: 'Message, text, context, applications and presentation are ready.', href: '/sermons' },
  { key: 'worship', label: 'Worship flow', note: 'Songs, transitions, rights posture and rehearsal are reviewed.', href: '/choir' },
  { key: 'teams', label: 'Workers & teams', note: 'Critical roles, backups, children/family coverage and call times are clear.', href: '/workers/manage' },
  { key: 'communications', label: 'Communications', note: 'Announcements, reminders and consent-aware messaging are ready.', href: '/communications' },
  { key: 'response', label: 'Prayer & response', note: 'Prayer, salvation/follow-up, care and next-step pathways are staffed.', href: '/service-response' },
  { key: 'followup', label: 'Follow-up', note: 'Owners and next actions are clear for visitors, requests and care handoffs.', href: '/follow-up/manage' },
];

export function MinisterWeeklyPlanner() {
  const [state, setState] = useState<PlannerState>(initial);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('digital-church-os:minister-weekly-planner');
      if (!raw) return;
      const parsed = { ...initial, ...(JSON.parse(raw) as Partial<PlannerState>) };
      parsed.readiness = { ...initial.readiness, ...(parsed.readiness || {}) };
      setState(parsed);
      setSavedAt(parsed.updatedAt || null);
    } catch {
      // Best-effort private recovery only.
    }
  }, []);

  const readyCount = useMemo(() => Object.values(state.readiness).filter(Boolean).length, [state.readiness]);

  function toggle(key: ReadinessKey) {
    setState((current) => ({ ...current, readiness: { ...current.readiness, [key]: !current.readiness[key] } }));
  }

  function save() {
    const updatedAt = new Date().toISOString();
    const next = { ...state, updatedAt };
    window.localStorage.setItem('digital-church-os:minister-weekly-planner', JSON.stringify(next));
    setState(next);
    setSavedAt(updatedAt);
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Weekly ministry readiness</p><h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Prepare the whole ministry week, not only the sermon.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Use this as a private planning layer. Real tenant-owned assignments, schedules and protected records remain in their church workspace modules.</p></div>
          <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"><ClipboardList className="mr-2 inline h-4 w-4" /> {readyCount}/{items.length} readiness areas reviewed</div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">Service / ministry focus<input value={state.serviceFocus} onChange={(e) => setState((current) => ({ ...current, serviceFocus: e.target.value }))} placeholder="Theme or ministry focus this week" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label>
              <label className="text-sm font-medium text-stone-700">Primary Scripture<input value={state.scripture} onChange={(e) => setState((current) => ({ ...current, scripture: e.target.value }))} placeholder="Reference only until verified text is loaded" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3" /></label>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {items.map((item) => (
                <article key={item.key} className={`rounded-2xl border p-4 ${state.readiness[item.key] ? 'border-sage-300 bg-sage-50' : 'border-stone-200 bg-white'}`}>
                  <div className="flex items-start gap-3"><button type="button" onClick={() => toggle(item.key)} aria-label={`Toggle ${item.label}`} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${state.readiness[item.key] ? 'border-sage-600 bg-sage-600 text-white' : 'border-stone-300 bg-white text-transparent'}`}><CheckCircle2 className="h-4 w-4" /></button><div><h3 className="font-semibold text-stone-900">{item.label}</h3><p className="mt-1 text-sm leading-5 text-stone-600">{item.note}</p><Link href={item.href} className="mt-2 inline-block text-xs font-semibold text-sage-700">Open workspace →</Link></div></div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-300">Leader notes</p>
              <label className="mt-4 block text-sm text-stone-200">Top priority<textarea value={state.priority} onChange={(e) => setState((current) => ({ ...current, priority: e.target.value }))} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none" placeholder="What most needs human leadership this week?" /></label>
              <label className="mt-4 block text-sm text-stone-200">Risk / unresolved gap<textarea value={state.risk} onChange={(e) => setState((current) => ({ ...current, risk: e.target.value }))} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none" placeholder="Staffing, care, media, safeguarding, communication, logistics…" /></label>
              <label className="mt-4 block text-sm text-stone-200">Win / gratitude<textarea value={state.win} onChange={(e) => setState((current) => ({ ...current, win: e.target.value }))} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none" placeholder="What should the team celebrate or thank God for?" /></label>
              <button type="button" onClick={save} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sage-500 px-4 text-sm font-semibold text-white"><Save className="mr-2 h-4 w-4" /> Save private weekly plan</button>
              <p className="mt-3 text-xs text-stone-400">{savedAt ? `Saved ${new Date(savedAt).toLocaleString()}.` : 'Not yet saved in this browser.'}</p>
            </div>
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5 text-sm leading-6 text-sage-900"><ShieldCheck className="mb-2 h-5 w-5" /> Do not place confidential pastoral cases, safeguarding reports, medical details, credentials or financial account data in this general planning scratchpad.</div>
          </aside>
        </div>
      </div>
    </section>
  );
}
