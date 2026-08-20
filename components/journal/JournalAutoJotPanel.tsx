'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpenText,
  Check,
  HeartHandshake,
  Lightbulb,
  Mic,
  Save,
  Sparkles,
  Square,
} from 'lucide-react';

function deriveInsights(text: string) {
  const normalized = text.toLowerCase();
  const insights: Array<{ title: string; detail: string; href: string }> = [];

  if (/thank|grateful|gratitude|bless/.test(normalized)) {
    insights.push({ title: 'Gratitude is present', detail: 'Name one gift specifically and consider encouraging someone else with it.', href: '/community-wall' });
  }
  if (/worr|fear|anxious|heavy|struggl|hurt|lonely/.test(normalized)) {
    insights.push({ title: 'A burden may need prayer or care', detail: 'Bring the concern into prayer and choose human pastoral support if you need someone to walk with you.', href: '/care' });
  }
  if (/scripture|bible|verse|psalm|matthew|john|romans|corinth|isaiah|genesis|revelation/.test(normalized)) {
    insights.push({ title: 'Return to the biblical text', detail: 'Re-read the passage in context and write one observation before adding interpretation.', href: '/scripture' });
  }
  if (/serve|help|neighbor|family|friend|church|community|volunteer/.test(normalized)) {
    insights.push({ title: 'Turn reflection into service', detail: 'Choose one concrete person or ministry action you can serve today.', href: '/activities' });
  }
  if (/fast|fasting|discipline|focus|distraction/.test(normalized)) {
    insights.push({ title: 'Create a focused prayer rhythm', detail: 'Use the fasting and prayer planner to organize Scripture, prayer focus, reflection, and a healthy discipline.', href: '/fasting-prayer' });
  }

  if (!insights.length) {
    insights.push({ title: 'Choose one next faithful action', detail: 'Summarize this reflection in one sentence: what will you pray, study, change, or do next?', href: '/journey' });
  }

  return insights.slice(0, 3);
}

export function JournalAutoJotPanel() {
  const [draft, setDraft] = useState('');
  const [title, setTitle] = useState(`Daily reflection — ${new Date().toLocaleDateString()}`);
  const [mood, setMood] = useState('Seeking');
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const recognitionRef = useRef<any>(null);
  const insights = useMemo(() => deriveInsights(draft), [draft]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('Live speech-to-text is not supported in this browser. You can still type or use your device dictation.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) finalText += `${event.results[i][0].transcript} `;
      }
      if (finalText) setDraft((current) => `${current}${current ? ' ' : ''}${finalText.trim()}`);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    setStatus('Listening… speak naturally.');
  };

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
    setStatus('Voice auto-jot stopped. Review the text before saving.');
  };

  const saveLocal = () => {
    try {
      window.localStorage.setItem('digital-church-journal-autojot-draft', JSON.stringify({ title, draft, mood, savedAt: new Date().toISOString() }));
      setStatus('Draft saved privately on this device.');
    } catch {
      setStatus('Local draft storage is unavailable in this browser.');
    }
  };

  const saveJournal = async () => {
    if (!title.trim() || !draft.trim()) return;
    setStatus('Saving to journal…');
    try {
      const res = await fetch('/api/user/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: draft.trim(), mood }),
      });
      if (res.ok) {
        setStatus('Saved to your spiritual journal.');
        setDraft('');
      } else if (res.status === 401) {
        setStatus('Sign in to save this reflection to your journal.');
      } else {
        setStatus('Journal save is temporarily unavailable. Your text remains on screen.');
      }
    } catch {
      setStatus('Journal save is temporarily unavailable. Your text remains on screen.');
    }
  };

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-sage-100 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
                <Mic className="mr-2 h-4 w-4" /> Voice auto-jot
              </div>
              <h2 className="mt-4 text-3xl font-light text-stone-900">Capture the thought before it disappears.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Speak or type what you learned from prayer, Scripture, fasting, a sermon, or ordinary life. The insight cards below are private rule-based prompts on this device—not claims about what God is saying.</p>
            </div>
            {!listening ? (
              <button onClick={startListening} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800"><Mic className="mr-2 h-4 w-4" /> Start auto-jot</button>
            ) : (
              <button onClick={stopListening} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white"><Square className="mr-2 h-4 w-4" /> Stop listening</button>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_0.35fr]">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Entry title</span><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Mood</span><select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3"><option>Seeking</option><option>Grateful</option><option>Peaceful</option><option>Hopeful</option><option>Challenged</option><option>Struggling</option><option>Joyful</option><option>Worshipful</option><option>Faithful</option></select></label>
          </div>

          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="mt-4 min-h-[220px] w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-5 leading-7 text-stone-700 outline-none focus:ring-2 focus:ring-sage-200" placeholder="What happened? What stood out? What Scripture or question do you want to revisit? What might you do next?" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={saveJournal} disabled={!draft.trim() || !title.trim()} className="inline-flex items-center rounded-xl bg-sage-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"><BookOpenText className="mr-2 h-4 w-4" /> Save to journal</button>
            <button onClick={saveLocal} disabled={!draft.trim()} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 disabled:opacity-40"><Save className="mr-2 h-4 w-4" /> Save private draft</button>
          </div>
          {status && <p className="mt-3 text-xs text-stone-500">{status}</p>}
        </div>

        <aside className="border-t border-sage-100 bg-sage-50/60 p-6 sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <div className="flex items-center gap-3"><Lightbulb className="h-6 w-6 text-amber-600" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Daily alignment insights</p><h3 className="mt-1 text-2xl font-light text-stone-900">What could you do next?</h3></div></div>
          <div className="mt-6 space-y-3">
            {insights.map((insight) => (
              <Link key={insight.title} href={insight.href} className="group block rounded-2xl border border-white bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sage-200">
                <div className="flex items-start gap-3"><span className="rounded-xl bg-sage-100 p-2 text-sage-700"><Sparkles className="h-4 w-4" /></span><div><p className="font-semibold text-stone-900">{insight.title}</p><p className="mt-1 text-xs leading-5 text-stone-600">{insight.detail}</p></div></div>
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">These prompts are based only on words in your current draft. They are not prophecy, diagnosis, or spiritual authority. For sensitive concerns, choose trusted human care.</div>
          <Link href="/care" className="mt-5 inline-flex items-center text-sm font-semibold text-rose-700"><HeartHandshake className="mr-2 h-4 w-4" /> Human pastoral care</Link>
          <Link href="/scripture" className="mt-3 flex items-center text-sm font-semibold text-sage-700"><BookOpenText className="mr-2 h-4 w-4" /> Scripture study</Link>
        </aside>
      </div>
    </section>
  );
}
