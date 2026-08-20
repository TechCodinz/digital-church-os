'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Headphones,
  Library,
  Loader2,
  Music2,
  PlayCircle,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type MediaItem = {
  id: string;
  title: string;
  artist?: string | null;
  media_type?: string;
  category?: string;
  source_url?: string;
  language?: string;
  scripture_refs?: string[];
  mood_tags?: string[];
  license_type?: string;
  visibility?: string;
  rights_status?: string;
};

const categories = ['ALL', 'WORSHIP', 'PRAISE', 'PRAYER_ATMOSPHERE', 'MEDITATION', 'CHOIR', 'SERMON_CLIP', 'CHILDREN', 'YOUTH'];

export function WorshipMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [rolloutMessage, setRolloutMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (category !== 'ALL') params.set('category', category);
        const response = await fetch(`/api/worship/media${params.toString() ? `?${params}` : ''}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load worship media.');
        if (cancelled) return;
        setMedia(Array.isArray(data.media) ? data.media : []);
        setRolloutMessage(data.rollout?.message || '');
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Unable to load worship media.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [category]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return media;
    return media.filter((item) => [item.title, item.artist, item.category, item.language, ...(item.mood_tags || []), ...(item.scripture_refs || [])].filter(Boolean).join(' ').toLowerCase().includes(needle));
  }, [media, query]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 bg-gradient-to-r from-purple-50 via-white to-sage-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-purple-700 shadow-sm"><Library className="mr-2 h-4 w-4" /> Rights-cleared worship library</div>
              <h2 className="mt-4 text-3xl font-light text-stone-900 md:text-4xl">Choose worship media by ministry moment—not just by file name.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Browse approved worship, praise, prayer atmosphere, choir, children, youth, and sermon media. Public results only appear after rights review and distribution clearance.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/choir" className="inline-flex items-center rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-800"><Music2 className="mr-2 h-4 w-4" /> Create worship music</Link>
              <Link href="/media-rights" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><ShieldCheck className="mr-2 h-4 w-4" /> Media rights</Link>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, artist, mood, language, Scripture..." className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-200" /></div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:max-w-[56%]">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === item ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-600'}`}>{item.replaceAll('_', ' ')}</button>)}</div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {rolloutMessage && <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-800"><ShieldCheck className="mr-2 inline h-4 w-4" />{rolloutMessage}</div>}
          {error && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          {loading ? (
            <div className="flex min-h-56 items-center justify-center text-stone-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading approved worship media...</div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <article key={item.id} className="group rounded-3xl border border-stone-100 bg-stone-50 p-5 transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-4"><div className="rounded-2xl bg-white p-3 text-purple-700 shadow-sm"><Headphones className="h-5 w-5" /></div><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sage-700">{item.license_type || 'REVIEWED'}</span></div>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{item.artist || 'Church / worship contributor'}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-stone-500">{item.category && <span className="rounded-full bg-white px-2.5 py-1">{item.category.replaceAll('_', ' ')}</span>}{item.language && <span className="rounded-full bg-white px-2.5 py-1">{item.language}</span>}</div>
                  {!!item.scripture_refs?.length && <p className="mt-4 text-xs leading-5 text-stone-500">Scripture: {item.scripture_refs.slice(0, 3).join(', ')}</p>}
                  <div className="mt-5 flex gap-2">{item.source_url ? <a href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white"><PlayCircle className="mr-2 h-4 w-4" /> Open media</a> : <span className="flex-1 rounded-xl bg-stone-200 px-4 py-2.5 text-center text-xs text-stone-500">Source unavailable</span>}<Link href="/live-broadcast" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-3 text-stone-700" title="Use in broadcast"><Radio className="h-4 w-4" /></Link></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-stone-200 bg-stone-50 p-10 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-purple-300" />
              <h3 className="mt-4 text-xl font-semibold text-stone-900">No cleared media in this view yet.</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-500">That is safer than showing unreviewed copyrighted content. Churches can prepare original/public-domain/licensed media through the rights workflow, then publish after approval.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/choir" className="text-sm font-semibold text-purple-700">Create original worship →</Link><Link href="/media-rights" className="text-sm font-semibold text-purple-700">Review rights →</Link></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
