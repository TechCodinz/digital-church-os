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
    <div className="min-h-screen bg-cream-50 pb-28 pt-20 sm:pt-24 lg:pb-0">
      <section className="relative overflow-hidden px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(120,155,100,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(210,180,140,0.24),_transparent_35%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.8fr] lg:gap-10">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-sage-200 bg-white/80 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm backdrop-blur">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              {badge}
            </div>
            <h1 className="max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-800 md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5">
                <Activity className="mr-1.5 h-3.5 w-3.5 text-sage-600" aria-hidden="true" /> Connected ministry workflow
              </span>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5">
                <LockKeyhole className="mr-1.5 h-3.5 w-3.5 text-sage-600" aria-hidden="true" /> Role, privacy & policy aware
              </span>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5">
                <Save className="mr-1.5 h-3.5 w-3.5 text-sage-600" aria-hidden="true" /> Private device continuity
              </span>
            </div>

            <div className="mt-9 grid gap-3 sm:flex sm:flex-row">
              <Link href={primaryHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-sage-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-sage-200 transition hover:-translate-y-0.5 hover:bg-sage-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2">
                {primaryLabel} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={secondaryHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-200 bg-white/85 px-7 py-3.5 text-sm font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-sage-300 hover:text-sage-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2">
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="sanctuary-card overflow-hidden p-0 shadow-2xl">
            <div className="border-b border-cream-200 bg-gradient-to-br from-white to-sage-50/70 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-sage-600">Workspace intelligence</p>
                  <h2 className="mt-2 text-2xl text-stone-800">{badge}</h2>
                  <p className="mt-2 text-sm text-stone-500">Context, action, and connected ministry handoffs in one place.</p>
                </div>
                <div className="rounded-3xl border border-sage-100 bg-white p-4 text-4xl shadow-sm" aria-hidden="true">{emoji}</div>
              </div>
            </div>
            <div className="space-y-3 p-5 sm:p-6">
              {intelligence.map((item, index) => (
                <div key={item.title} className="group rounded-2xl border border-cream-200 bg-white/80 p-4 transition hover:border-sage-200 hover:shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-bold text-sage-700">{index + 1}</span>
                    <div>
                      <p className="font-medium text-stone-800">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white/65 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-sage-100 p-3 text-sage-700"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage-600">Execution layer</p>
              <h2 className="mt-1 text-3xl font-light text-stone-800">Professional ministry workflow</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="sanctuary-card group p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <CheckCircle2 className="mb-4 h-6 w-6 text-sage-600" aria-hidden="true" />
                <h3 className="text-xl font-medium text-stone-800">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage-600">Connected action flow</p>
            <h2 className="mt-2 text-3xl font-light text-stone-800 sm:text-4xl">Move from insight to ministry action without losing context.</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">Check off the steps as you work. Progress is private to this browser and is not presented as a spiritual score.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {flow.map((item, index) => (
              <button key={item.step} type="button" onClick={() => toggleStep(index)} aria-pressed={workspace.completed[index]} className={`rounded-3xl border p-5 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 ${workspace.completed[index] ? 'border-sage-300 bg-sage-50' : 'border-stone-200 bg-white/85 hover:border-sage-200'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold tracking-[0.24em] text-sage-600">{item.step}</p>
                  <CheckCircle2 className={`h-5 w-5 ${workspace.completed[index] ? 'text-sage-600' : 'text-stone-300'}`} aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-stone-800">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-7 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-600">Private continuity</p>
                    <h3 className="mt-2 text-2xl font-light text-stone-800">Today&apos;s ministry workspace</h3>
                  </div>
                  <ClipboardCheck className="h-6 w-6 text-sage-600" aria-hidden="true" />
                </div>
                <div className="mt-5 rounded-2xl bg-stone-950 p-5 text-white">
                  <div className="flex items-end justify-between gap-3">
                    <div><p className="text-xs uppercase tracking-wider text-stone-400">Action progress</p><p className="mt-1 text-3xl font-light">{hydrated ? completionPercent : 0}%</p></div>
                    <p className="text-xs text-stone-400">{hydrated ? completedCount : 0}/4 steps</p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sage-400 transition-all" style={{ width: `${hydrated ? completionPercent : 0}%` }} /></div>
                  <p className="mt-3 text-xs leading-5 text-stone-400">This meter tracks use of this workspace only. It does not measure faith, maturity, holiness, or ministry worth.</p>
                </div>
                <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor={`ministry-focus-${badge.replace(/\s+/g, '-').toLowerCase()}`}>Focus for this session</label>
                <input id={`ministry-focus-${badge.replace(/\s+/g, '-').toLowerCase()}`} value={workspace.focus} onChange={(event) => setWorkspace((current) => ({ ...current, focus: event.target.value }))} placeholder="What matters most in this ministry moment?" maxLength={240} className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
              </div>
              <div>
                <label className="flex items-center text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor={`ministry-notes-${badge.replace(/\s+/g, '-').toLowerCase()}`}><NotebookPen className="mr-2 h-4 w-4" /> Working notes</label>
                <textarea id={`ministry-notes-${badge.replace(/\s+/g, '-').toLowerCase()}`} value={workspace.notes} onChange={(event) => setWorkspace((current) => ({ ...current, notes: event.target.value }))} placeholder="Capture observations, questions, follow-up context, or a next action. Avoid confidential pastoral details on shared devices." rows={8} maxLength={5000} className="mt-2 w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button type="button" onClick={saveWorkspace} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sage-600 px-5 text-sm font-semibold text-white transition hover:bg-sage-700"><Save className="mr-2 h-4 w-4" /> Save on this device</button>
                  <button type="button" onClick={resetWorkspace} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-600 transition hover:border-stone-300"><RotateCcw className="mr-2 h-4 w-4" /> Reset</button>
                </div>
                {savedMessage && <p className="mt-3 text-xs font-medium text-sage-700" role="status">{savedMessage}</p>}
                {workspace.updatedAt && <p className="mt-2 text-[11px] text-stone-400">Last saved {new Date(workspace.updatedAt).toLocaleString()}</p>}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href={primaryHref} className="group flex min-h-14 items-center justify-between rounded-2xl border border-sage-200 bg-sage-50 px-5 py-4 text-sm font-semibold text-sage-800 transition hover:border-sage-300 hover:bg-sage-100"><span>{primaryLabel}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></Link>
            <Link href={secondaryHref} className="group flex min-h-14 items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm font-semibold text-stone-700 transition hover:border-sage-300 hover:text-sage-800"><span>{secondaryLabel}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-14 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-stone-900 p-7 text-white shadow-2xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sage-200">Trust and safety</p>
              <h2 className="mt-3 text-3xl font-light leading-tight">Designed to serve people with dignity, clarity, privacy, and accountable intelligence.</h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">Automation may assist with organization and next-step guidance, but sensitive pastoral, financial, safeguarding, or leadership decisions stay human-led.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {safeguards.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-stone-100 backdrop-blur">{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[5.1rem] z-30 px-3 sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2 rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-2xl backdrop-blur">
          <Link href={primaryHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sage-600 px-3 text-center text-xs font-semibold text-white">{primaryLabel}</Link>
          <Link href={secondaryHref} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-3 text-center text-xs font-semibold text-stone-700">{secondaryLabel}</Link>
        </div>
      </div>
    </div>
  );
}
