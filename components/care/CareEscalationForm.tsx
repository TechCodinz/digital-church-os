'use client';

import { useState } from 'react';
import { HeartHandshake, Loader2, Send, ShieldAlert } from 'lucide-react';

export function CareEscalationForm() {
  const [reason, setReason] = useState('I need a care team member to follow up with me.');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRISIS'>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/care/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, urgency, notes, module: 'Care Team' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit care request.');
      setMessage('Care request submitted. A care leader can review it from the escalation queue.');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="sanctuary-card p-8 shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        <HeartHandshake className="h-7 w-7 text-sage-600" />
        <div>
          <h2 className="text-2xl font-light text-stone-800">Human Care Escalation</h2>
          <p className="text-sm text-stone-500">Ask for a real person to follow up, not only AI support.</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Reason</label>
          <input className="soft-input" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Urgency</label>
          <select className="soft-input" value={urgency} onChange={(e) => setUrgency(e.target.value as any)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRISIS">Crisis</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Notes</label>
          <textarea className="soft-input min-h-28" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Share what a care team member should know..." />
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <ShieldAlert className="mr-2 inline h-4 w-4" /> If this is immediate danger, contact local emergency services first. This queue is not an emergency dispatch system.
        </div>
        <button disabled={loading || reason.trim().length < 6} className="prayer-button inline-flex w-full items-center justify-center disabled:opacity-60">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Submit Care Request
        </button>
        {message && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      </div>
    </form>
  );
}
