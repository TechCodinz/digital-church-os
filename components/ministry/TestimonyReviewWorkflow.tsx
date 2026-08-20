'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, MessageSquare, Plus, ShieldCheck, Sparkles, Trash2, UsersRound } from 'lucide-react';
import {
  getActiveChurchId,
  loadChurchOperationalRecord,
  saveChurchOperationalRecord,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type ReviewState = 'submitted' | 'pastoral-review' | 'consent-check' | 'approved' | 'published' | 'declined';
type TestimonyItem = {
  id: string;
  title: string;
  storyteller: string;
  story: string;
  scripture: string;
  owner: string;
  reviewState: ReviewState;
  publishAnonymously: boolean;
  publicConsent: boolean;
  mediaConsent: boolean;
  verificationNeeded: boolean;
  reviewNote: string;
};

const legacyKey = 'digital-church-testimony-review';
const localPrefix = 'digital-church-testimony-review:v2';
const seed: TestimonyItem[] = [
  { id: 'story-1', title: 'New testimony', storyteller: '', story: '', scripture: '', owner: '', reviewState: 'submitted', publishAnonymously: false, publicConsent: false, mediaConsent: false, verificationNeeded: false, reviewNote: '' },
];

function normalizeItems(value: unknown): TestimonyItem[] {
  if (!Array.isArray(value)) return seed;
  return value.filter((item) => item && typeof item === 'object').map((item: any, index) => ({
    id: typeof item.id === 'string' ? item.id : `story-${index}`,
    title: typeof item.title === 'string' ? item.title : 'Testimony',
    storyteller: typeof item.storyteller === 'string' ? item.storyteller : '',
    story: typeof item.story === 'string' ? item.story : '',
    scripture: typeof item.scripture === 'string' ? item.scripture : '',
    owner: typeof item.owner === 'string' ? item.owner : '',
    reviewState: ['submitted', 'pastoral-review', 'consent-check', 'approved', 'published', 'declined'].includes(item.reviewState) ? item.reviewState : 'submitted',
    publishAnonymously: Boolean(item.publishAnonymously),
    publicConsent: Boolean(item.publicConsent),
    mediaConsent: Boolean(item.mediaConsent),
    verificationNeeded: Boolean(item.verificationNeeded),
    reviewNote: typeof item.reviewNote === 'string' ? item.reviewNote : '',
  }));
}

export function TestimonyReviewWorkflow() {
  const [items, setItems] = useState<TestimonyItem[]>(seed);
  const [saved, setSaved] = useState(false);
  const [activeChurchId, setActiveChurchId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Private browser draft');

  const loadWorkspace = async (churchId: string) => {
    setActiveChurchId(churchId);
    setSaved(false);
    setSyncing(true);
    setSyncMessage(churchId ? 'Loading church testimony review…' : 'Loading private testimony draft…');
    try {
      const result = await loadChurchOperationalRecord({
        churchId,
        module: 'testimonies',
        recordKey: 'review-board',
        localStoragePrefix: localPrefix,
        legacyLocalStorageKey: legacyKey,
        defaultValue: seed,
        normalize: normalizeItems,
      });
      setItems(result.value);
      setSyncMessage(result.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void loadWorkspace(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadWorkspace(churchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approved = useMemo(() => items.filter((item) => item.reviewState === 'approved' || item.reviewState === 'published').length, [items]);
  const missingConsent = useMemo(() => items.filter((item) => !item.publicConsent && item.reviewState !== 'declined').length, [items]);
  const verifyCount = useMemo(() => items.filter((item) => item.verificationNeeded).length, [items]);

  const update = (id: string, patch: Partial<TestimonyItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const add = () => setItems((current) => [...current, { id: `${Date.now()}`, title: 'New testimony', storyteller: '', story: '', scripture: '', owner: '', reviewState: 'submitted', publishAnonymously: false, publicConsent: false, mediaConsent: false, verificationNeeded: false, reviewNote: '' }]);
  const save = async () => {
    setSyncing(true);
    setSyncMessage(activeChurchId ? 'Saving testimony review to active church…' : 'Saving private testimony draft…');
    try {
      const result = await saveChurchOperationalRecord({
        churchId: activeChurchId,
        module: 'testimonies',
        recordKey: 'review-board',
        title: 'Testimony review & consent board',
        classification: 'SENSITIVE_OPERATIONAL',
        localStoragePrefix: localPrefix,
        value: items,
      });
      setSaved(true);
      setSyncMessage(result.message);
      window.setTimeout(() => setSaved(false), 1500);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-700"><Sparkles className="mr-2 h-4 w-4" /> Testimony review</div>
              <h1 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-5xl">Honor people’s stories without turning private moments into content by default.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Capture a testimony, assign human review, record public/media consent, choose anonymity, flag claims that need verification, and keep publication status explicit. Shared review data is tenant-scoped and classified as sensitive operational content.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-violet-700" /> {syncing ? 'Syncing…' : syncMessage}</div>
            </div>
            <div className="grid min-w-[210px] grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-stone-950 p-3 text-white"><p className="text-xl font-light">{approved}</p><p className="text-[9px] uppercase tracking-wider text-stone-400">Approved</p></div><div className="rounded-2xl bg-amber-50 p-3"><p className="text-xl font-light text-amber-800">{missingConsent}</p><p className="text-[9px] uppercase tracking-wider text-amber-700">Consent</p></div><div className="rounded-2xl bg-blue-50 p-3"><p className="text-xl font-light text-blue-800">{verifyCount}</p><p className="text-[9px] uppercase tracking-wider text-blue-700">Verify</p></div></div>
          </div>

          <div className="mt-7 space-y-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Title</span><input value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Storyteller</span><input value={item.storyteller} onChange={(e) => update(item.id, { storyteller: e.target.value })} placeholder="Name or internal label" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Review owner</span><input value={item.owner} onChange={(e) => update(item.id, { owner: e.target.value })} placeholder="Pastor / communications lead" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Status</span><select value={item.reviewState} onChange={(e) => update(item.id, { reviewState: e.target.value as ReviewState })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="submitted">Submitted</option><option value="pastoral-review">Pastoral review</option><option value="consent-check">Consent check</option><option value="approved">Approved</option><option value="published">Published</option><option value="declined">Declined / private</option></select></label>
                  <label className="md:col-span-2 xl:col-span-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Testimony text</span><textarea value={item.story} onChange={(e) => update(item.id, { story: e.target.value })} className="min-h-[140px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-6" placeholder="Record the person’s story carefully and in their own terms..." /></label>
                  <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Scripture reference</span><input value={item.scripture} onChange={(e) => update(item.id, { scripture: e.target.value })} placeholder="Reference only unless supplied" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Reviewer note</span><input value={item.reviewNote} onChange={(e) => update(item.id, { reviewNote: e.target.value })} placeholder="Operational review note" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-stone-600"><input type="checkbox" checked={item.publicConsent} onChange={(e) => update(item.id, { publicConsent: e.target.checked })} /> Public-story consent</label>
                  <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-stone-600"><input type="checkbox" checked={item.mediaConsent} onChange={(e) => update(item.id, { mediaConsent: e.target.checked })} /> Photo/video/audio consent</label>
                  <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-stone-600"><input type="checkbox" checked={item.publishAnonymously} onChange={(e) => update(item.id, { publishAnonymously: e.target.checked })} /> Publish anonymously</label>
                  <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-stone-600"><input type="checkbox" checked={item.verificationNeeded} onChange={(e) => update(item.id, { verificationNeeded: e.target.checked })} /> Claims need verification</label>
                </div>
                <div className="mt-4 flex justify-end"><button type="button" onClick={() => setItems((current) => current.filter((story) => story.id !== item.id))} className="inline-flex items-center rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-semibold text-rose-600"><Trash2 className="mr-1.5 h-4 w-4" /> Remove</button></div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={add} className="inline-flex items-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white"><Plus className="mr-2 h-4 w-4" /> Add testimony</button><button type="button" onClick={() => void save()} disabled={syncing} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 disabled:opacity-60"><Check className="mr-2 h-4 w-4" /> {syncing ? 'Syncing…' : saved ? 'Saved' : activeChurchId ? 'Save to active church' : 'Save private review board'}</button></div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10"><MessageSquare className="h-8 w-8 text-violet-300" /><h2 className="mt-5 text-3xl font-light">Story stewardship before promotion.</h2><div className="mt-6 space-y-3 text-sm leading-6 text-stone-300"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="mb-2 h-5 w-5 text-violet-300" /><strong className="text-white">The person owns the story.</strong> Consent can be withheld or changed; a ministry win does not create automatic publishing rights.</div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-2 h-5 w-5 text-violet-300" /><strong className="text-white">Sensitive details stay private.</strong> Remove confidential health, counseling, child, abuse, financial, or identifying details unless there is a legitimate, reviewed reason and appropriate permission.</div></div><div className="mt-6 grid gap-3"><Link href="/communications" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Prepare approved communication →</Link><Link href="/media-rights" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">Review media rights →</Link></div></aside>
      </div>
    </section>
  );
}
