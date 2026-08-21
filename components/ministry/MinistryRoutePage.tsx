'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Activity,
  LockKeyhole,
  ClipboardCheck,
  NotebookPen,
  RotateCcw,
  Save,
} from 'lucide-react';

type Feature = {
  title: string;
  description: string;
};

type MinistryRoutePageProps = {
  badge: string;
  title: string;
  description: string;
  emoji: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  features: Feature[];
  intelligence: Feature[];
  safeguards: string[];
};

type WorkspaceState = {
  completed: boolean[];
  focus: string;
  notes: string;
  updatedAt?: string;
};

const EMPTY_STATE: WorkspaceState = {
  completed: [false, false, false, false],
  focus: '',
  notes: '',
};

export function MinistryRoutePage({
  badge,
  title,
  description,
  emoji,
  primaryHref = '/dashboard',
  primaryLabel = 'Open dashboard',
  secondaryHref = '/community-wall',
  secondaryLabel = 'Visit community',
  features,
  intelligence,
  safeguards,
}: MinistryRoutePageProps) {
  const pathname = usePathname();
  const storageKey = useMemo(() => `dcos:ministry-workspace:${pathname}`, [pathname]);
  const [workspace, setWorkspace] = useState<WorkspaceState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const flow = useMemo(() => [
    {
      step: '01',
      title: 'Understand the moment',
      description: intelligence[0]?.description || description,
    },
    {
      step: '02',
      title: 'Take a faithful action',
      description: features[0]?.description || 'Move from information into a clear ministry action without unnecessary complexity.',
    },
    {
      step: '03',
      title: 'Connect the next ministry surface',
      description: intelligence[1]?.description || 'Carry the work forward into the most relevant connected ministry experience.',
    },
    {
      step: '04',
      title: 'Review with accountable context',
      description: safeguards[0] || 'Keep important ministry decisions transparent, permission-aware, and human accountable.',
    },
  ], [description, features, intelligence, safeguards]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as WorkspaceState;
        setWorkspace({
          completed: Array.isArray(parsed.completed) && parsed.completed.length === 4 ? parsed.completed : EMPTY_STATE.completed,
          focus: typeof parsed.focus === 'string' ? parsed.focus : '',
          notes: typeof parsed.notes === 'string' ? parsed.notes : '',
          updatedAt: parsed.updatedAt,
        });
      } else {
        setWorkspace(EMPTY_STATE);
      }
    } catch {
      setWorkspace(EMPTY_STATE);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  const completedCount = workspace.completed.filter(Boolean).length;
  const completionPercent = completedCount * 25;

  const saveWorkspace = () => {
    const next = { ...workspace, updatedAt: new Date().toISOString() };
    setWorkspace(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setSavedMessage('Private workspace saved on this device.');
    } catch {
      setSavedMessage('This browser could not save locally. Your current text is still visible in this session.');
    }
    window.setTimeout(() => setSavedMessage(''), 3500);
  };

  const toggleStep = (index: number) => {
    setWorkspace((current) => ({
      ...current,
      completed: current.completed.map((value, itemIndex) => itemIndex === index ? !value : value),
    }));
  };

  const resetWorkspace = () => {
    setWorkspace(EMPTY_STATE);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Local persistence is an enhancement; the workspace remains usable without it.
    }
    setSavedMessage('Workspace reset on this device.');
    window.setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-28 pt-20 text-white sm:pt-24 lg:pb-16">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1fr_0.72fr]">
          <div className="relative z-10">
            <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              {badge}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-light leading-[1.03] tracking-tight text-white md:text-7xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/55 sm:text-lg">{description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2"><Activity className="mr-1.5 h-3.5 w-3.5 text-emerald-200" aria-hidden="true" /> Connected workflow</span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2"><LockKeyhole className="mr-1.5 h-3.5 w-3.5 text-emerald-200" aria-hidden="true" /> Privacy & policy aware</span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2"><Save className="mr-1.5 h-3.5 w-3.5 text-emerald-200" aria-hidden="true" /> Device continuity</span>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={primaryHref} className="sacred-primary-button">{primaryLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href={secondaryHref} className="sacred-secondary-button">{secondaryLabel}</Link>
            </div>
          </div>

          <aside className="sacred-panel-dark relative z-10 overflow-hidden p-6 sm:p-7">
            <div className="presence-orbit" aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-5">
              <div>
                <p className="sanctuary-section-label text-emerald-200/55">Workspace intelligence</p>
                <h2 className="mt-2 text-2xl font-light text-white">{badge}</h2>
                <p className="mt-2 text-sm leading-6 text-white/40">Context, action, and connected ministry handoffs in one place.</p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-3xl shadow-[0_12px_34px_rgba(0,0,0,.22)]" aria-hidden="true">{emoji}</div>
            </div>
            <div className="relative mt-6 space-y-3">
              {intelligence.map((item, index) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-200/15 bg-emerald-300/8 text-xs font-bold text-emerald-100">{index + 1}</span>
                    <div><p className="font-medium text-white">{item.title}</p><p className="mt-1 text-sm leading-6 text-white/42">{item.description}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="relative border-y border-white/8 bg-[#04100d] px-4 py-14 sm:px-6 lg:px-8">
        <div className="sanctuary-radiance absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-200/15 bg-emerald-300/8 p-3 text-emerald-100"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></div>
            <div><p className="sanctuary-section-label text-emerald-200/55">Execution layer</p><h2 className="mt-1 text-3xl font-light text-white">Professional ministry workflow</h2></div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title} className="sacred-panel-dark group p-6 transition hover:-translate-y-1">
                <div className="flex items-center justify-between"><CheckCircle2 className="h-6 w-6 text-emerald-200" aria-hidden="true" /><span className="text-[10px] font-bold tracking-[0.2em] text-white/20">0{index + 1}</span></div>
                <h3 className="mt-5 text-xl font-medium text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/43">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="sanctuary-section-label text-amber-100/55">Connected action flow</p>
            <h2 className="mt-2 text-3xl font-light text-white sm:text-4xl">Move from insight to ministry action without losing context.</h2>
            <p className="mt-3 text-sm leading-6 text-white/43 sm:text-base">Check off the steps as you work. Progress is private to this browser and is never presented as a spiritual score.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {flow.map((item, index) => {
              const done = workspace.completed[index];
              return (
                <button key={item.step} type="button" onClick={() => toggleStep(index)} aria-pressed={done} className={`rounded-3xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/50 ${done ? 'border-emerald-200/25 bg-emerald-300/10' : 'border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.055]'}`}>
                  <div className="flex items-center justify-between gap-3"><p className={`text-xs font-bold tracking-[0.24em] ${done ? 'text-emerald-200' : 'text-white/28'}`}>{item.step}</p><CheckCircle2 className={`h-5 w-5 ${done ? 'text-emerald-200' : 'text-white/18'}`} aria-hidden="true" /></div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/42">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 sacred-panel-dark p-5 sm:p-7">
            <div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div><p className="sanctuary-section-label text-emerald-200/55">Private continuity</p><h3 className="mt-2 text-2xl font-light text-white">Today&apos;s ministry workspace</h3></div>
                  <ClipboardCheck className="h-6 w-6 text-emerald-200" aria-hidden="true" />
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/18 p-5 text-white">
                  <div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-white/32">Action progress</p><p className="mt-1 text-3xl font-light">{hydrated ? completionPercent : 0}%</p></div><p className="text-xs text-white/30">{hydrated ? completedCount : 0}/4 steps</p></div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-200 transition-all" style={{ width: `${hydrated ? completionPercent : 0}%` }} /></div>
                  <p className="mt-3 text-xs leading-5 text-white/32">This meter tracks use of this workspace only. It does not measure faith, maturity, holiness, or ministry worth.</p>
                </div>
                <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-white/35" htmlFor={`ministry-focus-${badge.replace(/\s+/g, '-').toLowerCase()}`}>Focus for this session</label>
                <input id={`ministry-focus-${badge.replace(/\s+/g, '-').toLowerCase()}`} value={workspace.focus} onChange={(event) => setWorkspace((current) => ({ ...current, focus: event.target.value }))} placeholder="What matters most in this ministry moment?" maxLength={240} className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-amber-200/35 focus:ring-2 focus:ring-amber-200/20" />
              </div>
              <div>
                <label className="flex items-center text-xs font-semibold uppercase tracking-wide text-white/35" htmlFor={`ministry-notes-${badge.replace(/\s+/g, '-').toLowerCase()}`}><NotebookPen className="mr-2 h-4 w-4" /> Working notes</label>
                <textarea id={`ministry-notes-${badge.replace(/\s+/g, '-').toLowerCase()}`} value={workspace.notes} onChange={(event) => setWorkspace((current) => ({ ...current, notes: event.target.value }))} placeholder="Capture observations, questions, follow-up context, or a next action. Avoid confidential pastoral details on shared devices." rows={8} maxLength={5000} className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-amber-200/35 focus:ring-2 focus:ring-amber-200/20" />
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button type="button" onClick={saveWorkspace} className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-amber-100 px-5 text-sm font-semibold text-[#07110f]"><Save className="mr-2 h-4 w-4" /> Save on this device</button>
                  <button type="button" onClick={resetWorkspace} className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/55 transition hover:text-white"><RotateCcw className="mr-2 h-4 w-4" /> Reset</button>
                </div>
                {savedMessage && <p className="mt-3 text-xs font-medium text-emerald-200" role="status">{savedMessage}</p>}
                {workspace.updatedAt && <p className="mt-2 text-[11px] text-white/28">Last saved {new Date(workspace.updatedAt).toLocaleString()}</p>}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href={primaryHref} className="group flex min-h-14 items-center justify-between rounded-2xl border border-amber-200/20 bg-amber-300/8 px-5 py-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/12"><span>{primaryLabel}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></Link>
            <Link href={secondaryHref} className="group flex min-h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white/60 transition hover:border-emerald-200/20 hover:text-emerald-100"><span>{secondaryLabel}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl sacred-panel-dark p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="sanctuary-section-label text-emerald-200/55">Trust and safety</p>
              <h2 className="mt-3 text-3xl font-light leading-tight text-white">Serve people with dignity, clarity, privacy, and accountable intelligence.</h2>
              <p className="mt-3 text-sm leading-6 text-white/43">Automation may assist with organization and next-step guidance, but sensitive pastoral, financial, safeguarding, or leadership decisions stay human-led.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {safeguards.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/58">{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[5.1rem] z-30 px-3 sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#06110f]/95 p-2 shadow-2xl backdrop-blur-2xl">
          <Link href={primaryHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-200 px-3 text-center text-xs font-semibold text-[#07110f]">{primaryLabel}</Link>
          <Link href={secondaryHref} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-center text-xs font-semibold text-white/60">{secondaryLabel}</Link>
        </div>
      </div>
    </main>
  );
}
