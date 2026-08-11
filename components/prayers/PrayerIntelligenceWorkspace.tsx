'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
  BookOpenText,
  Check,
  ClipboardCopy,
  HeartHandshake,
  Loader2,
  Mic,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Square,
} from 'lucide-react';

type PrayerMode = 'general' | 'adoration' | 'confession' | 'thanksgiving' | 'intercession' | 'lament' | 'warfare' | 'discernment';

type PrayerResult = {
  title?: string;
  prayerMode?: string;
  opening?: string;
  adoration?: string;
  confession?: string;
  thanksgiving?: string;
  petitions?: string[];
  declarations?: Array<{ text?: string; scriptureReference?: string; posture?: string }>;
  resistancePrayers?: Array<{ text?: string; scriptureReference?: string }>;
  scriptureAnchors?: Array<{ reference?: string; whyItFits?: string }>;
  closingPrayer?: string;
  nextFaithfulStep?: string;
  humanCareNote?: string;
};

const modes: Array<{ id: PrayerMode; label: string; note: string }> = [
  { id: 'general', label: 'Guided prayer', note: 'A balanced prayer shaped around what you share.' },
  { id: 'adoration', label: 'Adoration', note: 'Focus attention on God’s character and works.' },
  { id: 'confession', label: 'Confession', note: 'Repentance, honesty, grace, and restoration.' },
  { id: 'thanksgiving', label: 'Thanksgiving', note: 'Name gifts, provision, people, and answered prayer.' },
  { id: 'intercession', label: 'Intercession', note: 'Pray carefully for people, church, community, and world.' },
  { id: 'lament', label: 'Lament', note: 'Bring grief, injustice, fear, or disappointment honestly.' },
  { id: 'warfare', label: 'Stand in faith', note: 'Scripture-referenced resistance, truth, prayer, and wise action.' },
  { id: 'discernment', label: 'Discernment', note: 'Pray through a decision without pretending certainty about God’s private will.' },
];

function buildJournalContent(result: PrayerResult, request: string, references: string) {
  const sections = [
    `Prayer focus:\n${request}`,
    references.trim() ? `Scripture references supplied:\n${references.trim()}` : '',
    result.opening ? `Opening:\n${result.opening}` : '',
    result.adoration ? `Adoration:\n${result.adoration}` : '',
    result.confession ? `Confession:\n${result.confession}` : '',
    result.thanksgiving ? `Thanksgiving:\n${result.thanksgiving}` : '',
    result.petitions?.length ? `Petitions:\n${result.petitions.map((item) => `• ${item}`).join('\n')}` : '',
    result.declarations?.length ? `Scripture-anchored declarations:\n${result.declarations.map((item) => `• ${item.text || ''}${item.scriptureReference ? ` — ${item.scriptureReference}` : ''}`).join('\n')}` : '',
    result.resistancePrayers?.length ? `Resistance prayers:\n${result.resistancePrayers.map((item) => `• ${item.text || ''}${item.scriptureReference ? ` — ${item.scriptureReference}` : ''}`).join('\n')}` : '',
    result.scriptureAnchors?.length ? `Scripture anchors:\n${result.scriptureAnchors.map((item) => `• ${item.reference || ''}${item.whyItFits ? ` — ${item.whyItFits}` : ''}`).join('\n')}` : '',
    result.closingPrayer ? `Closing prayer:\n${result.closingPrayer}` : '',
    result.nextFaithfulStep ? `Next faithful step:\n${result.nextFaithfulStep}` : '',
  ].filter(Boolean);
  return sections.join('\n\n');
}

