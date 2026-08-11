'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  ShieldCheck,
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
            workspaceData.workspaces.forEach((church: ChurchCalendar) => {
              combined.set(church.id, { ...combined.get(church.id), ...church });
            });
          }
        }

        const next = Array.from(combined.values()).sort((a, b) => a.name.localeCompare(b.name));
        setChurches(next);

        const remembered = window.localStorage.getItem(selectedCalendarKey) || '';
        const nextChurchId = next.some((church) => church.id === remembered) ? remembered : next[0]?.id || '';
        setSelectedChurchId(nextChurchId);
        setMessage(nextChurchId
          ? 'Showing one church calendar at a time so tenant event data never gets mixed silently.'
          : publicData?.migrationRequired
            ? 'Conference calendars are waiting for the tenant database migration.'
            : 'No church conference calendars are available yet.');
      } catch {
        setChurches([]);
        setSelectedChurchId('');
        setMessage('Conference calendar discovery is unavailable. No demo events are being substituted.');
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
    if (!session?.user?.id) return;
    if (conference.isRegistered || registeringId) return;

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

  return (
    <main className="min-h-screen bg-cream-50 pb-16 pt-24">
      <section className="px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-semibold text-sage-700"><Calendar className="mr-2 h-4 w-4" /> Church conference calendars</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight text-stone-900 md:text-6xl">Join a real gathering from the church that actually owns and hosts it.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600">Conference calendars are tenant-scoped. Public churches can publish gatherings for visitors; signed-in church members can also access calendars attached to their own workspaces.</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Church calendar</label>
              <select
                value={selectedChurchId}
                disabled={loadingChurches || !churches.length}
                onChange={(e) => setSelectedChurchId(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-sage-200 disabled:opacity-60"
              >
                {!churches.length && <option value="">No calendars available</option>}
                {churches.map((church) => <option key={church.id} value={church.id}>{church.name}{church.city ? ` · ${church.city}` : ''}{church.country ? `, ${church.country}` : ''}</option>)}
              </select>
              <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-stone-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> {message}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Selected church</p>
              <h2 className="mt-2 text-2xl font-light text-stone-900">{selectedChurch?.name || 'Conference calendar'}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['UPCOMING', 'LIVE', 'COMPLETED'] as ConferenceStatus[]).map((status) => (
                <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${filter === status ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-600'}`}>{status}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-stone-500">Loading this church calendar…</div>
          ) : !selectedChurchId ? (
            <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">Choose a church calendar to see its conferences.</div>
          ) : !conferences.length ? (
            <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center"><Calendar className="mx-auto h-10 w-10 text-stone-300" /><p className="mt-4 font-semibold text-stone-700">No {filter.toLowerCase()} conferences for this church.</p><p className="mt-2 text-sm text-stone-500">Nothing is fabricated when the church has not published a gathering.</p></div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {conferences.map((conference) => (
                <article key={conference.id} className="flex flex-col rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3"><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${conference.status === 'LIVE' ? 'bg-rose-100 text-rose-700' : conference.status === 'UPCOMING' ? 'bg-sage-100 text-sage-700' : 'bg-stone-100 text-stone-600'}`}>{conference.status}</span>{conference.isRegistered && <span className="inline-flex items-center text-xs font-semibold text-sage-700"><CheckCircle2 className="mr-1 h-4 w-4" /> Registered</span>}</div>
                  <h3 className="mt-5 text-2xl font-light text-stone-900">{conference.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{conference.theme}</p>
                  {conference.scriptureRefs?.length > 0 && <p className="mt-3 text-xs font-semibold text-sage-700">{conference.scriptureRefs.join(' · ')}</p>}

                  <div className="mt-6 space-y-3 text-sm text-stone-500">
                    <p className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> {new Date(conference.startDate).toLocaleDateString()}</p>
                    <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /> {new Date(conference.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(conference.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="flex items-center">{conference.virtualRoomLink ? <Video className="mr-2 h-4 w-4" /> : <MapPin className="mr-2 h-4 w-4" />}{conference.location || (conference.virtualRoomLink ? 'Online gathering' : 'Location to be confirmed')}</p>
                    <p className="flex items-center"><Users className="mr-2 h-4 w-4" /> {conference.attendeeCount || 0} registered{conference.maxAttendees ? ` · capacity ${conference.maxAttendees}` : ''}</p>
                  </div>

                  <div className="mt-auto pt-6">
                    {conference.status === 'LIVE' && conference.virtualRoomLink ? (
                      <a href={conference.virtualRoomLink} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">Join provider room <ExternalLink className="ml-2 h-4 w-4" /></a>
                    ) : conference.status === 'COMPLETED' && conference.replayUrl ? (
                      <a href={conference.replayUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">Open replay <ExternalLink className="ml-2 h-4 w-4" /></a>
                    ) : conference.status === 'UPCOMING' && conference.isRegistered ? (
                      <div className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-center text-sm font-semibold text-sage-700">Registration recorded</div>
                    ) : conference.status === 'UPCOMING' && session?.user?.id ? (
                      <button type="button" disabled={registeringId === conference.id} onClick={() => void register(conference)} className="w-full rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{registeringId === conference.id ? 'Registering…' : 'Register'}</button>
                    ) : conference.status === 'UPCOMING' ? (
                      <Link href="/auth/signin?callbackUrl=/conferences" className="block w-full rounded-xl bg-stone-900 px-4 py-3 text-center text-sm font-semibold text-white">Sign in to register</Link>
                    ) : (
                      <div className="rounded-xl bg-stone-50 px-4 py-3 text-center text-sm text-stone-500">Conference completed</div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
