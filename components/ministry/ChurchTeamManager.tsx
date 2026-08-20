'use client';

import { useEffect, useState } from 'react';
import { Check, ClipboardCheck, Loader2, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import { ACTIVE_CHURCH_STORAGE_KEY } from '@/components/ministry/ChurchWorkspaceSelector';

type TeamRole = 'OWNER' | 'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER';
type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'REMOVED';

type Member = {
  id: string;
  user_id: string;
  role: TeamRole;
  status: MemberStatus;
  name: string | null;
  email: string;
};

type Invitation = {
  id: string;
  email: string;
  role: 'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER';
  status: string;
  expires_at: string;
};

type Church = {
  id: string;
  name: string;
  role: TeamRole;
};

export function ChurchTeamManager() {
  const [church, setChurch] = useState<Church | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER'>('STAFF');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState('');
  const [message, setMessage] = useState('');

  const activeChurchId = () => window.localStorage.getItem(ACTIVE_CHURCH_STORAGE_KEY) || '';

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const churchId = activeChurchId();
      const params = churchId ? `?churchId=${encodeURIComponent(churchId)}` : '';
      const response = await fetch(`/api/church-ops/team${params}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        setChurch(null);
        setMembers([]);
        setInvitations([]);
        setMessage(data?.migrationRequired
          ? 'Church team persistence is waiting for the latest database migration.'
          : data?.error || 'Church team access is unavailable.');
        return;
      }
      setChurch(data.church || null);
      setMembers(Array.isArray(data.members) ? data.members : []);
      setInvitations(Array.isArray(data.invitations) ? data.invitations : []);
    } catch {
      setMessage('Church team access is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const onWorkspace = () => {
      setInviteLink('');
      void load();
    };
    window.addEventListener('digital-church-workspace-change', onWorkspace);
    return () => window.removeEventListener('digital-church-workspace-change', onWorkspace);
    // load is intentionally event driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const invite = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    setMessage('');
    setInviteLink('');
    try {
      const response = await fetch('/api/church-ops/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: activeChurchId() || undefined, email: email.trim(), role }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Invitation could not be created.');
        return;
      }
      setEmail('');
      setInviteLink(data.invitationUrl || '');
      setMessage('Invitation created. Access is not granted until the invited email signs in and accepts it.');
      await load();
    } catch {
      setMessage('Invitation could not be created right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateMember = async (memberId: string, patch: { role?: Exclude<TeamRole, 'OWNER'>; status?: MemberStatus }) => {
    setBusyMemberId(memberId);
    setMessage('');
    try {
      const response = await fetch('/api/church-ops/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: activeChurchId() || undefined, memberId, ...patch }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Team access could not be changed.');
        return;
      }
      setMessage(patch.status === 'REMOVED' ? 'Workspace access removed.' : patch.status === 'SUSPENDED' ? 'Workspace access suspended.' : 'Workspace access updated.');
      await load();
    } catch {
      setMessage('Team access could not be changed right now.');
    } finally {
      setBusyMemberId('');
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setMessage('Invitation link copied. Send it only to the intended person.');
    } catch {
      setMessage('Copy was blocked by the browser. Select and copy the link manually.');
    }
  };

  const revoke = async (invitationId: string) => {
    setSubmitting(true);
    setMessage('');
    try {
      const params = new URLSearchParams({ invitationId });
      const churchId = activeChurchId();
      if (churchId) params.set('churchId', churchId);
      const response = await fetch(`/api/church-ops/team?${params.toString()}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Invitation could not be revoked.');
        return;
      }
      setInviteLink('');
      setMessage('Invitation revoked.');
      await load();
    } catch {
      setMessage('Invitation could not be revoked right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const canEditMember = (member: Member) => {
    if (!church || member.role === 'OWNER') return false;
    if (church.role === 'OWNER') return true;
    return church.role === 'ADMIN' && member.role !== 'ADMIN';
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700"><UsersRound className="mr-2 h-4 w-4" /> Church team & access</div>
              <h1 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-5xl">Invite ministry teammates without turning an email address into automatic access.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Invitations are church-scoped, expire after seven days, store only a token hash, and activate only when the matching signed-in email accepts them.</p>
            </div>
            <div className="min-w-[180px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Active church</p>
              <p className="mt-1 text-lg font-semibold">{church?.name || 'Not resolved'}</p>
              {church && <p className="mt-2 text-xs text-sage-300">Your workspace role: {church.role}</p>}
            </div>
          </div>

          <div className="mt-7 rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="font-semibold text-stone-900">Create invitation</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@example.com" className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              <select value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm">
                {church?.role === 'OWNER' && <option value="ADMIN">Admin</option>}
                <option value="PASTOR">Pastor</option>
                <option value="STAFF">Staff</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button type="button" onClick={() => void invite()} disabled={submitting || !email.trim()} className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Invite</button>
            </div>

            {inviteLink && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">One-time invitation link</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input readOnly value={inviteLink} className="min-w-0 flex-1 rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-xs text-stone-600" />
                  <button type="button" onClick={() => void copyLink()} className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-sm"><ClipboardCheck className="mr-2 h-4 w-4" /> Copy link</button>
                </div>
              </div>
            )}

            {message && <p className="mt-4 text-xs font-medium text-amber-700">{message}</p>}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-stone-900">Active team</h2>
            {loading ? <p className="mt-4 inline-flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading team…</p> : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {members.map((member) => {
                  const editable = canEditMember(member);
                  const busy = busyMemberId === member.id;
                  return (
                    <article key={member.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><p className="truncate font-semibold text-stone-900">{member.name || member.email}</p><p className="mt-1 truncate text-xs text-stone-500">{member.email}</p></div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${member.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-800' : 'bg-white text-stone-600'}`}>{member.status}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {editable ? (
                          <select
                            value={member.role}
                            disabled={busy}
                            onChange={(event) => void updateMember(member.id, { role: event.target.value as Exclude<TeamRole, 'OWNER'> })}
                            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-50"
                          >
                            {church?.role === 'OWNER' && <option value="ADMIN">Admin</option>}
                            <option value="PASTOR">Pastor</option>
                            <option value="STAFF">Staff</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                        ) : (
                          <span className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm">{member.role}</span>
                        )}

                        {editable && member.status === 'ACTIVE' && <button type="button" disabled={busy} onClick={() => void updateMember(member.id, { status: 'SUSPENDED' })} className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs font-semibold text-amber-700 disabled:opacity-50">Suspend</button>}
                        {editable && member.status === 'SUSPENDED' && <button type="button" disabled={busy} onClick={() => void updateMember(member.id, { status: 'ACTIVE' })} className="rounded-xl border border-sage-100 bg-white px-3 py-2 text-xs font-semibold text-sage-700 disabled:opacity-50">Reactivate</button>}
                        {editable && <button type="button" disabled={busy} onClick={() => void updateMember(member.id, { status: 'REMOVED' })} className="inline-flex items-center rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-50">{busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />} Remove</button>}
                      </div>
                    </article>
                  );
                })}
                {!members.length && <p className="text-sm text-stone-500">No active team memberships are available yet.</p>}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-stone-900">Pending & expired invitations</h2>
            <div className="mt-4 space-y-3">
              {invitations.map((invitation) => (
                <article key={invitation.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-medium text-stone-900">{invitation.email}</p><p className="mt-1 text-xs text-stone-500">{invitation.role} · {invitation.status} · expires {new Date(invitation.expires_at).toLocaleString()}</p></div>
                  {invitation.status === 'PENDING' && <button type="button" onClick={() => void revoke(invitation.id)} disabled={submitting} className="inline-flex items-center rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-semibold text-rose-600"><Trash2 className="mr-1.5 h-4 w-4" /> Revoke</button>}
                </article>
              ))}
              {!invitations.length && !loading && <p className="text-sm text-stone-500">No pending invitations.</p>}
            </div>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <ShieldCheck className="h-8 w-8 text-blue-300" />
          <h2 className="mt-5 text-3xl font-light">Tenant access is separate from global product roles.</h2>
          <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">Owner.</strong> Controls workspace administration and may grant the tenant Admin role. Owner access cannot be downgraded here.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">Admin.</strong> Can manage normal church workspace access but cannot manufacture a new owner or control another admin.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">Pastor / Staff.</strong> Intended for operational write access as legacy modules are migrated to tenant-safe storage.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">Viewer.</strong> Intended for read-oriented visibility without shared-record mutation rights.</div>
          </div>
          <p className="mt-6 text-xs leading-5 text-stone-500">A tenant membership never grants access to another church profile. Global product administration and church workspace roles remain distinct.</p>
        </aside>
      </div>
    </section>
  );
}
