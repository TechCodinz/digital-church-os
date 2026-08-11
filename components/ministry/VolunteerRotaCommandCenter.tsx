'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock3,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UsersRound,
} from 'lucide-react';

type RotaStatus = 'unassigned' | 'invited' | 'confirmed' | 'checked-in' | 'unavailable';
type RotaRole = {
  id: string;
  department: string;
  role: string;
  primary: string;
  backup: string;
  callTime: string;
  status: RotaStatus;
  note: string;
  critical: boolean;
};

const departments = ['Service lead', 'Worship', 'Choir', 'Media / AV', 'Streaming', 'Ushers', 'Hospitality', 'Prayer team', 'Children', 'Security / safety', 'Parking', 'Protocol', 'Outreach', 'Other'];
const statusLabels: Record<RotaStatus, string> = {
  unassigned: 'Unassigned',
  invited: 'Invited',
  confirmed: 'Confirmed',
  'checked-in': 'Checked in',
  unavailable: 'Unavailable',
};

const defaultRoles: RotaRole[] = [
  { id: 'service-lead', department: 'Service lead', role: 'Service coordinator', primary: '', backup: '', callTime: '09:00', status: 'unassigned', note: '', critical: true },
  { id: 'worship-lead', department: 'Worship', role: 'Worship leader', primary: '', backup: '', callTime: '08:30', status: 'unassigned', note: '', critical: true },
  { id: 'audio', department: 'Media / AV', role: 'Audio operator', primary: '', backup: '', callTime: '08:15', status: 'unassigned', note: '', critical: true },
  { id: 'stream', department: 'Streaming', role: 'Stream operator', primary: '', backup: '', callTime: '08:30', status: 'unassigned', note: '', critical: true },
  { id: 'children', department: 'Children', role: 'Children ministry lead', primary: '', backup: '', callTime: '09:00', status: 'unassigned', note: '', critical: true },
  { id: 'prayer', department: 'Prayer team', role: 'Response / prayer lead', primary: '', backup: '', callTime: '09:15', status: 'unassigned', note: '', critical: true },
  { id: 'ushers', department: 'Ushers', role: 'Usher lead', primary: '', backup: '', callTime: '09:15', status: 'unassigned', note: '', critical: false },
];

function storageKey() {
  return 'digital-church-volunteer-rota:v1';
}

