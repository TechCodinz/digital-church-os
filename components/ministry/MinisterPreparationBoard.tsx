'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type PrepState = {
  serviceTheme: string;
  scripture: string;
  messageReady: boolean;
  worshipReady: boolean;
  teamReady: boolean;
  presentationReady: boolean;
  responseReady: boolean;
  communicationsReady: boolean;
  followupReady: boolean;
  riskNote: string;
  priority: string;
  updatedAt: string;
};

type ReadinessKey =
  | 'messageReady'
  | 'worshipReady'
  | 'teamReady'
  | 'presentationReady'
  | 'responseReady'
  | 'communicationsReady'
  | 'followupReady';

const emptyState: PrepState = {
  serviceTheme: '',
  scripture: '',
  messageReady: false,
  worshipReady: false,
  teamReady: false,
  presentationReady: false,
  responseReady: false,
  communicationsReady: false,
  followupReady: false,
  riskNote: '',
  priority: '',
  updatedAt: '',
};

const checks: { key: ReadinessKey; title: string; description: string; href: string }[] = [
  { key: 'messageReady', title: 'Message & Scripture', description: 'Theme, passage, context, application, delivery, and response posture are prepared.', href: '/sermons' },
  { key: 'worshipReady', title: 'Worship flow', description: 'Songs, transitions, rights posture, rehearsal, and service atmosphere are coordinated.', href: '/choir' },
  { key: 'teamReady', title: 'People & assignments', description: 'Primary/backup workers, call times, responsibilities, and critical coverage are clear.', href: '/workers/manage' },
  { key: 'presentationReady', title: 'Presentation & media', description: 'Scripture, lyrics, slides, lower-thirds, and service visuals are reviewed.', href: '/presentation' },
  { key: 'responseReady', title: 'Prayer & response', description: 'Prayer, salvation/discipleship, care, and human follow-up pathways are staffed and visible.', href: '/service-response' },
  { key: 'communicationsReady', title: 'Communications', description: 'Service reminders, guest information, consent-sensitive messaging, and public updates are ready.', href: '/communications' },
  { key: 'followupReady', title: 'Post-service follow-up', description: 'Owners and next actions exist for visitors, prayer requests, groups, discipleship, and care handoffs.', href: '/follow-up/manage' },
];

const localPrefix = 'digital-church-minister-preparation:v2';

function normalizePrep(value: unknown): PrepState {
  const data = value && typeof value === 'object' ? value as Partial<PrepState> : {};
  return {
    serviceTheme: typeof data.serviceTheme === 'string' ? data.serviceTheme : '',
    scripture: typeof data.scripture === 'string' ? data.scripture : '',
    messageReady: data.messageReady === true,
    worshipReady: data.worshipReady === true,
    teamReady: data.teamReady === true,
    presentationReady: data.presentationReady === true,
    responseReady: data.responseReady === true,
    communicationsReady: data.communicationsReady === true,
    followupReady: data.followupReady === true,
    riskNote: typeof data.riskNote === 'string' ? data.riskNote : '',
    priority: typeof data.priority === 'string' ? data.priority : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
  };
}

