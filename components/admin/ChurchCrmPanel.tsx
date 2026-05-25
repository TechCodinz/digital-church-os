'use client';

import { useEffect, useState } from 'react';
import { Loader2, UsersRound } from 'lucide-react';

type CrmPayload = {
  metrics: Record<string, number>;
  recentMembers: Array<{ id: string; name: string | null; email: string; role: string; createdAt: string; points: number; level: number }>;
  pendingAid: Array<{ id: string; title: string; category: string; amount: number | null; currency: string; status: string; createdAt: string; user: { name: string | null; email: string } }>;
  suggestedWorkflows: string[];
};

export function ChurchCrmPanel() {
  const [payload, setPayload] = useState<CrmPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/crm')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load CRM.');
        if (mounted) setPayload(data);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="sanctuary-card flex items-center justify-center p-10 text-stone-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading CRM...</div>;
  if (error) return <div className="sanctuary-card border-red-100 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  if (!payload) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(payload.metrics).map(([key, value]) => (
          <div key={key} className="sanctuary-card p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{key}</p>
            <p className="mt-2 text-3xl font-light text-stone-800">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="sanctuary-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-medium text-stone-800"><UsersRound className="h-5 w-5 text-sage-600" /> Recent Members</h2>
          <div className="space-y-3">
            {payload.recentMembers.map((member) => (
              <div key={member.id} className="rounded-2xl border border-cream-200 bg-white/70 p-4">
                <p className="font-medium text-stone-800">{member.name || member.email}</p>
                <p className="text-sm text-stone-500">{member.role} · Level {member.level} · {member.points} pts</p>
              </div>
            ))}
          </div>
        </div>
        <div className="sanctuary-card p-6">
          <h2 className="mb-4 text-xl font-medium text-stone-800">Pending Support Requests</h2>
          <div className="space-y-3">
            {payload.pendingAid.length === 0 ? <p className="text-sm text-stone-500">No pending support requests.</p> : payload.pendingAid.map((request) => (
              <div key={request.id} className="rounded-2xl border border-cream-200 bg-white/70 p-4">
                <p className="font-medium text-stone-800">{request.title}</p>
                <p className="text-sm text-stone-500">{request.category} · {request.status} · {request.user.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="sanctuary-card p-6">
        <h2 className="mb-4 text-xl font-medium text-stone-800">Suggested Admin Workflows</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-stone-600">
          {payload.suggestedWorkflows.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
