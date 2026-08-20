'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  BookOpenText,
  Check,
  Heart,
  Loader2,
  NotebookPen,
  RefreshCw,
  Sparkles,
  Sunrise,
} from 'lucide-react';

type DailySeed = {
  reference?: string;
  title?: string;
  dailyAlignment?: string;
  prayerPrompt?: string;
  application?: string;
};

type DailyResult = {
  title?: string;
  scriptureReferences?: string[];
  morningFocus?: string;
  middayPause?: string;
  servicePrompt?: string;
  relationshipPrompt?: string;
  eveningExamen?: string[];
  prayer?: string;
  oneNextStep?: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dailySeedKey(userId: string) {
  return `digital-church-daily-seed:v2:${userId}:${today()}`;
}

function dailyIntelligenceKey(userId: string) {
  return `digital-church-daily-intelligence:v2:${userId}:${today()}`;
}

function legacyDailySeedKey() {
  return `digital-church-daily-seed:${today()}`;
}

function legacyDailyIntelligenceKey() {
  return `digital-church-daily-intelligence:${today()}`;
}

export function DailyAlignmentIntelligence() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';
  const [seed, setSeed] = useState<DailySeed | null>(null);
  const [focus, setFocus] = useState('');
  const [result, setResult] = useState<DailyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const [legacyDraftPresent, setLegacyDraftPresent] = useState(false);

  useEffect(() => {
    if (!userId) return;

    try {
      const raw = window.localStorage.getItem(dailySeedKey(userId));
      if (raw) setSeed(JSON.parse(raw));

      const saved = window.localStorage.getItem(dailyIntelligenceKey(userId));
      if (saved) {
        const parsed = JSON.parse(saved);
        setResult(parsed.result || null);
        setCompleted(Array.isArray(parsed.completed) ? parsed.completed : []);
        setFocus(parsed.focus || '');
      }

      // Never auto-import old account-agnostic daily material from a shared browser.
      setLegacyDraftPresent(Boolean(
        window.localStorage.getItem(legacyDailySeedKey())
        || window.localStorage.getItem(legacyDailyIntelligenceKey())
      ));
    } catch {
      setStatus('Today’s private browser state could not be restored.');
    }
  }, [userId]);

  const steps = useMemo(() => [
    ['morning', 'Morning focus', result?.morningFocus],
    ['midday', 'Midday pause', result?.middayPause],
    ['service', 'Service prompt', result?.servicePrompt],
    ['relationship', 'Relationship prompt', result?.relationshipPrompt],
    ['next', 'One next step', result?.oneNextStep],
  ].filter((item) => item[2]) as Array<[string, string, string]>, [result]);

  const persistDaily = (nextResult: DailyResult | null, nextCompleted: string[], nextFocus = focus) => {
    if (!userId) return false;
    try {
      window.localStorage.setItem(dailyIntelligenceKey(userId), JSON.stringify({ focus: nextFocus, result: nextResult, completed: nextCompleted, updatedAt: new Date().toISOString() }));
      return true;
    } catch {
      return false;
    }
  };

  const removeLegacyDraft = () => {
    try {
      window.localStorage.removeItem(legacyDailySeedKey());
      window.localStorage.removeItem(legacyDailyIntelligenceKey());
      setLegacyDraftPresent(false);
      setStatus('Legacy unscoped daily browser data removed.');
    } catch {
      setStatus('Legacy daily browser data could not be removed.');
    }
  };

  const generate = async () => {
    if (!userId) {
      setStatus('Your signed-in session is still loading. Try again in a moment.');
      return;
    }

    setLoading(true);
    setStatus('');
    try {
      const input = [
        seed?.reference ? `Scripture seed from today's Bible study: ${seed.reference}` : '',
        seed?.dailyAlignment ? `Study alignment already identified: ${seed.dailyAlignment}` : '',
        seed?.prayerPrompt ? `Prayer prompt from study: ${seed.prayerPrompt}` : '',
        seed?.application ? `Application from study: ${seed.application}` : '',
        focus.trim() ? `What the user wants to stay aligned around today: ${focus.trim()}` : '',
        'Create a calm, realistic Christian daily rhythm. Do not score spirituality or pressure the user into streaks. Use Bible references only, not fabricated quotations.',
      ].filter(Boolean).join('\n\n');
      const res = await fetch('/api/ai/spiritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'daily', input: input || 'Create a balanced Scripture, prayer, service, reflection, and rest rhythm for today.' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setStatus('Sign in to generate a Scripture-seeded daily alignment.');
        return;
      }
      if (!res.ok) {
        setStatus(data?.error || 'Daily alignment intelligence is unavailable right now.');
        return;
      }
      const next = data?.data || data;
      setResult(next);
      setCompleted([]);
      if (!persistDaily(next, [], focus)) {
        setStatus('Daily alignment generated, but this browser could not save the account-scoped draft.');
      }
    } catch {
      setStatus('Daily alignment intelligence is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setCompleted((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      if (!persistDaily(result, next, focus)) {
        setStatus('This step changed for the current view, but the browser could not save the account-scoped draft.');
      }
      return next;
    });
  };

  const saveJournal = async () => {
    if (!result) return;
    const content = [
      result.scriptureReferences?.length ? `Scripture references:\n${result.scriptureReferences.map((item) => `• ${item}`).join('\n')}` : '',
      result.morningFocus ? `Morning focus:\n${result.morningFocus}` : '',
      result.middayPause ? `Midday pause:\n${result.middayPause}` : '',
      result.servicePrompt ? `Service prompt:\n${result.servicePrompt}` : '',
      result.relationshipPrompt ? `Relationship prompt:\n${result.relationshipPrompt}` : '',
      result.eveningExamen?.length ? `Evening examen:\n${result.eveningExamen.map((item) => `• ${item}`).join('\n')}` : '',
      result.prayer ? `Prayer:\n${result.prayer}` : '',
      result.oneNextStep ? `One next step:\n${result.oneNextStep}` : '',
    ].filter(Boolean).join('\n\n');
    setStatus('Saving today’s alignment to your private journal…');
    try {
      const res = await fetch('/api/user/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: result.title || `Daily alignment — ${new Date().toLocaleDateString()}`, content, mood: 'Grounded' }),
      });
      if (res.ok) setStatus('Saved to your private Spiritual Journal.');
      else if (res.status === 401) setStatus('Sign in to save this daily alignment to your journal.');
      else setStatus('Journal saving is unavailable right now.');
    } catch {
      setStatus('Journal saving is unavailable right now.');
    }
  };

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[0.88fr_1.12fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-700"><Sunrise className="mr-2 h-4 w-4" /> Daily alignment intelligence</div>
          <h2 className="mt-4 text-3xl font-light leading-tight text-stone-900 md:text-4xl">Carry today’s Bible study into morning focus, midday pause, service, relationships, prayer, and evening reflection.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">If you sent a study insight here from the Scripture page, it becomes the seed for this signed-in account. Otherwise you can name what needs your attention today and build a calm, non-competitive rhythm around it.</p>

          {legacyDraftPresent && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Older unscoped daily browser data exists for today. It was <strong>not imported</strong> because this browser may be shared and its original owner cannot be verified.
              <button type="button" onClick={removeLegacyDraft} className="ml-2 font-semibold underline">Remove legacy data</button>
            </div>
          )}

          {seed?.reference && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Today’s Scripture seed</p>
              <p className="mt-2 font-semibold text-blue-950">{seed.reference}</p>
              {seed.dailyAlignment && <p className="mt-2 text-sm leading-6 text-blue-900">{seed.dailyAlignment}</p>}
            </div>
          )}

          <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">What needs alignment today? · optional</span><textarea value={focus} onChange={(e) => { setFocus(e.target.value); setStatus(''); }} maxLength={2200} className="min-h-[130px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-amber-200" placeholder="A decision, relationship, responsibility, habit, burden, opportunity to serve..." /></label>
          <button type="button" onClick={generate} disabled={loading} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : result ? <RefreshCw className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}{loading ? 'Preparing today’s rhythm…' : result ? 'Rebuild today’s rhythm' : 'Build today’s rhythm'}
          </button>
          {status && <p className="mt-3 rounded-xl bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600">{status}</p>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/scripture" className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700"><BookOpenText className="mr-2 h-4 w-4" /> Return to Bible study</Link>
            <Link href="/prayer-room" className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"><Heart className="mr-2 h-4 w-4" /> Open Prayer Room</Link>
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-50 p-6 sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          {!result ? (
            <div className="flex min-h-[440px] flex-col justify-between">
              <div>
                <Sparkles className="h-8 w-8 text-amber-600" />
                <h3 className="mt-5 text-3xl font-light text-stone-900">A guide for attention, not a spiritual scorecard.</h3>
                <p className="mt-4 text-sm leading-6 text-stone-600">The generated rhythm is intentionally small and adjustable. Missing a step does not mean failure; the goal is to remember Scripture and respond faithfully in ordinary life.</p>
              </div>
              <Link href="/journey" className="mt-8 inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Open spiritual journey →</Link>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Today’s rhythm</p>
              <h3 className="mt-2 text-3xl font-light text-stone-900">{result.title || 'Daily alignment'}</h3>
              {!!result.scriptureReferences?.length && <div className="mt-5 flex flex-wrap gap-2">{result.scriptureReferences.map((item) => <span key={item} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">{item}</span>)}</div>}

              <div className="mt-5 space-y-3">
                {steps.map(([id, label, body]) => {
                  const done = completed.includes(id);
                  return <button key={id} type="button" onClick={() => toggle(id)} className={`w-full rounded-2xl border p-4 text-left transition ${done ? 'border-sage-200 bg-sage-50' : 'border-stone-200 bg-white'}`}><div className="flex items-start gap-3"><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${done ? 'bg-sage-600 text-white' : 'border border-stone-300 text-stone-400'}`}>{done ? <Check className="h-3.5 w-3.5" /> : null}</span><div><p className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</p><p className="mt-1 text-sm leading-6 text-stone-700">{body}</p></div></div></button>;
                })}
              </div>

              {!!result.eveningExamen?.length && <div className="mt-4 rounded-2xl bg-stone-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-sage-300">Evening examen</p><ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">{result.eveningExamen.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul></div>}
              {result.prayer && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-rose-700">Prayer</p><p className="mt-2 text-sm leading-7 text-rose-900">{result.prayer}</p></div>}

              <button type="button" onClick={saveJournal} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-sage-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sage-700"><NotebookPen className="mr-2 h-4 w-4" /> Save today to journal</button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