export function MinisterPreparationBoard() {
  const [state, setState] = useState<PrepState>(emptyState);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Loading church readiness…');

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId);
    setSyncing(true);
    setSyncMessage(churchId ? 'Loading active church readiness…' : 'Waiting for an active church workspace…');
    try {
      const result = await loadChurchOperationalRecord({
        churchId,
        module: 'minister-preparation',
        recordKey: 'current',
        localStoragePrefix: localPrefix,
        defaultValue: emptyState,
        normalize: normalizePrep,
      });
      setState(result.value);
      setSyncMessage(result.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // Workspace selection is the explicit reload boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = useMemo(() => checks.filter((item) => state[item.key]).length, [state]);
  const readiness = Math.round((complete / checks.length) * 100);

  function update<K extends keyof PrepState>(key: K, value: PrepState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function toggleReadiness(key: ReadinessKey) {
    setState((current) => ({ ...current, [key]: !current[key] }));
  }

  async function persist(nextState: PrepState, actionLabel: string) {
    setSyncing(true);
    setSyncMessage(actionLabel);
    try {
      const result = await saveChurchOperationalRecord({
        churchId: activeChurchId,
        module: 'minister-preparation',
        recordKey: 'current',
        title: 'Minister service readiness',
        classification: 'INTERNAL',
        localStoragePrefix: localPrefix,
        value: nextState,
      });
      setState(nextState);
      setSyncMessage(result.message);
    } finally {
      setSyncing(false);
    }
  }

  async function save() {
    const next = { ...state, updatedAt: new Date().toISOString() };
    await persist(next, 'Saving readiness…');
  }

  async function reset() {
    const next = { ...emptyState, updatedAt: new Date().toISOString() };
    await persist(next, 'Resetting readiness…');
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_0.45fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Service readiness</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Know what is ready before the service starts.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">This board is shared only with the selected church workspace. Keep it operational: confidential pastoral narratives, safeguarding cases, medical details, credentials, and crisis notes belong in restricted human-care systems.</p>
          </div>
          <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage-300">Readiness snapshot</p>
            <div className="mt-3 flex items-end gap-3"><span className="text-4xl font-light">{readiness}%</span><span className="pb-1 text-sm text-stone-400">{complete}/{checks.length} lanes</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sage-400 transition-all" style={{ width: `${readiness}%` }} /></div>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
          <span>{syncing ? 'Syncing…' : syncMessage}</span>
          <span>{activeChurchId ? 'Active church workspace' : 'No active church selected'}</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">Service theme<input value={state.serviceTheme} onChange={(e) => update('serviceTheme', e.target.value)} placeholder="Theme / emphasis" maxLength={160} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Primary Scripture<input value={state.scripture} onChange={(e) => update('scripture', e.target.value)} placeholder="Reference only" maxLength={120} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label>
            </div>
            <div className="mt-6 space-y-3">{checks.map((item) => <div key={item.title} className={`rounded-2xl border p-4 transition ${state[item.key] ? 'border-sage-200 bg-sage-50' : 'border-stone-200 bg-white'}`}><div className="flex items-start gap-3"><button type="button" onClick={() => toggleReadiness(item.key)} aria-label={`Toggle ${item.title}`} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${state[item.key] ? 'border-sage-600 bg-sage-600 text-white' : 'border-stone-300 bg-white text-transparent'}`}><CheckCircle2 className="h-4 w-4" /></button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-stone-800">{item.title}</p><Link href={item.href} className="text-xs font-semibold text-sage-700">Open workspace</Link></div><p className="mt-1 text-sm leading-5 text-stone-500">{item.description}</p></div></div></div>)}</div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => void save()} disabled={syncing || !activeChurchId} type="button" className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Save className="mr-2 h-4 w-4" /> Save readiness</button>
              <button onClick={() => void reset()} disabled={syncing || !activeChurchId} type="button" className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600 disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw className="mr-2 h-4 w-4" /> Reset shared board</button>
            </div>
            <p className="mt-3 text-xs text-stone-500">Old unscoped browser drafts are deliberately not auto-imported into a church workspace.</p>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <ClipboardCheck className="h-6 w-6 text-sage-600" />
              <h3 className="mt-4 text-xl font-semibold text-stone-800">Leadership attention</h3>
              <label className="mt-4 block text-sm font-medium text-stone-700">Biggest unresolved operational risk<textarea value={state.riskNote} onChange={(e) => update('riskNote', e.target.value)} rows={4} maxLength={800} placeholder="Operational risk only—do not paste confidential care details." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="mt-4 block text-sm font-medium text-stone-700">One priority before service<textarea value={state.priority} onChange={(e) => update('priority', e.target.value)} rows={3} maxLength={500} placeholder="What most needs a human decision or handoff?" className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
            </div>
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5 text-sm leading-6 text-sage-900"><ShieldCheck className="mb-2 h-5 w-5" /> Readiness percentages describe completion of preparation lanes only. They do not measure spiritual quality, ministry effectiveness, or the faithfulness of any leader.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
