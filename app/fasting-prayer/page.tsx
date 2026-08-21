'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  CalendarDays,
  Check,
  HeartHandshake,
  Loader2,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Utensils,
  Smartphone,
} from 'lucide-react';

const focusOptions = ['Repentance & renewal', 'Family', 'Church', 'Healing & comfort', 'Wisdom', 'Outreach & mission', 'Justice & mercy', 'Gratitude'];
const LEGACY_STORAGE_KEY = 'digital-church-fasting-prayer-plan';

const practiceOptions = [
  { id: 'food' as const, label: 'Food-related fast', icon: Utensils, note: 'Only if appropriate for you.' },
  { id: 'media' as const, label: 'Media / distraction fast', icon: Smartphone, note: 'Reduce selected distractions.' },
  { id: 'other' as const, label: 'Custom discipline', icon: Sparkles, note: 'Choose a healthy practice.' },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(userId: string) {
  return `digital-church-fasting-prayer-plan:v2:${userId}`;
}

export default function FastingPrayerPage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';
  const [purpose, setPurpose] = useState('');
  const [focuses, setFocuses] = useState<string[]>([]);
  const [scriptureRefs, setScriptureRefs] = useState('');
  const [notes, setNotes] = useState('');
  const [practice, setPractice] = useState<'food' | 'media' | 'other'>('media');
  const [days, setDays] = useState(3);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [startedOn, setStartedOn] = useState(todayKey());
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [legacyDraftPresent, setLegacyDraftPresent] = useState(false);

  useEffect(() => {
    if (!userId) return;
    try {
      setLegacyDraftPresent(Boolean(window.localStorage.getItem(LEGACY_STORAGE_KEY)));
      const stored = window.localStorage.getItem(storageKey(userId));
      if (!stored) return;
      const data = JSON.parse(stored);
      setPurpose(typeof data.purpose === 'string' ? data.purpose : '');
      setFocuses(Array.isArray(data.focuses) ? data.focuses.filter((item: unknown): item is string => typeof item === 'string') : []);
      setScriptureRefs(typeof data.scriptureRefs === 'string' ? data.scriptureRefs : '');
      setNotes(typeof data.notes === 'string' ? data.notes : '');
      setPractice(data.practice === 'food' || data.practice === 'other' ? data.practice : 'media');
      setDays([1, 3, 7, 14, 21].includes(Number(data.days)) ? Number(data.days) : 3);
      setCompletedDays(Array.isArray(data.completedDays) ? data.completedDays.filter((item: unknown): item is number => Number.isInteger(item)) : []);
      setStartedOn(typeof data.startedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.startedOn) ? data.startedOn : todayKey());
    } catch {
      setSaveStatus('This account’s fasting plan could not be restored from the browser.');
    }
  }, [userId]);

  const progress = useMemo(() => Math.round((completedDays.length / Math.max(days, 1)) * 100), [completedDays.length, days]);

  const markChanged = () => setSaveStatus('');
  const toggleFocus = (focus: string) => {
    markChanged();
    setFocuses((current) => current.includes(focus) ? current.filter((item) => item !== focus) : [...current, focus]);
  };
  const toggleDay = (day: number) => {
    markChanged();
    setCompletedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  };

  const removeLegacyDraft = () => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLegacyDraftPresent(false);
      setSaveStatus('Legacy unscoped fasting plan removed without importing it into this account.');
    } catch {
      setSaveStatus('Legacy fasting plan could not be removed.');
    }
  };

  const savePlan = async () => {
    if (saving) return;
    if (!userId) {
      setSaveStatus('Sign in to save this private fasting plan and carry its reflection into Journey.');
      return;
    }
    setSaving(true);
    setSaveStatus('');

    let localSaved = false;
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify({ purpose, focuses, scriptureRefs, notes, practice, days, completedDays, startedOn }));
      localSaved = true;
    } catch {
      localSaved = false;
    }

    const content = [
      purpose.trim() ? `Purpose: ${purpose.trim()}` : '',
      notes.trim() ? `Reflection: ${notes.trim()}` : '',
    ].filter(Boolean).join('\n\n');
    const refs = scriptureRefs.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean);
    const practiceLabel = practice === 'food' ? 'food-related fast' : practice === 'media' ? 'media / distraction fast' : 'custom discipline';
    const completedSorted = [...completedDays].sort((a, b) => a - b);
    const nextStep = [
      `${days}-day ${practiceLabel}`,
      focuses.length ? `Prayer focuses: ${focuses.join(', ')}` : '',
      completedSorted.length ? `Days reflected: ${completedSorted.join(', ')}` : '',
    ].filter(Boolean).join('. ');

    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Fasting',
          sourceKey: `fasting-plan:${startedOn}`,
          title: `Fasting & prayer plan · ${startedOn}`,
          content,
          scriptureRefs: refs,
          nextStep,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSaveStatus(`Plan saved to this account’s browser draft and ${data.operation === 'updated' ? 'updated in' : 'added to'} your private Journey.`);
      } else {
        setSaveStatus(localSaved ? `Plan saved to this account’s browser draft. ${data.error || 'Journey sync is temporarily unavailable.'}` : (data.error || 'Unable to save the fasting plan.'));
      }
    } catch {
      setSaveStatus(localSaved ? 'Plan saved to this account’s browser draft. Journey sync is temporarily unavailable.' : 'Unable to save the fasting plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-20 pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.68fr] lg:items-end">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl">
              <Sparkles className="mr-2 h-4 w-4" /> Fasting & prayer sanctuary
            </div>
            <h1 className="mt-6 text-4xl font-light leading-[1.03] text-white md:text-7xl">Set something aside so prayer, Scripture, mercy, and obedience can come back into focus.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Build a private rhythm around purpose rather than performance. Food fasting remains optional; media reduction and other healthy disciplines are first-class paths when they are more appropriate.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#fasting-plan" className="sacred-primary-button"><NotebookPen className="h-4 w-4" /> Shape a private plan</Link>
              <Link href="/prayer-room" className="sacred-secondary-button"><HeartHandshake className="h-4 w-4" /> Enter Prayer Room</Link>
              <Link href="/scripture" className="sacred-secondary-button"><BookOpenText className="h-4 w-4" /> Open Scripture</Link>
            </div>
          </div>

          <aside className="sacred-panel-dark relative z-10 overflow-hidden p-7">
            <div className="presence-orbit" aria-hidden="true" />
            <ShieldCheck className="relative h-7 w-7 text-amber-100" />
            <p className="relative mt-5 sanctuary-section-label text-emerald-200/60">Voluntary · responsible · private</p>
            <h2 className="relative mt-2 text-3xl font-light text-white">Fasting is not proof of spirituality.</h2>
            <p className="relative mt-4 text-sm leading-7 text-white/45">The app does not prescribe extreme restriction, shame people into participation, or infer spiritual maturity from duration or completion. Health-sensitive decisions belong with appropriate professional guidance and trusted human leadership.</p>
          </aside>
        </div>
      </section>

      <section id="fasting-plan" className="relative px-4 py-12 sm:px-6 lg:px-8">
        <div className="sanctuary-radiance absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          {legacyDraftPresent && (
            <div className="mb-5 rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">
              An older device-only fasting plan exists. It was <strong>not imported</strong> because this browser may be shared and its original owner cannot be verified.
              <button type="button" onClick={removeLegacyDraft} className="ml-2 font-semibold underline">Remove legacy plan</button>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="sacred-panel-dark p-6 sm:p-8">
              <p className="sanctuary-section-label text-amber-100/55">Choose the discipline</p>
              <h2 className="mt-2 text-3xl font-light text-white sm:text-4xl">Start with what you are making room for—not what you are giving up.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">Your selection helps describe the plan. It does not become a spiritual score or recommendation engine.</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {practiceOptions.map((item) => {
                  const Icon = item.icon;
                  const active = practice === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { markChanged(); setPractice(item.id); }}
                      className={`rounded-2xl border p-4 text-left transition ${active ? 'border-amber-200/30 bg-amber-300/10 shadow-[0_16px_42px_rgba(245,201,120,.08)]' : 'border-white/10 bg-white/[0.035] hover:border-white/18 hover:bg-white/[0.055]'}`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-amber-100' : 'text-white/45'}`} />
                      <p className="mt-3 font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-white/38">{item.note}</p>
                    </button>
                  );
                })}
              </div>

              <label className="mt-7 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">Purpose</span>
                <textarea value={purpose} onChange={(e) => { setPurpose(e.target.value); markChanged(); }} maxLength={1600} className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 leading-6 text-white outline-none placeholder:text-white/20 focus:ring-2 focus:ring-amber-200/45" placeholder="Why are you setting apart this time? What do you want to seek God about?" />
              </label>

              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/35">Prayer focuses</p>
                <div className="flex flex-wrap gap-2">
                  {focusOptions.map((focus) => (
                    <button key={focus} type="button" onClick={() => toggleFocus(focus)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${focuses.includes(focus) ? 'border-emerald-200/30 bg-emerald-300/12 text-emerald-100' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/18'}`}>
                      {focuses.includes(focus) && <Check className="mr-1 inline h-3.5 w-3.5" />}
                      {focus}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">Scripture references</span>
                  <textarea value={scriptureRefs} onChange={(e) => { setScriptureRefs(e.target.value); markChanged(); }} maxLength={1200} className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none placeholder:text-white/20 focus:ring-2 focus:ring-amber-200/45" placeholder="e.g. Isaiah 58, Matthew 6:16-18" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">Private reflection</span>
                  <textarea value={notes} onChange={(e) => { setNotes(e.target.value); markChanged(); }} maxLength={2200} className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none placeholder:text-white/20 focus:ring-2 focus:ring-amber-200/45" placeholder="Prayer burdens, gratitude, insights, answered prayer..." />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">Plan length</span>
                  <select value={days} onChange={(e) => { markChanged(); setDays(Number(e.target.value)); setCompletedDays([]); }} className="rounded-xl border border-white/10 bg-[#071512] px-4 py-3 text-white outline-none">
                    <option value={1}>1 day</option><option value={3}>3 days</option><option value={7}>7 days</option><option value={14}>14 days</option><option value={21}>21 days</option>
                  </select>
                </label>
                <button type="button" onClick={savePlan} disabled={saving} className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-200 to-amber-100 px-5 py-3 text-sm font-semibold text-[#07110f] shadow-[0_14px_36px_rgba(245,201,120,.14)] disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving privately…' : 'Save private plan'}
                </button>
                <Link href="/prayer-room" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-emerald-200">Open Prayer Room</Link>
              </div>
              {saveStatus && <p className="mt-3 text-xs leading-5 text-white/50" role="status">{saveStatus}</p>}
              <p className="mt-2 text-[11px] leading-5 text-white/28">Active plan started {startedOn}. Re-saving updates the same Journey moment instead of creating a duplicate.</p>
              <Link href="/journey" className="mt-3 inline-flex text-sm font-semibold text-emerald-200">View private Journey →</Link>
            </div>

            <aside className="sacred-panel-dark p-6 sm:p-8">
              <ShieldCheck className="h-7 w-7 text-amber-100" />
              <p className="mt-5 sanctuary-section-label text-emerald-200/55">Responsible boundaries</p>
              <h2 className="mt-2 text-3xl font-light text-white">Keep the practice spiritually meaningful and physically responsible.</h2>
              <div className="mt-6 space-y-3 text-sm leading-6 text-white/48">
                <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">Fasting should not be used to pressure, shame, compete, or prove spirituality. The purpose is prayerful focus and obedience.</p>
                <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">If food fasting may be inappropriate because of age, pregnancy, medication, a health condition, disordered-eating history, or uncertainty, choose a non-food practice and seek appropriate professional guidance.</p>
                <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">The app does not prescribe extreme food or water restriction. Church leaders should encourage responsible, voluntary participation and appropriate adaptations.</p>
              </div>
              <Link href="/care" className="mt-7 inline-flex items-center text-sm font-semibold text-emerald-200"><HeartHandshake className="mr-2 h-4 w-4" /> Request human care</Link>
            </aside>
          </div>

          <div className="mt-8 sacred-panel-dark p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="sanctuary-section-label text-emerald-200/55">Daily rhythm</p>
                <h2 className="mt-2 text-3xl font-light text-white">Pray. Read. Reflect. Serve. Rest.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Marking a day simply tracks your private plan. It is not a measure of holiness, sacrifice, favor, or spiritual maturity.</p>
              </div>
              <div className="min-w-[180px] rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between text-xs font-semibold text-white/55"><span>Plan completion</span><span>{progress}%</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-200 transition-all" style={{ width: `${progress}%` }} /></div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
              {Array.from({ length: days }, (_, index) => index + 1).map((day) => {
                const done = completedDays.includes(day);
                return (
                  <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-2xl border p-4 text-left transition ${done ? 'border-emerald-200/25 bg-emerald-300/10' : 'border-white/10 bg-white/[0.035]'}`}>
                    <CalendarDays className={`h-5 w-5 ${done ? 'text-emerald-100' : 'text-white/30'}`} />
                    <p className="mt-3 font-semibold text-white">Day {day}</p>
                    <p className="mt-1 text-xs text-white/35">{done ? 'Reflection recorded' : 'Open for prayer'}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
