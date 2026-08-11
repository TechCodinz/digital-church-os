'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BookOpenText,
  Check,
  Clock3,
  Loader2,
  MessageCircleHeart,
  MonitorPlay,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type SermonResult = {
  title?: string;
  textFocus?: string;
  bigIdea?: string;
  contextChecks?: string[];
  outline?: Array<{ movement?: string; purpose?: string; scriptureReferences?: string[] }>;
  illustrationQuestions?: string[];
  applicationLanes?: string[];
  deliveryCues?: string[];
  responseMoment?: string;
  followUpIdeas?: string[];
  reviewChecklist?: string[];
};

const audiences = ['Whole church', 'Youth', 'Children & family', 'Leaders', 'New believers', 'Outreach / seekers', 'Small group'];
const durations = ['10', '20', '30', '40', '50', '60'];

export function SermonIntelligenceWorkbench() {
  const [reference, setReference] = useState('');
  const [theme, setTheme] = useState('');
  const [audience, setAudience] = useState('Whole church');
  const [duration, setDuration] = useState('35');
  const [pastoralAim, setPastoralAim] = useState('');
  const [existingNotes, setExistingNotes] = useState('');
  const [result, setResult] = useState<SermonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [checked, setChecked] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);

  const readiness = useMemo(() => {
    const essentials = [reference, theme, pastoralAim].filter((item) => item.trim()).length;
    return Math.round((essentials / 3) * 100);
  }, [reference, theme, pastoralAim]);

  const generate = async () => {
    if (!reference.trim() || !theme.trim()) return;
    setLoading(true);
    setStatus('');
    setResult(null);
    setChecked([]);
    try {
      const input = [
        `Primary Bible reference: ${reference.trim()}`,
        `Working theme: ${theme.trim()}`,
        `Audience: ${audience}`,
        `Target duration: ${duration} minutes`,
        pastoralAim.trim() ? `Pastoral aim: ${pastoralAim.trim()}` : '',
        existingNotes.trim() ? `Existing human notes to organize, not override:\n${existingNotes.trim()}` : '',
        'Return a preparation framework, not a claim of authoritative interpretation. Use Bible references rather than fabricated quotation wording.',
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/ai/spiritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'sermon', input }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setStatus('Sign in to use sermon intelligence. The manual sermon command center above remains available.');
        return;
      }
      if (!res.ok) {
        setStatus(data?.error || 'Sermon intelligence is unavailable right now.');
        return;
      }
      setResult(data?.data || data);
    } catch {
      setStatus('Sermon intelligence is unavailable right now. Your manual preparation notes remain unchanged.');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    if (!result) return;
    try {
      window.localStorage.setItem(`digital-church-sermon-intelligence:${Date.now()}`, JSON.stringify({ reference, theme, audience, duration, pastoralAim, existingNotes, result, savedAt: new Date().toISOString() }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[0.92fr_1.08fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            <Sparkles className="mr-2 h-4 w-4" /> Sermon intelligence workbench
          </div>
          <h2 className="mt-4 text-3xl font-light leading-tight text-stone-900 md:text-4xl">Deepen exegesis, structure, delivery, response, and follow-up without letting AI become the preacher.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">Start with the biblical reference, audience, pastoral aim, and your own notes. The assistant returns review prompts, outline movements, application lanes, delivery cues, and follow-up ideas for a pastor or teaching team to assess.</p>

          <div className="mt-6 rounded-2xl bg-stone-950 p-4 text-white">
            <div className="flex items-center justify-between text-xs font-semibold"><span>Preparation input</span><span>{readiness}%</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-indigo-400" style={{ width: `${readiness}%` }} /></div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Primary Bible reference</span><input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="e.g. Ephesians 2:1-10" /></label>
            <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Working theme</span><input value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Grace that creates a new way of life" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Audience</span><select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm">{audiences.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Target length</span><select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm">{durations.map((item) => <option key={item} value={item}>{item} minutes</option>)}</select></label>
          </div>

          <label className="mt-4 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Pastoral aim</span><textarea value={pastoralAim} onChange={(e) => setPastoralAim(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="What should people understand, feel, question, practice, or receive care around?" /></label>
          <label className="mt-4 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Existing human notes · optional</span><textarea value={existingNotes} onChange={(e) => setExistingNotes(e.target.value)} className="min-h-[150px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Context notes, commentary observations, illustrations, church-specific concerns..." /></label>

          <button type="button" onClick={generate} disabled={loading || !reference.trim() || !theme.trim()} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-700 px-5 py-3.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{loading ? 'Building preparation framework…' : 'Build accountable sermon framework'}
          </button>
          {status && <p className="mt-3 rounded-xl bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600">{status}</p>}
        </div>

        <aside className="border-t border-stone-200 bg-stone-50 p-6 sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          {!result ? (
            <div className="flex min-h-[560px] flex-col justify-between">
              <div>
                <ShieldCheck className="h-8 w-8 text-indigo-600" />
                <h3 className="mt-5 text-3xl font-light text-stone-900">Theological review stays visible at every stage.</h3>
                <div className="mt-6 space-y-3 text-sm leading-6 text-stone-600">
                  <div className="rounded-2xl border border-stone-200 bg-white p-4"><BookOpenText className="mb-2 h-5 w-5 text-sage-600" />Read the passage in context and compare enabled translations before turning a generated outline into public teaching.</div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4"><UsersRound className="mb-2 h-5 w-5 text-indigo-600" />Review applications for the real congregation: age, culture, grief, new believers, disability, family situations, and pastoral sensitivities.</div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4"><Clock3 className="mb-2 h-5 w-5 text-amber-600" />Use delivery cues to simplify the message, not to pack more content into the allotted time.</div>
                </div>
              </div>
              <Link href="/scripture" className="mt-8 inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white"><BookOpenText className="mr-2 h-4 w-4" /> Open Scripture study first</Link>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Preparation framework</p>
              <h3 className="mt-2 text-3xl font-light text-stone-900">{result.title || 'Sermon preparation'}</h3>
              {result.bigIdea && <div className="mt-5 rounded-2xl bg-indigo-700 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-indigo-200">Big idea</p><p className="mt-2 text-lg leading-7">{result.bigIdea}</p></div>}

              <div className="mt-5 max-h-[640px] space-y-4 overflow-y-auto pr-1">
                {!!result.contextChecks?.length && <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Context checks</p><ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">{result.contextChecks.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul></div>}
                {!!result.outline?.length && <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Teaching movements</p><div className="mt-3 space-y-3">{result.outline.map((item, index) => <div key={`${item.movement}-${index}`} className="rounded-xl bg-stone-50 p-3"><p className="font-semibold text-stone-900">{index + 1}. {item.movement}</p>{item.purpose && <p className="mt-1 text-xs leading-5 text-stone-600">{item.purpose}</p>}{!!item.scriptureReferences?.length && <p className="mt-2 text-xs font-semibold text-sage-700">{item.scriptureReferences.join(' · ')}</p>}</div>)}</div></div>}
                {!!result.applicationLanes?.length && <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Application lanes</p><ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">{result.applicationLanes.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul></div>}
                {!!result.deliveryCues?.length && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Delivery cues</p><ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">{result.deliveryCues.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul></div>}
                {result.responseMoment && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-rose-700">Response moment</p><p className="mt-2 text-sm leading-6 text-rose-900">{result.responseMoment}</p></div>}
                {!!result.followUpIdeas?.length && <div className="rounded-2xl border border-sage-200 bg-sage-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-700">Follow-up ideas</p><ul className="mt-3 space-y-2 text-sm leading-6 text-sage-900">{result.followUpIdeas.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul></div>}
                {!!result.reviewChecklist?.length && <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Human review checklist</p><div className="mt-3 space-y-2">{result.reviewChecklist.map((item, index) => { const done = checked.includes(index); return <button key={`${item}-${index}`} type="button" onClick={() => setChecked((current) => done ? current.filter((value) => value !== index) : [...current, index])} className={`flex w-full items-start gap-3 rounded-xl p-3 text-left text-sm ${done ? 'bg-sage-50 text-sage-900' : 'bg-stone-50 text-stone-700'}`}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${done ? 'bg-sage-600 text-white' : 'border border-stone-300'}`}>{done && <Check className="h-3 w-3" />}</span><span>{item}</span></button>; })}</div></div>}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={saveDraft} className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">{saved ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}{saved ? 'Saved privately' : 'Save framework'}</button>
                <Link href="/presentation" className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700"><MonitorPlay className="mr-2 h-4 w-4" /> Build presentation</Link>
              </div>
              <Link href="/service-response" className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700"><MessageCircleHeart className="mr-2 h-4 w-4" /> Prepare response & care flow</Link>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
