'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Church,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UsersRound,
} from 'lucide-react';

type GroupStatus = 'forming' | 'open' | 'near-capacity' | 'full' | 'paused';
type Group = {
  id: string;
  name: string;
  focus: string;
  leader: string;
  backup: string;
  meeting: string;
  location: string;
  capacity: number;
  current: number;
  status: GroupStatus;
  nextStep: string;
};

const defaultGroups: Group[] = [];

function storageKey() {
  return 'digital-church-group-ministry:v1';
}

function safeNumber(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

export function GroupMinistryPlanner() {
  const [groups, setGroups] = useState<Group[]>(defaultGroups);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.groups)) setGroups(data.groups);
    } catch {
      // Local group planning is optional.
    }
  }, []);

  const openGroups = useMemo(() => groups.filter((group) => ['forming', 'open'].includes(group.status)), [groups]);
  const totalCapacity = useMemo(() => groups.reduce((sum, group) => sum + group.capacity, 0), [groups]);
  const totalCurrent = useMemo(() => groups.reduce((sum, group) => sum + group.current, 0), [groups]);
  const missingBackups = useMemo(() => groups.filter((group) => group.status !== 'paused' && !group.backup.trim()).length, [groups]);
  const overCapacity = useMemo(() => groups.filter((group) => group.capacity > 0 && group.current > group.capacity), [groups]);

  const updateGroup = (id: string, patch: Partial<Group>) => setGroups((current) => current.map((group) => group.id === id ? { ...group, ...patch } : group));
  const addGroup = () => setGroups((current) => [...current, { id: `${Date.now()}`, name: 'New community group', focus: 'Scripture, prayer & community', leader: '', backup: '', meeting: '', location: '', capacity: 12, current: 0, status: 'forming', nextStep: 'Confirm leader, meeting rhythm, safeguarding needs, and who the group is ready to welcome.' }]);
  const removeGroup = (id: string) => setGroups((current) => current.filter((group) => group.id !== id));

  const save = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ groups, updatedAt: new Date().toISOString() }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.12fr_0.88fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700"><Church className="mr-2 h-4 w-4" /> Small groups & community</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Build enough healthy community capacity that people have somewhere relational to go after Sunday.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Track groups at the ministry level: focus, leaders, backup leadership, meeting rhythm, location, healthy capacity, and next operational action. Individual counseling notes and private member histories do not belong in this planner.</p>
            </div>
            <div className="min-w-[200px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Community capacity</p>
              <p className="mt-1 text-4xl font-light">{totalCurrent}/{totalCapacity}</p>
              <p className="mt-2 text-xs text-stone-400">{openGroups.length} group{openGroups.length === 1 ? '' : 's'} open/forming</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={addGroup} className="inline-flex items-center rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-800"><Plus className="mr-2 h-4 w-4" /> Add group</button>
            <button type="button" onClick={save} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Group plan saved' : 'Save group plan locally'}</button>
          </div>

          <div className="mt-6 space-y-4">
            {groups.map((group) => {
              const occupancy = group.capacity > 0 ? Math.min(100, Math.round((group.current / group.capacity) * 100)) : 0;
              return (
                <article key={group.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Group name</span><input value={group.name} onChange={(e) => updateGroup(group.id, { name: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Status</span><select value={group.status} onChange={(e) => updateGroup(group.id, { status: e.target.value as GroupStatus })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="forming">Forming</option><option value="open">Open</option><option value="near-capacity">Near capacity</option><option value="full">Full</option><option value="paused">Paused</option></select></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Focus</span><input value={group.focus} onChange={(e) => updateGroup(group.id, { focus: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Leader</span><input value={group.leader} onChange={(e) => updateGroup(group.id, { leader: e.target.value })} placeholder="Leader" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Backup / apprentice</span><input value={group.backup} onChange={(e) => updateGroup(group.id, { backup: e.target.value })} placeholder="Backup leader" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Meeting rhythm</span><input value={group.meeting} onChange={(e) => updateGroup(group.id, { meeting: e.target.value })} placeholder="Tue 7pm / biweekly" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Location / mode</span><input value={group.location} onChange={(e) => updateGroup(group.id, { location: e.target.value })} placeholder="Neighborhood / online" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Current people</span><input type="number" min="0" value={group.current} onChange={(e) => updateGroup(group.id, { current: safeNumber(e.target.value) })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Healthy capacity</span><input type="number" min="0" value={group.capacity} onChange={(e) => updateGroup(group.id, { capacity: safeNumber(e.target.value) })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <div className="md:col-span-2 rounded-xl border border-stone-200 bg-white p-3"><div className="flex items-center justify-between text-xs font-semibold text-stone-600"><span>Capacity use</span><span>{occupancy}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full bg-indigo-500" style={{ width: `${occupancy}%` }} /></div></div>
                      <label className="md:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Next operational action</span><textarea value={group.nextStep} onChange={(e) => updateGroup(group.id, { nextStep: e.target.value })} className="min-h-[72px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-5" /></label>
                    </div>
                    <button type="button" onClick={() => removeGroup(group.id)} className="rounded-xl border border-rose-100 bg-white p-2.5 text-rose-500" aria-label={`Remove ${group.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
            {!groups.length && <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center"><Church className="mx-auto h-8 w-8 text-stone-300" /><p className="mt-3 font-semibold text-stone-700">No community groups planned on this device yet.</p><p className="mt-2 text-sm leading-6 text-stone-500">Add groups to see leadership depth, capacity, and where new connections can be received.</p></div>}
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <ShieldCheck className="h-8 w-8 text-indigo-300" />
          <h3 className="mt-5 text-3xl font-light">Healthy groups need leaders, backups, capacity, and boundaries.</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="mb-2 h-5 w-5 text-indigo-300" /><p className="text-xs uppercase tracking-wider text-stone-500">Leadership backups missing</p><p className="mt-2 text-3xl font-light">{missingBackups}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><MapPin className="mb-2 h-5 w-5 text-indigo-300" /><p className="text-xs uppercase tracking-wider text-stone-500">Groups above capacity</p><p className="mt-2 text-3xl font-light">{overCapacity.length}</p></div>
          </div>

          {(missingBackups > 0 || overCapacity.length > 0) && <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><AlertTriangle className="mb-2 h-4 w-4" /> Leadership depth and healthy capacity should be addressed before continuously sending more people into the same group.</div>}

          <div className="mt-5 space-y-3 text-xs leading-5 text-stone-400">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="mb-2 h-4 w-4 text-indigo-300" /> Meeting frequency and capacity are operational signals, not measures of faithfulness or spiritual maturity.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-2 h-4 w-4 text-indigo-300" /> Groups involving children, vulnerable people, transport, homes, or counseling-like care require church-approved safeguarding and privacy procedures beyond this planner.</p>
          </div>

          <div className="mt-6 grid gap-3">
            <Link href="/admin/follow-up" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">Connect follow-up to community</Link>
            <Link href="/events" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200"><CalendarDays className="mr-2 h-4 w-4" /> Group events & calendar</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
