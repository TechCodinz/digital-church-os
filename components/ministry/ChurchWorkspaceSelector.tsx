'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Building2, Check, Loader2, ShieldCheck } from 'lucide-react';

type Workspace = {
  id: string;
  name: string;
  slug: string;
  denomination: string | null;
  country: string | null;
  city: string | null;
  role: 'OWNER' | 'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER';
};

export const ACTIVE_CHURCH_STORAGE_KEY = 'digital-church-active-church-id';

function broadcastWorkspace(churchId: string) {
  window.dispatchEvent(new CustomEvent('digital-church-workspace-change', { detail: { churchId } }));
}

export function ChurchWorkspaceSelector() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState('');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [message, setMessage] = useState('');

  const activateWorkspace = async (id: string, silent = false) => {
    setSwitching(true);
    try {
      if (!id) {
        await fetch('/api/church-ops/active', { method: 'DELETE' });
        window.localStorage.removeItem(ACTIVE_CHURCH_STORAGE_KEY);
        setActiveId('');
        broadcastWorkspace('');
        if (!silent) setMessage('No shared church workspace is selected. Operational drafts remain private to this browser.');
        return true;
      }

      const response = await fetch('/api/church-ops/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: id }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (!silent) setMessage(data?.error || 'That church workspace could not be activated.');
        return false;
      }

      window.localStorage.setItem(ACTIVE_CHURCH_STORAGE_KEY, id);
      setActiveId(id);
      broadcastWorkspace(id);
      if (!silent) setMessage(`Active church changed to ${data?.church?.name || 'the selected workspace'}.`);
      return true;
    } catch {
      if (!silent) setMessage('Church workspace selection is unavailable right now.');
      return false;
    } finally {
      setSwitching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/church-ops/workspaces', { cache: 'no-store' });
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          setMessage(data?.migrationRequired
            ? 'Shared church operations are waiting for the latest database migration.'
            : data?.error || 'Church workspaces are unavailable right now.');
          return;
        }

        const next = Array.isArray(data.workspaces) ? data.workspaces : [];
        setWorkspaces(next);

        const saved = window.localStorage.getItem(ACTIVE_CHURCH_STORAGE_KEY) || '';
        const validSaved = next.some((workspace: Workspace) => workspace.id === saved) ? saved : '';
        const resolved = validSaved || (next.length === 1 ? next[0].id : '');

        if (resolved) {
          const activated = await activateWorkspace(resolved, true);
          if (!activated && !cancelled) {
            window.localStorage.removeItem(ACTIVE_CHURCH_STORAGE_KEY);
            setActiveId('');
            broadcastWorkspace('');
          }
        } else {
          await activateWorkspace('', true);
        }
      } catch {
        if (!cancelled) setMessage('Church workspace discovery is unavailable right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
    // activateWorkspace intentionally remains local to the mounted selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = workspaces.find((workspace) => workspace.id === activeId);

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-sage-50 p-3 text-sage-700"><Building2 className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Active church workspace</p>
                {active && <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600">{active.role}</span>}
              </div>
              <h2 className="mt-2 text-xl font-semibold text-stone-900">Choose where shared ministry operations belong.</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">Browser-local drafts can remain private, but shared operational records must be scoped to one church profile so leaders never accidentally mix churches.</p>

              {loading ? (
                <p className="mt-4 inline-flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading accessible church workspaces…</p>
              ) : workspaces.length ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    value={activeId}
                    disabled={switching}
                    onChange={(event) => void activateWorkspace(event.target.value)}
                    className="min-w-[260px] rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-sage-200 disabled:opacity-60"
                  >
                    <option value="">Select a church workspace</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>{workspace.name}{workspace.city ? ` · ${workspace.city}` : ''}</option>
                    ))}
                  </select>
                  {switching
                    ? <span className="inline-flex items-center text-xs font-semibold text-stone-500"><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Validating church access…</span>
                    : active && <span className="inline-flex items-center text-xs font-semibold text-sage-700"><Check className="mr-1.5 h-4 w-4" /> Shared operations target {active.name}</span>}
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-amber-700">No church profile is attached to this account yet.</span>
                  <Link href="/church-network" className="rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white">Create or manage church profile</Link>
                </div>
              )}

              {message && <p className="mt-3 text-xs font-medium text-amber-700">{message}</p>}
            </div>
          </div>
        </div>
        <div className="border-t border-stone-100 bg-stone-950 p-5 text-white lg:border-l lg:border-t-0">
          <ShieldCheck className="h-5 w-5 text-sage-300" />
          <p className="mt-2 max-w-xs text-xs leading-5 text-stone-300">The server validates membership before setting the HttpOnly active-church cookie, and every shared-record API verifies membership again.</p>
        </div>
      </div>
    </section>
  );
}
