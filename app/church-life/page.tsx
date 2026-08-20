'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Baby,
  CalendarDays,
  Check,
  Church,
  HeartHandshake,
  Home,
  Loader2,
  LockKeyhole,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wine,
} from 'lucide-react';

type WorkspaceRole = 'OWNER' | 'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER';
type Workspace = { id: string; name: string; slug?: string; role: WorkspaceRole };
type PlanningState = { completed: Record<string, string[]>; notes: Record<string, string>; savedAt: string };

type Workflow = {
  id: string;
  title: string;
  description: string;
  owner: string;
  icon: typeof Church;
  checklist: string[];
};

const OPERATING_ROLES = new Set<WorkspaceRole>(['OWNER', 'ADMIN', 'PASTOR', 'STAFF']);
const LEGACY_STORAGE_KEY = 'digital-church-life-operations';

function planningStorageKey(userId: string, churchId: string) {
  return `digital-church-life-operations:v2:${userId}:${churchId}`;
}

function selectionStorageKey(userId: string) {
  return `digital-church-life-selected:v2:${userId}`;
}

const workflows: Workflow[] = [
  { id: 'membership', title: 'Membership & belonging', description: 'Welcome visitors, explain church life, capture consented follow-up, and move people toward meaningful belonging rather than database enrollment alone.', owner: 'Pastoral / membership team', icon: UsersRound, checklist: ['Visitor follow-up', 'Membership conversation', 'Beliefs & expectations', 'Small-group connection', 'Serving pathway'] },
  { id: 'baptism', title: 'Baptism pathway', description: 'Prepare candidates, schedule pastoral conversations, coordinate service logistics, and retain an accountable milestone record in the appropriate ministry system.', owner: 'Pastor / discipleship leader', icon: Baby, checklist: ['Candidate request', 'Pastoral conversation', 'Preparation material', 'Service scheduling', 'Follow-up discipleship'] },
  { id: 'communion', title: 'Communion / Lord’s Supper', description: 'Plan service timing, pastoral wording, accessibility, supplies, and congregation guidance according to the church’s own doctrine and practice.', owner: 'Pastor / service leader', icon: Wine, checklist: ['Church doctrine reviewed', 'Service placement', 'Elements & accessibility', 'Serving team', 'Pastoral guidance'] },
  { id: 'groups', title: 'Small groups & home fellowship', description: 'Organize leaders, meeting rhythm, studies, care needs, attendance signals, and pathways back into the wider church community.', owner: 'Group / discipleship leaders', icon: Home, checklist: ['Leader assigned', 'Meeting rhythm', 'Study plan', 'Care pathway', 'Community follow-up'] },
  { id: 'visitation', title: 'Pastoral visitation & care', description: 'Coordinate hospital or home visits, bereavement support, practical needs, prayer, and follow-up while limiting access to sensitive information.', owner: 'Care team', icon: HeartHandshake, checklist: ['Consent & privacy', 'Assigned care leader', 'Visit purpose', 'Prayer / practical need', 'Follow-up date'] },
  { id: 'services', title: 'Service & ceremony planning', description: 'Coordinate worship services, dedications, weddings, memorials, commissioning, and other church gatherings with pastoral review and clear roles.', owner: 'Pastoral / service team', icon: CalendarDays, checklist: ['Purpose & doctrine', 'People / roles', 'Scripture & music', 'Run of service', 'Care / follow-up'] },
];

