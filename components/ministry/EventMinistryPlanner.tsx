'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Plus,
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

type EventType = 'service' | 'conference' | 'prayer' | 'outreach' | 'youth' | 'children' | 'training' | 'rehearsal' | 'community' | 'other';
type RegistrationMode = 'open' | 'approval' | 'invite' | 'none';
type EventTask = { id: string; title: string; owner: string; due: string; completed: boolean };
type ReadinessKey = 'venue' | 'registration' | 'workers' | 'safeguarding' | 'accessibility' | 'media' | 'communication' | 'care' | 'contingency';
type EventPlanState = {
  title: string;
  eventType: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  owner: string;
  capacity: number;
  registrationMode: RegistrationMode;
  purpose: string;
  audience: string;
  tasks: EventTask[];
  ready: ReadinessKey[];
};

const readinessItems: Array<{ id: ReadinessKey; title: string; note: string }> = [
  { id: 'venue', title: 'Venue & facilities', note: 'Space, seating, power, restrooms, access, signage, and cleanup reviewed.' },
  { id: 'registration', title: 'Registration flow', note: 'Capacity, approval rules, arrival/check-in, and attendee communication are clear.' },
  { id: 'workers', title: 'Workers & departments', note: 'Owners, volunteers, call times, backups, and escalation paths are assigned.' },
  { id: 'safeguarding', title: 'Safeguarding', note: 'Children, vulnerable people, trusted adults, permissions, and reporting pathways reviewed.' },
  { id: 'accessibility', title: 'Accessibility', note: 'Mobility, captions, interpretation/translation, readable content, and assistance considered.' },
  { id: 'media', title: 'Media / AV / rights', note: 'Sound, projection, recording, streaming, music/media permissions, and backup checked.' },
  { id: 'communication', title: 'Communication', note: 'Invitations, reminders, location details, changes, and follow-up messages prepared.' },
  { id: 'care', title: 'Prayer & pastoral response', note: 'Prayer/care team and appropriate human follow-up are ready where relevant.' },
  { id: 'contingency', title: 'Contingency', note: 'Weather, power, internet, medical incident, transport, and cancellation/change plan reviewed.' },
];

const defaultTasks: EventTask[] = [
  { id: 'brief', title: 'Approve event brief and ministry purpose', owner: '', due: '', completed: false },
  { id: 'venue', title: 'Confirm venue / room / online channel', owner: '', due: '', completed: false },
  { id: 'rota', title: 'Confirm worker and volunteer coverage', owner: '', due: '', completed: false },
  { id: 'comms', title: 'Prepare invitation and attendee information', owner: '', due: '', completed: false },
  { id: 'response', title: 'Prepare prayer, care, and post-event follow-up', owner: '', due: '', completed: false },
];

const defaultState: EventPlanState = {
  title: '', eventType: 'community', date: '', startTime: '', endTime: '', location: '', owner: '', capacity: 100,
  registrationMode: 'open', purpose: '', audience: '', tasks: defaultTasks, ready: [],
};
const legacyKey = 'digital-church-event-ministry-plan:v1';
const localPrefix = 'digital-church-event-ministry-plan:v2';

function normalizeEvent(value: unknown): EventPlanState {
  const data = value && typeof value === 'object' ? value as any : {};
  const eventTypes: EventType[] = ['service', 'conference', 'prayer', 'outreach', 'youth', 'children', 'training', 'rehearsal', 'community', 'other'];
  const registrationModes: RegistrationMode[] = ['open', 'approval', 'invite', 'none'];
  const tasks: EventTask[] = Array.isArray(data.tasks)
    ? data.tasks.filter((task: unknown) => task && typeof task === 'object').map((task: any, index: number) => ({
        id: typeof task.id === 'string' ? task.id : `task-${index}`,
        title: typeof task.title === 'string' ? task.title : 'Event task',
        owner: typeof task.owner === 'string' ? task.owner : '',
        due: typeof task.due === 'string' ? task.due : '',
        completed: Boolean(task.completed),
      }))
    : defaultTasks;
  const ready = Array.isArray(data.ready)
    ? data.ready.filter((item: unknown): item is ReadinessKey => readinessItems.some((entry) => entry.id === item))
    : [];

  return {
    title: typeof data.title === 'string' ? data.title : '',
    eventType: eventTypes.includes(data.eventType) ? data.eventType : 'community',
    date: typeof data.date === 'string' ? data.date : '',
    startTime: typeof data.startTime === 'string' ? data.startTime : '',
    endTime: typeof data.endTime === 'string' ? data.endTime : '',
    location: typeof data.location === 'string' ? data.location : '',
    owner: typeof data.owner === 'string' ? data.owner : '',
    capacity: Number.isFinite(Number(data.capacity)) ? Math.max(1, Number(data.capacity)) : 100,
    registrationMode: registrationModes.includes(data.registrationMode) ? data.registrationMode : 'open',
    purpose: typeof data.purpose === 'string' ? data.purpose : '',
    audience: typeof data.audience === 'string' ? data.audience : '',
    tasks,
    ready,
  };
}

