'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Baby,
  Building2,
  CalendarCheck,
  Check,
  Church,
  CircleDollarSign,
  ClipboardCheck,
  Copyright,
  HandHeart,
  HeartHandshake,
  Megaphone,
  MessageSquare,
  Music2,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { ACTIVE_CHURCH_STORAGE_KEY } from '@/components/ministry/ChurchWorkspaceSelector';

type Area = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Church;
  critical?: boolean;
};

type WeeklyOpsState = {
  ready: string[];
  priority: string;
  risk: string;
  win: string;
};

const areas: Area[] = [
  { id: 'service', title: 'Service & broadcast', description: 'Full run-of-show, owners, stream, presentation, response, accessibility, and fallback readiness.', href: '/service-planner', icon: Radio, critical: true },
  { id: 'sermon', title: 'Sermon & teaching', description: 'Scripture context, thesis, teaching flow, live cues, response, and follow-up.', href: '/sermons', icon: ClipboardCheck, critical: true },
  { id: 'worship', title: 'Worship & choir', description: 'Songs, hymns, rehearsals, keys, choir structure, playlists, and projection.', href: '/choir', icon: Music2 },
  { id: 'care', title: 'Prayer & pastoral care', description: 'Prayer requests, human care, appointments, referrals, safeguarding, and accountable follow-up.', href: '/admin/care-appointments', icon: HeartHandshake, critical: true },
  { id: 'follow-up', title: 'Discipleship follow-up', description: 'Consent-aware response ownership across contact, foundations, baptism, belonging, groups, and serving.', href: '/admin/follow-up', icon: UsersRound, critical: true },
  { id: 'attendance', title: 'Attendance & assimilation', description: 'Aggregate attendance, guest flow, response ownership, and connection signals without individual surveillance.', href: '/admin/attendance', icon: UsersRound },
  { id: 'groups', title: 'Small groups & community', description: 'Group leadership depth, meeting rhythm, healthy capacity, and places for people to belong.', href: '/admin/groups', icon: Church },
  { id: 'departments', title: 'Ministry departments', description: 'Purpose, leaders, deputies, meeting rhythm, active workers, open roles, and next ministry priorities.', href: '/departments', icon: Church },
  { id: 'people', title: 'Workers & volunteers', description: 'Rota coverage, roles, primaries/backups, call times, gaps, appreciation, and ministry ownership.', href: '/workers/manage', icon: UsersRound },
  { id: 'children', title: 'Children & family', description: 'Age-aware teaching, guardian controls, family discipleship, and trusted-adult pathways.', href: '/children', icon: Baby, critical: true },
  { id: 'facilities', title: 'Facilities & assets', description: 'Rooms, equipment, ownership, condition, next checks, critical outages, and operational follow-up.', href: '/facilities', icon: Building2, critical: true },
  { id: 'requests', title: 'Requests & forms', description: 'Baptism, membership, volunteer, event, facility, letter, care, and other requests with ownership and due dates.', href: '/requests', icon: ClipboardCheck },
  { id: 'giving', title: 'Giving & benevolence', description: 'Giving operations, aid requests, stewardship review, and accountable disbursement.', href: '/giving', icon: CircleDollarSign },
  { id: 'rights', title: 'Media & rights', description: 'Licensing, public-domain checks, distribution clearance, takedowns, and attribution.', href: '/media-rights', icon: Copyright, critical: true },
  { id: 'communications', title: 'Communications & announcements', description: 'Audience, owner, approval, timing, consent posture, and delivery-channel planning.', href: '/communications', icon: Megaphone },
  { id: 'testimonies', title: 'Testimonies & stories', description: 'Pastoral review, public/media consent, anonymity, verification, and publication posture.', href: '/testimonies', icon: MessageSquare },
  { id: 'outreach', title: 'Outreach & mission CRM', description: 'Community contacts, initiatives, owners, consent, next actions, needs, and respectful connection outcomes.', href: '/outreach', icon: HandHeart },
  { id: 'network', title: 'Church network', description: 'Church discovery, collaboration, shared ministry opportunities, and belonging pathways.', href: '/church-network', icon: Church },
  { id: 'calendar', title: 'Events & calendar', description: 'Services, rehearsals, meetings, conferences, registrations, campaigns, and readiness.', href: '/events/manage', icon: CalendarCheck },
];

