'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Loader2, ShieldCheck, UsersRound } from 'lucide-react';
import { ACTIVE_CHURCH_STORAGE_KEY } from '@/components/ministry/ChurchWorkspaceSelector';

export function ChurchTeamInvitationAccept({ token }: { token: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'accepted' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [churchName, setChurchName] = useState('');
  const [role, setRole] = useState('');

  const accept = async () => {
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/church-ops/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus('error');
        setMessage(data?.error || 'Invitation could not be accepted.');
        return;
      }

      const churchId = data?.church?.id || '';
      if (churchId) {
        window.localStorage.setItem(ACTIVE_CHURCH_STORAGE_KEY, churchId);
        await fetch('/api/church-ops/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ churchId }),
        });
      }

      setChurchName(data?.church?.name || 'the church workspace');
      setRole(data?.membership?.role || 'member');
      setMessage(data?.message || 'Invitation accepted.');
      setStatus('accepted');
    } catch {
      setStatus('error');
      setMessage('Invitation acceptance is unavailable right now.');
    }
  };

  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl">
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7 sm:p-10">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700"><UsersRound className="mr-2 h-4 w-4" /> Church workspace invitation</div>
          <h1 className="mt-5 text-4xl font-light leading-tight text-stone-900">Accept only if this is the church team you expect to join.</h1>
          <p className="mt-4 text-sm leading-7 text-stone-600">The invitation is bound to the email address it was created for. Signing in as another account will not transfer the access.</p>

          {!token ? (
            <div className="mt-7 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">The invitation token is missing from this link.</div>
          ) : status === 'accepted' ? (
            <div className="mt-7 rounded-2xl border border-sage-100 bg-sage-50 p-5">
              <div className="flex items-center gap-2 font-semibold text-sage-800"><Check className="h-5 w-5" /> Invitation accepted</div>
              <p className="mt-2 text-sm leading-6 text-sage-800">{message}</p>
              <p className="mt-2 text-xs text-sage-700">Workspace: {churchName} · Role: {role}</p>
              <div className="mt-5 flex flex-wrap gap-2"><Link href="/dashboard" className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white">Open dashboard</Link><Link href="/church-network" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700">Church network</Link></div>
            </div>
          ) : (
            <div className="mt-7">
              <button type="button" onClick={() => void accept()} disabled={status === 'loading'} className="inline-flex items-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}{status === 'loading' ? 'Validating invitation…' : 'Accept church team invitation'}</button>
              {message && <p className={`mt-4 text-sm ${status === 'error' ? 'text-rose-700' : 'text-stone-600'}`}>{message}</p>}
            </div>
          )}
        </div>
        <aside className="bg-stone-950 p-7 text-white sm:p-10"><ShieldCheck className="h-8 w-8 text-blue-300" /><h2 className="mt-5 text-2xl font-light">What acceptance does</h2><div className="mt-5 space-y-3 text-sm leading-6 text-stone-300"><p>It activates access only for the church profile named in the invitation.</p><p>It does not create a global product-admin role or grant access to other churches.</p><p>The church owner/admin can later revoke workspace access according to church policy.</p></div></aside>
      </div>
    </section>
  );
}