export function EventMinistryPlanner() {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('community');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [owner, setOwner] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>('open');
  const [purpose, setPurpose] = useState('');
  const [audience, setAudience] = useState('');
  const [tasks, setTasks] = useState<EventTask[]>(defaultTasks);
  const [ready, setReady] = useState<ReadinessKey[]>([]);
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Private browser draft');

  const applyState = (state: EventPlanState) => {
    setTitle(state.title); setEventType(state.eventType); setDate(state.date); setStartTime(state.startTime); setEndTime(state.endTime);
    setLocation(state.location); setOwner(state.owner); setCapacity(state.capacity); setRegistrationMode(state.registrationMode);
    setPurpose(state.purpose); setAudience(state.audience); setTasks(state.tasks); setReady(state.ready);
  };

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId); setSaved(false); setSyncing(true);
    setSyncMessage(churchId ? 'Loading church event plan…' : 'Loading private event draft…');
    try {
      const result = await loadChurchOperationalRecord({ churchId, module: 'events', recordKey: 'current-plan', localStoragePrefix: localPrefix, legacyLocalStorageKey: legacyKey, defaultValue: defaultState, normalize: normalizeEvent });
      applyState(result.value); setSyncMessage(result.message);
    } finally { setSyncing(false); }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readiness = useMemo(() => Math.round((ready.length / readinessItems.length) * 100), [ready.length]);
  const taskProgress = useMemo(() => Math.round((tasks.filter((task) => task.completed).length / Math.max(tasks.length, 1)) * 100), [tasks]);
  const unownedTasks = useMemo(() => tasks.filter((task) => !task.owner.trim()).length, [tasks]);

  const updateTask = (id: string, patch: Partial<EventTask>) => setTasks((current) => current.map((task) => task.id === id ? { ...task, ...patch } : task));
  const addTask = () => setTasks((current) => [...current, { id: `${Date.now()}`, title: 'New event task', owner: '', due: '', completed: false }]);
  const removeTask = (id: string) => setTasks((current) => current.filter((task) => task.id !== id));
  const toggleReady = (id: ReadinessKey) => setReady((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const save = async () => {
    const value: EventPlanState = { title, eventType, date, startTime, endTime, location, owner, capacity, registrationMode, purpose, audience, tasks, ready };
    setSyncing(true); setSyncMessage(activeChurchId ? 'Saving event plan to active church…' : 'Saving private event draft…');
    try {
      const result = await saveChurchOperationalRecord({ churchId: activeChurchId, module: 'events', recordKey: 'current-plan', title: title || 'Church event ministry plan', classification: 'SENSITIVE_OPERATIONAL', localStoragePrefix: localPrefix, value });
      setSaved(true); setSyncMessage(result.message); window.setTimeout(() => setSaved(false), 1600);
    } finally { setSyncing(false); }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.12fr_0.88fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-fuchsia-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-700"><CalendarDays className="mr-2 h-4 w-4" /> Church events & ministry calendar</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Plan events around ministry purpose, people, readiness, safeguarding, accessibility, and follow-through.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">This tenant-scoped plan covers the operational event brief and readiness workflow. It does not claim live ticketing, attendee payment collection, SMS delivery, or external calendar sync until those providers are connected.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-fuchsia-700" /> {syncing ? 'Syncing…' : syncMessage}</div>
            </div>
            <div className="min-w-[190px] rounded-2xl bg-stone-950 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Event readiness</p><p className="mt-1 text-4xl font-light">{readiness}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-fuchsia-400" style={{ width: `${readiness}%` }} /></div><p className="mt-3 text-xs text-stone-400">Task progress {taskProgress}%</p></div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Event title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Community worship night, youth conference..." className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Event type</span><select value={eventType} onChange={(e) => setEventType(e.target.value as EventType)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"><option value="service">Service</option><option value="conference">Conference</option><option value="prayer">Prayer</option><option value="outreach">Outreach</option><option value="youth">Youth</option><option value="children">Children / family</option><option value="training">Training</option><option value="rehearsal">Rehearsal</option><option value="community">Community</option><option value="other">Other</option></select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Starts</span><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Ends</span><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Location / channel</span><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Address, room, online channel..." className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Event owner</span><input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Ministry lead" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Capacity target</span><input type="number" min="1" max="100000" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Registration</span><select value={registrationMode} onChange={(e) => setRegistrationMode(e.target.value as RegistrationMode)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"><option value="open">Open registration</option><option value="approval">Approval required</option><option value="invite">Invite only</option><option value="none">No registration</option></select></label>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2"><label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Ministry purpose</span><textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Why is the church holding this event and what faithful outcome matters?" /></label><label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Intended audience</span><textarea value={audience} onChange={(e) => setAudience(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Members, families, youth, neighborhood, leaders, visitors..." /></label></div>

          <div className="mt-7"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Event task board</p><p className="mt-1 text-xs text-stone-500">{unownedTasks} task{unownedTasks === 1 ? '' : 's'} still need an owner.</p></div><button type="button" onClick={addTask} className="inline-flex items-center rounded-xl bg-fuchsia-700 px-4 py-2.5 text-xs font-semibold text-white"><Plus className="mr-1.5 h-3.5 w-3.5" /> Add task</button></div><div className="space-y-3">{tasks.map((task) => <article key={task.id} className={`grid gap-3 rounded-2xl border p-4 md:grid-cols-[auto_1.4fr_1fr_0.8fr_auto] md:items-center ${task.completed ? 'border-sage-200 bg-sage-50' : 'border-stone-200 bg-stone-50'}`}><button type="button" onClick={() => updateTask(task.id, { completed: !task.completed })} className={`flex h-8 w-8 items-center justify-center rounded-full ${task.completed ? 'bg-sage-600 text-white' : 'border border-stone-300 bg-white text-stone-400'}`} aria-label={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`}><Check className="h-4 w-4" /></button><input value={task.title} onChange={(e) => updateTask(task.id, { title: e.target.value })} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /><input value={task.owner} onChange={(e) => updateTask(task.id, { owner: e.target.value })} placeholder="Owner" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /><input type="date" value={task.due} onChange={(e) => updateTask(task.id, { due: e.target.value })} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /><button type="button" onClick={() => removeTask(task.id)} className="rounded-xl border border-rose-100 bg-white p-2.5 text-rose-500" aria-label={`Remove ${task.title}`}><Trash2 className="h-4 w-4" /></button></article>)}</div></div>

          <button type="button" onClick={() => void save()} disabled={syncing} className="mt-5 inline-flex items-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{syncing ? 'Syncing…' : saved ? 'Event plan saved' : activeChurchId ? 'Save to active church' : 'Save private event plan'}</button>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <ShieldCheck className="h-8 w-8 text-fuchsia-300" /><h3 className="mt-5 text-3xl font-light">Readiness before promotion.</h3><p className="mt-3 text-sm leading-6 text-stone-400">An event is not ready just because a flyer exists. Review the people, venue, safeguarding, accessibility, communications, media, care, and contingency behind it.</p>
          <div className="mt-5 space-y-2">{readinessItems.map((item) => { const done = ready.includes(item.id); return <button key={item.id} type="button" onClick={() => toggleReady(item.id)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left ${done ? 'border-fuchsia-300/20 bg-fuchsia-300/10' : 'border-white/10 bg-white/5'}`}><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${done ? 'bg-fuchsia-500 text-white' : 'border border-white/20'}`}>{done && <Check className="h-3.5 w-3.5" />}</span><span><strong className="text-sm text-white">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-stone-400">{item.note}</span></span></button>; })}</div>
          <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><AlertTriangle className="mb-2 h-4 w-4" /> Do not put medical records, abuse disclosures, payment credentials, counseling notes, or other sensitive case data into general event notes. Use dedicated protected workflows.</div>
          <div className="mt-6 grid gap-3"><Link href="/workers/manage" className="inline-flex items-center justify-center rounded-xl bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white"><UsersRound className="mr-2 h-4 w-4" /> Staff the event</Link><Link href="/outreach" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200"><MapPin className="mr-2 h-4 w-4" /> Outreach CRM</Link><Link href="/service-planner" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200"><Clock3 className="mr-2 h-4 w-4" /> Service run sheet</Link></div>
        </aside>
      </div>
    </section>
  );
}
