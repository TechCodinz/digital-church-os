'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { DailyAlignmentIntelligence } from '@/components/ministry/DailyAlignmentIntelligence';
import {
  BookOpenText,
  Check,
  Heart,
  Loader2,
  NotebookPen,
  Radio,
  Sparkles,
  Sunrise,
  UsersRound,
} from 'lucide-react';

const rhythm = [
  { id: 'scripture', title: 'Receive the Word', description: 'Read one passage slowly, in context, before reaching for commentary or AI.', href: '/scripture', icon: BookOpenText },
  { id: 'pray', title: 'Pray honestly', description: 'Respond to God with gratitude, confession, intercession, and your real concerns.', href: '/prayer-room', icon: Heart },
  { id: 'worship', title: 'Make room for worship', description: 'Use silence, song, or a worship sequence that helps you pay attention to God.', href: '/worship-media', icon: Radio },
  { id: 'serve', title: 'Serve one person', description: 'Turn formation outward through encouragement, practical help, generosity, or ministry service.', href: '/activities', icon: UsersRound },
  { id: 'reflect', title: 'Jot what changed', description: 'Capture one insight, one question, and one next step to revisit later.', href: '/journey', icon: NotebookPen },
];

const LEGACY_PREFIX = 'digital-church-daily-alignment:';

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function key(userId: string) {
  return `digital-church-daily-alignment:v2:${userId}:${dayKey()}`;
}

function legacyKey() {
  return `${LEGACY_PREFIX}${dayKey()}`;
}

