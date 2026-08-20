'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  Check,
  Church,
  Focus,
  HeartHandshake,
  MessageCircleHeart,
  NotebookPen,
  Radio,
  Save,
  Sparkles,
} from 'lucide-react';

type ServiceMoment = 'gather' | 'worship' | 'scripture' | 'sermon' | 'prayer' | 'communion' | 'response' | 'sending';

type FocusMode = 'watch' | 'scripture' | 'notes';

const moments: Array<{ id: ServiceMoment; label: string; hint: string }> = [
  { id: 'gather', label: 'Gather', hint: 'Welcome, call to worship, orientation.' },
  { id: 'worship', label: 'Worship', hint: 'Songs, praise, silence, corporate response.' },
  { id: 'scripture', label: 'Scripture', hint: 'Read the biblical text slowly and in context.' },
  { id: 'sermon', label: 'Sermon', hint: 'Listen, mark key points, and capture references.' },
  { id: 'prayer', label: 'Prayer', hint: 'Intercession, confession, thanksgiving, ministry prayer.' },
  { id: 'communion', label: 'Communion', hint: 'Participate according to your church’s teaching and practice.' },
  { id: 'response', label: 'Response', hint: 'Prayer, care, salvation response, discipleship, service.' },
  { id: 'sending', label: 'Sending', hint: 'Benediction, next steps, service beyond the gathering.' },
];

const storageKey = 'digital-church-live-second-screen';

export function LiveWorshipCommandRail() {
  const [moment, setMoment] = useState<ServiceMoment>('sermon');
  const [focusMode, setFocusMode] = useState<FocusMode>('watch');
  const [reference, setReference] = useState('');
  const [focus, setFocus] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (moments.some((item) => item.id === data.moment)) setMoment(data.moment);
      if (['watch', 'scripture', 'notes'].includes(data.focusMode)) setFocusMode(data.focusMode);
      setReference(data.reference || '');
      setFocus(data.focus || '');
    } catch {
      // Local second-screen state is optional.
    }
  }, []);

  const activeIndex = useMemo(() => Math.max(0, moments.findIndex((item) => item.id === moment)), [moment]);
  const activeMoment = moments[activeIndex];

  const save = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ moment, focusMode, reference, focus }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="bg-stone-950 px-4 pt-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-stone-900 shadow-2xl">
        <div className="grid xl:grid-cols-[1.12fr_0.88fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center rounded-full bg-sage-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-300">
                  <Radio className="mr-2 h-4 w-4" /> Live worship second screen
                </div>
                <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight md:text-4xl">Stay present in the service while Scripture, notes, prayer, and response remain one tap away.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-400">This layer does not pretend to control the external livestream player. It organizes the worship journey around the stream and keeps your private service context on this device.</p>
              </div>
              <div className="min-w-[180px] rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Current moment</p>
                <p className="mt-2 text-xl font-semibold text-white">{activeMoment.label}</p>
                <p className="mt-1 text-xs leading-5 text-stone-400">{activeMoment.hint}</p>
              </div>
            </div>

            <div className="mt-7 overflow-x-auto pb-2">
              <div className="flex min-w-max gap-2">
                {moments.map((item, index) => {
                  const active = item.id === moment;
                  const passed = index < activeIndex;
                  return (
                    <button key={item.id} type="button" onClick={() => setMoment(item.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${active ? 'border-sage-400 bg-sage-500 text-white' : passed ? 'border-sage-400/20 bg-sage-400/10 text-sage-200' : 'border-white/10 bg-white/5 text-stone-400 hover:text-white'}`}>
                      {passed && <Check className="mr-1 inline h-3 w-3" />}{item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Focus mode</p>
                <div className="mt-3 grid gap-2">
                  {([
                    ['watch', 'Watch quietly', 'Keep the interface minimal while the service is active.'],
                    ['scripture', 'Scripture focus', 'Keep the current reference visible for Bible study handoff.'],
                    ['notes', 'Active notes', 'Move quickly into the live sermon companion below.'],
                  ] as Array<[FocusMode, string, string]>).map(([id, label, note]) => (
                    <button key={id} type="button" onClick={() => setFocusMode(id)} className={`rounded-xl border p-3 text-left ${focusMode === id ? 'border-amber-300/40 bg-amber-300/10' : 'border-white/10 bg-white/5'}`}>
                      <p className={`text-sm font-semibold ${focusMode === id ? 'text-amber-200' : 'text-stone-200'}`}>{label}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-500">{note}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Current Scripture reference</span>
                    <input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sage-400/40" placeholder="e.g. John 15:1-8" />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Message / service focus</span>
                    <input value={focus} onChange={(e) => setFocus(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sage-400/40" placeholder="One phrase to remember" />
                  </label>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Link href="/scripture" className="inline-flex items-center justify-center rounded-xl bg-sage-500 px-4 py-3 text-sm font-semibold text-white"><BookOpenText className="mr-2 h-4 w-4" /> Bible</Link>
                  <Link href="/prayer-room" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-100"><Sparkles className="mr-2 h-4 w-4" /> Prayer</Link>
                  <Link href="/service-response" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-100"><MessageCircleHeart className="mr-2 h-4 w-4" /> Respond</Link>
                </div>
                <button type="button" onClick={save} className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-stone-800 px-4 py-3 text-sm font-semibold text-stone-200 hover:bg-stone-700">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Service context saved privately' : 'Save this service context'}</button>
              </div>
            </div>
          </div>

          <aside className="border-t border-white/10 bg-black/20 p-6 sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
            <Focus className="h-8 w-8 text-amber-300" />
            <h3 className="mt-5 text-2xl font-light">One service, one connected ministry flow.</h3>
            <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">During Scripture:</strong> open the translation-aware Bible desk without losing the service route.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">During preaching:</strong> the live companion below captures voice jots, timestamps, references, questions, and a next action.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">During response:</strong> move directly into prayer, human care, discipleship, or service rather than ending at a reaction button.</div>
            </div>
            <div className="mt-7 grid gap-3">
              <Link href="/sermons" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-100"><NotebookPen className="mr-2 h-4 w-4" /> Sermon & teaching studio</Link>
              <Link href="/care" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-rose-200"><HeartHandshake className="mr-2 h-4 w-4" /> Human pastoral care</Link>
              <Link href="/church-life" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-sage-200"><Church className="mr-2 h-4 w-4" /> Continue in church life</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
