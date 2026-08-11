'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  CalendarDays,
  Check,
  Clock3,
  HeartHandshake,
  NotebookPen,
  ShieldAlert,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type DayPlan = {
  id: string;
  label: string;
  scripture: string;
  prayerFocus: string;
  reflection: string;
  completed: boolean;
};

const defaultDays: DayPlan[] = [
  { id: 'day-1', label: 'Day 1', scripture: 'Psalm 51', prayerFocus: 'Consecration, repentance, and renewed attention to God', reflection: '', completed: false },
  { id: 'day-2', label: 'Day 2', scripture: 'Isaiah 58:6-12', prayerFocus: 'Mercy, justice, generosity, and care for others', reflection: '', completed: false },
  { id: 'day-3', label: 'Day 3', scripture: 'Matthew 6:5-18', prayerFocus: 'Sincere prayer, humility, and hidden devotion', reflection: '', completed: false },
  { id: 'day-4', label: 'Day 4', scripture: 'John 15:1-11', prayerFocus: 'Abiding in Christ and bearing faithful fruit', reflection: '', completed: false },
  { id: 'day-5', label: 'Day 5', scripture: 'Philippians 4:4-9', prayerFocus: 'Peace, gratitude, and disciplined thought', reflection: '', completed: false },
  { id: 'day-6', label: 'Day 6', scripture: 'Acts 13:1-3', prayerFocus: 'Church mission, calling, and service', reflection: '', completed: false },
  { id: 'day-7', label: 'Day 7', scripture: 'Romans 12:1-18', prayerFocus: 'Worshipful living, community, and practical obedience', reflection: '', completed: false },
];

const focusModes = [
  { id: 'prayer', title: 'Prayer focus', description: 'Set aside extra time and attention for prayer without prescribing a food fast.' },
  { id: 'media', title: 'Media / distraction fast', description: 'Reduce optional media or entertainment so attention can return to Scripture, prayer, family, and service.' },
  { id: 'church', title: 'Church-led fast', description: 'Follow your church’s pastoral guidance and agreed schedule, with room for health-related adaptations.' },
];

function storageKey() {
  return 'digital-church-fasting-prayer-plan:v1';
}

export function FastingPrayerPlanner() {
  const [days, setDays] = useState<DayPlan[]>(defaultDays);
  const [mode, setMode] = useState('prayer');
  const [intention, setIntention] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey());
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.days)) setDays(parsed.days);
      if (typeof parsed.mode === 'string') setMode(parsed.mode);
      if (typeof parsed.intention === 'string') setIntention(parsed.intention);
    } catch {
      // Local planning is optional.
    }
  }, []);

  const progress = useMemo(() => Math.round((days.filter((day) => day.completed).length / days.length) * 100), [days]);

  const save = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ days, mode, intention }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  const updateDay = (id: string, patch: Partial<DayPlan>) => {
    setDays((current) => current.map((day) => day.id === id ? { ...day, ...patch } : day));
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles className="mr-2 h-4 w-4" /> Fasting & prayer journey
            </div>
            <h2 className="mt-5 text-3xl font-light leading-tight text-stone-900 md:text-4xl">Plan a spiritually focused season without turning fasting into a competition or medical prescription.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Define the purpose, follow Scripture, keep reflections private, and stay connected to accountable church leadership. The planner supports prayer and church-led rhythms; it does not prescribe unsafe food restriction.
            </p>

            <label className="mt-7 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Prayer intention</span>
              <textarea value={intention} onChange={(event) => setIntention(event.target.value)} className="min-h-28 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-700 outline-none focus:ring-2 focus:ring-violet-200" placeholder="What are you seeking God about? What change, obedience, intercession, or ministry burden are you bringing into this season?" />
            </label>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {focusModes.map((item) => (
                <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-2xl border p-4 text-left transition ${mode === item.id ? 'border-violet-300 bg-violet-50' : 'border-stone-200 bg-white hover:border-violet-200'}`}>
                  <p className="font-semibold text-stone-900">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">{item.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={save} className="inline-flex items-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800">
                {saved ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}{saved ? 'Saved privately' : 'Save prayer plan'}
              </button>
              <Link href="/prayer-room" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><HeartHandshake className="mr-2 h-4 w-4" /> Prayer room</Link>
              <Link href="/scripture" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><BookOpenText className="mr-2 h-4 w-4" /> Scripture study</Link>
            </div>
          </div>

          <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Journey progress</p><p className="mt-2 text-4xl font-light">{progress}%</p></div>
              <CalendarDays className="h-8 w-8 text-violet-300" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${progress}%` }} /></div>
            <div className="mt-7 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-300"><Clock3 className="mb-2 h-5 w-5 text-violet-300" /> Build a sustainable prayer rhythm around Scripture, silence, worship, intercession, and service—not merely hours without food.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-300"><UsersRound className="mb-2 h-5 w-5 text-violet-300" /> Church-led corporate fasts should remain pastorally accountable and allow appropriate health adaptations.</div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><ShieldAlert className="mb-2 h-5 w-5" /> If fasting from food could affect pregnancy, diabetes, an eating disorder, medications, chronic illness, or another health concern, use a safer spiritual practice and seek appropriate medical guidance before restricting food or fluids.</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => (
          <article key={day.id} className={`rounded-3xl border p-5 transition ${day.completed ? 'border-violet-200 bg-violet-50' : 'border-stone-200 bg-white'}`}>
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">{day.label}</p><h3 className="mt-1 font-semibold text-stone-900">{day.prayerFocus}</h3></div>
              <button type="button" onClick={() => updateDay(day.id, { completed: !day.completed })} className={`flex h-9 w-9 items-center justify-center rounded-full ${day.completed ? 'bg-violet-700 text-white' : 'bg-stone-100 text-stone-500'}`} aria-label={`Mark ${day.label} ${day.completed ? 'incomplete' : 'complete'}`}><Check className="h-4 w-4" /></button>
            </div>
            <Link href="/scripture" className="mt-4 inline-flex items-center rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700"><BookOpenText className="mr-1.5 h-3.5 w-3.5" /> {day.scripture}</Link>
            <textarea value={day.reflection} onChange={(event) => updateDay(day.id, { reflection: event.target.value })} className="mt-4 min-h-24 w-full rounded-2xl border border-stone-100 bg-white/80 p-3 text-xs leading-5 text-stone-700 outline-none focus:border-violet-200" placeholder="Prayer/reflection for this day..." />
          </article>
        ))}
      </section>
    </div>
  );
}
