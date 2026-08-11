'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpenText, Footprints, HeartHandshake, Loader2, Search, ShieldCheck, Target } from 'lucide-react';

type SearchResult = {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  date: string;
  meta?: string;
  href: string;
};

const filters = ['All', 'Journey moment', 'Journal', 'Prayer', 'Sermon note', 'Goal'] as const;

export function JourneyMemorySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

  const visible = useMemo(() => filter === 'All' ? results : results.filter((item) => item.type === filter), [results, filter]);

  const search = async () => {
    const q = query.trim();
    if (q.length < 2 || loading) {
      if (q.length < 2) setStatus('Enter at least 2 characters to search your private memory.');
      return;
    }
    setLoading(true);
    setStatus('');
    setResults([]);
    try {
      const response = await fetch(`/api/journey/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Search is temporarily unavailable.');
      const next = Array.isArray(data.results) ? data.results : [];
      setResults(next);
      setFilter('All');
      setStatus(next.length ? `${next.length} private memory ${next.length === 1 ? 'match' : 'matches'} found.` : 'No matching private memory was found.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Search is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><Search className="h-5 w-5" /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700">Private spiritual memory search</p>
              <h2 className="mt-1 text-2xl font-light text-stone-900 sm:text-3xl">Find an old prayer, sermon note, Scripture reflection, goal, or Journey takeaway when you need it again.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Search only your own account records. This is retrieval, not AI interpretation: the system does not infer what God is saying from your history.</p>
            </div>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); void search(); }} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="journey-memory-query">Search your private spiritual memory</label>
            <input id="journey-memory-query" value={query} onChange={(event) => { setQuery(event.target.value); setStatus(''); }} maxLength={120} placeholder="Search forgiveness, Psalm 23, family, courage, service…" className="min-h-12 flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
            <button type="submit" disabled={loading || query.trim().length < 2} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-stone-950 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}{loading ? 'Searching…' : 'Search memory'}</button>
          </form>

          {results.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {filters.map((item) => {
                const count = item === 'All' ? results.length : results.filter((result) => result.type === item).length;
                if (item !== 'All' && count === 0) return null;
                return <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${filter === item ? 'border-violet-300 bg-violet-50 text-violet-800' : 'border-stone-200 bg-white text-stone-600'}`}>{item} · {count}</button>;
              })}
            </div>
          )}

          {status && <p className="mt-4 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600" role="status">{status}</p>}

          <div className="mt-6 space-y-3">
            {visible.map((item) => (
              <article key={`${item.type}-${item.id}`} className="rounded-2xl border border-stone-100 bg-white p-4 transition hover:border-violet-200 hover:shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">{item.type}</span>{item.meta && <span className="text-xs text-stone-400">{item.meta}</span>}</div>
                    <h3 className="mt-2 font-semibold text-stone-900">{item.title}</h3>
                    {item.excerpt && <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-stone-600">{item.excerpt}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-stone-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <Link href={item.href} className="mt-3 inline-flex text-xs font-semibold text-violet-700">Open source →</Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 xl:border-l xl:border-t-0">
          <ShieldCheck className="h-7 w-7 text-violet-300" />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">Memory boundaries</p>
          <h3 className="mt-2 text-2xl font-light">Useful recall without spiritual surveillance.</h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-stone-300">
            <p>Search is account-only and returns only records owned by the signed-in member.</p>
            <p>Giving amounts, child activity, pastoral counseling, crisis, safeguarding, abuse, medical, and other sensitive case records are excluded.</p>
            <p>No AI inference is used to decide what a memory “means” spiritually. Results are simple retrieval matches for your own review.</p>
          </div>

          <div className="mt-7 space-y-3">
            <Link href="/scripture" className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white"><BookOpenText className="mr-3 h-5 w-5 text-violet-300" /> Return to Scripture</Link>
            <Link href="/prayer-room" className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white"><HeartHandshake className="mr-3 h-5 w-5 text-violet-300" /> Return to prayer</Link>
            <Link href="/daily-guide" className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white"><Target className="mr-3 h-5 w-5 text-violet-300" /> Choose today’s next step</Link>
            <div className="flex items-start rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4 text-xs leading-5 text-violet-100"><Footprints className="mr-3 mt-0.5 h-4 w-4 shrink-0" /> Search is for memory and reference, not for scoring spiritual progress.</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
