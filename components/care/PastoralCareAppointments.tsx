'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, HeartHandshake, Phone, Plus, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type CareType = 'pastoral' | 'prayer' | 'grief' | 'marriage-family' | 'benevolence' | 'discipleship' | 'other';
type AppointmentStatus = 'requested' | 'assigned' | 'scheduled' | 'completed' | 'referred';
type PreferredContact = 'phone' | 'in-person' | 'video';
type Appointment = {
  id: string;
  requesterLabel: string;
  careType: CareType;
  owner: string;
  preferredContact: PreferredContact;
  requestedWindow: string;
  scheduledAt: string;
  status: AppointmentStatus;
  consentConfirmed: boolean;
  nextAction: string;
};
type AppointmentState = { items: Appointment[] };

const initial: Appointment[] = [{ id: 'care-1', requesterLabel: 'Care request', careType: 'pastoral', owner: '', preferredContact: 'phone', requestedWindow: '', scheduledAt: '', status: 'requested', consentConfirmed: false, nextAction: 'Assign a trusted care leader.' }];
const defaultState: AppointmentState = { items: initial };
const legacyKey = 'digital-church-pastoral-appointments';
const localPrefix = 'digital-church-pastoral-appointments:v2';

function normalizeAppointments(value: unknown): AppointmentState {
  const data = value && typeof value === 'object' ? value as any : {};
  const careTypes: CareType[] = ['pastoral', 'prayer', 'grief', 'marriage-family', 'benevolence', 'discipleship', 'other'];
  const statuses: AppointmentStatus[] = ['requested', 'assigned', 'scheduled', 'completed', 'referred'];
  const contacts: PreferredContact[] = ['phone', 'in-person', 'video'];
  const items: Appointment[] = Array.isArray(data.items)
    ? data.items.filter((item: unknown) => item && typeof item === 'object').map((item: any, index: number) => ({
        id: typeof item.id === 'string' ? item.id : `care-${index}`,
        requesterLabel: typeof item.requesterLabel === 'string' ? item.requesterLabel : 'Care request',
        careType: careTypes.includes(item.careType) ? item.careType : 'pastoral',
        owner: typeof item.owner === 'string' ? item.owner : '',
        preferredContact: contacts.includes(item.preferredContact) ? item.preferredContact : 'phone',
        requestedWindow: typeof item.requestedWindow === 'string' ? item.requestedWindow : '',
        scheduledAt: typeof item.scheduledAt === 'string' ? item.scheduledAt : '',
        status: statuses.includes(item.status) ? item.status : 'requested',
        consentConfirmed: Boolean(item.consentConfirmed),
        nextAction: typeof item.nextAction === 'string' ? item.nextAction : '',
      }))
    : initial;
  return { items };
}