export function PrayerIntelligenceWorkspace() {
  const [mode, setMode] = useState<PrayerMode>('general');
  const [request, setRequest] = useState('');
  const [references, setReferences] = useState('');
  const [result, setResult] = useState<PrayerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  const selected = modes.find((item) => item.id === mode) || modes[0];
  const journalContent = useMemo(() => result ? buildJournalContent(result, request, references) : '', [result, request, references]);

  const generate = async () => {
    if (!request.trim()) return;
    setLoading(true);
    setStatus('');
    setResult(null);
    try {
      const input = [
        `Prayer mode: ${mode}.`,
        `Prayer need or intention: ${request.trim()}`,
        references.trim() ? `Bible references already on the user's heart: ${references.trim()}` : '',
        'Keep every declaration, rejection, or spiritual-resistance statement attached to an explicit Bible reference. Do not invent Bible quotation wording.',
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/ai/spiritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'prayer', input }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setStatus('Sign in to use the Scripture-grounded prayer intelligence desk.');
        return;
      }
      if (!res.ok) {
        setStatus(data?.error || 'Prayer assistance is unavailable right now. You can still use the Prayer Room and human care pathways.');
        return;
      }
      setResult(data?.data || data);
    } catch {
      setStatus('Prayer assistance is unavailable right now. Your prayer request was not saved by this workspace.');
    } finally {
      setLoading(false);
    }
  };

  const startVoiceJot = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('Speech-to-text is not supported in this browser. You can continue typing your prayer need.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let text = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) text += `${event.results[index][0].transcript} `;
      }
      if (text.trim()) setRequest((current) => `${current}${current ? ' ' : ''}${text.trim()}`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopVoiceJot = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
  };

  const saveToJournal = async () => {
    if (!journalContent) return;
    setStatus('Saving to your private journal…');
    try {
      const res = await fetch('/api/user/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result?.title || `Prayer reflection — ${new Date().toLocaleDateString()}`,
          content: journalContent,
          mood: 'Prayerful',
        }),
      });
      if (res.ok) setStatus('Saved to your private Spiritual Journal.');
      else if (res.status === 401) setStatus('Sign in to save this prayer reflection to your journal.');
      else setStatus('Journal saving is unavailable. You can still copy the prayer below.');
    } catch {
      setStatus('Journal saving is unavailable. You can still copy the prayer below.');
    }
  };

  const copyPrayer = async () => {
    if (!journalContent) return;
    try {
      await navigator.clipboard.writeText(journalContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setStatus('Copy is unavailable in this browser.');
    }
  };

  return (
    <section className="bg-cream-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="grid xl:grid-cols-[1.08fr_0.92fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                  <Sparkles className="mr-2 h-4 w-4" /> Prayer intelligence desk
                </div>
                <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Turn a burden into a Scripture-anchored prayer you can revisit, journal, and carry into daily life.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Choose a prayer posture, speak or type what is on your heart, and receive a structured draft with Bible references. Generated wording remains assistance—not revelation, prophecy, or a replacement for personal prayer and pastoral care.</p>
              </div>
              <div className="rounded-2xl border border-sage-100 bg-sage-50 p-4 text-xs leading-5 text-sage-800 md:max-w-[230px]">
                <ShieldCheck className="mb-2 h-5 w-5" /> Every generated declaration or resistance prayer is required to carry a Bible reference.
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {modes.map((item) => (
                <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-2xl border p-4 text-left transition ${mode === item.id ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-stone-50 hover:border-amber-200'}`}>
                  <p className="font-semibold text-stone-900">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{item.note}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{selected.label}</p>
                  <p className="mt-1 text-xs text-stone-500">Share only what you are comfortable processing with an AI service.</p>
                </div>
                {!listening ? (
                  <button type="button" onClick={startVoiceJot} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-sage-700"><Mic className="mr-1.5 h-3.5 w-3.5" /> Voice auto-jot</button>
                ) : (
                  <button type="button" onClick={stopVoiceJot} className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"><Square className="mr-1.5 h-3.5 w-3.5" /> Stop listening</button>
                )}
              </div>
              <textarea value={request} onChange={(e) => setRequest(e.target.value)} className="min-h-[160px] w-full rounded-2xl border border-stone-200 bg-white p-4 leading-7 text-stone-700 outline-none focus:ring-2 focus:ring-amber-200" placeholder="What are you praying about? What happened, who is involved, or what decision needs wisdom?" />
              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture already on your heart · optional</span>
                <input value={references} onChange={(e) => setReferences(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200" placeholder="e.g. Psalm 46; Philippians 4:6-9" />
              </label>
              <button type="button" onClick={generate} disabled={loading || !request.trim()} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{loading ? 'Preparing prayer…' : 'Prepare Scripture-grounded prayer'}
              </button>
              {status && <p className="mt-3 rounded-xl bg-white px-4 py-3 text-xs leading-5 text-stone-600">{status}</p>}
            </div>
          </div>

          <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
            {!result ? (
              <div className="flex h-full min-h-[440px] flex-col justify-between">
                <div>
                  <BookOpenText className="h-8 w-8 text-sage-300" />
                  <h3 className="mt-5 text-3xl font-light">Prayer that stays connected to the Word and to real people.</h3>
                  <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
                    <p className="rounded-2xl border border-white/10 bg-white/5 p-4">Use Scripture references as anchors, then open the Bible workspace to read each passage in context and in an enabled translation.</p>
                    <p className="rounded-2xl border border-white/10 bg-white/5 p-4">For warfare-style prayer, the assistant is constrained to Scripture-referenced truth, resistance, prayer, forgiveness, wisdom, and responsible action.</p>
                    <p className="rounded-2xl border border-white/10 bg-white/5 p-4">For grief, crisis, abuse, major life decisions, or sensitive pastoral needs, involve trusted human care instead of relying on generated text alone.</p>
                  </div>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Link href="/scripture" className="inline-flex items-center justify-center rounded-xl bg-sage-500 px-5 py-3 text-sm font-semibold text-white"><BookOpenText className="mr-2 h-4 w-4" /> Open Bible study</Link>
                  <Link href="/care" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-100"><HeartHandshake className="mr-2 h-4 w-4" /> Request human care</Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Prepared prayer</p>
                <h3 className="mt-3 text-3xl font-light">{result.title || 'Prayer reflection'}</h3>
                {result.opening && <p className="mt-5 text-sm leading-7 text-stone-300">{result.opening}</p>}

                <div className="mt-6 max-h-[620px] space-y-4 overflow-y-auto pr-1">
                  {result.adoration && <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-300">Adoration</p><p className="mt-2 text-sm leading-6 text-stone-300">{result.adoration}</p></div>}
                  {result.confession && <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-300">Confession</p><p className="mt-2 text-sm leading-6 text-stone-300">{result.confession}</p></div>}
                  {result.thanksgiving && <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-300">Thanksgiving</p><p className="mt-2 text-sm leading-6 text-stone-300">{result.thanksgiving}</p></div>}
                  {!!result.petitions?.length && <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-300">Petitions</p><ul className="mt-2 space-y-2 text-sm leading-6 text-stone-300">{result.petitions.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul></div>}
                  {!!result.declarations?.length && <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-amber-200">Scripture-anchored declarations</p><div className="mt-3 space-y-3">{result.declarations.map((item, index) => <div key={`${item.text}-${index}`}><p className="text-sm leading-6 text-amber-50">{item.text}</p><p className="mt-1 text-xs font-semibold text-amber-200">{item.scriptureReference || 'Reference required'}</p></div>)}</div></div>}
                  {!!result.resistancePrayers?.length && <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-rose-200">Resistance prayers</p><div className="mt-3 space-y-3">{result.resistancePrayers.map((item, index) => <div key={`${item.text}-${index}`}><p className="text-sm leading-6 text-rose-50">{item.text}</p><p className="mt-1 text-xs font-semibold text-rose-200">{item.scriptureReference || 'Reference required'}</p></div>)}</div></div>}
                  {!!result.scriptureAnchors?.length && <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-300">Scripture anchors</p><div className="mt-3 space-y-3">{result.scriptureAnchors.map((item, index) => <div key={`${item.reference}-${index}`}><p className="text-sm font-semibold text-white">{item.reference}</p>{item.whyItFits && <p className="mt-1 text-xs leading-5 text-stone-400">{item.whyItFits}</p>}</div>)}</div></div>}
                  {result.closingPrayer && <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-300">Closing prayer</p><p className="mt-2 text-sm leading-7 text-stone-300">{result.closingPrayer}</p></div>}
                  {result.nextFaithfulStep && <div className="rounded-2xl border border-sage-300/20 bg-sage-300/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sage-200">Next faithful step</p><p className="mt-2 text-sm leading-6 text-sage-50">{result.nextFaithfulStep}</p></div>}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={saveToJournal} className="inline-flex items-center justify-center rounded-xl bg-sage-500 px-4 py-3 text-sm font-semibold text-white"><NotebookPen className="mr-2 h-4 w-4" /> Save to journal</button>
                  <button type="button" onClick={copyPrayer} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-100">{copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}{copied ? 'Copied' : 'Copy prayer'}</button>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
                  <Link href="/scripture" className="text-sage-300">Read references in Bible Study →</Link>
                  <Link href="/daily-guide" className="text-amber-300">Carry into Daily Guide →</Link>
                  <Link href="/care" className="text-rose-300">Human care →</Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
