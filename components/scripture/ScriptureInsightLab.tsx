'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpenText,
  Check,
  Loader2,
  NotebookPen,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type StudyResult = {
  title?: string;
  passageFocus?: string;
  context?: string;
  observations?: string[];
  themes?: string[];
  questions?: string[];
  crossReferences?: Array<{ reference?: string; connection?: string }>;
  application?: string;
  prayerPrompt?: string;
  dailyAlignment?: string;
  reviewNote?: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ScriptureInsightLab() {
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<StudyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [saved, setSaved] = useState(false);
  const [handedOff, setHandedOff] = useState(false);

  const journalContent = useMemo(() => {
    if (!result) return '';
    return [
      `Bible study: ${reference}`,
      notes.trim() ? `My observations before AI:\n${notes.trim()}` : '',
      result.context ? `Context:\n${result.context}` : '',
      result.observations?.length ? `Study observations:\n${result.observations.map((item) => `• ${item}`).join('\n')}` : '',
      result.themes?.length ? `Themes:\n${result.themes.map((item) => `• ${item}`).join('\n')}` : '',
      result.questions?.length ? `Questions to revisit:\n${result.questions.map((item) => `• ${item}`).join('\n')}` : '',
      result.crossReferences?.length ? `Cross references:\n${result.crossReferences.map((item) => `• ${item.reference || ''}${item.connection ? ` — ${item.connection}` : ''}`).join('\n')}` : '',
      result.application ? `Application:\n${result.application}` : '',
      result.prayerPrompt ? `Prayer prompt:\n${result.prayerPrompt}` : '',
      result.dailyAlignment ? `Daily alignment:\n${result.dailyAlignment}` : '',
    ].filter(Boolean).join('\n\n');
  }, [notes, reference, result]);

  const generate = async () => {
    if (!reference.trim()) return;
    setLoading(true);
    setStatus('');
    setResult(null);
    try {
      const input = [
        `Passage reference: ${reference.trim()}`,
        notes.trim() ? `The user's own observations before AI:\n${notes.trim()}` : 'The user has not added observations yet.',
        'Do not invent quotation wording. Keep observation, context, interpretation questions, application, prayer, and daily alignment distinct. Return references for cross-references.',
      ].join('\n\n');
      const res = await fetch('/api/ai/spiritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'study', input }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setStatus('Sign in to use AI-assisted study insights. Translation comparison and private notes above remain available.');
        return;
      }
      if (!res.ok) {
        setStatus(data?.error || 'Study insights are unavailable right now.');
        return;
      }
      setResult(data?.data || data);
    } catch {
      setStatus('Study insights are unavailable right now. Your own observations have not been removed.');
    } finally {
      setLoading(false);
    }
  };

  const savePrivate = () => {
    if (!result) return;
    try {
      window.localStorage.setItem(`digital-church-study-insight:${today()}:${reference}`, JSON.stringify({ reference, notes, result, savedAt: new Date().toISOString() }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  const saveJournal = async () => {
    if (!journalContent) return;
    setStatus('Saving study to your private journal…');
    try {
      const res = await fetch('/api/user/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: result?.title || `Bible study — ${reference}`, content: journalContent, mood: 'Seeking' }),
      });
      if (res.ok) setStatus('Saved to your private Spiritual Journal.');
      else if (res.status === 401) setStatus('Sign in to save this study to your journal.');
      else setStatus('Journal saving is unavailable right now.');
    } catch {
      setStatus('Journal saving is unavailable right now.');
    }
  };

  const handoffToDailyGuide = () => {
    if (!result) return;
    try {
      window.localStorage.setItem(`digital-church-daily-seed:${today()}`, JSON.stringify({
        reference,
        title: result.title || reference,
        dailyAlignment: result.dailyAlignment || result.application || '',
        prayerPrompt: result.prayerPrompt || '',
        application: result.application || '',
        createdAt: new Date().toISOString(),
      }));
      setHandedOff(true);
      window.setTimeout(() => setHandedOff(false), 1800);
    } catch {
      setHandedOff(false);
    }
  };

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[0.88fr_1.12fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            <Sparkles className="mr-2 h-4 w-4" /> Scripture insight lab
          </div>
          <h2 className="mt-4 text-3xl font-light leading-tight text-stone-900 md:text-4xl">Move from translation comparison to context, questions, cross-references, prayer, and one daily alignment.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">Write what you notice first. Then ask the study assistant to organize context and reflection prompts around the reference without inventing Bible translation wording.</p>

          <label className="mt-6 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Passage reference</span><input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" placeholder="e.g. John 15:1-8" /></label>
          <label className="mt-4 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">My observations before AI</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[180px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-7 outline-none focus:ring-2 focus:ring-blue-200" placeholder="What repeats? What surprises you? What question do you have? What is the immediate context?" /></label>
          <button type="button" onClick={generate} disabled={loading || !reference.trim()} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpenText className="mr-2 h-4 w-4" />}{loading ? 'Building study insight…' : 'Build study insight'}
          </button>
          {status && <p className="mt-3 rounded-xl bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600">{status}</p>}

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            <ShieldCheck className="mb-2 h-5 w-5 text-amber-700" /> Generated study guidance should be checked against the biblical text, context, trustworthy scholarship, and accountable church teaching before public use.
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-50 p-6 sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          {!result ? (
            <div className="flex min-h-[500px] flex-col justify-between">
              <div>
                <NotebookPen className="h-8 w-8 text-blue-600" />
                <h3 className="mt-5 text-3xl font-light text-stone-900">Your study can become a reusable spiritual reference, not a forgotten note.</h3>
                <p className="mt-4 text-sm leading-6 text-stone-600">After insight is generated, save it privately, move it into your Spiritual Journal, or seed today’s Daily Guide so Scripture, prayer, service, and reflection stay connected.</p>
              </div>
              <Link href="/daily-guide" className="mt-8 inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Open Daily Guide <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Study insight</p>
              <h3 className="mt-2 text-3xl font-light text-stone-900">{result.title || reference}</h3>
              {result.passageFocus && <p className="mt-3 text-sm leading-6 text-stone-600">{result.passageFocus}</p>}

              <div className="mt-5 max-h-[620px] space-y-4 overflow-y-auto pr-1">
                {result.context && <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Context</p><p className="mt-2 text-sm leading-6 text-stone-700">{result.context}</p></div>}
                {!!result.observations?.length && <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Observations to test</p><ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">{result.observations.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul></div>}
                {!!result.themes?.length && <div className="rounded-2xl border border-sage-200 bg-sage-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-700">Themes</p><div className="mt-3 flex flex-wrap gap-2">{result.themes.map((item) => <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-sage-800">{item}</span>)}</div></div>}
                {!!result.questions?.length && <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Questions to revisit</p><ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">{result.questions.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul></div>}
                {!!result.crossReferences?.length && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Cross references</p><div className="mt-3 space-y-3">{result.crossReferences.map((item, index) => <div key={`${item.reference}-${index}`}><p className="text-sm font-semibold text-blue-900">{item.reference}</p>{item.connection && <p className="mt-1 text-xs leading-5 text-blue-800">{item.connection}</p>}</div>)}</div></div>}
                {result.application && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Application</p><p className="mt-2 text-sm leading-6 text-amber-900">{result.application}</p></div>}
                {result.prayerPrompt && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-rose-700">Prayer prompt</p><p className="mt-2 text-sm leading-6 text-rose-900">{result.prayerPrompt}</p></div>}
                {result.dailyAlignment && <div className="rounded-2xl bg-stone-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-sage-300">Daily alignment</p><p className="mt-2 text-sm leading-7 text-stone-200">{result.dailyAlignment}</p></div>}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={savePrivate} className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Saved' : 'Save private'}</button>
                <button type="button" onClick={saveJournal} className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700"><NotebookPen className="mr-2 h-4 w-4" /> Journal</button>
                <button type="button" onClick={handoffToDailyGuide} className="inline-flex items-center justify-center rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800">{handedOff ? <Check className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}{handedOff ? 'Sent' : 'Daily Guide'}</button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
