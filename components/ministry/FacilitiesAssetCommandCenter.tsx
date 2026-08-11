'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Building2, Check, Plus, ShieldCheck, Trash2, Wrench } from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type Status = 'ready' | 'attention' | 'offline' | 'reserved';
type Asset = { id: string; name: string; area: string; owner: string; status: Status; nextCheck: string; nextAction: string; critical: boolean };

const seed: Asset[] = [
  { id: 'audio', name: 'Main audio system', area: 'Auditorium', owner: '', status: 'ready', nextCheck: '', nextAction: '', critical: true },
  { id: 'display', name: 'Presentation displays', area: 'Auditorium', owner: '', status: 'ready', nextCheck: '', nextAction: '', critical: true },
  { id: 'children', name: 'Children room readiness', area: 'Children ministry', owner: '', status: 'ready', nextCheck: '', nextAction: '', critical: true },
  { id: 'power', name: 'Backup power', area: 'Facilities', owner: '', status: 'ready', nextCheck: '', nextAction: '', critical: true },
];

const legacyKey = 'digital-church-facility-assets';
const localPrefix = 'digital-church-facility-assets:v2';

function normalizeAssets(value: unknown): Asset[] {
  if (!Array.isArray(value)) return seed;
  return value.filter((item) => item && typeof item === 'object').map((item: any, index) => ({
    id: typeof item.id === 'string' ? item.id : `asset-${index}`,
    name: typeof item.name === 'string' ? item.name : 'Asset or room',
    area: typeof item.area === 'string' ? item.area : '',
    owner: typeof item.owner === 'string' ? item.owner : '',
    status: ['ready', 'attention', 'offline', 'reserved'].includes(item.status) ? item.status : 'ready',
    nextCheck: typeof item.nextCheck === 'string' ? item.nextCheck : '',
    nextAction: typeof item.nextAction === 'string' ? item.nextAction : '',
    critical: Boolean(item.critical),
  }));
}

export function FacilitiesAssetCommandCenter() {
  const [assets, setAssets] = useState<Asset[]>(seed);
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Private browser draft');

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId);
    setSaved(false);
    setSyncing(true);
    setSyncMessage(churchId ? 'Loading church facilities…' : 'Loading private facilities draft…');
    try {
      const result = await loadChurchOperationalRecord({
        churchId,
        module: 'facilities',
        recordKey: 'assets',
        localStoragePrefix: localPrefix,
        legacyLocalStorageKey: legacyKey,
        defaultValue: seed,
        normalize: normalizeAssets,
      });
      setAssets(result.value);
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

  const attention = useMemo(() => assets.filter((item) => item.status === 'attention' || item.status === 'offline').length, [assets]);
  const criticalOffline = useMemo(() => assets.filter((item) => item.critical && item.status === 'offline').length, [assets]);

  const update = (id: string, patch: Partial<Asset>) => setAssets((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const add = () => setAssets((current) => [...current, { id: `${Date.now()}`, name: 'New asset or room', area: '', owner: '', status: 'ready', nextCheck: '', nextAction: '', critical: false }]);
  const save = async () => {
    setSyncing(true);
    setSyncMessage(activeChurchId ? 'Saving facilities to active church…' : 'Saving private facilities draft…');
    try {
      const result = await saveChurchOperationalRecord({
        churchId: activeChurchId,
        module: 'facilities',
        recordKey: 'assets',
        title: 'Facilities & asset readiness',
        localStoragePrefix: localPrefix,
        value: assets,
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
              <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-800"><Building2 className="mr-2 h-4 w-4" /> Facilities & assets</div>
              <h1 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-5xl">Know what the church building depends on before people arrive.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Track rooms and equipment, ownership, condition, next checks, and required actions in one operational workspace. Shared state is scoped to the active church tenant.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-amber-700" /> {syncing ? 'Syncing…' : syncMessage}</div>
            </div>
            <div className="grid min-w-[185px] grid-cols-2 gap-2 text-center"><div className="rounded-2xl bg-amber-50 p-3"><p className="text-2xl font-light text-amber-800">{attention}</p><p className="text-[9px] uppercase tracking-wider text-amber-700">Need attention</p></div><div className="rounded-2xl bg-rose-50 p-3"><p className="text-2xl font-light text-rose-800">{criticalOffline}</p><p className="text-[9px] uppercase tracking-wider text-rose-700">Critical offline</p></div></div>
          </div>

          <div className="mt-7 space-y-4">
            {assets.map((asset) => (
              <article key={asset.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Asset / room</span><input value={asset.name} onChange={(e) => update(asset.id, { name: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Area</span><input value={asset.area} onChange={(e) => update(asset.id, { area: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Owner</span><input value={asset.owner} onChange={(e) => update(asset.id, { owner: e.target.value })} placeholder="Facilities / tech lead" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Status</span><select value={asset.status} onChange={(e) => update(asset.id, { status: e.target.value as Status })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="ready">Ready</option><option value="attention">Needs attention</option><option value="offline">Offline</option><option value="reserved">Reserved</option></select></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Next check</span><input type="date" value={asset.nextCheck} onChange={(e) => update(asset.id, { nextCheck: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label className="md:col-span-2 xl:col-span-3"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Next action</span><input value={asset.nextAction} onChange={(e) => update(asset.id, { nextAction: e.target.value })} placeholder="Test, repair, replace, reserve..." className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                </div>
                <div className="mt-4 flex items-center justify-between"><label className="inline-flex items-center gap-2 text-xs font-medium text-stone-600"><input type="checkbox" checked={asset.critical} onChange={(e) => update(asset.id, { critical: e.target.checked })} className="h-4 w-4 rounded" /> Critical for service operations</label><button type="button" onClick={() => setAssets((current) => current.filter((item) => item.id !== asset.id))} className="rounded-xl border border-rose-100 bg-white p-2 text-rose-600" aria-label="Remove asset"><Trash2 className="h-4 w-4" /></button></div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={add} className="inline-flex items-center rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white"><Plus className="mr-2 h-4 w-4" /> Add asset</button><button type="button" onClick={() => void save()} disabled={syncing} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 disabled:opacity-60"><Check className="mr-2 h-4 w-4" /> {syncing ? 'Syncing…' : saved ? 'Saved' : activeChurchId ? 'Save to active church' : 'Save private plan'}</button></div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10"><Wrench className="h-8 w-8 text-amber-300" /><h2 className="mt-5 text-3xl font-light">Operational visibility for rooms and equipment.</h2><p className="mt-4 text-sm leading-6 text-stone-300">Use this workspace to coordinate owners and follow-up. Formal inspections, repairs, certifications, and specialist maintenance remain with qualified people and the church’s official records.</p><div className="mt-6 grid gap-3"><Link href="/service-planner" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open service planner →</Link><Link href="/events" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open events →</Link></div></aside>
      </div>
    </section>
  );
}
