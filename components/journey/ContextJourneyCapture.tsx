'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, CheckCircle2, Footprints, Loader2, NotebookPen, ShieldCheck } from 'lucide-react';

type CaptureContext = {
  source: 'Scripture' | 'Prayer' | 'Fasting' | 'Family Altar' | 'Choir' | 'Sermon' | 'Service Response';
  title: string;
  prompt: string;
  nextStepPrompt: string;
};

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function contextFor(pathname: string): CaptureContext | null {
  if (pathname === '/scripture' || pathname.startsWith('/scripture/')) {
    return { source: 'Scripture', title: 'Remember this Scripture moment', prompt: 'What did you observe, question, receive, or want to revisit from the passage?', nextStepPrompt: 'What is one faithful response to carry forward?' };
  }
  if (pathname.startsWith('/prayer-room') || pathname.startsWith('/prayer-practice') || pathname.startsWith('/prayer-watch')) {
    return { source: 'Prayer', title: 'Remember this prayer moment', prompt: 'What are you praying, noticing, surrendering, thanking God for, or continuing to hold before Him?', nextStepPrompt: 'Is there a person to contact, prayer to continue, or practical step to take?' };
  }
  if (pathname.startsWith('/fasting-prayer') || pathname.startsWith('/fasting-companion')) {
    return { source: 'Fasting', title: 'Remember this fasting reflection', prompt: 'What Scripture, prayer focus, dependence, limitation, or insight do you want to remember?', nextStepPrompt: 'What responsible next step will help you continue with wisdom and care?' };
  }
  if (pathname.startsWith('/family-altar')) {
    return { source: 'Family Altar', title: 'Remember this family worship moment', prompt: 'What theme, question, gratitude, prayer, or family conversation is worth remembering?', nextStepPrompt: 'What simple household practice or conversation should continue?' };
  }
  if (pathname.startsWith('/choir') || pathname.startsWith('/choir-studio') || pathname.startsWith('/worship-media')) {
    return { source: 'Choir', title: 'Remember this worship-creation moment', prompt: 'What Scripture, lyric idea, musical direction, rehearsal insight, or worship intention should stay with you?', nextStepPrompt: 'What should be rehearsed, reviewed, credited, or prepared next?' };
  }
  if (pathname.startsWith('/sermons')) {
    return { source: 'Sermon', title: 'Remember this sermon moment', prompt: 'What teaching point, Scripture connection, question, conviction, or encouragement do you want to revisit?', nextStepPrompt: 'What is one grounded response after hearing or preparing this message?' };
  }
  if (pathname.startsWith('/live-service') || pathname.startsWith('/service-response')) {
    return { source: 'Service Response', title: 'Remember this service response', prompt: 'What from this service do you want to carry into prayer, discipleship, care, service, or the week ahead?', nextStepPrompt: 'What response needs action, follow-up, prayer, or human support?' };
  }
  return null;
}

function sourceKey(source: string, pathname: string) {
  const safePath = pathname.toLowerCase().replace(/[^a-z0-9/\-_]+/g, '-').replace(/\//g, ':').replace(/^:+|:+$/g, '');
  return `${source.toLowerCase().replace(/\s+/g, '-')}:${safePath || 'root'}:${dayKey()}`;
}

export function ContextJourneyCapture() {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const context = useMemo(() => contextFor(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [reflection, setReflection] = useState('');
  const [scriptureRefs, setScriptureRefs] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!context) return null;

  const signedIn = Boolean((session?.user as { id?: string } | undefined)?.id);

  const save = async () => {
    if (saving || (!reflection.trim() && !nextStep.trim())) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: context.source,
          sourceKey: sourceKey(context.source, pathname),
          title: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          content: reflection.trim(),
          scriptureRefs: scriptureRefs.split(',').map((item) => item.trim()).filter(Boolean),
          nextStep: nextStep.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save this moment.');
      setMessage(data.operation === 'updated' ? 'Today’s private journey moment was updated.' : 'Saved privately to your Journey.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save this moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="px-4 pb-8 sm:px-6 lg:px-8" aria-label="Journey continuity capture">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[1.75rem] border border-sage-100 bg-gradient-to-br from-white via-white to-sage-50 shadow-sm">
          <button type="button" onClick={() => { setOpen((value) => !value); setMessage(''); }} aria-expanded={open} className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-sage-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage-500 sm:px-6">
            <span className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-700"><Footprints className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-sage-700">Private journey continuity</span>
                <span className="mt-0.5 block truncate text-sm font-semibold text-stone-900 sm:text-base">{context.title}</span>
              </span>
            </span>
            <span className="shrink-0 rounded-full border border-sage-200 bg-white px-3 py-1.5 text-xs font-semibold text-sage-700">{open ? 'Close' : 'Remember'}</span>
          </button>

          {open && (
            <div className="border-t border-sage-100 p-5 sm:p-6">
              {sessionStatus === 'loading' ? (
                <div className="flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking your private account…</div>
              ) : !signedIn ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-5">
                  <p className="text-sm leading-6 text-stone-600">Sign in before saving continuity so this reflection belongs to your account rather than an ambiguous browser session.</p>
                  <Link href="/auth/signin" className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white">Sign in to remember this</Link>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                  <div>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Reflection</span>
                      <textarea value={reflection} onChange={(event) => { setReflection(event.target.value); setMessage(''); }} maxLength={3500} rows={6} placeholder={context.prompt} className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
                    </label>
                    <label className="mt-4 block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture references · optional</span>
                      <input value={scriptureRefs} onChange={(event) => { setScriptureRefs(event.target.value); setMessage(''); }} placeholder="John 15:5, Psalm 23" className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
                    </label>
                  </div>

                  <aside className="rounded-2xl bg-stone-950 p-5 text-white">
                    <BookOpenText className="h-5 w-5 text-sage-300" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-sage-300">One faithful next step</p>
                    <textarea value={nextStep} onChange={(event) => { setNextStep(event.target.value); setMessage(''); }} maxLength={800} rows={5} placeholder={context.nextStepPrompt} className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white outline-none placeholder:text-stone-500 focus:ring-2 focus:ring-sage-400" />
                    <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-stone-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" /><span>This saves to your private Journey. It is not a spiritual score, public testimony, pastoral case record, or financial activity record.</span></div>
                    <button type="button" onClick={save} disabled={saving || (!reflection.trim() && !nextStep.trim())} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sage-500 px-4 text-sm font-semibold text-white hover:bg-sage-400 disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save / update today’s moment'}</button>
                    {message && <p className={`mt-3 flex items-start gap-2 text-xs leading-5 ${message.toLowerCase().includes('saved') || message.toLowerCase().includes('updated') ? 'text-sage-200' : 'text-amber-200'}`}>{(message.toLowerCase().includes('saved') || message.toLowerCase().includes('updated')) && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}{message}</p>}
                  </aside>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
