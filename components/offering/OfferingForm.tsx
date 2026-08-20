'use client';

import { useState } from 'react';
import { HeartHandshake, Loader2, Send } from 'lucide-react';

export function OfferingForm() {
  const [amount, setAmount] = useState('25');
  const [purpose, setPurpose] = useState<'COMMUNITY_AID' | 'PLATFORM_UPKEEP' | 'CONFERENCE_SUPPORT'>('COMMUNITY_AID');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/offerings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), currency: 'usd', purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start offering checkout.');
      setStatus('success');
      setMessage('Offering intent created. Connect Stripe Elements or Checkout UI to complete payment collection.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Could not process offering right now.');
    }
  }

  return (
    <form onSubmit={submit} className="sanctuary-card p-8 shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        <HeartHandshake className="h-7 w-7 text-sage-600" />
        <div>
          <h2 className="text-2xl font-light text-stone-800">Purpose-based giving</h2>
          <p className="text-sm text-stone-500">Create a secure payment intent for transparent offerings.</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Amount</label>
          <input type="number" min="1" step="0.01" className="soft-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Purpose</label>
          <select className="soft-input" value={purpose} onChange={(e) => setPurpose(e.target.value as any)}>
            <option value="COMMUNITY_AID">Community support</option>
            <option value="PLATFORM_UPKEEP">Platform upkeep</option>
            <option value="CONFERENCE_SUPPORT">Conference support</option>
          </select>
        </div>
        <button disabled={status === 'loading'} className="prayer-button inline-flex w-full items-center justify-center disabled:opacity-60">
          {status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Start Giving Flow
        </button>
        {message && (
          <div className={`rounded-2xl p-4 text-sm ${status === 'error' ? 'border border-red-100 bg-red-50 text-red-700' : 'border border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
            {message}
          </div>
        )}
      </div>
    </form>
  );
}
