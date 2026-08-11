'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
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
const storageKey = 'digital-church-fasting-prayer-plan';

export default function FastingPrayerPage() {
  const [purpose, setPurpose] = useState('');
  const [focuses, setFocuses] = useState<string[]>([]);
  const [scriptureRefs, setScriptureRefs] = useState('');
  const [notes, setNotes] = useState('');
  const [practice, setPractice] = useState<'food' | 'media' | 'other'>('media');
  const [days, setDays] = useState(3);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;
      const data = JSON.parse(stored);
      setPurpose(typeof data.purpose === 'string' ? data.purpose : '');
      setFocuses(Array.isArray(data.focuses) ? data.focuses.filter((item: unknown): item is string => typeof item === 'string') : []);
      setScriptureRefs(typeof data.scriptureRefs === 'string' ? data.scriptureRefs : '');
      setNotes(typeof data.notes === 'string' ? data.notes : '');
      setPractice(data.practice === 'food' || data.practice === 'other' ? data.practice : 'media');
      setDays([1, 3, 7, 14, 21].includes(Number(data.days)) ? Number(data.days) : 3);
      setCompletedDays(Array.isArray(data.completedDays) ? data.completedDays.filter((item: unknown): item is number => Number.isInteger(item)) : []);
    } catch {
      // Private local plan remains optional.
    }
  }, []);

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

  const savePlan = async () => {
    if (saving) return;
    setSaving(true);
    setSaveStatus('');

    let localSaved = false;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ purpose, focuses, scriptureRefs, notes, practice, days, completedDays }));
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
    const nextStep = [
      `${days}-day ${practiceLabel}`,
      focuses.length ? `Prayer focuses: ${focuses.join(', ')}` : '',
      completedDays.length ? `Days reflected: ${completedDays.sort((a, b) => a - b).join(', ')}` : '',
    ].filter(Boolean).join('. ');

    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'Fasting', title: 'Fasting & prayer plan', content, scriptureRefs: refs, nextStep }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSaveStatus('Plan saved on this device and its reflection added to your private Journey timeline.');
      } else if (response.status === 401 && localSaved) {
        setSaveStatus('Plan saved privately on this device. Sign in to carry its reflection into your Journey timeline.');
      } else {
        setSaveStatus(localSaved ? `Plan saved on this device. ${data.error || 'Journey sync is temporarily unavailable.'}` : (data.error || 'Unable to save the fasting plan.'));
      }
    } catch {
      setSaveStatus(localSaved ? 'Plan saved privately on this device. Journey sync is temporarily unavailable.' : 'Unable to save the fasting plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 sm:p-9 lg:p-11">
              <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                <Sparkles className="mr-2 h-4 w-4" /> Fasting & prayer journey
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-light leading-tight text-stone-900 md:text-5xl">Create a focused spiritual rhythm for prayer, Scripture, reflection, and service.</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">Plan the spiritual purpose first. Physical fasting is optional and is not appropriate for everyone; this workspace also supports non-food practices such as reducing media or other distractions.</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { id: 'food', label: 'Food-related fast', icon: Utensils, note: 'Only if appropriate for you.' },
                  { id: 'media', label: 'Media / distraction fast', icon: Smartphone, note: 'Reduce selected distractions.' },
                  { id: 'other', label: 'Custom discipline', icon: Sparkles, note: 'Choose a healthy practice.' },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = practice === item.id;
                  return <button key={item.id} type="button" onClick={() => { markChanged(); setPractice(item.id as typeof practice); }} className={`rounded-2xl border p-4 text-left transition ${active ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-stone-50'}`}><Icon className="h-5 w-5 text-amber-700" /><p className="mt-3 font-semibold text-stone-900">{item.label}</p><p className="mt-1 text-xs text-stone-500">{item.note}</p></button>;
                })}
              </div>

              <label className="mt-6 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Purpose</span><textarea value={purpose} onChange={(e) => { setPurpose(e.target.value); markChanged(); }} maxLength={1600} className="min-h-[110px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 leading-6 outline-none focus:ring-2 focus:ring-amber-200" placeholder="Why are you setting apart this time? What do you want to seek God about?" /></label>

              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Prayer focuses</p>
                <div className="flex flex-wrap gap-2">{focusOptions.map((focus) => <button key={focus} type="button" onClick={() => toggleFocus(focus)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${focuses.includes(focus) ? 'bg-sage-600 text-white' : 'border border-stone-200 bg-white text-stone-600'}`}>{focuses.includes(focus) && <Check className="mr-1 inline h-3.5 w-3.5" />}{focus}</button>)}</div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture references</span><textarea value={scriptureRefs} onChange={(e) => { setScriptureRefs(e.target.value); markChanged(); }} maxLength={1200} className="min-h-[120px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 outline-none focus:ring-2 focus:ring-amber-200" placeholder="e.g. Isaiah 58, Matthew 6:16-18" /></label>
                <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Private reflection</span><textarea value={notes} onChange={(e) => { setNotes(e.target.value); markChanged(); }} maxLength={2200} className="min-h-[120px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 outline-none focus:ring-2 focus:ring-amber-200" placeholder="Prayer burdens, gratitude, insights, answered prayer..." /></label>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-4">
                <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Plan length</span><select value={days} onChange={(e) => { markChanged(); setDays(Number(e.target.value)); setCompletedDays([]); }} className="rounded-xl border border-stone-200 bg-white px-4 py-3"><option value={1}>1 day</option><option value={3}>3 days</option><option value={7}>7 days</option><option value={14}>14 days</option><option value={21}>21 days</option></select></label>
                <button type="button" onClick={savePlan} disabled={saving} className="inline-flex items-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save private plan'}</button>
                <Link href="/prayer-room" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Open Prayer Room</Link>
              </div>
              {saveStatus && <p className="mt-3 text-xs leading-5 text-stone-500" role="status">{saveStatus}</p>}
              <Link href="/journey" className="mt-3 inline-flex text-sm font-semibold text-sage-700">View private Journey →</Link>
            </div>

            <aside className="bg-stone-950 p-7 text-white sm:p-9 lg:p-11">
              <ShieldCheck className="h-8 w-8 text-amber-300" />
              <h2 className="mt-5 text-3xl font-light">Keep fasting spiritually meaningful and physically responsible.</h2>
              <div className="mt-6 space-y-4 text-sm leading-6 text-stone-300">
                <p className="rounded-2xl border border-white/10 bg-white/5 p-4">Fasting should not be used to pressure, shame, compete, or prove spirituality. The purpose is prayerful focus and obedience.</p>
                <p className="rounded-2xl border border-white/10 bg-white/5 p-4">If you are pregnant, a child or teenager, have a health condition, take medication, have a history of disordered eating, or are unsure whether food fasting is appropriate, choose a non-food practice and seek appropriate professional guidance.</p>
                <p className="rounded-2xl border border-white/10 bg-white/5 p-4">Never use the app to prescribe extreme food or water restriction. Church leaders should encourage responsible, voluntary participation.</p>
              </div>
              <Link href="/care" className="mt-7 inline-flex items-center text-sm font-semibold text-sage-300"><HeartHandshake className="mr-2 h-4 w-4" /> Request human care</Link>
            </aside>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Daily rhythm</p><h2 className="mt-2 text-3xl font-light text-stone-900">Pray. Read. Reflect. Serve. Rest.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Marking a day simply tracks your private plan; it is not a spiritual score.</p></div>
            <div className="min-w-[170px] rounded-2xl bg-sage-50 p-4"><div className="flex justify-between text-xs font-semibold text-sage-800"><span>Progress</span><span>{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-sage-100"><div className="h-full bg-sage-600" style={{ width: `${progress}%` }} /></div></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">{Array.from({ length: days }, (_, index) => index + 1).map((day) => { const done = completedDays.includes(day); return <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-2xl border p-4 text-left transition ${done ? 'border-sage-200 bg-sage-50' : 'border-stone-200 bg-stone-50'}`}><CalendarDays className={`h-5 w-5 ${done ? 'text-sage-700' : 'text-stone-400'}`} /><p className="mt-3 font-semibold text-stone-900">Day {day}</p><p className="mt-1 text-xs text-stone-500">{done ? 'Reflection recorded' : 'Open for prayer'}</p></button>; })}</div>
        </section>
      </div>
    </main>
  );
}