function currentWeekStart() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - now.getDay());
  return start.toISOString().slice(0, 10);
}

function localStorageKey(churchId: string) {
  return `digital-church-ops-week:${churchId || 'private'}:${currentWeekStart()}`;
}

function sharedRecordKey() {
  return `week:${currentWeekStart()}`;
}

function normalizeWeeklyState(value: any): WeeklyOpsState {
  return {
    ready: Array.isArray(value?.ready) ? value.ready.filter((item: unknown) => typeof item === 'string') : [],
    priority: typeof value?.priority === 'string' ? value.priority : '',
    risk: typeof value?.risk === 'string' ? value.risk : '',
    win: typeof value?.win === 'string' ? value.win : '',
  };
}

export function ChurchOperationsCommandDeck() {
  const [ready, setReady] = useState<string[]>([]);
  const [priority, setPriority] = useState('');
  const [risk, setRisk] = useState('');
  const [win, setWin] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncMessage, setSyncMessage] = useState('Private browser draft');
  const [syncing, setSyncing] = useState(false);

  const applyState = (data: WeeklyOpsState) => {
    setReady(data.ready);
    setPriority(data.priority);
    setRisk(data.risk);
    setWin(data.win);
  };

  const loadLocal = (churchId: string) => {
    try {
      const raw = window.localStorage.getItem(localStorageKey(churchId));
      if (raw) {
        applyState(normalizeWeeklyState(JSON.parse(raw)));
        return true;
      }

      if (!churchId) {
        const legacy = window.localStorage.getItem(`digital-church-ops-week:${currentWeekStart()}`);
        if (legacy) {
          applyState(normalizeWeeklyState(JSON.parse(legacy)));
          return true;
        }
      }
    } catch {
      // Local recovery is best effort.
    }
    applyState({ ready: [], priority: '', risk: '', win: '' });
    return false;
  };

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId);
    setSaved(false);

    if (!churchId) {
      loadLocal('');
      setSyncMessage('Private browser draft');
      return;
    }

    setSyncing(true);
    setSyncMessage('Loading shared church week…');
    try {
      const params = new URLSearchParams({ churchId, module: 'command-center', key: sharedRecordKey() });
      const response = await fetch(`/api/church-ops/records?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();

      if (response.ok && data?.record?.payload) {
        const normalized = normalizeWeeklyState(data.record.payload);
        applyState(normalized);
        window.localStorage.setItem(localStorageKey(churchId), JSON.stringify(normalized));
        setSyncMessage(`Shared church week · v${data.record.version || 1}`);
        return;
      }

      if (response.status === 404) {
        const restored = loadLocal(churchId);
        setSyncMessage(restored ? 'Church-scoped browser draft · not shared yet' : 'New shared church week');
        return;
      }

      loadLocal(churchId);
      setSyncMessage(data?.migrationRequired ? 'Shared persistence waiting for database migration' : data?.error || 'Shared sync unavailable · using church-scoped browser draft');
    } catch {
      loadLocal(churchId);
      setSyncMessage('Shared sync unavailable · using church-scoped browser draft');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const initialChurchId = window.localStorage.getItem(ACTIVE_CHURCH_STORAGE_KEY) || '';
    void loadWorkspace(initialChurchId);

    const onWorkspaceChange = (event: Event) => {
      const custom = event as CustomEvent<{ churchId?: string }>;
      void loadWorkspace(custom.detail?.churchId || '');
    };

    window.addEventListener('digital-church-workspace-change', onWorkspaceChange);
    return () => window.removeEventListener('digital-church-workspace-change', onWorkspaceChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readiness = useMemo(() => Math.round((ready.length / areas.length) * 100), [ready.length]);
  const criticalReady = useMemo(() => areas.filter((area) => area.critical).every((area) => ready.includes(area.id)), [ready]);
  const toggle = (id: string) => setReady((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const save = async () => {
    const state: WeeklyOpsState = { ready, priority, risk, win };
    try { window.localStorage.setItem(localStorageKey(activeChurchId), JSON.stringify(state)); } catch {}

    if (!activeChurchId) {
      setSaved(true);
      setSyncMessage('Private browser draft saved');
      window.setTimeout(() => setSaved(false), 1600);
      return;
    }

    setSyncing(true);
    setSyncMessage('Saving to active church…');
    try {
      const response = await fetch('/api/church-ops/records', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: activeChurchId, module: 'command-center', key: sharedRecordKey(), title: `Weekly church operations · ${currentWeekStart()}`, classification: 'INTERNAL', payload: state }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSaved(false);
        setSyncMessage(data?.migrationRequired ? 'Saved in this browser; shared database migration is still required' : data?.error || 'Saved in this browser; shared sync failed');
        return;
      }
      setSaved(true);
      setSyncMessage(`Saved to active church · v${data?.record?.version || 1}`);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
      setSyncMessage('Saved in this browser; shared sync is unavailable');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.18fr_0.82fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><Sparkles className="mr-2 h-4 w-4" /> Church operations command deck</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">One weekly view for the ministries people actually depend on.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Use readiness as an operational checklist—not a ministry score. When an active church workspace is selected, the weekly state is versioned and shared with authorized leaders for that church.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-sage-700" /> {syncing ? 'Syncing…' : syncMessage}</div>
            </div>
            <div className="min-w-[180px] rounded-2xl bg-stone-950 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Weekly readiness</p><p className="mt-1 text-4xl font-light">{readiness}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-sage-400" style={{ width: `${readiness}%` }} /></div><p className={`mt-3 text-xs ${criticalReady ? 'text-sage-300' : 'text-amber-300'}`}>{criticalReady ? 'Critical areas reviewed' : 'Critical review still open'}</p></div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {areas.map((area) => {
              const Icon = area.icon;
              const done = ready.includes(area.id);
              return <article key={area.id} className={`rounded-2xl border p-4 transition ${done ? 'border-sage-200 bg-sage-50' : area.critical ? 'border-amber-200 bg-amber-50/50' : 'border-stone-200 bg-stone-50'}`}><div className="flex items-start justify-between gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${done ? 'bg-sage-600 text-white' : 'bg-white text-stone-700 shadow-sm'}`}>{done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}</span>{area.critical && <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">Critical</span>}</div><h3 className="mt-4 font-semibold text-stone-900">{area.title}</h3><p className="mt-1 min-h-[60px] text-xs leading-5 text-stone-500">{area.description}</p><div className="mt-4 flex items-center justify-between gap-2"><Link href={area.href} className="text-xs font-semibold text-sage-700">Open module →</Link><button type="button" onClick={() => toggle(area.id)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${done ? 'bg-white text-sage-700' : 'bg-stone-200 text-stone-600'}`}>{done ? 'Reviewed' : 'Mark reviewed'}</button></div></article>;
            })}
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <ShieldCheck className="h-8 w-8 text-sage-300" />
          <h3 className="mt-5 text-3xl font-light">Leadership attention, not surveillance.</h3>
          <p className="mt-3 text-sm leading-6 text-stone-400">Record the week’s biggest priority, risk, and win. Keep sensitive pastoral details inside the appropriate care systems rather than this general leadership scratchpad.</p>
          <label className="mt-7 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">This week’s priority</span><textarea value={priority} onChange={(e) => setPriority(e.target.value)} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" placeholder="What must leadership make sure happens well?" /></label>
          <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Risk / gap</span><textarea value={risk} onChange={(e) => setRisk(e.target.value)} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-amber-400" placeholder="Coverage gap, unresolved care, rights issue, technical dependency..." /></label>
          <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Win / testimony to review</span><textarea value={win} onChange={(e) => setWin(e.target.value)} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" placeholder="What went well and should be thanked, learned from, or followed up?" /></label>
          <button type="button" onClick={() => void save()} disabled={syncing} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-sage-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sage-400 disabled:cursor-not-allowed disabled:opacity-60">{saved ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}{syncing ? 'Syncing weekly attention…' : saved ? 'Weekly attention saved' : activeChurchId ? 'Save to active church' : 'Save private weekly attention'}</button>
          <p className="mt-4 text-xs leading-5 text-stone-500">This operational record must not contain confidential counseling notes, medical details, abuse reports, financial credentials, child safeguarding case content, or other restricted case data.</p>
        </aside>
      </div>
    </section>
  );
}