export default function DailyGuidePage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';
  const [completed, setCompleted] = useState<string[]>([]);
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [legacyDraftPresent, setLegacyDraftPresent] = useState(false);

  useEffect(() => {
    if (!userId) return;
    try {
      setLegacyDraftPresent(Boolean(window.localStorage.getItem(legacyKey())));
      const stored = window.localStorage.getItem(key(userId));
      if (!stored) return;
      const data = JSON.parse(stored);
      setCompleted(Array.isArray(data.completed) ? data.completed : []);
      setMorning(data.morning || '');
      setEvening(data.evening || '');
    } catch {
      setSaveStatus('This account’s daily rhythm could not be restored from the browser.');
    }
  }, [userId]);

  const progress = useMemo(() => Math.round((completed.length / rhythm.length) * 100), [completed.length]);
  const toggle = (id: string) => {
    setSaveStatus('');
    setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const removeLegacyDraft = () => {
    try {
      window.localStorage.removeItem(legacyKey());
      setLegacyDraftPresent(false);
      setSaveStatus('Legacy unscoped daily draft removed without importing it into this account.');
    } catch {
      setSaveStatus('Legacy daily draft could not be removed.');
    }
  };

  const save = async () => {
    if (saving) return;
    if (!userId) {
      setSaveStatus('Sign in to save today’s private rhythm and carry its reflection into Journey.');
      return;
    }
    setSaving(true);
    setSaveStatus('');

    let localSaved = false;
    try {
      window.localStorage.setItem(key(userId), JSON.stringify({ completed, morning, evening }));
      localSaved = true;
    } catch {
      localSaved = false;
    }

    const reflectionParts = [
      morning.trim() ? `Morning intention: ${morning.trim()}` : '',
      evening.trim() ? `Evening examen: ${evening.trim()}` : '',
    ].filter(Boolean);

    if (!reflectionParts.length) {
      setSaveStatus(localSaved ? 'Daily rhythm saved to this account’s browser draft. Add a reflection when you want it carried into Journey.' : 'Nothing was saved. Add a reflection and try again.');
      setSaving(false);
      return;
    }

    const completedLabels = rhythm.filter((item) => completed.includes(item.id)).map((item) => item.title);

    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Daily Guide',
          sourceKey: `daily-guide:${dayKey()}`,
          title: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          content: reflectionParts.join('\n\n'),
          nextStep: completedLabels.length ? `Rhythm touched today: ${completedLabels.join(', ')}` : '',
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSaveStatus(`Saved to this account’s browser draft and ${data.operation === 'updated' ? 'updated in' : 'added to'} your private Journey.`);
      } else {
        setSaveStatus(localSaved ? `Saved to this account’s browser draft. ${data.error || 'Journey sync is temporarily unavailable.'}` : (data.error || 'Unable to save today’s reflection.'));
      }
    } catch {
      setSaveStatus(localSaved ? 'Saved to this account’s browser draft. Journey sync is temporarily unavailable.' : 'Unable to save today’s reflection.');
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
            <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl"><Sunrise className="mr-2 h-4 w-4" /> Daily alignment sanctuary</div>
            <h1 className="mt-6 text-4xl font-light leading-[1.03] text-white md:text-7xl">Begin the day with attention. End it with remembrance.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Scripture, prayer, worship, service, and reflection become one quiet daily rhythm—not a streak, not a holiness score, and not another noisy dashboard competing for your attention.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#daily-rhythm" className="sacred-primary-button"><Sparkles className="h-4 w-4" /> Enter today’s rhythm</Link>
              <Link href="/scripture" className="sacred-secondary-button"><BookOpenText className="h-4 w-4" /> Begin with the Word</Link>
              <Link href="/prayer-room" className="sacred-secondary-button"><Heart className="h-4 w-4" /> Enter Prayer Room</Link>
            </div>
          </div>

          <div className="sacred-panel-dark relative z-10 overflow-hidden p-7">
            <div className="presence-orbit" aria-hidden="true" />
            <p className="sanctuary-section-label relative text-emerald-200/60">Private daily pulse</p>
            <div className="relative mt-5 flex items-end gap-3"><span className="text-6xl font-light text-white">{progress}%</span><span className="pb-2 text-xs uppercase tracking-[0.18em] text-white/35">rhythm touched</span></div>
            <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-200 transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="relative mt-5 text-sm leading-7 text-white/45">This percentage only reflects which prompts you chose to touch today. It is private, account-scoped, and never used to rank spiritual maturity.</p>
          </div>
        </div>
      </section>

      <section id="daily-rhythm" className="relative px-4 py-12 sm:px-6 lg:px-8">
        <div className="sanctuary-radiance absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          {legacyDraftPresent && (
            <div className="mb-5 rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">
              An older device-only daily draft exists. It was <strong>not imported</strong> because this browser may be shared and its original owner cannot be verified.
              <button type="button" onClick={removeLegacyDraft} className="ml-2 font-semibold underline">Remove legacy draft</button>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="sacred-panel-dark p-6 sm:p-8">
              <p className="sanctuary-section-label text-amber-100/55">Five movements · one day</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-light text-white sm:text-4xl">Move slowly enough to notice what actually changes.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">Open each experience when useful, mark only what you genuinely touched, and leave the rest unfinished without guilt.</p>

              <div className="mt-7 space-y-3">
                {rhythm.map((item, index) => {
                  const Icon = item.icon;
                  const done = completed.includes(item.id);
                  return (
                    <article key={item.id} className={`grid gap-4 rounded-2xl border p-5 transition sm:grid-cols-[auto_1fr_auto] sm:items-center ${done ? 'border-emerald-200/25 bg-emerald-300/10' : 'border-white/10 bg-white/[0.035]'}`}>
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${done ? 'border-emerald-200/25 bg-emerald-300/15 text-emerald-100' : 'border-white/10 bg-white/5 text-amber-100'}`}>{done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}</span>
                      <div>
                        <div className="flex items-center gap-2"><span className="text-[9px] font-bold tracking-[0.2em] text-white/20">0{index + 1}</span><h3 className="font-semibold text-white">{item.title}</h3></div>
                        <p className="mt-1 text-sm leading-6 text-white/45">{item.description}</p>
                        <Link href={item.href} className="mt-2 inline-flex text-xs font-semibold text-emerald-200">Open experience →</Link>
                      </div>
                      <button type="button" onClick={() => toggle(item.id)} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${done ? 'border-emerald-200/25 bg-emerald-300/12 text-emerald-100' : 'border-white/10 bg-white/5 text-white/55'}`}>{done ? 'Done' : 'Mark done'}</button>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="sacred-panel-dark p-6 sm:p-8">
              <NotebookPen className="h-7 w-7 text-amber-100" />
              <p className="mt-5 sanctuary-section-label text-emerald-200/55">Private reflection</p>
              <h2 className="mt-2 text-3xl font-light text-white">Hold the beginning and the ending of the day in one place.</h2>
              <p className="mt-3 text-sm leading-6 text-white/42">Signed-in reflections can be carried into one updateable private Journey moment for today. Nothing here is visible to other members by default.</p>

              <label className="mt-7 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">Morning intention</span><textarea value={morning} onChange={(e) => { setMorning(e.target.value); setSaveStatus(''); }} maxLength={1600} className="min-h-[118px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:ring-2 focus:ring-amber-200/45" placeholder="What needs your attention, prayer, or surrender today?" /></label>
              <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">Evening examen</span><textarea value={evening} onChange={(e) => { setEvening(e.target.value); setSaveStatus(''); }} maxLength={1600} className="min-h-[118px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:ring-2 focus:ring-amber-200/45" placeholder="Where did you notice grace, resistance, need, or a next step?" /></label>
              <button type="button" onClick={save} disabled={saving} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-amber-100 px-5 py-3 text-sm font-semibold text-[#07110f] shadow-[0_14px_36px_rgba(245,201,120,.14)] disabled:cursor-not-allowed disabled:opacity-60">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save today’s reflection'}</button>
              {saveStatus && <p className="mt-3 text-xs leading-5 text-white/50" role="status">{saveStatus}</p>}
              <div className="mt-5 grid gap-2 sm:grid-cols-2"><Link href="/journey" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-semibold text-emerald-200">Open private Journey</Link><Link href="/fasting-prayer" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-semibold text-amber-100">Fasting & prayer</Link></div>
            </aside>
          </div>

          <div className="mt-10">
            <DailyAlignmentIntelligence />
          </div>
        </div>
      </section>
    </main>
  );
}