export function VolunteerRotaCommandCenter() {
  const [serviceDate, setServiceDate] = useState('');
  const [serviceName, setServiceName] = useState('Sunday Worship Service');
  const [roles, setRoles] = useState<RotaRole[]>(defaultRoles);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      setServiceDate(data.serviceDate || '');
      setServiceName(data.serviceName || 'Sunday Worship Service');
      if (Array.isArray(data.roles)) setRoles(data.roles);
    } catch {
      // Local rota recovery is optional.
    }
  }, []);

  const confirmed = useMemo(() => roles.filter((item) => ['confirmed', 'checked-in'].includes(item.status)).length, [roles]);
  const criticalGaps = useMemo(() => roles.filter((item) => item.critical && (!item.primary.trim() || ['unassigned', 'unavailable'].includes(item.status))), [roles]);
  const missingBackups = useMemo(() => roles.filter((item) => item.critical && !item.backup.trim()).length, [roles]);
  const coverage = useMemo(() => Math.round((confirmed / Math.max(roles.length, 1)) * 100), [confirmed, roles.length]);

  const updateRole = (id: string, patch: Partial<RotaRole>) => setRoles((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const addRole = () => setRoles((current) => [...current, { id: `${Date.now()}`, department: 'Other', role: 'New role', primary: '', backup: '', callTime: '09:00', status: 'unassigned', note: '', critical: false }]);
  const removeRole = (id: string) => setRoles((current) => current.filter((item) => item.id !== id));

  const save = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ serviceDate, serviceName, roles, updatedAt: new Date().toISOString() }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.18fr_0.82fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700"><UsersRound className="mr-2 h-4 w-4" /> Volunteer rota & coverage</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Know who is serving, who confirmed, who is backup, and where the service still has a people gap.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Use this as a coordination board rather than a spiritual-performance score. Names and operational notes stay on this device in this phase; sensitive pastoral, safeguarding, payroll, or disciplinary details do not belong here.</p>
            </div>
            <div className="min-w-[190px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Confirmed coverage</p>
              <p className="mt-1 text-4xl font-light">{coverage}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-emerald-400" style={{ width: `${coverage}%` }} /></div>
              <p className={`mt-3 text-xs ${criticalGaps.length ? 'text-amber-300' : 'text-emerald-300'}`}>{criticalGaps.length ? `${criticalGaps.length} critical gap${criticalGaps.length === 1 ? '' : 's'}` : 'Critical roles covered'}</p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Service / event</span><input value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Date</span><input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
          </div>

          <div className="mt-7 space-y-3">
            {roles.map((item) => (
              <article key={item.id} className={`rounded-3xl border p-5 ${item.critical && (!item.primary.trim() || ['unassigned', 'unavailable'].includes(item.status)) ? 'border-amber-200 bg-amber-50/60' : 'border-stone-200 bg-stone-50'}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Department</span><select value={item.department} onChange={(e) => updateRole(item.id, { department: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
                    <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Role</span><input value={item.role} onChange={(e) => updateRole(item.id, { role: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                    <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Primary</span><input value={item.primary} onChange={(e) => updateRole(item.id, { primary: e.target.value })} placeholder="Name" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                    <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Backup</span><input value={item.backup} onChange={(e) => updateRole(item.id, { backup: e.target.value })} placeholder="Name" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                    <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Call time</span><input type="time" value={item.callTime} onChange={(e) => updateRole(item.id, { callTime: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                    <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Status</span><select value={item.status} onChange={(e) => updateRole(item.id, { status: e.target.value as RotaStatus })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                    <label className="flex items-end"><button type="button" onClick={() => updateRole(item.id, { critical: !item.critical })} className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold ${item.critical ? 'border-amber-200 bg-amber-100 text-amber-800' : 'border-stone-200 bg-white text-stone-600'}`}>{item.critical ? 'Critical role' : 'Standard role'}</button></label>
                    <label className="md:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Operational note</span><textarea value={item.note} onChange={(e) => updateRole(item.id, { note: e.target.value })} className="min-h-[68px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm" placeholder="Equipment, arrival point, handoff, simple coordination note..." /></label>
                  </div>
                  <button type="button" onClick={() => removeRole(item.id)} className="rounded-xl border border-rose-100 bg-white p-2.5 text-rose-500" aria-label={`Remove ${item.role}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={addRole} className="inline-flex items-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="mr-2 h-4 w-4" /> Add role</button>
            <button type="button" onClick={save} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Rota saved' : 'Save rota privately'}</button>
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <ShieldCheck className="h-8 w-8 text-emerald-300" />
          <h3 className="mt-5 text-3xl font-light">Coverage intelligence that still respects volunteers as people.</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-wider text-stone-500">Confirmed / checked in</p><p className="mt-2 text-2xl font-light">{confirmed} / {roles.length}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-wider text-stone-500">Critical backups missing</p><p className="mt-2 text-2xl font-light">{missingBackups}</p></div>
          </div>

          {criticalGaps.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <div className="flex items-center gap-2 text-amber-200"><AlertTriangle className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-wider">Critical coverage gaps</p></div>
              <ul className="mt-3 space-y-2 text-sm text-amber-50">{criticalGaps.map((item) => <li key={item.id}>• {item.department}: {item.role}</li>)}</ul>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100"><Check className="mb-2 h-4 w-4" /> All critical roles currently have an assigned, available primary with a confirmed/checked-in status.</div>
          )}

          <div className="mt-5 space-y-3 text-xs leading-5 text-stone-400">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="mb-2 h-4 w-4 text-emerald-300" /> Call time helps teams arrive before their first service cue. It is not an attendance score.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><Clock3 className="mb-2 h-4 w-4 text-emerald-300" /> A future backend can send confirmations, detect schedule conflicts, and sync church calendars; this local version does not pretend those integrations already exist.</p>
          </div>

          <div className="mt-6 grid gap-3">
            <Link href="/service-planner" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Open service run sheet</Link>
            <Link href="/activities" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200">Volunteer opportunities →</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
