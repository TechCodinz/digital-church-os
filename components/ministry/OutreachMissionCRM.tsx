'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, HandHeart, MapPin, Megaphone, Plus, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type Status = 'identified' | 'contacted' | 'engaged' | 'follow-up' | 'connected' | 'closed';
type OutreachItem = {
  id: string;
  personOrCommunity: string;
  area: string;
  initiative: string;
  owner: string;
  status: Status;
  consentToContact: boolean;
  nextAction: string;
  due: string;
  needSummary: string;
  outcome: string;
};

const legacyKey = 'digital-church-outreach-crm';
const localPrefix = 'digital-church-outreach-crm:v2';
const seed: OutreachItem[] = [
  { id: 'community-1', personOrCommunity: 'Community contact', area: '', initiative: 'Local outreach', owner: '', status: 'identified', consentToContact: false, nextAction: '', due: '', needSummary: '', outcome: '' },
];

function normalizeItems(value: unknown): OutreachItem[] {
  if (!Array.isArray(value)) return seed;
  return value.filter((item) => item && typeof item === 'object').map((item: any, index) => ({
    id: typeof item.id === 'string' ? item.id : `outreach-${index}`,
    personOrCommunity: typeof item.personOrCommunity === 'string' ? item.personOrCommunity : 'Community contact',
    area: typeof item.area === 'string' ? item.area : '',
    initiative: typeof item.initiative === 'string' ? item.initiative : '',
    owner: typeof item.owner === 'string' ? item.owner : '',
    status: ['identified', 'contacted', 'engaged', 'follow-up', 'connected', 'closed'].includes(item.status) ? item.status : 'identified',
    consentToContact: Boolean(item.consentToContact),
    nextAction: typeof item.nextAction === 'string' ? item.nextAction : '',
    due: typeof item.due === 'string' ? item.due : '',
    needSummary: typeof item.needSummary === 'string' ? item.needSummary : '',
    outcome: typeof item.outcome === 'string' ? item.outcome : '',
  }));
}

