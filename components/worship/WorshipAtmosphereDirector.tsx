'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Check,
  Copyright,
  HeartHandshake,
  Music2,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type Stage = {
  id: string;
  title: string;
  purpose: string;
  guidance: string;
};

const stages: Stage[] = [
  { id: 'gather', title: 'Gather', purpose: 'Welcome and center the room.', guidance: 'Use a gentle instrumental, congregational call, or familiar opening that helps people arrive.' },
  { id: 'praise', title: 'Praise', purpose: 'Shared joy and participation.', guidance: 'Choose singable material, clear keys, and energy that serves the congregation rather than performance.' },
  { id: 'worship', title: 'Worship', purpose: 'Prayerful attention and surrender.', guidance: 'Leave room for silence, prayer, Scripture, or a simple refrain instead of filling every moment.' },
  { id: 'word', title: 'Word', purpose: 'Prepare for Scripture and teaching.', guidance: 'Use minimal transitions so music supports the biblical message rather than competing with it.' },
  { id: 'response', title: 'Response', purpose: 'Prayer, salvation, care, and commitment.', guidance: 'Choose material that allows people to pray, respond, receive care, or reflect without emotional pressure.' },
  { id: 'sending', title: 'Sending', purpose: 'Carry worship into daily service.', guidance: 'Close with hope, mission, blessing, or a practical invitation to serve.' },
];

export function WorshipAtmosphereDirector() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const progress = useMemo(() => Math.round((completed.length / stages.length) * 100), [completed.length]);

  const toggle = (id: string) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const save = () => {
    try {
      window.localStorage.setItem('digital-church-worship-atmosphere-plan', JSON.stringify({ completed, notes, rightsConfirmed }));
    } catch {
      // Local persistence is optional.
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
                <Music2 className="mr-2 h-4 w-4" /> Worship atmosphere director
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Plan the spiritual arc of the gathering, not just a playlist.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Guide worship from gathering to sending with purposeful transitions, rights-aware media choices, response space, and human-led pastoral sensitivity.</p>
            </div>
            <div className="min-w-[150px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Service flow</p>
              <p className="mt-1 text-3xl font-light">{progress}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-purple-400" style={{ width: `${progress}%` }} /></div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stages.map((stage) => {
              const done = completed.includes(stage.id);
              return (
                <article key={stage.id} className={`rounded-3xl border p-5 transition ${done ? 'border-purple-200 bg-purple-50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${done ? 'bg-purple-600 text-white' : 'bg-white text-purple-700 shadow-sm'}`}>{done ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</span>
                    <button type="button" onClick={() => toggle(stage.id)} className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${done ? 'bg-white text-purple-700' : 'bg-stone-200 text-stone-600'}`}>{done ? 'Planned' : 'Mark planned'}</button>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900">{stage.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-purple-700">{stage.purpose}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{stage.guidance}</p>
                  <textarea value={notes[stage.id] || ''} onChange={(e) => setNotes((current) => ({ ...current, [stage.id]: e.target.value }))} className="mt-4 min-h-[90px] w-full rounded-xl border border-stone-200 bg-white p-3 text-xs leading-5 outline-none focus:ring-2 focus:ring-purple-200" placeholder="Song/media slot, key, leader, transition, prayer cue..." />
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={save} className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700">Save service atmosphere plan</button>
            <Link href="/choir" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Open Choir Studio</Link>
            <Link href="/live-service" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Radio className="mr-2 h-4 w-4" /> Live service</Link>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <Copyright className="h-8 w-8 text-purple-300" />
          <h3 className="mt-5 text-2xl font-light">Media rights and pastoral response remain part of worship planning.</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">A beautiful service is not enough if the church cannot legally stream the music or if the response moment becomes manipulative.</p>
          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-300">
            <input type="checkbox" checked={rightsConfirmed} onChange={(e) => setRightsConfirmed(e.target.checked)} className="mt-1 h-4 w-4 accent-purple-500" />
            <span>I have reviewed the intended songs/media for original, public-domain, licensed, or provider-cleared use before public performance/streaming.</span>
          </label>
          <div className={`mt-4 rounded-2xl border p-4 text-xs leading-5 ${rightsConfirmed ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-amber-300/20 bg-amber-300/10 text-amber-100'}`}>
            <ShieldCheck className="mb-2 h-4 w-4" /> {rightsConfirmed ? 'Rights review marked complete for this planning session.' : 'Keep public streaming/distribution gated until rights review is complete.'}
          </div>
          <Link href="/media-rights" className="mt-6 inline-flex text-sm font-semibold text-purple-300">Review media rights →</Link>
          <div className="mt-7 rounded-2xl border border-sage-300/20 bg-sage-300/10 p-4 text-xs leading-5 text-sage-100">
            <HeartHandshake className="mb-2 h-4 w-4" /> Response music should support prayer and care without manufacturing pressure. Sensitive responses belong with trusted human leaders.
          </div>
        </aside>
      </div>
    </section>
  );
}
