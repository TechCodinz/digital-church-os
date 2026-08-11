'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Church, Save, ShieldCheck, UsersRound } from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type AttendanceSnapshot = {
  adults: number;
  youth: number;
  children: number;
  online: number;
  firstTimeGuests: number;
  returningGuests: number;
  responses: number;
  followUpsAssigned: number;
  foundations: number;
  groupsConnected: number;
  servingConnected: number;
};

type AttendanceState = {
  serviceDate: string;
  gathering: string;
  snapshot: AttendanceSnapshot;
  observations: string;
};

const initial: AttendanceSnapshot = { adults: 0, youth: 0, children: 0, online: 0, firstTimeGuests: 0, returningGuests: 0, responses: 0, followUpsAssigned: 0, foundations: 0, groupsConnected: 0, servingConnected: 0 };
const defaultState: AttendanceState = { serviceDate: '', gathering: 'Sunday Worship Service', snapshot: initial, observations: '' };
const legacyKey = 'digital-church-attendance-assimilation:v1';
const localPrefix = 'digital-church-attendance-assimilation:v2';

function safeNumber(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function normalizeAttendance(value: unknown): AttendanceState {
  const data = value && typeof value === 'object' ? value as any : {};
  const raw = data.snapshot && typeof data.snapshot === 'object' ? data.snapshot : {};
  const snapshot = Object.fromEntries(Object.keys(initial).map((key) => [key, safeNumber(raw[key])])) as AttendanceSnapshot;
  return {
    serviceDate: typeof data.serviceDate === 'string' ? data.serviceDate : '',
    gathering: typeof data.gathering === 'string' ? data.gathering : defaultState.gathering,
    snapshot,
    observations: typeof data.observations === 'string' ? data.observations : '',
  };
}

export function AttendanceAssimilationDashboard() {
  const [serviceDate, setServiceDate] = useState('');
  const [gathering, setGathering] = useState(defaultState.gathering);
  const [snapshot, setSnapshot] = useState<AttendanceSnapshot>(initial);
  const [observations, setObservations] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Private browser draft');

  const applyState = (state: AttendanceState) => {
    setServiceDate(state.serviceDate);
    setGathering(state.gathering);
    setSnapshot(state.snapshot);
    setObservations(state.observations);
  };

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId); setSaved(false); setSyncing(true);
    setSyncMessage(churchId ? 'Loading church attendance snapshot…' : 'Loading private aggregate draft…');
    try {
      const result = await loadChurchOperationalRecord({ churchId, module: 'attendance', recordKey: 'latest-aggregate', localStoragePrefix: localPrefix, legacyLocalStorageKey: legacyKey, defaultValue: defaultState, normalize: normalizeAttendance });
      applyState(result.value); setSyncMessage(result.message);
    } finally { setSyncing(false); }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const physicalTotal = useMemo(() => snapshot.adults + snapshot.youth + snapshot.children, [snapshot.adults, snapshot.youth, snapshot.children]);
  const combinedReach = physicalTotal + snapshot.online;
  const guestTotal = snapshot.firstTimeGuests + snapshot.returningGuests;
  const responseCoverage = snapshot.responses > 0 ? Math.min(100, Math.round((snapshot.followUpsAssigned / snapshot.responses) * 100)) : 100;
  const groupConnection = snapshot.firstTimeGuests > 0 ? Math.min(100, Math.round((snapshot.groupsConnected / snapshot.firstTimeGuests) * 100)) : 0;
  const update = (key: keyof AttendanceSnapshot, value: string) => setSnapshot((current) => ({ ...current, [key]: safeNumber(value) }));

  const save = async () => {
    const value: AttendanceState = { serviceDate, gathering, snapshot, observations };
    setSyncing(true); setSyncMessage(activeChurchId ? 'Saving aggregate snapshot to active church…' : 'Saving private aggregate draft…');
    try {
      const result = await saveChurchOperationalRecord({ churchId: activeChurchId, module: 'attendance', recordKey: 'latest-aggregate', title: serviceDate ? `${gathering} attendance · ${serviceDate}` : `${gathering} attendance`, localStoragePrefix: localPrefix, value });
      setSaved(true); setSyncMessage(result.message); window.setTimeout(() => setSaved(false), 1600);
    } finally { setSyncing(false); }
  };

  const fields: Array<{ key: keyof AttendanceSnapshot; label: string; group: 'attendance' | 'assimilation' }> = [
    { key: 'adults', label: 'Adults in room', group: 'attendance' }, { key: 'youth', label: 'Youth in room', group: 'attendance' }, { key: 'children', label: 'Children in room', group: 'attendance' }, { key: 'online', label: 'Online reach', group: 'attendance' }, { key: 'firstTimeGuests', label: 'First-time guests', group: 'attendance' }, { key: 'returningGuests', label: 'Returning guests', group: 'attendance' }, { key: 'responses', label: 'Next-step responses', group: 'assimilation' }, { key: 'followUpsAssigned', label: 'Follow-ups assigned', group: 'assimilation' }, { key: 'foundations', label: 'Foundations connections', group: 'assimilation' }, { key: 'groupsConnected', label: 'Connected to groups', group: 'assimilation' }, { key: 'servingConnected', label: 'Connected to serving', group: 'assimilation' },
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.08fr_0.92fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div><div className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700"><UsersRound className="mr-2 h-4 w-4" /> Attendance & assimilation</div><h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">See whether people are only attending—or actually receiving appropriate follow-up, community, and next-step support.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">This dashboard stores aggregate counts only. Individual contact data belongs in protected, consent-aware follow-up and care workflows rather than attendance analytics.</p><div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-cyan-700" /> {syncing ? 'Syncing…' : syncMessage}</div></div><div className="min-w-[190px] rounded-2xl bg-stone-950 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Combined reach</p><p className="mt-1 text-4xl font-light">{combinedReach}</p><p className="mt-2 text-xs text-stone-400">{physicalTotal} in room · {snapshot.online} online</p></div></div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Gathering</span><input value={gathering} onChange={(e) => setGathering(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label><label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Date</span><input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label></div>

          <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Attendance snapshot</p><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fields.filter((field) => field.group === 'attendance').map((field) => <label key={field.key} className="rounded-2xl border border-stone-200 bg-stone-50 p-4"><span className="block text-xs font-semibold text-stone-600">{field.label}</span><input type="number" min="0" value={snapshot[field.key]} onChange={(e) => update(field.key, e.target.value)} className="mt-3 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-lg font-semibold text-stone-900" /></label>)}</div></div>
          <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Assimilation / discipleship snapshot</p><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fields.filter((field) => field.group === 'assimilation').map((field) => <label key={field.key} className="rounded-2xl border border-stone-200 bg-stone-50 p-4"><span className="block text-xs font-semibold text-stone-600">{field.label}</span><input type="number" min="0" value={snapshot[field.key]} onChange={(e) => update(field.key, e.target.value)} className="mt-3 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-lg font-semibold text-stone-900" /></label>)}</div></div>

          <label className="mt-6 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Operational observation · aggregate only</span><textarea value={observations} onChange={(e) => setObservations(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Example: second service needs more welcome-team coverage; online response link was hard to find. Do not put individual pastoral details here." /></label>
          <button type="button" onClick={() => void save()} disabled={syncing} className="mt-5 inline-flex items-center rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{syncing ? 'Syncing…' : saved ? 'Snapshot saved' : activeChurchId ? 'Save to active church' : 'Save private aggregate snapshot'}</button>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0"><ShieldCheck className="h-8 w-8 text-cyan-300" /><h3 className="mt-5 text-3xl font-light">Metrics should expose ministry gaps, not rank people.</h3><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-wider text-stone-500">Guests recorded</p><p className="mt-2 text-3xl font-light">{guestTotal}</p><p className="mt-1 text-xs text-stone-400">{snapshot.firstTimeGuests} first-time · {snapshot.returningGuests} returning</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-wider text-stone-500">Response ownership</p><p className="mt-2 text-3xl font-light">{responseCoverage}%</p><p className="mt-1 text-xs text-stone-400">Assigned follow-up ÷ recorded responses</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-wider text-stone-500">Guest-to-group signal</p><p className="mt-2 text-3xl font-light">{groupConnection}%</p><p className="mt-1 text-xs text-stone-400">Directional signal only; not a spiritual success score.</p></div></div><div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-xs leading-5 text-cyan-100">Use these counts to ask operational questions: Do first-time guests know where to go next? Are responses assigned to humans? Are groups healthy enough to receive people? Are children and online participants visible in planning?</div><div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">Do not infer faith, commitment, generosity, mental health, family status, or spiritual maturity from attendance frequency. Individual ministry decisions require context and human judgment.</div><div className="mt-6 grid gap-3"><Link href="/follow-up/manage" className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white">Open follow-up board</Link><Link href="/groups/manage" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200"><Church className="mr-2 h-4 w-4" /> Small groups & community</Link><Link href="/events/manage" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200"><CalendarDays className="mr-2 h-4 w-4" /> Events & calendar</Link></div></aside>
      </div>
    </section>
  );
}
