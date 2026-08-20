'use client';

import { useState } from 'react';
import { Loader2, MessageCircleHeart, Send, ShieldCheck } from 'lucide-react';

type PastorResponse = {
  type?: string;
  content?: {
    reflection?: string;
    practicalSteps?: string[];
    scriptures?: Array<{ reference: string; text: string; application?: string }>;
  };
  disclaimer?: string;
};

export function AIPastorConsole() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<PastorResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (input.trim().length < 3) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/pastor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AI Pastor could not respond right now.');
      }

      setResponse(data.response || data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sanctuary-card p-8 shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircleHeart className="h-7 w-7 text-sage-600" />
        <div>
          <h2 className="text-2xl font-light text-stone-800">AI Pastor Console</h2>
          <p className="text-sm text-stone-500">Scripture-aware encouragement with pastoral guardrails.</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          className="soft-input min-h-36"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Share what you need guidance, prayer, or encouragement about..."
        />
        <button
          onClick={submit}
          disabled={loading || input.trim().length < 3}
          className="prayer-button inline-flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Ask AI Pastor
        </button>
      </div>

      {error && <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {response && (
        <div className="mt-6 space-y-5 rounded-3xl border border-sage-100 bg-sage-50/60 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-sage-700">
            <ShieldCheck className="h-4 w-4" /> Response type: {response.type || 'pastoral-support'}
          </div>
          {response.content?.reflection && <p className="leading-7 text-stone-700">{response.content.reflection}</p>}
          {!!response.content?.scriptures?.length && (
            <div className="space-y-3">
              {response.content.scriptures.map((scripture) => (
                <div key={scripture.reference} className="rounded-2xl bg-white/80 p-4">
                  <p className="font-semibold text-stone-800">{scripture.reference}</p>
                  <p className="mt-1 text-sm italic text-stone-600">{scripture.text}</p>
                  {scripture.application && <p className="mt-2 text-sm text-stone-500">{scripture.application}</p>}
                </div>
              ))}
            </div>
          )}
          {!!response.content?.practicalSteps?.length && (
            <div>
              <p className="mb-2 text-sm font-semibold text-stone-700">Suggested next steps</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-stone-600">
                {response.content.practicalSteps.map((step) => <li key={step}>{step}</li>)}
              </ul>
            </div>
          )}
          {response.disclaimer && <p className="border-t border-sage-100 pt-4 text-xs leading-5 text-stone-500">{response.disclaimer}</p>}
        </div>
      )}
    </div>
  );
}