export function OutreachMissionCRM() {
  const [items, setItems] = useState<OutreachItem[]>(seed);
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Private browser draft');

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId);
    setSaved(false);
    setSyncing(true);
    setSyncMessage(churchId ? 'Loading church outreach CRM…' : 'Loading private outreach draft…');
    try {
      const result = await loadChurchOperationalRecord({
        churchId,
        module: 'outreach',
        recordKey: 'crm',
        localStoragePrefix: localPrefix,
        legacyLocalStorageKey: legacyKey,
        defaultValue: seed,
        normalize: normalizeItems,
      });
      setItems(result.value);
      setSyncMessage(result.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(() => items.filter((item) => !['connected', 'closed'].includes(item.status)).length, [items]);
  const unowned = useMemo(() => items.filter((item) => !item.owner && !['connected', 'closed'].includes(item.status)).length, [items]);
  const followUp = useMemo(() => items.filter((item) => item.status === 'follow-up').length, [items]);

  const update = (id: string, patch: Partial<OutreachItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const add = () => setItems((current) => [...current, { id: `${Date.now()}`, personOrCommunity: 'New outreach contact', area: '', initiative: '', owner: '', status: 'identified', consentToContact: false, nextAction: '', due: '', needSummary: '', outcome: '' }]);
  const save = async () => {
    setSyncing(true);
    setSyncMessage(activeChurchId ? 'Saving outreach CRM to active church…' : 'Saving private outreach draft…');
    try {
      const result = await saveChurchOperationalRecord({
        churchId: activeChurchId,
        module: 'outreach',
        recordKey: 'crm',
        title: 'Outreach & mission follow-up',
        classification: 'SENSITIVE_OPERATIONAL',
        localStoragePrefix: localPrefix,
        value: items,
      });
      setSaved(true);
      setSyncMessage(result.message);
      window.setTimeout(() => setSaved(false), 1500);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700"><HandHeart className="mr-2 h-4 w-4" /> Outreach & mission CRM</div>
              <h1 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-5xl">Turn outreach activity into respectful, accountable follow-up.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Track community contacts, initiative ownership, permission to contact, needs, next actions, deadlines, connection outcomes, and ministry handoffs without treating people like sales leads. Shared contact data is tenant-scoped and marked sensitive operational.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-emerald-700" /> {syncing ? 'Syncing…' : syncMessage}</div>
            </div>
            <div className="grid min-w-[205px] grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-stone-950 p-3 text-white"><p className="text-xl font-light">{active}</p><p className="text-[9px] uppercase tracking-wider text-stone-400">Active</p></div><div className="rounded-2xl bg-amber-50 p-3"><p className="text-xl font-light text-amber-800">{unowned}</p><p className="text-[9px] uppercase tracking-wider text-amber-700">Unowned</p></div><div className="rounded-2xl bg-emerald-50 p-3"><p className="text-xl font-light text-emerald-800">{followUp}</p><p className="text-[9px] uppercase tracking-wider text-emerald-700">Follow-up</p></div></div>
          </div>

          <div className="mt-7 space-y-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Person / community label</span><input value={item.personOrCommunity} onChange={(e) => update(item.id, { personOrCommunity: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Area / neighborhood</span><input value={item.area} onChange={(e) => update(item.id, { area: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Initiative</span><input value={item.initiative} onChange={(e) => update(item.id, { initiative: e.target.value })} placeholder="Food drive, invitation, school visit..." className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Human owner</span><input value={item.owner} onChange={(e) => update(item.id, { owner: e.target.value })} placeholder="Outreach leader" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Status</span><select value={item.status} onChange={(e) => update(item.id, { status: e.target.value as Status })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="identified">Identified</option><option value="contacted">Contacted</option><option value="engaged">Engaged</option><option value="follow-up">Follow-up</option><option value="connected">Connected</option><option value="closed">Closed / no further contact</option></select></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Due date</span><input type="date" value={item.due} onChange={(e) => update(item.id, { due: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Next action</span><input value={item.nextAction} onChange={(e) => update(item.id, { nextAction: e.target.value })} placeholder="Invite, call, deliver support, connect to care..." className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Need summary</span><textarea value={item.needSummary} onChange={(e) => update(item.id, { needSummary: e.target.value })} className="min-h-[86px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-6" placeholder="Keep this operational and minimal; move sensitive care details to the care system." /></label>
                  <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Outcome / connection</span><textarea value={item.outcome} onChange={(e) => update(item.id, { outcome: e.target.value })} className="min-h-[86px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-6" placeholder="Connected to group, care, event, church, or closed respectfully..." /></label>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3"><label className="inline-flex items-center gap-2 text-xs font-medium text-stone-600"><input type="checkbox" checked={item.consentToContact} onChange={(e) => update(item.id, { consentToContact: e.target.checked })} className="h-4 w-4 rounded" /> Permission to contact again is recorded</label><button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="inline-flex items-center rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-semibold text-rose-600"><Trash2 className="mr-1.5 h-4 w-4" /> Remove</button></div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={add} className="inline-flex items-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"><Plus className="mr-2 h-4 w-4" /> Add outreach contact</button><button type="button" onClick={() => void save()} disabled={syncing} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 disabled:opacity-60"><Check className="mr-2 h-4 w-4" /> {syncing ? 'Syncing…' : saved ? 'Saved' : activeChurchId ? 'Save to active church' : 'Save private outreach board'}</button></div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10"><Megaphone className="h-8 w-8 text-emerald-300" /><h2 className="mt-5 text-3xl font-light">Mission follow-up without sales-pressure behavior.</h2><div className="mt-6 space-y-3 text-sm leading-6 text-stone-300"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="mb-2 h-5 w-5 text-emerald-300" /><strong className="text-white">Respect refusal.</strong> “Closed / no further contact” is a valid outcome and should stop repeated outreach.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><MapPin className="mb-2 h-5 w-5 text-emerald-300" /><strong className="text-white">Community awareness.</strong> Organize initiatives by neighborhood or ministry context so the church can learn where service capacity is actually needed.</div></div><div className="mt-6 grid gap-3"><Link href="/communications" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open communications →</Link><Link href="/care" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open care handoff →</Link><Link href="/groups" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open groups →</Link></div></aside>
      </div>
    </section>
  );
}
