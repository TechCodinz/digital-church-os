'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';

type ConferenceStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';
type ChurchCalendar = {
  id: string;
  name: string;
  slug?: string;
  city?: string | null;
  country?: string | null;
  role?: string | null;
};
type Conference = {
  id: string;
  title: string;
  theme: string;
  scriptureRefs: string[];
  startDate: string;
  endDate: string;
  location: string | null;
  virtualRoomLink: string | null;
  replayUrl: string | null;
  status: ConferenceStatus;
  maxAttendees: number | null;
  attendeeCount: number;
  isRegistered: boolean;
};

const selectedCalendarKey = 'digital-church-conference-calendar:v1';

export default function ConferencesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [churches, setChurches] = useState<ChurchCalendar[]>([]);
  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [filter, setFilter] = useState<ConferenceStatus>('UPCOMING');
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [loading, setLoading] = useState(false);
  const [registeringId, setRegisteringId] = useState('');
  const [message, setMessage] = useState('Choose a church calendar to see its gatherings.');

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    const loadChurches = async () => {
      setLoadingChurches(true);
      try {
        const publicResponse = await fetch('/api/conferences/churches', { cache: 'no-store' });
        const publicData = await publicResponse.json();
        const combined = new Map<string, ChurchCalendar>();

        if (publicResponse.ok && Array.isArray(publicData?.churches)) {
          publicData.churches.forEach((church: ChurchCalendar) => combined.set(church.id, church));
        }

        if (session?.user?.id) {
          const workspaceResponse = await fetch('/api/church-ops/workspaces', { cache: 'no-store' });
          const workspaceData = await workspaceResponse.json();
          if (workspaceResponse.ok && Array.isArray(workspaceData?.workspaces)) {
            workspaceData.workspaces.forEach((church: ChurchCalendar) => combined.set(church.id, { ...combined.get(church.id), ...church }));
          }
        }

        const next = Array.from(combined.values()).sort((a, b) => a.name.localeCompare(b.name));
        setChurches(next);

        const remembered = window.localStorage.getItem(selectedCalendarKey) || '';
        const nextChurchId = next.some((church) => church.id === remembered) ? remembered : next[0]?.id || '';
        setSelectedChurchId(nextChurchId);
        setMessage(nextChurchId
          ? 'One church calendar is shown at a time so congregation event data is never silently blended.'
          : publicData?.migrationRequired
            ? 'Conference calendars are waiting for the tenant database migration.'
            : 'No church conference calendars are available yet.');
      } catch {
        setChurches([]);
        setSelectedChurchId('');
        setMessage('Conference calendar discovery is unavailable. No demo gatherings are being substituted.');
      } finally {
        setLoadingChurches(false);
      }
    };

    void loadChurches();
  }, [session?.user?.id, sessionStatus]);

  useEffect(() => {
    if (!selectedChurchId) {
      setConferences([]);
      return;
    }

    window.localStorage.setItem(selectedCalendarKey, selectedChurchId);

    const loadConferences = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ churchId: selectedChurchId, status: filter });
        const response = await fetch(`/api/conferences?${params.toString()}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) {
          setConferences([]);
          setMessage(data?.migrationRequired
            ? 'Conference calendars are waiting for the tenant database migration.'
            : data?.error || 'This conference calendar is unavailable.');
          return;
        }
        setConferences(Array.isArray(data) ? data : []);
        setMessage('Conference data is scoped to the selected church.');
      } catch {
        setConferences([]);
        setMessage('Conference data is unavailable. No placeholder gatherings are being shown.');
      } finally {
        setLoading(false);
      }
    };

    void loadConferences();
  }, [selectedChurchId, filter]);

  const selectedChurch = useMemo(
    () => churches.find((church) => church.id === selectedChurchId) || null,
    [churches, selectedChurchId],
  );

  const register = async (conference: Conference) => {
    if (!session?.user?.id || conference.isRegistered || registeringId) return;

    setRegisteringId(conference.id);
    setMessage(`Registering for ${conference.title}…`);
    try {
      const response = await fetch('/api/conferences/sponsorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', conferenceId: conference.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Registration could not be completed.');
        return;
      }

      setConferences((current) => current.map((item) => item.id === conference.id
        ? { ...item, isRegistered: true, attendeeCount: (item.attendeeCount || 0) + 1 }
        : item));
      setMessage(`Registration recorded for ${conference.title}.`);
    } catch {
      setMessage('Registration could not be completed.');
    } finally {
      setRegisteringId('');
    }
  };

  const liveCount = conferences.filter((conference) => conference.status === 'LIVE').length;

  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-20 pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl"><Calendar className="mr-2 h-4 w-4" /> Tenant-scoped gatherings</div>
            <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">Enter a gathering knowing exactly which church called it together.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Each calendar belongs to one church workspace. Dates, capacity, registration, virtual rooms, replay links, and Scripture anchors come from that church’s records—not from a synthetic global events feed.</p>
          </div>

          <div className="sacred-panel-dark relative z-10 p-6">
            <p className="sanctuary-section-label text-emerald-200/60">Choose a church calendar</p>
            <select
              value={selectedChurchId}
              disabled={loadingChurches || !churches.length}
              onChange={(event) => setSelectedChurchId(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-amber-200/35 disabled:opacity-60"
            >
              {!churches.length && <option className="text-stone-900" value="">No calendars available</option>}
              {churches.map((church) => <option className="text-stone-900" key={church.id} value={church.id}>{church.name}{church.city ? ` · ${church.city}` : ''}{church.country ? `, ${church.country}` : ''}</option>)}
            </select>
            <div className="mt-4 flex items-start gap-2 text-xs leading-6 text-white/45"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> {message}</div>
            {selectedChurch?.role && <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-amber-100/55">Your workspace role · {selectedChurch.role}</p>}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-stone-200 bg-white p-5"><ShieldCheck className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-sm font-semibold text-stone-800">One church at a time</p><p className="mt-1 text-xs leading-5 text-stone-500">Tenant data is never silently combined across congregations.</p></div>
            <div className="rounded-3xl border border-stone-200 bg-white p-5"><Radio className="h-5 w-5 text-rose-500" /><p className="mt-3 text-sm font-semibold text-stone-800">{filter === 'LIVE' ? liveCount : conferences.length} in this view</p><p className="mt-1 text-xs leading-5 text-stone-500">Counts are drawn from the selected calendar and current filter.</p></div>
            <div className="rounded-3xl border border-stone-200 bg-white p-5"><ExternalLink className="h-5 w-5 text-amber-600" /><p className="mt-3 text-sm font-semibold text-stone-800">Safe external links</p><p className="mt-1 text-xs leading-5 text-stone-500">Join and replay links are limited to public HTTP(S) destinations without embedded credentials.</p></div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="sanctuary-section-label text-emerald-700">Selected church</p>
              <h2 className="mt-2 text-3xl font-light text-stone-900">{selectedChurch?.name || 'Conference calendar'}</h2>
              {(selectedChurch?.city || selectedChurch?.country) && <p className="mt-2 text-sm text-stone-500">{[selectedChurch.city, selectedChurch.country].filter(Boolean).join(', ')}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['UPCOMING', 'LIVE', 'COMPLETED'] as ConferenceStatus[]).map((status) => (
                <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${filter === status ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-600 hover:border-emerald-200'}`}>{status}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /><p className="mt-4 text-sm text-stone-500">Loading this church calendar…</p></div>
          ) : !selectedChurchId ? (
            <div className="mt-8 rounded-[2rem] border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">Choose a church calendar to see its gatherings.</div>
          ) : !conferences.length ? (
            <div className="mt-8 rounded-[2rem] border border-dashed border-stone-300 bg-white p-12 text-center"><Calendar className="mx-auto h-10 w-10 text-stone-300" /><p className="mt-4 font-semibold text-stone-700">No {filter.toLowerCase()} conferences for this church.</p><p className="mt-2 text-sm text-stone-500">Nothing is fabricated when the church has not published a gathering.</p></div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {conferences.map((conference) => {
                const full = Boolean(conference.maxAttendees && conference.attendeeCount >= conference.maxAttendees);
                return (
                  <article key={conference.id} className="group flex flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative overflow-hidden bg-[#081713] p-6 text-white">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(245,201,120,.12),transparent_30%)]" />
                      <div className="relative">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${conference.status === 'LIVE' ? 'bg-rose-400/15 text-rose-200' : conference.status === 'UPCOMING' ? 'bg-emerald-300/10 text-emerald-200' : 'bg-white/8 text-white/55'}`}>{conference.status}</span>
                          {conference.isRegistered && <span className="inline-flex items-center text-xs font-semibold text-emerald-200"><CheckCircle2 className="mr-1 h-4 w-4" /> Registered</span>}
                        </div>
                        <h3 className="mt-5 text-2xl font-light leading-tight text-white">{conference.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-white/55">{conference.theme}</p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      {conference.scriptureRefs?.length > 0 && (
                        <div className="mb-5 flex flex-wrap gap-2">
                          {conference.scriptureRefs.slice(0, 4).map((reference) => <Link key={reference} href={`/scripture?ref=${encodeURIComponent(reference)}`} className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-800"><BookOpen className="mr-1.5 h-3 w-3" />{reference}</Link>)}
                        </div>
                      )}

                      <div className="space-y-3 text-sm text-stone-500">
                        <p className="flex items-center"><Calendar className="mr-2 h-4 w-4 text-emerald-600" /> {new Date(conference.startDate).toLocaleDateString()}</p>
                        <p className="flex items-center"><Clock className="mr-2 h-4 w-4 text-emerald-600" /> {new Date(conference.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(conference.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="flex items-center">{conference.virtualRoomLink ? <Video className="mr-2 h-4 w-4 text-emerald-600" /> : <MapPin className="mr-2 h-4 w-4 text-emerald-600" />}{conference.location || (conference.virtualRoomLink ? 'Online gathering' : 'Location to be confirmed')}</p>
                        <p className="flex items-center"><Users className="mr-2 h-4 w-4 text-emerald-600" /> {conference.attendeeCount || 0} registered{conference.maxAttendees ? ` · capacity ${conference.maxAttendees}` : ''}</p>
                      </div>

                      <div className="mt-auto pt-6">
                        {conference.status === 'LIVE' && conference.virtualRoomLink ? (
                          <a href={conference.virtualRoomLink} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">Join provider room <ExternalLink className="ml-2 h-4 w-4" /></a>
                        ) : conference.status === 'COMPLETED' && conference.replayUrl ? (
                          <a href={conference.replayUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">Open replay <ExternalLink className="ml-2 h-4 w-4" /></a>
                        ) : conference.status === 'UPCOMING' && conference.isRegistered ? (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">Registration recorded</div>
                        ) : conference.status === 'UPCOMING' && full ? (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800">Registration is currently full</div>
                        ) : conference.status === 'UPCOMING' && session?.user?.id ? (
                          <button type="button" disabled={registeringId === conference.id} onClick={() => void register(conference)} className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">{registeringId === conference.id ? 'Registering…' : 'Register'}</button>
                        ) : conference.status === 'UPCOMING' ? (
                          <Link href="/auth/signin?callbackUrl=/conferences" className="block w-full rounded-2xl bg-stone-900 px-4 py-3 text-center text-sm font-semibold text-white">Sign in to register</Link>
                        ) : (
                          <div className="rounded-2xl bg-stone-50 px-4 py-3 text-center text-sm text-stone-500">Conference completed</div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Link href="/church-network" className="rounded-3xl border border-stone-200 bg-white p-5 text-sm font-semibold text-stone-800 hover:border-emerald-200"><Users className="h-5 w-5 text-emerald-600" /><span className="mt-3 block">Explore church network</span><span className="mt-2 block text-xs font-normal leading-5 text-stone-500">Discover verified public church profiles before collaboration.</span></Link>
            <Link href="/prayer-room" className="rounded-3xl border border-stone-200 bg-white p-5 text-sm font-semibold text-stone-800 hover:border-emerald-200"><Sparkles className="h-5 w-5 text-amber-600" /><span className="mt-3 block">Carry the gathering into prayer</span><span className="mt-2 block text-xs font-normal leading-5 text-stone-500">Move from event participation into prayer without mixing church records.</span></Link>
            <Link href="/journey" className="rounded-3xl border border-stone-200 bg-white p-5 text-sm font-semibold text-stone-800 hover:border-emerald-200"><ArrowRight className="h-5 w-5 text-emerald-600" /><span className="mt-3 block">Continue your journey</span><span className="mt-2 block text-xs font-normal leading-5 text-stone-500">Save only the moments you intentionally want to carry into personal formation.</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
