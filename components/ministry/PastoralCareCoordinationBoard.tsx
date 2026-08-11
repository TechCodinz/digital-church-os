'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, HeartHandshake, Save, ShieldCheck, UsersRound } from 'lucide-react';

type CareLane = {
  id: string;
  label: string;
  ready: boolean;
};

type PastoralDeskState = {
  focus: string;
  handoffNote: string;
  lanes: CareLane[];
  updatedAt: string;
};

const defaultState: PastoralDeskState = {
  focus: 'Review new requests and make sure every open care need has a human owner.',
  handoffNote: '',
  lanes: [
    { id: 'appointments', label: 'Appointments reviewed', ready: false },
    { id: 'followup', label: 'Follow-up owners assigned', ready: false },
    { id: 'prayer', label: 'Prayer requests routed appropriately', ready: false },
    { id: 'referrals', label: 'Professional / safeguarding referrals checked', ready: false },
    { id: 'benevolence', label: 'Benevolence handoffs reviewed', ready: false },
    { id: 'privacy', label: 'Confidentiality boundary confirmed', ready: false },
  ],
  updatedAt: '',
};

const STORAGE_KEY = 'digital-church-os:pastoral-care-coordination';

export function PastoralCareCoordinationBoard() {
  const [state, setState] = useState<PastoralDeskState>(defaultState);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PastoralDeskState>;
      const next = {
        ...defaultState,
        ...parsed,
        lanes: Array.isArray(parsed.lanes) && parsed.lanes.length ? parsed.lanes : defaultState.lanes,
      };
      setState(next);
      setSavedAt(next.updatedAt || null);
    } catch {
      // Local recovery is best-effort only.
    }
  }, []);

  const completeCount = useMemo(() => state.lanes.filter((lane) => lane.ready).length, [state.lanes]);

  const toggleLane = (id: string) => {
    setState((current) => ({
      ...current,
      lanes: current.lanes.map((lane) => lane.id === id ? { ...lane, ready: !lane.ready } : lane),
    }));
  };

  const save = () => {
    const updatedAt = new Date().toISOString();
    const next = { ...state, updatedAt };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
    setSavedAt(updatedAt);
  };

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Pastoral coordination desk</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Know what needs human pastoral attention today.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              This desk tracks operational readiness only. Do not enter counseling narratives, abuse reports, medical details, crisis descriptions, or confidential case notes here.
            </p>
          </div>
          <div className="rounded-2xl border border-sage-200 bg-sage-50 px-5 py-4 text-center">
            <p className="text-2xl font-semibold text-sage-800">{completeCount}/{state.lanes.length}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sage-700">care checks ready</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-600">Today’s pastoral posture</p>
                <h3 className="mt-1 text-2xl font-light text-stone-900">Human ownership before automation</h3>
              </div>
              <HeartHandshake className="h-6 w-6 text-sage-600" />
            </div>

            <label className="mt-5 block text-sm font-medium text-stone-700">
              Leadership focus
              <textarea
                value={state.focus}
                onChange={(event) => setState((current) => ({ ...current, focus: event.target.value }))}
                rows={3}
                maxLength={500}
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:border-sage-400"
                placeholder="Operational focus only — no confidential case narrative."
              />
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {state.lanes.map((lane) => (
                <button
                  key={lane.id}
                  type="button"
                  onClick={() => toggleLane(lane.id)}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition ${lane.ready ? 'border-sage-300 bg-sage-50 text-sage-900' : 'border-stone-200 bg-white text-stone-700 hover:border-sage-200'}`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${lane.ready ? 'bg-sage-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  {lane.label}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-sm font-medium text-stone-700">
              Safe handoff reminder
              <textarea
                value={state.handoffNote}
                onChange={(event) => setState((current) => ({ ...current, handoffNote: event.target.value }))}
                rows={3}
                maxLength={500}
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:border-sage-400"
                placeholder="Example: Confirm follow-up owner after service. Do not put names, diagnoses, or crisis details here."
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={save} className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white hover:bg-sage-700">
                <Save className="mr-2 h-4 w-4" /> Save private desk
              </button>
              <p className="text-xs text-stone-500">{savedAt ? `Saved ${new Date(savedAt).toLocaleString()}.` : 'Not yet saved in this browser.'}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage-300">Care handoff map</p>
              <div className="mt-5 space-y-3">
                <Link href="/care/manage" className="flex min-h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"><span className="inline-flex items-center"><CalendarClock className="mr-3 h-4 w-4 text-sage-300" />Appointments & care queue</span><span>→</span></Link>
                <Link href="/follow-up/manage" className="flex min-h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"><span className="inline-flex items-center"><UsersRound className="mr-3 h-4 w-4 text-sage-300" />Follow-up ownership</span><span>→</span></Link>
                <Link href="/prayer-room" className="flex min-h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"><span className="inline-flex items-center"><HeartHandshake className="mr-3 h-4 w-4 text-sage-300" />Prayer & member response</span><span>→</span></Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <h3 className="font-semibold text-amber-950">Restricted-content boundary</h3>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    Sensitive counseling notes, safeguarding cases, medical information, abuse reports, crisis narratives, credentials, and emergency-response details belong only in purpose-built restricted systems and qualified human workflows—not this coordination board.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