export function PastoralCareAppointments() {
  const [items, setItems] = useState<Appointment[]>(initial);
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Private browser draft');

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId); setSaved(false); setSyncing(true);
    setSyncMessage(churchId ? 'Loading church care coordination…' : 'Loading private care coordination…');
    try {
      const result = await loadChurchOperationalRecord({ churchId, module: 'pastoral-appointments', recordKey: 'coordination', localStoragePrefix: localPrefix, legacyLocalStorageKey: legacyKey, defaultValue: defaultState, normalize: normalizeAppointments });
      setItems(result.value.items); setSyncMessage(result.message);
    } finally { setSyncing(false); }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduled = useMemo(() => items.filter((item) => item.status === 'scheduled').length, [items]);
  const unowned = useMemo(() => items.filter((item) => !item.owner && item.status !== 'completed').length, [items]);
  const consentMissing = useMemo(() => items.filter((item) => !item.consentConfirmed && item.status !== 'completed').length, [items]);

  const update = (id: string, patch: Partial<Appointment>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const add = () => setItems((current) => [...current, { id: `${Date.now()}`, requesterLabel: 'New care request', careType: 'pastoral', owner: '', preferredContact: 'phone', requestedWindow: '', scheduledAt: '', status: 'requested', consentConfirmed: false, nextAction: '' }]);
  const remove = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  const save = async () => {
    setSyncing(true); setSyncMessage(activeChurchId ? 'Saving care coordination to active church…' : 'Saving private care coordination…');
    try {
      const result = await saveChurchOperationalRecord({ churchId: activeChurchId, module: 'pastoral-appointments', recordKey: 'coordination', title: 'Pastoral appointment coordination', classification: 'SENSITIVE_OPERATIONAL', localStoragePrefix: localPrefix, value: { items } });
      setSaved(true); setSyncMessage(result.message); window.setTimeout(() => setSaved(false), 1500);
    } finally { setSyncing(false); }
  };

  return (
    <section className="mt-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.18fr_0.82fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div><div className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-rose-700"><CalendarDays className="mr-2 h-4 w-4" /> Pastoral care appointments</div><h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Move a care request from “someone should call” to accountable human ownership.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Coordinate assignment, consent, contact preference, scheduling, next action, and referral posture only. Counseling-session content, abuse reports, medical detail, crisis narratives, and safeguarding case notes are prohibited from this coordination board.</p><div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-rose-700" /> {syncing ? 'Syncing…' : syncMessage}</div></div><div className="grid min-w-[200px] grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-stone-950 p-3 text-white"><p className="text-xl font-light">{scheduled}</p><p className="text-[9px] uppercase tracking-wider text-stone-400">Scheduled</p></div><div className="rounded-2xl bg-amber-50 p-3"><p className="text-xl font-light text-amber-800">{unowned}</p><p className="text-[9px] uppercase tracking-wider text-amber-700">Unowned</p></div><div className="rounded-2xl bg-rose-50 p-3"><p className="text-xl font-light text-rose-800">{consentMissing}</p><p className="text-[9px] uppercase tracking-wider text-rose-700">Consent</p></div></div></div>

          <div className="mt-7 space-y-4">{items.map((item) => <article key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Request label</span><input value={item.requesterLabel} onChange={(e) => update(item.id, { requesterLabel: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Care lane</span><select value={item.careType} onChange={(e) => update(item.id, { careType: e.target.value as CareType })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="pastoral">Pastoral</option><option value="prayer">Prayer</option><option value="grief">Grief</option><option value="marriage-family">Marriage / family</option><option value="benevolence">Benevolence</option><option value="discipleship">Discipleship</option><option value="other">Other</option></select></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Human owner</span><input value={item.owner} onChange={(e) => update(item.id, { owner: e.target.value })} placeholder="Pastor / care leader" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Status</span><select value={item.status} onChange={(e) => update(item.id, { status: e.target.value as AppointmentStatus })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="requested">Requested</option><option value="assigned">Assigned</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="referred">Referred</option></select></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Preferred contact</span><select value={item.preferredContact} onChange={(e) => update(item.id, { preferredContact: e.target.value as PreferredContact })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="phone">Phone</option><option value="in-person">In person</option><option value="video">Video</option></select></label><label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Requested window</span><input value={item.requestedWindow} onChange={(e) => update(item.id, { requestedWindow: e.target.value })} placeholder="e.g. weekday evenings" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Scheduled time</span><input type="datetime-local" value={item.scheduledAt} onChange={(e) => update(item.id, { scheduledAt: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label><label className="md:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Next operational action only</span><input value={item.nextAction} onChange={(e) => update(item.id, { nextAction: e.target.value })} placeholder="Call, schedule, refer, confirm transport..." className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="inline-flex items-center gap-2 text-xs font-medium text-stone-600"><input type="checkbox" checked={item.consentConfirmed} onChange={(e) => update(item.id, { consentConfirmed: e.target.checked })} className="h-4 w-4 rounded" /> Contact consent/permission confirmed</label><button type="button" onClick={() => remove(item.id)} className="inline-flex items-center rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-semibold text-rose-600"><Trash2 className="mr-1.5 h-4 w-4" /> Remove</button></div></article>)}</div>

          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={add} className="inline-flex items-center rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white"><Plus className="mr-2 h-4 w-4" /> Add care appointment</button><button type="button" onClick={() => void save()} disabled={syncing} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 disabled:opacity-60"><Check className="mr-2 h-4 w-4" /> {syncing ? 'Syncing…' : saved ? 'Saved' : activeChurchId ? 'Save to active church' : 'Save private coordination'}</button></div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10"><HeartHandshake className="h-8 w-8 text-rose-300" /><h3 className="mt-5 text-3xl font-light">Care coordination is not the counseling record.</h3><div className="mt-6 space-y-3 text-sm leading-6 text-stone-300"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="mb-2 h-5 w-5 text-rose-300" /><strong className="text-white">Human ownership.</strong> Every open request should have a named accountable leader or appropriate referral pathway.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Phone className="mb-2 h-5 w-5 text-rose-300" /><strong className="text-white">Consent-aware contact.</strong> Respect contact preference and permission before initiating non-emergency follow-up.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-2 h-5 w-5 text-rose-300" /><strong className="text-white">Sensitive records elsewhere.</strong> Abuse reports, clinical notes, counseling detail, medical information, and crisis documentation require restricted systems and trained human handling.</div></div><Link href="/follow-up/manage" className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open discipleship follow-up →</Link></aside>
      </div>
    </section>
  );
}
