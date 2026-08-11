'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Globe2,
  Handshake,
  Languages,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

type Church = {
  id: string;
  name: string;
  slug?: string;
  denomination?: string | null;
  country?: string | null;
  city?: string | null;
  description?: string | null;
  verified?: boolean;
  visibility?: string;
};

type Connection = {
  id?: string;
  status?: string;
  connection_type?: string;
  requester_church_id?: string;
  receiver_church_id?: string;
};

type NetworkPayload = {
  churches?: Church[];
  connections?: Connection[];
};

const collaborationModes = [
  { id: 'OUTREACH', label: 'Outreach', note: 'Coordinate mission, evangelism, relief, or community service.' },
  { id: 'CONFERENCE', label: 'Conference', note: 'Plan accountable multi-church gatherings and training.' },
  { id: 'GUEST_SPEAKER', label: 'Guest minister', note: 'Prepare invitations and review responsibility before approval.' },
  { id: 'RESOURCE_SHARING', label: 'Resources', note: 'Share cleared lessons, worship material, and ministry tools.' },
  { id: 'PARTNER', label: 'Partnership', note: 'Build an ongoing church-to-church relationship.' },
];

export function ChurchNetworkIntelligence() {
  const [payload, setPayload] = useState<NetworkPayload>({ churches: [], connections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mode, setMode] = useState('PARTNER');
  const [brief, setBrief] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/network/churches', { cache: 'no-store' });
      if (!response.ok) throw new Error('Church network data is unavailable.');
      const data = (await response.json()) as NetworkPayload;
      setPayload({ churches: data.churches || [], connections: data.connections || [] });
    } catch (cause) {
      console.error(cause);
      setError('The live church directory could not be refreshed. Existing ministry tools remain available.');
      setPayload({ churches: [], connections: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const countries = useMemo(
    () => Array.from(new Set((payload.churches || []).map((church) => church.country).filter(Boolean) as string[])).sort(),
    [payload.churches],
  );

  const visibleChurches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (payload.churches || []).filter((church) => {
      if (country !== 'all' && church.country !== country) return false;
      if (verifiedOnly && !church.verified) return false;
      if (!needle) return true;
      return [church.name, church.denomination, church.country, church.city, church.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [country, payload.churches, query, verifiedOnly]);

  const verifiedCount = (payload.churches || []).filter((church) => church.verified).length;
  const pendingConnections = (payload.connections || []).filter((item) => item.status === 'PENDING').length;
  const selectedMode = collaborationModes.find((item) => item.id === mode) || collaborationModes[0];

  const saveBrief = () => {
    try {
      window.localStorage.setItem(
        'digital-church-network-collaboration-brief',
        JSON.stringify({ mode, brief, savedAt: new Date().toISOString() }),
      );
    } catch {
      // Private browser persistence is optional.
    }
  };

  return (
    <section className="border-y border-cream-200 bg-white/70 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-sage-200 bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
              <Sparkles className="mr-2 h-4 w-4" /> Live network intelligence
            </div>
            <h2 className="mt-3 text-3xl font-light text-stone-900 sm:text-4xl">Discover real churches, understand context, and prepare accountable collaboration.</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">This workspace reads the existing church-network API. Verification badges reflect stored verification state only; the interface does not invent affiliation, trust, attendance, doctrine, or partnership status.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm disabled:opacity-60">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh directory
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-4"><Building2 className="h-5 w-5 text-sage-600" /><p className="mt-3 text-2xl font-semibold text-stone-900">{payload.churches?.length || 0}</p><p className="text-xs text-stone-500">Public church profiles</p></div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4"><ShieldCheck className="h-5 w-5 text-sage-600" /><p className="mt-3 text-2xl font-semibold text-stone-900">{verifiedCount}</p><p className="text-xs text-stone-500">Stored as verified</p></div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4"><Globe2 className="h-5 w-5 text-sage-600" /><p className="mt-3 text-2xl font-semibold text-stone-900">{countries.length}</p><p className="text-xs text-stone-500">Countries represented</p></div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4"><Handshake className="h-5 w-5 text-sage-600" /><p className="mt-3 text-2xl font-semibold text-stone-900">{pendingConnections}</p><p className="text-xs text-stone-500">Your pending requests</p></div>
        </div>

        <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><Search className="h-5 w-5 text-sage-600" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Directory</p><h3 className="text-2xl font-light text-stone-900">Church discovery</h3></div></div>
            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search church, city, country, tradition, ministry focus…" className="min-h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
              <select value={country} onChange={(event) => setCountry(event.target.value)} className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-700"><option value="all">All countries</option>{countries.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <label className="flex min-h-12 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-700"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} /> Verified only</label>
            </div>

            {error && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>}

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-stone-100" />) : visibleChurches.length === 0 ? (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center"><Globe2 className="mx-auto h-7 w-7 text-stone-400" /><p className="mt-3 font-semibold text-stone-700">No church profiles match this view.</p><p className="mt-1 text-sm text-stone-500">Change the search or country filter. The app will not fabricate directory entries.</p></div>
              ) : visibleChurches.slice(0, 12).map((church) => (
                <article key={church.id} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><h4 className="truncate font-semibold text-stone-900">{church.name}</h4><p className="mt-1 text-xs text-stone-500">{church.denomination || 'Tradition not publicly specified'}</p></div>
                    {church.verified && <span className="inline-flex shrink-0 items-center rounded-full bg-sage-100 px-2 py-1 text-[10px] font-bold uppercase text-sage-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</span>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-600">
                    {(church.city || church.country) && <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1"><MapPin className="mr-1 h-3 w-3" />{[church.city, church.country].filter(Boolean).join(', ')}</span>}
                    <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1"><Users className="mr-1 h-3 w-3" /> Public profile</span>
                  </div>
                  {church.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">{church.description}</p>}
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-sage-200 bg-sage-50 p-5 shadow-sm sm:p-7">
            <Languages className="h-6 w-6 text-sage-700" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Collaboration brief</p>
            <h3 className="mt-2 text-2xl font-light text-stone-900">Prepare before you invite.</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Draft purpose and context privately first. Sending a real network request remains an authenticated, owner-scoped action through the existing backend.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {collaborationModes.map((item) => <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold ${mode === item.id ? 'border-sage-400 bg-white text-sage-800' : 'border-sage-100 bg-sage-50 text-stone-600'}`}>{item.label}</button>)}
            </div>
            <div className="mt-4 rounded-xl bg-white p-3 text-xs leading-5 text-stone-600"><strong className="block text-stone-800">{selectedMode.label}</strong>{selectedMode.note}</div>
            <textarea value={brief} onChange={(event) => setBrief(event.target.value)} rows={7} maxLength={2000} placeholder="Purpose, desired outcomes, dates, languages, safeguarding considerations, resource needs, responsible contacts…" className="mt-4 w-full rounded-2xl border border-sage-200 bg-white p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-sage-200" />
            <button type="button" onClick={saveBrief} className="mt-3 min-h-11 w-full rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white">Save private brief</button>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <Link href="/conferences" className="rounded-xl border border-sage-200 bg-white px-4 py-3 text-center text-sm font-semibold text-sage-800">Plan a joint event</Link>
              <Link href="/prayer-room" className="rounded-xl border border-sage-200 bg-white px-4 py-3 text-center text-sm font-semibold text-sage-800">Coordinate prayer</Link>
            </div>
            <p className="mt-4 text-[11px] leading-5 text-stone-500">AI or matching logic may suggest relevant profiles later, but it must never declare theological compatibility, safeguarding fitness, legitimacy, or endorsement without human verification.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
