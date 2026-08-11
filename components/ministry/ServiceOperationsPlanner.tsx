'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clock3,
  Plus,
  Radio,
  Save,
  ShieldCheck,
  Trash2,
  UsersRound,
} from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type ServiceBlockKind = 'gather' | 'worship' | 'scripture' | 'sermon' | 'prayer' | 'communion' | 'announcement' | 'response' | 'sending' | 'other';
type ReadinessKey = 'stream' | 'slides' | 'audio' | 'accessibility' | 'workers' | 'children' | 'care' | 'rights' | 'backup';

type ServiceBlock = {
  id: string;
  kind: ServiceBlockKind;
  title: string;
  owner: string;
  minutes: number;
  cue: string;
  notes: string;
};

type ServicePlanState = {
  serviceName: string;
  serviceDate: string;
  startTime: string;
  location: string;
  serviceLead: string;
  backupLead: string;
  blocks: ServiceBlock[];
  ready: ReadinessKey[];
  risk: string;
};

const kinds: Array<{ id: ServiceBlockKind; label: string }> = [
  { id: 'gather', label: 'Gather / welcome' },
  { id: 'worship', label: 'Worship' },
  { id: 'scripture', label: 'Scripture' },
  { id: 'sermon', label: 'Sermon / teaching' },
  { id: 'prayer', label: 'Prayer / ministry' },
  { id: 'communion', label: 'Communion' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'response', label: 'Response / follow-up' },
  { id: 'sending', label: 'Sending / benediction' },
  { id: 'other', label: 'Other' },
];

const readinessItems: Array<{ id: ReadinessKey; title: string; detail: string }> = [
  { id: 'stream', title: 'Broadcast / stream', detail: 'Primary stream destination, operator, network, and fallback confirmed.' },
  { id: 'slides', title: 'Slides / projection', detail: 'Lyrics, Scripture, sermon visuals, notices, and response QR/link reviewed.' },
  { id: 'audio', title: 'Audio / microphones', detail: 'Inputs, batteries, monitors, recording, and backup microphone checked.' },
  { id: 'accessibility', title: 'Accessibility', detail: 'Captions, readable screens, interpretation/translation, seating, and assistance considered.' },
  { id: 'workers', title: 'Volunteer coverage', detail: 'Every critical role has a primary owner and an escalation/backup plan.' },
  { id: 'children', title: 'Children & family', detail: 'Check-in, trusted adults, room coverage, safeguarding, and guardian flow ready.' },
  { id: 'care', title: 'Prayer & care response', detail: 'Prayer team, pastoral follow-up, response pathway, and sensitive-care escalation ready.' },
  { id: 'rights', title: 'Media / rights', detail: 'Songs, recordings, videos, images, and distribution permissions reviewed.' },
  { id: 'backup', title: 'Contingency plan', detail: 'Power, internet, presenter, stream, audio, and key-leader fallback identified.' },
];

const defaultBlocks: ServiceBlock[] = [
  { id: 'welcome', kind: 'gather', title: 'Welcome & call to worship', owner: '', minutes: 5, cue: 'House ready → host live', notes: '' },
  { id: 'worship', kind: 'worship', title: 'Congregational worship', owner: '', minutes: 25, cue: 'Band ready → worship lead', notes: '' },
  { id: 'scripture', kind: 'scripture', title: 'Scripture reading', owner: '', minutes: 5, cue: 'Reader mic live', notes: '' },
  { id: 'sermon', kind: 'sermon', title: 'Sermon', owner: '', minutes: 35, cue: 'Teaching mic + sermon slides', notes: '' },
  { id: 'response', kind: 'response', title: 'Prayer & response', owner: '', minutes: 12, cue: 'Prayer team ready', notes: '' },
  { id: 'sending', kind: 'sending', title: 'Benediction & next steps', owner: '', minutes: 5, cue: 'Response links visible', notes: '' },
];

const defaultPlan: ServicePlanState = {
  serviceName: 'Sunday Worship Service',
  serviceDate: '',
  startTime: '10:00',
  location: 'Main sanctuary + online',
  serviceLead: '',
  backupLead: '',
  blocks: defaultBlocks,
  ready: [],
  risk: '',
};

const localPrefix = 'digital-church-service-operations-plan:v2';
const legacyLocalKey = 'digital-church-service-operations-plan:v1';

