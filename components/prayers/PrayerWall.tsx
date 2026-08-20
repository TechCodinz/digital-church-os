'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Heart, Info, Loader2, Share2, User } from 'lucide-react';

type Prayer = {
  id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'ANONYMOUS';
  isAnswered: boolean;
  answeredAt?: string | null;
  createdAt: string;
  viewerIsOwner?: boolean;
  intercessionCount?: number;
  user?: { name?: string | null; avatar?: string | null };
};

export function PrayerWall() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Record<string, string>>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [gratitude, setGratitude] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prayers', { cache: 'no-store' });
      const data = await response.json().catch(() => []);
      setPrayers(Array.isArray(data) ? data : []);
    } catch {
      setPrayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const intercede = async (prayer: Prayer) => {
    if (actionId) return;
    setActionId(prayer.id);
    setNotice((current) => ({ ...current, [prayer.id]: '' }));
    try {
      const response = await fetch(`/api/prayers/${encodeURIComponent(prayer.id)}/intercede`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to record intercession.');
      setNotice((current) => ({ ...current, [prayer.id]: data.message || 'Intercession recorded privately.' }));
      if (!data.alreadyRecorded) {
        setPrayers((current) => current.map((item) => item.id === prayer.id ? { ...item, intercessionCount: (item.intercessionCount || 0) + 1 } : item));
      }
    } catch (error) {
      setNotice((current) => ({ ...current, [prayer.id]: error instanceof Error ? error.message : 'Unable to record intercession.' }));
    } finally {
      setActionId(null);
    }
  };

  const sharePrayer = async (prayer: Prayer) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/prayer-room` : '';
    const text = prayer.visibility === 'ANONYMOUS' ? 'A public prayer request on Digital Church OS' : prayer.title;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Prayer request', text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setNotice((current) => ({ ...current, [prayer.id]: 'Prayer Room link copied.' }));
      }
    } catch {
      // User cancellation should not surface as an error.
    }
  };

  const updateAnswered = async (prayer: Prayer, answered: boolean) => {
    if (actionId) return;
    setActionId(prayer.id);
    setNotice((current) => ({ ...current, [prayer.id]: '' }));
    try {
      const response = await fetch(`/api/prayers/${encodeURIComponent(prayer.id)}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answered, gratitude: answered ? gratitude.trim() : '' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to update answered status.');
      setPrayers((current) => current.map((item) => item.id === prayer.id ? { ...item, isAnswered: data.prayer?.isAnswered === true, answeredAt: data.prayer?.answeredAt || null } : item));
      setNotice((current) => ({ ...current, [prayer.id]: answered ? (data.gratitudeSavedToJourney ? 'Marked answered. Your gratitude reflection was saved privately to Journey.' : 'Marked answered.') : 'Marked as still in prayer.' }));
      setAnsweringId(null);
      setGratitude('');
    } catch (error) {
      setNotice((current) => ({ ...current, [prayer.id]: error instanceof Error ? error.message : 'Unable to update answered status.' }));
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-400"><Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" /> Loading prayer requests…</div>;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {prayers.map((prayer, index) => (
          <motion.article key={prayer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.3) }} className="sanctuary-card group relative overflow-hidden border border-sage-50 transition-all hover:shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-50"><Heart size={40} className="text-rose-100 transition-colors group-hover:text-rose-200" /></div>

            <div className="mb-6 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-600">{prayer.visibility === 'ANONYMOUS' ? <Info size={20} /> : <User size={20} />}</div>
              <div>
                <p className="font-medium text-stone-800">{prayer.visibility === 'ANONYMOUS' ? 'Anonymous member' : (prayer.user?.name || 'A Member')}</p>
                <p className="text-xs text-stone-400">{new Date(prayer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 pr-8">
              <h4 className="text-xl font-medium text-stone-800">{prayer.title}</h4>
              {prayer.isAnswered && <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Answered</span>}
            </div>
            <p className="mb-6 line-clamp-5 whitespace-pre-wrap text-stone-600 leading-relaxed">{prayer.content}</p>

            <div className="rounded-2xl border border-cream-100 bg-cream-50/60 p-3 text-xs text-stone-500">
              <span className="font-semibold text-stone-700">{prayer.intercessionCount || 0}</span> recorded {prayer.intercessionCount === 1 ? 'intercession' : 'intercessions'}
              {prayer.isAnswered && prayer.answeredAt ? ` · marked answered ${new Date(prayer.answeredAt).toLocaleDateString()}` : ''}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-cream-100 pt-5">
              <button type="button" onClick={() => void intercede(prayer)} disabled={actionId === prayer.id} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-rose-50 px-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">{actionId === prayer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="mr-1.5 h-4 w-4" />} Pray</button>
              <Link href="/prayer-practice" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-2 text-center text-xs font-semibold text-sage-700">Practice</Link>
              <button type="button" onClick={() => void sharePrayer(prayer)} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-2 text-xs font-semibold text-stone-600"><Share2 className="mr-1.5 h-4 w-4" /> Share</button>
            </div>

            {prayer.viewerIsOwner && (
              <div className="mt-4 rounded-2xl border border-sage-100 bg-sage-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-sage-800">Your prayer request</p>
                {!prayer.isAnswered ? (
                  answeringId === prayer.id ? (
                    <div className="mt-3">
                      <textarea value={gratitude} onChange={(event) => setGratitude(event.target.value)} maxLength={2400} rows={3} placeholder="Optional private gratitude reflection for your Journey…" className="w-full rounded-xl border border-sage-200 bg-white p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-sage-200" />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => void updateAnswered(prayer, true)} disabled={actionId === prayer.id} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Mark answered</button>
                        <button type="button" onClick={() => { setAnsweringId(null); setGratitude(''); }} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600">Cancel</button>
                      </div>
                    </div>
                  ) : <button type="button" onClick={() => setAnsweringId(prayer.id)} className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm">Mark as answered</button>
                ) : <button type="button" onClick={() => void updateAnswered(prayer, false)} disabled={actionId === prayer.id} className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm">Reopen prayer</button>}
              </div>
            )}

            {notice[prayer.id] && <p className="mt-3 text-xs leading-5 text-stone-500" role="status">{notice[prayer.id]}</p>}
          </motion.article>
        ))}
      </AnimatePresence>

      {prayers.length === 0 && (
        <div className="col-span-full rounded-3xl border border-cream-100 bg-white py-20 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-stone-200" />
          <p className="text-stone-500">The public prayer wall is quiet right now. Share a prayer when you are ready.</p>
        </div>
      )}
    </div>
  );
}
