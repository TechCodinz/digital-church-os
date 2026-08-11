'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ClipboardCheck,
  Eye,
  HandHeart,
  ShieldCheck,
  TicketCheck,
  Undo2,
  UserCheck,
  X,
} from 'lucide-react';
import { getActiveChurchId, subscribeToChurchWorkspace } from '@/lib/church-ops/client-record';

type Conference = {
  id: string;
  title: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  startDate: string;
};

type Registration = {
  id: string;
  conference_id: string;
  ticket_id: string | null;
  user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  checked_in_at: string | null;
  created_at: string;
};

type Sponsorship = {
  id: string;
  conference_id: string;
  user_id: string;
  request_type: string;
  amount_requested: string | number;
  currency: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  name?: string | null;
  email?: string | null;
};

export function ConferenceRegistrationDesk() {
  const [activeChurchId, setActiveChurchId] = useState('');
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [message, setMessage] = useState('Select a church workspace and conference to open the registration desk.');

  const selectedConference = useMemo(
    () => conferences.find((conference) => conference.id === selectedConferenceId) || null,
    [conferences, selectedConferenceId],
  );
  const checkedIn = useMemo(() => registrations.filter((item) => Boolean(item.checked_in_at)).length, [registrations]);
  const pendingSupport = useMemo(() => sponsorships.filter((item) => item.status === 'PENDING').length, [sponsorships]);

  const loadDesk = async (conferenceId: string) => {
    setSelectedConferenceId(conferenceId);
    setRegistrations([]);
    setSponsorships([]);
    if (!conferenceId) {
      setMessage('Publish or select a tenant conference to open its registration desk.');
      return;
    }

    setLoading(true);
    setMessage('Loading this conference’s sensitive operations…');
    try {
      const response = await fetch(`/api/conferences/sponsorship?conferenceId=${encodeURIComponent(conferenceId)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Registration desk is unavailable.');
        return;
      }
      if (data?.scope !== 'tenant-manager') {
        setMessage('This account does not have tenant management access for the selected conference.');
        return;
      }
      setRegistrations(Array.isArray(data?.registrations) ? data.registrations : []);
      setSponsorships(Array.isArray(data?.sponsorships) ? data.sponsorships : []);
      setMessage('Sensitive records are limited to this explicitly selected conference.');
    } catch {
      setMessage('Registration desk is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const loadChurch = async (churchId: string) => {
    setActiveChurchId(churchId);
    setConferences([]);
    setSelectedConferenceId('');
    setRegistrations([]);
    setSponsorships([]);

    if (!churchId) {
      setLoading(false);
      setMessage('Select a church workspace before opening conference registrations.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/conferences?churchId=${encodeURIComponent(churchId)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.migrationRequired
          ? 'Conference operations are waiting for the tenant database migration.'
          : data?.error || 'Conference list is unavailable.');
        return;
      }

      const next = Array.isArray(data) ? data : [];
      setConferences(next);
      const firstId = next[0]?.id || '';
      if (firstId) {
        await loadDesk(firstId);
      } else {
        setMessage('No tenant conference exists in this church workspace yet.');
      }
    } catch {
      setMessage('Conference operations are unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadChurch(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void loadChurch(churchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkIn = async (registration: Registration, checked: boolean) => {
    if (!selectedConferenceId || workingId) return;
    setWorkingId(registration.id);
    try {
      const response = await fetch('/api/conferences/sponsorship', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-in-registration',
          conferenceId: selectedConferenceId,
          registrationId: registration.id,
          checkedIn: checked,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Check-in could not be updated.');
        return;
      }
      setRegistrations((current) => current.map((item) => item.id === registration.id ? data.registration : item));
      setMessage(checked ? 'Registration checked in.' : 'Check-in removed.');
    } finally {
      setWorkingId('');
    }
  };

  const reviewSupport = async (request: Sponsorship, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    if (!selectedConferenceId || workingId) return;
    setWorkingId(request.id);
    try {
      const response = await fetch('/api/conferences/sponsorship', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review-sponsorship',
          conferenceId: selectedConferenceId,
          requestId: request.id,
          status,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Support-request review could not be updated.');
        return;
      }
      setSponsorships((current) => current.map((item) => item.id === request.id ? { ...item, ...data.request } : item));
      setMessage(`Support request marked ${status.toLowerCase()}. This status does not claim money was disbursed.`);
    } finally {
      setWorkingId('');
    }
  };

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700"><ClipboardCheck className="mr-2 h-4 w-4" /> Conference registration desk</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Run check-in and support-request review for one church conference at a time.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">This desk intentionally does not provide a cross-church attendee search or bulk export. Registration contacts and sponsorship reasons remain sensitive operational data and are fetched only after an explicit managed conference is selected.</p>
              <div className="mt-3 inline-flex items-start gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" /> {loading ? 'Loading…' : message}</div>
            </div>
            <div className="grid min-w-[225px] grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-stone-950 p-3 text-white"><p className="text-2xl font-light">{registrations.length}</p><p className="text-[9px] uppercase tracking-wider text-stone-400">Registered</p></div>
              <div className="rounded-2xl bg-cyan-50 p-3"><p className="text-2xl font-light text-cyan-800">{checkedIn}</p><p className="text-[9px] uppercase tracking-wider text-cyan-700">Checked in</p></div>
              <div className="rounded-2xl bg-amber-50 p-3"><p className="text-2xl font-light text-amber-800">{pendingSupport}</p><p className="text-[9px] uppercase tracking-wider text-amber-700">Support</p></div>
            </div>
          </div>

          <label className="mt-7 block max-w-xl"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Explicit conference</span><select value={selectedConferenceId} disabled={!activeChurchId || !conferences.length || loading} onChange={(e) => void loadDesk(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm disabled:opacity-60"><option value="">Select conference</option>{conferences.map((conference) => <option key={conference.id} value={conference.id}>{conference.title} · {conference.status}</option>)}</select></label>

          <div className="mt-8">
            <div className="flex items-center gap-2"><TicketCheck className="h-5 w-5 text-cyan-700" /><h3 className="text-lg font-semibold text-stone-900">Registrations</h3></div>
            <div className="mt-3 space-y-3">
              {registrations.map((registration) => (
                <article key={registration.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0"><p className="font-semibold text-stone-900">{registration.name || 'Conference guest'}</p><p className="mt-1 break-all text-xs text-stone-500">{registration.email || 'No email recorded'}{registration.phone ? ` · ${registration.phone}` : ''}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-stone-400">{registration.status} · registered {new Date(registration.created_at).toLocaleString()}</p></div>
                    <button type="button" disabled={workingId === registration.id || registration.status === 'CANCELLED'} onClick={() => void checkIn(registration, !registration.checked_in_at)} className={`inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold disabled:opacity-50 ${registration.checked_in_at ? 'border border-cyan-200 bg-white text-cyan-700' : 'bg-cyan-700 text-white'}`}>{registration.checked_in_at ? <><Undo2 className="mr-1.5 h-4 w-4" /> Undo check-in</> : <><UserCheck className="mr-1.5 h-4 w-4" /> Check in</>}</button>
                  </div>
                </article>
              ))}
              {!loading && selectedConferenceId && !registrations.length && <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">No registrations recorded for this conference.</div>}
            </div>
          </div>

          <div className="mt-9">
            <div className="flex items-center gap-2"><HandHeart className="h-5 w-5 text-amber-700" /><h3 className="text-lg font-semibold text-stone-900">Support requests</h3></div>
            <div className="mt-3 space-y-3">
              {sponsorships.map((request) => (
                <article key={request.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-stone-900">{request.name || 'Church member'}</p><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600">{request.status}</span></div><p className="mt-1 break-all text-xs text-stone-500">{request.email || 'Contact held in member account'}</p><p className="mt-2 text-sm font-semibold text-amber-800">{request.request_type.replaceAll('_', ' ')} · {Number(request.amount_requested || 0).toLocaleString()} {request.currency}</p><details className="mt-3 rounded-xl border border-amber-100 bg-white p-3"><summary className="cursor-pointer list-none text-xs font-semibold text-amber-800"><Eye className="mr-1.5 inline h-4 w-4" /> Reveal member-provided reason</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">{request.reason}</p></details>{request.reviewed_at && <p className="mt-2 text-[10px] uppercase tracking-wider text-stone-400">Reviewed {new Date(request.reviewed_at).toLocaleString()}</p>}</div>
                    <div className="flex shrink-0 flex-wrap gap-2"><button type="button" disabled={workingId === request.id || request.status === 'APPROVED'} onClick={() => void reviewSupport(request, 'APPROVED')} className="inline-flex items-center rounded-xl bg-sage-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Check className="mr-1 h-3.5 w-3.5" /> Approve</button><button type="button" disabled={workingId === request.id || request.status === 'REJECTED'} onClick={() => void reviewSupport(request, 'REJECTED')} className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-40"><X className="mr-1 h-3.5 w-3.5" /> Reject</button><button type="button" disabled={workingId === request.id || request.status === 'PENDING'} onClick={() => void reviewSupport(request, 'PENDING')} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 disabled:opacity-40"><Undo2 className="mr-1 h-3.5 w-3.5" /> Reset</button></div>
                  </div>
                </article>
              ))}
              {!loading && selectedConferenceId && !sponsorships.length && <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">No support requests recorded for this conference.</div>}
            </div>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <ShieldCheck className="h-8 w-8 text-cyan-300" />
          <h3 className="mt-5 text-3xl font-light">Sensitive operations without a global people database.</h3>
          <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><UserCheck className="mb-2 h-5 w-5 text-cyan-300" /><strong className="text-white">Check-in is factual.</strong> It writes or clears the registration’s real `checked_in_at` timestamp; it is not an attendance-faithfulness score.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><HandHeart className="mb-2 h-5 w-5 text-amber-300" /><strong className="text-white">Approval is not payment.</strong> Approving a support request records human review only. It does not claim funds were transferred, tickets purchased, transport booked, or aid fulfilled.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-2 h-5 w-5 text-cyan-300" /><strong className="text-white">Purpose limitation.</strong> Do not copy sponsorship reasons, contacts, or registration data into the generic operations scratchpad, public reports, or unrelated ministry dashboards.</p>
          </div>
          {selectedConference && <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-xs leading-5 text-cyan-100">Current scope: <strong>{selectedConference.title}</strong>. Switching the church workspace or conference reloads the desk instead of combining records.</div>}
        </aside>
      </div>
    </section>
  );
}