export default function ChurchLifePage() {
  const { data: session, status: sessionStatus } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceStatus, setWorkspaceStatus] = useState('');
  const [selected, setSelected] = useState(workflows[0].id);
  const [completed, setCompleted] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [legacyDraftPresent, setLegacyDraftPresent] = useState(false);

  const current = workflows.find((item) => item.id === selected)!;
  const currentDone = completed[selected] || [];
  const progress = useMemo(() => Math.round((currentDone.length / current.checklist.length) * 100), [currentDone.length, current.checklist.length]);
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedChurchId) || null;

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (!userId) {
      setWorkspaceLoading(false);
      setWorkspaces([]);
      return;
    }

    let active = true;
    const load = async () => {
      setWorkspaceLoading(true);
      try {
        const response = await fetch('/api/church-ops/workspaces', { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'Church workspaces are unavailable.');
        const available = (Array.isArray(data?.workspaces) ? data.workspaces : []).filter((workspace: Workspace) => OPERATING_ROLES.has(workspace.role));
        if (!active) return;
        setWorkspaces(available);

        let remembered = '';
        try { remembered = window.localStorage.getItem(selectionStorageKey(userId)) || ''; } catch { /* optional local preference */ }
        const nextId = available.some((workspace: Workspace) => workspace.id === remembered) ? remembered : available[0]?.id || '';
        setSelectedChurchId(nextId);
        setLegacyDraftPresent(Boolean(window.localStorage.getItem(LEGACY_STORAGE_KEY)));
        setWorkspaceStatus(nextId ? 'Planning is scoped to one church workspace at a time.' : 'No operating church workspace is available for this account.');
      } catch (error: any) {
        if (!active) return;
        setWorkspaces([]);
        setSelectedChurchId('');
        setWorkspaceStatus(error?.message || 'Church workspaces are unavailable.');
      } finally {
        if (active) setWorkspaceLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [sessionStatus, userId]);

  useEffect(() => {
    if (!userId || !selectedChurchId) {
      setCompleted({});
      setNotes({});
      setSavedAt(null);
      return;
    }

    try {
      const raw = window.localStorage.getItem(planningStorageKey(userId, selectedChurchId));
      if (!raw) {
        setCompleted({});
        setNotes({});
        setSavedAt(null);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<PlanningState>;
      setCompleted(parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {});
      setNotes(parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {});
      setSavedAt(typeof parsed.savedAt === 'string' ? parsed.savedAt : null);
    } catch {
      setCompleted({});
      setNotes({});
      setSavedAt(null);
      setSaveStatus('This church’s browser-scoped planning draft could not be restored.');
    }
  }, [selectedChurchId, userId]);

  const changeWorkspace = async (churchId: string) => {
    if (!userId || !churchId) return;
    setWorkspaceStatus('Switching church workspace…');
    try {
      const response = await fetch('/api/church-ops/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Workspace could not be selected.');
      setSelectedChurchId(churchId);
      try { window.localStorage.setItem(selectionStorageKey(userId), churchId); } catch { /* optional preference */ }
      setSaveStatus('');
      setWorkspaceStatus('Active workspace updated. Planning remains isolated to this church.');
    } catch (error: any) {
      setWorkspaceStatus(error?.message || 'Workspace could not be selected.');
    }
  };

  const toggle = (item: string) => {
    setSaveStatus('');
    setCompleted((state) => ({
      ...state,
      [selected]: currentDone.includes(item) ? currentDone.filter((entry) => entry !== item) : [...currentDone, item],
    }));
  };

  const save = () => {
    if (!userId || !selectedChurchId) {
      setSaveStatus('Choose an authorized church workspace before saving planning notes.');
      return;
    }
    try {
      const nextSavedAt = new Date().toISOString();
      window.localStorage.setItem(planningStorageKey(userId, selectedChurchId), JSON.stringify({ completed, notes, savedAt: nextSavedAt } satisfies PlanningState));
      setSavedAt(nextSavedAt);
      setSaveStatus('Saved as an account-and-church-scoped browser planning draft. This is not an authoritative ministry record.');
    } catch {
      setSaveStatus('Planning state could not be saved in this browser.');
    }
  };

  const removeLegacyDraft = () => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLegacyDraftPresent(false);
      setSaveStatus('Legacy unscoped planning state removed without importing it into any church.');
    } catch {
      setSaveStatus('Legacy planning state could not be removed.');
    }
  };

  if (workspaceLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#06110f] pt-20 text-white"><div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-200" /><p className="mt-4 text-sm text-white/45">Resolving your church workspaces…</p></div></main>;
  }

  if (!userId) {
    return <main className="flex min-h-screen items-center justify-center bg-[#06110f] px-4 pt-20 text-white"><div className="sacred-panel-dark max-w-xl p-8 text-center"><LockKeyhole className="mx-auto h-8 w-8 text-amber-100" /><h1 className="mt-5 text-3xl font-light">Sign in to open church operations</h1><p className="mt-3 text-sm leading-7 text-white/50">Operational church planning is attached to authenticated workspace membership.</p><Link href="/auth/signin?callbackUrl=/church-life" className="sacred-primary-button mt-6">Sign in</Link></div></main>;
  }

  if (!workspaces.length) {
    return <main className="flex min-h-screen items-center justify-center bg-[#06110f] px-4 pt-20 text-white"><div className="sacred-panel-dark max-w-2xl p-8 text-center"><Church className="mx-auto h-9 w-9 text-emerald-200" /><h1 className="mt-5 text-3xl font-light">No operating church workspace is attached to this account</h1><p className="mt-3 text-sm leading-7 text-white/50">Owner, admin, pastor, or staff membership is required before this operational planner is exposed. Public church discovery remains available separately.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/church-network" className="sacred-primary-button">Explore church network</Link><Link href="/leader-onboarding" className="sacred-secondary-button">Leader onboarding</Link></div></div></main>;
  }

  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" /><div className="sanctuary-nave" /><div className="sanctuary-vignette" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="relative z-10 max-w-4xl"><div className="inline-flex items-center rounded-full border border-emerald-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-100"><Church className="mr-2 h-4 w-4" /> Church life workspace</div><h1 className="mt-6 text-4xl font-light leading-[1.04] md:text-7xl">Care for the full life of one congregation without confusing workflow with pastoral authority.</h1><p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Membership, baptism, communion, groups, visitation, and services can share one planning rhythm while doctrine, sensitive records, and final ministry decisions remain church-owned.</p></div>
          <div className="sacred-panel-dark relative z-10 p-6"><p className="sanctuary-section-label text-amber-100/60">Active church</p><select value={selectedChurchId} onChange={(event) => void changeWorkspace(event.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none">{workspaces.map((workspace) => <option className="text-stone-900" key={workspace.id} value={workspace.id}>{workspace.name} · {workspace.role}</option>)}</select><p className="mt-4 text-xs leading-6 text-white/45"><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-200" />{workspaceStatus}</p>{selectedWorkspace && <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-amber-100/50">Tenant role · {selectedWorkspace.role}</p>}</div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
        {legacyDraftPresent && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">A legacy unscoped browser planning draft exists. It was <strong>not imported</strong> into {selectedWorkspace?.name || 'this church'} because ownership cannot be proven.<button type="button" onClick={removeLegacyDraft} className="ml-2 font-semibold underline">Remove legacy draft</button></div>}
        <div className="mb-8 grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-stone-200 bg-white p-5"><ShieldCheck className="h-5 w-5 text-emerald-600" /><p className="mt-3 font-semibold text-stone-800">Tenant isolated</p><p className="mt-1 text-xs leading-5 text-stone-500">Browser drafts are keyed to this account and church workspace.</p></div><div className="rounded-3xl border border-stone-200 bg-white p-5"><NotebookPen className="h-5 w-5 text-amber-600" /><p className="mt-3 font-semibold text-stone-800">Planning overlay</p><p className="mt-1 text-xs leading-5 text-stone-500">Checklist progress here is a private planning aid, not an official ministry record.</p></div><div className="rounded-3xl border border-stone-200 bg-white p-5"><Sparkles className="h-5 w-5 text-emerald-600" /><p className="mt-3 font-semibold text-stone-800">Doctrine stays human-owned</p><p className="mt-1 text-xs leading-5 text-stone-500">The platform coordinates; accountable church leadership decides theology and practice.</p></div></div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">{workflows.map((workflow) => { const Icon = workflow.icon; const active = selected === workflow.id; return <button key={workflow.id} type="button" onClick={() => setSelected(workflow.id)} className={`w-full rounded-3xl border p-5 text-left transition ${active ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-stone-200 bg-white hover:border-emerald-200'}`}><div className="flex items-start gap-4"><span className={`rounded-2xl p-3 ${active ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-emerald-700'}`}><Icon className="h-5 w-5" /></span><div><h2 className="font-semibold text-stone-900">{workflow.title}</h2><p className="mt-1 text-sm leading-6 text-stone-600">{workflow.description}</p><p className="mt-2 text-xs font-semibold text-emerald-700">Owner: {workflow.owner}</p></div></div></button>; })}</div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="sanctuary-section-label text-emerald-700">Planning workflow</p><h2 className="mt-2 text-3xl font-light text-stone-900">{current.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{current.description}</p></div><div className="min-w-[150px] rounded-2xl bg-emerald-50 p-4"><div className="flex justify-between text-xs font-semibold text-emerald-800"><span>Planning readiness</span><span>{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full bg-emerald-700" style={{ width: `${progress}%` }} /></div></div></div></div>
            <div className="mt-7 grid gap-3 md:grid-cols-2">{current.checklist.map((item) => { const done = currentDone.includes(item); return <button key={item} type="button" onClick={() => toggle(item)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm transition ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-stone-50 text-stone-700'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-emerald-700 text-white' : 'bg-white text-stone-500'}`}>{done ? <Check className="h-4 w-4" /> : '•'}</span>{item}</button>; })}</div>
            <label className="mt-6 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Private browser coordination notes</span><textarea maxLength={4000} value={notes[selected] || ''} onChange={(event) => { setNotes((state) => ({ ...state, [selected]: event.target.value })); setSaveStatus(''); }} className="min-h-[170px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 leading-6 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100" placeholder="Planning notes only. Keep sensitive pastoral case details in the governed care workflow..." /><span className="mt-1 block text-right text-[10px] text-stone-400">{(notes[selected] || '').length}/4000</span></label>
            <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={save} className="inline-flex items-center rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white"><NotebookPen className="mr-2 h-4 w-4" /> Save scoped planning draft</button><Link href="/care" className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Human Care</Link><Link href="/workers" className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Workers</Link><Link href="/activities" className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Activities</Link></div>
            <p className="mt-4 text-xs leading-5 text-stone-500" role="status">{saveStatus || (savedAt ? `Scoped browser draft saved ${new Date(savedAt).toLocaleString()}.` : 'No scoped browser planning draft saved yet.')}</p>
          </div>
        </div>
      </div></section>
    </main>
  );
}
