'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Plus, Radio, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import {
  getActiveChurchId,
  subscribeToChurchWorkspace,
} from '@/lib/church-ops/client-record';

type WorkspaceRole = 'OWNER' | 'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER';
type ConferenceStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';
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
  attendeeCount?: number;
};

type FormState = {
  title: string;
  theme: string;
  scriptureRefs: string;
  startDate: string;
  endDate: string;
  location: string;
  virtualRoomLink: string;
  maxAttendees: string;
};

const emptyForm: FormState = {
  title: '',
  theme: '',
  scriptureRefs: '',
  startDate: '',
  endDate: '',
  location: '',
  virtualRoomLink: '',
  maxAttendees: '',
};

export function TenantConferenceManager() {
  const [activeChurchId, setActiveChurchId] = useState('');
  const [role, setRole] = useState<WorkspaceRole | null>(null);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('Select a church workspace to load its published conferences.');

  const canDelete = role === 'OWNER' || role === 'ADMIN';
  const upcoming = useMemo(() => conferences.filter((item) => item.status === 'UPCOMING').length, [conferences]);
  const live = useMemo(() => conferences.filter((item) => item.status === 'LIVE').length, [conferences]);

  const load = async (churchId: string) => {
    setActiveChurchId(churchId);
    setLoading(true);
    setConferences([]);
    setRole(null);

    if (!churchId) {
      setMessage('Select a church workspace before publishing a conference.');
      setLoading(false);
      return;
    }

    try {
      const [workspaceResponse, conferenceResponse] = await Promise.all([
        fetch('/api/church-ops/workspaces', { cache: 'no-store' }),
        fetch(`/api/conferences?churchId=${encodeURIComponent(churchId)}`, { cache: 'no-store' }),
      ]);
      const workspaceData = await workspaceResponse.json();
      const conferenceData = await conferenceResponse.json();

      if (workspaceResponse.ok) {
        const workspace = Array.isArray(workspaceData?.workspaces)
          ? workspaceData.workspaces.find((item: any) => item.id === churchId)
          : null;
        setRole(workspace?.role || null);
      }

      if (!conferenceResponse.ok) {
        setMessage(conferenceData?.migrationRequired
          ? 'Conference publishing is waiting for the tenant database migration.'
          : conferenceData?.error || 'Conference publishing is unavailable.');
        return;
      }

      setConferences(Array.isArray(conferenceData) ? conferenceData : []);
      setMessage('Published conferences are scoped to the active church workspace.');
    } catch {
      setMessage('Conference publishing is unavailable right now. No fake event data is being shown.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(getActiveChurchId());
    return subscribeToChurchWorkspace((churchId) => void load(churchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createConference = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeChurchId || saving) return;

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
      setMessage('Choose a valid start and an end time after the start.');
      return;
    }

    setSaving(true);
    setMessage('Publishing conference to the active church…');
    try {
      const response = await fetch('/api/conferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId: activeChurchId,
          title: form.title,
          theme: form.theme,
          scriptureRefs: form.scriptureRefs.split(',').map((item) => item.trim()).filter(Boolean),
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          location: form.location || undefined,
          virtualRoomLink: form.virtualRoomLink || undefined,
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.migrationRequired
          ? 'Conference publishing is waiting for the tenant database migration.'
          : data?.error || 'Conference could not be published.');
        return;
      }
      setForm(emptyForm);
      await load(activeChurchId);
      setMessage('Conference published to this church workspace.');
    } catch {
      setMessage('Conference could not be published.');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (conference: Conference, status: ConferenceStatus) => {
    if (!activeChurchId) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/conferences?id=${encodeURIComponent(conference.id)}&churchId=${encodeURIComponent(activeChurchId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Conference status could not be updated.');
        return;
      }
      await load(activeChurchId);
      setMessage(`Conference marked ${status.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const removeConference = async (conference: Conference) => {
    if (!activeChurchId || !canDelete) return;
    if (!window.confirm(`Delete “${conference.title}”? Registration-linked records will follow the database cascade.`)) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/conferences?id=${encodeURIComponent(conference.id)}&churchId=${encodeURIComponent(activeChurchId)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Conference could not be deleted.');
        return;
      }
      await load(activeChurchId);
      setMessage('Conference deleted from this church workspace.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-700"><CalendarDays className="mr-2 h-4 w-4" /> Published conference calendar</div>
              <h1 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Publish real church conferences without turning event administration into a global cross-church database.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">The Conference record is now rooted in the active church. Historical pre-tenant conferences remain quarantined rather than being silently assigned to a church.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5 text-violet-700" /> {loading ? 'Loading church conferences…' : message}</div>
            </div>
            <div className="grid min-w-[210px] grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-stone-950 p-3 text-white"><p className="text-2xl font-light">{conferences.length}</p><p className="text-[9px] uppercase tracking-wider text-stone-400">Total</p></div>
              <div className="rounded-2xl bg-violet-50 p-3"><p className="text-2xl font-light text-violet-800">{upcoming}</p><p className="text-[9px] uppercase tracking-wider text-violet-700">Upcoming</p></div>
              <div className="rounded-2xl bg-rose-50 p-3"><p className="text-2xl font-light text-rose-800">{live}</p><p className="text-[9px] uppercase tracking-wider text-rose-700">Live</p></div>
            </div>
          </div>

          <form onSubmit={createConference} className="mt-7 rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Conference title</span><input required minLength={3} value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Capacity</span><input type="number" min="1" value={form.maxAttendees} onChange={(e) => setForm((current) => ({ ...current, maxAttendees: e.target.value }))} placeholder="Optional" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label className="md:col-span-2 xl:col-span-3"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Theme / purpose</span><textarea required minLength={3} value={form.theme} onChange={(e) => setForm((current) => ({ ...current, theme: e.target.value }))} className="min-h-[80px] w-full rounded-xl border border-stone-200 bg-white p-3 text-sm" /></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Starts</span><input required type="datetime-local" value={form.startDate} onChange={(e) => setForm((current) => ({ ...current, startDate: e.target.value }))} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Ends</span><input required type="datetime-local" value={form.endDate} onChange={(e) => setForm((current) => ({ ...current, endDate: e.target.value }))} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Location</span><input value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} placeholder="Venue / city / online" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Scripture references</span><input value={form.scriptureRefs} onChange={(e) => setForm((current) => ({ ...current, scriptureRefs: e.target.value }))} placeholder="Acts 2:42, Hebrews 10:24–25" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
              <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">Virtual room URL</span><input type="url" value={form.virtualRoomLink} onChange={(e) => setForm((current) => ({ ...current, virtualRoomLink: e.target.value }))} placeholder="Optional provider URL" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
            </div>
            <button type="submit" disabled={!activeChurchId || saving} className="mt-4 inline-flex items-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus className="mr-2 h-4 w-4" /> {saving ? 'Saving…' : 'Publish conference'}</button>
          </form>

          <div className="mt-6 space-y-3">
            {conferences.map((conference) => (
              <article key={conference.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold text-stone-900">{conference.title}</h3><span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600">{conference.status}</span></div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{conference.theme}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-500"><span>{new Date(conference.startDate).toLocaleString()}</span><span>→ {new Date(conference.endDate).toLocaleString()}</span>{conference.location && <span>{conference.location}</span>}<span>{conference.attendeeCount || 0} registered</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conference.status !== 'UPCOMING' && <button type="button" disabled={saving} onClick={() => void setStatus(conference, 'UPCOMING')} className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600">Upcoming</button>}
                    {conference.status !== 'LIVE' && <button type="button" disabled={saving} onClick={() => void setStatus(conference, 'LIVE')} className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"><Radio className="mr-1 inline h-3.5 w-3.5" /> Live</button>}
                    {conference.status !== 'COMPLETED' && <button type="button" disabled={saving} onClick={() => void setStatus(conference, 'COMPLETED')} className="rounded-xl border border-sage-100 bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-700"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Complete</button>}
                    {canDelete && <button type="button" disabled={saving} onClick={() => void removeConference(conference)} className="rounded-xl border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-600"><Trash2 className="mr-1 inline h-3.5 w-3.5" /> Delete</button>}
                  </div>
                </div>
              </article>
            ))}
            {!loading && activeChurchId && !conferences.length && <div className="rounded-3xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">No tenant-scoped conferences are published for this church yet.</div>}
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <ShieldCheck className="h-8 w-8 text-violet-300" />
          <h2 className="mt-5 text-3xl font-light">Published record ≠ full event readiness.</h2>
          <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="mb-2 h-5 w-5 text-violet-300" /><strong className="text-white">Tenant-owned calendar.</strong> A new conference belongs to the active church. Switching workspaces switches the published conference set.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="mb-2 h-5 w-5 text-violet-300" /><strong className="text-white">Registration is bounded.</strong> Registration capacity is enforced transactionally. Sensitive registration/sponsorship records are not exposed by a global admin sweep.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-2 h-5 w-5 text-violet-300" /><strong className="text-white">Rights stay separated.</strong> Publishing an event does not claim payment processing, ticket delivery, livestream control, licensing clearance, medical readiness, or safeguarding certification.</p>
          </div>
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">Historical conferences without a church tenant stay unassigned on purpose. They require legacy product-admin handling until a human explicitly decides which church, if any, owns them.</div>
        </aside>
      </div>
    </section>
  );
}