function normalizePlan(value: unknown): ServicePlanState {
  const data = value && typeof value === 'object' ? value as Partial<ServicePlanState> : {};
  return {
    serviceName: typeof data.serviceName === 'string' ? data.serviceName : defaultPlan.serviceName,
    serviceDate: typeof data.serviceDate === 'string' ? data.serviceDate : '',
    startTime: typeof data.startTime === 'string' ? data.startTime : defaultPlan.startTime,
    location: typeof data.location === 'string' ? data.location : defaultPlan.location,
    serviceLead: typeof data.serviceLead === 'string' ? data.serviceLead : '',
    backupLead: typeof data.backupLead === 'string' ? data.backupLead : '',
    blocks: Array.isArray(data.blocks) ? data.blocks : defaultBlocks,
    ready: Array.isArray(data.ready) ? data.ready.filter((item): item is ReadinessKey => readinessItems.some((entry) => entry.id === item)) : [],
    risk: typeof data.risk === 'string' ? data.risk : '',
  };
}

function formatClock(totalMinutes: number, startTime: string) {
  const [hourText, minuteText] = startTime.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return '';
  const date = new Date(2000, 0, 1, hour, minute + totalMinutes);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function ServiceOperationsPlanner() {
  const [serviceName, setServiceName] = useState(defaultPlan.serviceName);
  const [serviceDate, setServiceDate] = useState('');
  const [startTime, setStartTime] = useState(defaultPlan.startTime);
  const [location, setLocation] = useState(defaultPlan.location);
  const [serviceLead, setServiceLead] = useState('');
  const [backupLead, setBackupLead] = useState('');
  const [blocks, setBlocks] = useState<ServiceBlock[]>(defaultBlocks);
  const [ready, setReady] = useState<ReadinessKey[]>([]);
  const [risk, setRisk] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Private browser draft');

  const applyPlan = (plan: ServicePlanState) => {
    setServiceName(plan.serviceName);
    setServiceDate(plan.serviceDate);
    setStartTime(plan.startTime);
    setLocation(plan.location);
    setServiceLead(plan.serviceLead);
    setBackupLead(plan.backupLead);
    setBlocks(plan.blocks);
    setReady(plan.ready);
    setRisk(plan.risk);
  };

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId);
    setSaved(false);
    setSyncing(true);
    setSyncMessage(churchId ? 'Loading active church service plan…' : 'Loading private service draft…');
    try {
      const result = await loadChurchOperationalRecord({
        churchId,
        module: 'service-planner',
        recordKey: 'current',
        localStoragePrefix: localPrefix,
        legacyLocalStorageKey: legacyLocalKey,
        defaultValue: defaultPlan,
        normalize: normalizePlan,
      });
      applyPlan(result.value);
      setSyncMessage(result.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // Workspace changes are the explicit reload boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalMinutes = useMemo(() => blocks.reduce((sum, block) => sum + (Number(block.minutes) || 0), 0), [blocks]);
  const readiness = useMemo(() => Math.round((ready.length / readinessItems.length) * 100), [ready.length]);
  const missingOwners = useMemo(() => blocks.filter((block) => !block.owner.trim()).length, [blocks]);

  const save = async () => {
    const value: ServicePlanState = { serviceName, serviceDate, startTime, location, serviceLead, backupLead, blocks, ready, risk };
    setSyncing(true);
    setSyncMessage(activeChurchId ? 'Saving service plan to active church…' : 'Saving private service draft…');
    try {
      const result = await saveChurchOperationalRecord({
        churchId: activeChurchId,
        module: 'service-planner',
        recordKey: 'current',
        title: serviceDate ? `${serviceName} · ${serviceDate}` : serviceName,
        localStoragePrefix: localPrefix,
        value,
      });
      setSaved(true);
      setSyncMessage(result.message);
      window.setTimeout(() => setSaved(false), 1600);
    } finally {
      setSyncing(false);
    }
  };

  const updateBlock = (id: string, patch: Partial<ServiceBlock>) => setBlocks((current) => current.map((block) => block.id === id ? { ...block, ...patch } : block));
  const addBlock = () => setBlocks((current) => [...current, { id: `${Date.now()}`, kind: 'other', title: 'New service moment', owner: '', minutes: 5, cue: '', notes: '' }]);
  const removeBlock = (id: string) => setBlocks((current) => current.filter((block) => block.id !== id));
  const toggleReady = (id: ReadinessKey) => setReady((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.14fr_0.86fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700"><Radio className="mr-2 h-4 w-4" /> Service operations planner</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Run the entire service from one accountable timeline—not disconnected chats and last-minute memory.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Coordinate people, timing, cues, broadcast, slides, accessibility, children, prayer/care response, media rights, and contingencies. With an active church workspace, this plan is shared only with authorized leaders of that church.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-blue-700" /> {syncing ? 'Syncing…' : syncMessage}</div>
            </div>
            <div className="min-w-[200px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Planned service</p>
              <p className="mt-1 text-3xl font-light">{totalMinutes} min</p>
              <p className="mt-2 text-xs text-stone-400">{blocks.length} moments · ends {formatClock(totalMinutes, startTime) || '—'}</p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Service</span><input value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Date</span><input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Start time</span><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Location / channel</span><input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Service lead</span><input value={serviceLead} onChange={(e) => setServiceLead(e.target.value)} placeholder="Coordinator / pastor" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Backup lead</span><input value={backupLead} onChange={(e) => setBackupLead(e.target.value)} placeholder="Escalation owner" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
          </div>

          <div className="mt-7 space-y-3">
            {blocks.map((block, index) => {
              const elapsed = blocks.slice(0, index).reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
              return (
                <article key={block.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <div className="w-24 shrink-0 rounded-2xl bg-white p-3 text-center shadow-sm">
                      <Clock3 className="mx-auto h-4 w-4 text-blue-600" />
                      <p className="mt-1 text-sm font-semibold text-stone-900">{formatClock(elapsed, startTime) || `+${elapsed}m`}</p>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">Start</p>
                    </div>
                    <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Moment</span><input value={block.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Type</span><select value={block.kind} onChange={(e) => updateBlock(block.id, { kind: e.target.value as ServiceBlockKind })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">{kinds.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Minutes</span><input type="number" min="0" max="180" value={block.minutes} onChange={(e) => updateBlock(block.id, { minutes: Number(e.target.value) })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Owner</span><input value={block.owner} onChange={(e) => updateBlock(block.id, { owner: e.target.value })} placeholder="Named leader / team" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Production cue</span><input value={block.cue} onChange={(e) => updateBlock(block.id, { cue: e.target.value })} placeholder="Mic, slides, camera, stage, stream cue..." className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label className="md:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Notes / transition / fallback</span><textarea value={block.notes} onChange={(e) => updateBlock(block.id, { notes: e.target.value })} className="min-h-[72px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-5" /></label>
                    </div>
                    <button type="button" onClick={() => removeBlock(block.id)} className="rounded-xl border border-rose-100 bg-white p-2.5 text-rose-500" aria-label={`Remove ${block.title}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={addBlock} className="inline-flex items-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"><Plus className="mr-2 h-4 w-4" /> Add service moment</button>
            <button type="button" onClick={() => void save()} disabled={syncing} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 disabled:opacity-60">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{syncing ? 'Syncing…' : saved ? 'Saved' : activeChurchId ? 'Save to active church' : 'Save private plan'}</button>
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <ShieldCheck className="h-8 w-8 text-blue-300" />
          <h3 className="mt-5 text-3xl font-light">Service readiness without pretending every check is automatic.</h3>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs font-semibold"><span>Readiness reviewed</span><span>{readiness}%</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-blue-400" style={{ width: `${readiness}%` }} /></div>
            <p className={`mt-3 text-xs ${missingOwners === 0 ? 'text-sage-300' : 'text-amber-300'}`}>{missingOwners === 0 ? 'Every service moment has an owner.' : `${missingOwners} service moment${missingOwners === 1 ? '' : 's'} still need an owner.`}</p>
          </div>

          <div className="mt-5 space-y-2">
            {readinessItems.map((item) => {
              const done = ready.includes(item.id);
              return <button key={item.id} type="button" onClick={() => toggleReady(item.id)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${done ? 'border-sage-300/20 bg-sage-300/10' : 'border-white/10 bg-white/5'}`}><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${done ? 'bg-sage-500 text-white' : 'border border-white/20'}`}>{done && <Check className="h-3.5 w-3.5" />}</span><span><strong className="text-sm text-white">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-stone-400">{item.detail}</span></span></button>;
            })}
          </div>

          <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Known risk / fallback note</span><textarea value={risk} onChange={(e) => setRisk(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-amber-300/40" placeholder="Internet instability, absent volunteer, generator issue, translation gap, pastoral coverage..." /></label>

          <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><AlertTriangle className="mb-2 h-4 w-4" /> A checked item means a leader reviewed it; it does not prove the underlying system is healthy. Critical technical, safeguarding, financial, or care checks should still use their dedicated systems and human owners.</div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link href="/admin/workers" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-sage-200"><UsersRound className="mr-2 h-4 w-4" /> Check volunteer coverage</Link>
            <Link href="/presentation" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-blue-200">Review presentation →</Link>
            <Link href="/live-service" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"><Radio className="mr-2 h-4 w-4" /> Open live service</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
