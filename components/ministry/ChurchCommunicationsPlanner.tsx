'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, Mail, Megaphone, MessageSquare, Plus, ShieldCheck, Trash2, UsersRound } from 'lucide-react';

type Channel = 'in-app' | 'email' | 'sms' | 'whatsapp' | 'social' | 'stage';
type Status = 'draft' | 'review' | 'approved' | 'scheduled';
type MessageItem = {
  id: string;
  title: string;
  audience: string;
  owner: string;
  channel: Channel;
  status: Status;
  sendAt: string;
  body: string;
  consentRequired: boolean;
};

const defaults: MessageItem[] = [
  { id: 'welcome', title: 'Sunday service reminder', audience: 'Church family', owner: '', channel: 'in-app', status: 'draft', sendAt: '', body: '', consentRequired: false },
  { id: 'guests', title: 'Guest follow-up invitation', audience: 'Consented guests', owner: '', channel: 'email', status: 'draft', sendAt: '', body: '', consentRequired: true },
];

const storageKey = 'digital-church-communications-planner';

export function ChurchCommunicationsPlanner() {
  const [messages, setMessages] = useState<MessageItem[]>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      // Local planning is optional.
    }
  }, []);

  const ready = useMemo(() => messages.filter((item) => item.owner && item.audience && item.body.trim() && item.status !== 'draft').length, [messages]);
  const consentSensitive = useMemo(() => messages.filter((item) => item.consentRequired).length, [messages]);

  const update = (id: string, patch: Partial<MessageItem>) => setMessages((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const remove = (id: string) => setMessages((current) => current.filter((item) => item.id !== id));
  const add = () => setMessages((current) => [...current, { id: `${Date.now()}`, title: 'New announcement', audience: '', owner: '', channel: 'in-app', status: 'draft', sendAt: '', body: '', consentRequired: false }]);
  const save = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700"><Megaphone className="mr-2 h-4 w-4" /> Communications command desk</div>
              <h1 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-5xl">Plan church communication with clear audience, ownership, consent, review, and timing.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Prepare announcements across in-app, email, SMS, WhatsApp, social, and stage channels without pretending external delivery providers are already connected.</p>
            </div>
            <div className="min-w-[185px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Ready for delivery</p>
              <p className="mt-1 text-3xl font-light">{ready}/{messages.length}</p>
              <p className="mt-2 text-xs text-stone-400">{consentSensitive} consent-sensitive</p>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            {messages.map((item) => (
              <article key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Announcement</span><input value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Audience</span><input value={item.audience} onChange={(e) => update(item.id, { audience: e.target.value })} placeholder="Members, guests, parents..." className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Owner</span><input value={item.owner} onChange={(e) => update(item.id, { owner: e.target.value })} placeholder="Communications lead" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Channel</span><select value={item.channel} onChange={(e) => update(item.id, { channel: e.target.value as Channel })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="in-app">In-app</option><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="social">Social</option><option value="stage">Stage announcement</option></select></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Review state</span><select value={item.status} onChange={(e) => update(item.id, { status: e.target.value as Status })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="draft">Draft</option><option value="review">Needs review</option><option value="approved">Approved</option><option value="scheduled">Scheduled</option></select></label>
                  <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Target date/time</span><input type="datetime-local" value={item.sendAt} onChange={(e) => update(item.id, { sendAt: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label className="md:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Message copy</span><textarea value={item.body} onChange={(e) => update(item.id, { body: e.target.value })} className="min-h-[96px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-6" placeholder="Write the actual announcement here..." /></label>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-600"><input type="checkbox" checked={item.consentRequired} onChange={(e) => update(item.id, { consentRequired: e.target.checked })} className="h-4 w-4 rounded" /> Only contact people with appropriate consent</label>
                  <button type="button" onClick={() => remove(item.id)} className="inline-flex items-center rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-semibold text-rose-600"><Trash2 className="mr-1.5 h-4 w-4" /> Remove</button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={add} className="inline-flex items-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white"><Plus className="mr-2 h-4 w-4" /> Add announcement</button>
            <button type="button" onClick={save} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Check className="mr-2 h-4 w-4" /> {saved ? 'Saved privately' : 'Save plan'}</button>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <MessageSquare className="h-8 w-8 text-blue-300" />
          <h2 className="mt-5 text-3xl font-light">One message, different responsibilities.</h2>
          <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="mb-2 h-5 w-5 text-blue-300" /><strong className="text-white">Audience clarity.</strong> Separate members, guests, parents, workers, leaders, and public audiences before sending.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Mail className="mb-2 h-5 w-5 text-blue-300" /><strong className="text-white">Provider honesty.</strong> This planner prepares delivery metadata; SMS, WhatsApp, email, and social publishing require real provider connections.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-2 h-5 w-5 text-blue-300" /><strong className="text-white">Consent and safeguarding.</strong> Do not use bulk outreach to expose prayer, counseling, child, financial, or other sensitive information.</div>
          </div>
          <div className="mt-7 grid gap-3">
            <Link href="/events" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open events →</Link>
            <Link href="/admin/follow-up" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Open follow-up queue →</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
