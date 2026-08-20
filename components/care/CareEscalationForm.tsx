'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, HeartHandshake, Loader2, Send, ShieldAlert, UserRound } from 'lucide-react';

const NEED_TYPES = [
  'Pastoral conversation',
  'Prayer follow-up',
  'Grief or loss',
  'Family or relationship support',
  'Practical care',
];

const urgencyCopy = {
  LOW: 'A normal follow-up is appropriate.',
  MEDIUM: 'I would value a reasonably prompt response.',
  HIGH: 'This feels serious and needs priority human review.',
  CRISIS: 'This is urgent. The care queue is not emergency dispatch.',
} as const;

export function CareEscalationForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [urgency, setUrgency] = useState<keyof typeof urgencyCopy>('MEDIUM');
  const [notifyTrustedContact, setNotifyTrustedContact] = useState(false);
  const [stayWithPerson, setStayWithPerson] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const effectiveTitle = useMemo(() => title.trim() || 'Care team follow-up requested', [title]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/care/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: effectiveTitle,
          description,
          urgency,
          country: country || undefined,
          notifyPastor: true,
          notifyTrustedContact,
          stayWithPerson,
          followUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit care request.');
      setMessage('Your request is recorded for human review. This does not mean a specific leader has accepted or been assigned yet.');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-7 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><UserRound className="h-6 w-6" /></div>
        <div>
          <p className="sanctuary-section-label text-emerald-700">Human follow-up request</p>
          <h2 className="mt-1 text-2xl font-light text-stone-800">What kind of care would help?</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Your words go into a care workflow for real review. Keep the description focused on what the team needs to understand.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Care pathway</label>
          <div className="flex flex-wrap gap-2">
            {NEED_TYPES.map((need) => (
              <button key={need} type="button" onClick={() => setTitle(need)} className={`rounded-full border px-3 py-2 text-xs transition ${title === need ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-200'}`}>{need}</button>
            ))}
          </div>
          <input aria-label="Care request title" className="soft-input mt-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Or describe the kind of follow-up you need" />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">What should the care team know?</label>
          <textarea className="soft-input min-h-36" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Share enough context for a human care leader to understand what you are asking for…" required />
          <div className="mt-1 flex justify-between text-[10px] text-stone-400"><span>Minimum 6 characters</span><span>{description.length}/2000</span></div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Urgency</label>
            <select className="soft-input" value={urgency} onChange={(e) => setUrgency(e.target.value as keyof typeof urgencyCopy)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRISIS">Crisis</option>
            </select>
            <p className={`mt-2 text-xs leading-5 ${urgency === 'CRISIS' ? 'font-semibold text-rose-700' : urgency === 'HIGH' ? 'text-amber-700' : 'text-stone-500'}`}>{urgencyCopy[urgency]}</p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Country <span className="font-normal normal-case tracking-normal">(optional)</span></label>
            <input className="soft-input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria, United States" />
            <p className="mt-2 text-xs leading-5 text-stone-500">Used only to make emergency guidance less ambiguous when needed.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            <input type="checkbox" checked={notifyTrustedContact} onChange={(e) => setNotifyTrustedContact(e.target.checked)} className="mr-2" /> Notify a trusted contact when one is configured
          </label>
          <label className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            <input type="checkbox" checked={stayWithPerson} onChange={(e) => setStayWithPerson(e.target.checked)} className="mr-2" /> Flag that the person should not be left alone
          </label>
        </div>

        <div className={`rounded-2xl border p-4 text-sm leading-6 ${urgency === 'CRISIS' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
          <ShieldAlert className="mr-2 inline h-4 w-4" /> If there is immediate danger, contact local emergency services or nearby trusted people first. This queue is not emergency dispatch.
        </div>

        <button disabled={loading || description.trim().length < 6 || description.length > 2000} className="inline-flex min-h-13 w-full items-center justify-center rounded-2xl bg-stone-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Record request for human review
        </button>

        {message && <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="flex items-start gap-2 text-[10px] leading-5 text-stone-400">
          <HeartHandshake className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>The platform can record and route the request, but it does not claim that a pastor, counselor, or other person has responded until the human workflow actually records that action.</span>
        </div>
      </div>
    </form>
  );
}
