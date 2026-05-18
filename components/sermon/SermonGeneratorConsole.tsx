'use client';

import { useState } from 'react';
import { BookOpenText, Loader2, Send, ShieldCheck } from 'lucide-react';

type SermonResponse = {
  title?: string;
  theme?: string;
  scriptureRefs?: string[];
  outline?: {
    introduction?: string;
    points?: Array<{ title: string; scripture: string; explanation: string; application: string }>;
    conclusion?: string;
  };
  discussionQuestions?: string[];
  fullSermon?: string;
  disclaimer?: string;
  safeMode?: boolean;
};

export function SermonGeneratorConsole() {
  const [theme, setTheme] = useState('Faith under pressure');
  const [style, setStyle] = useState<'expository' | 'topical' | 'narrative'>('expository');
  const [scriptureRefs, setScriptureRefs] = useState('Matthew 11:28, Psalm 34:18');
  const [sermon, setSermon] = useState<SermonResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError('');
    setSermon(null);

    try {
      const refs = scriptureRefs.split(',').map((ref) => ref.trim()).filter(Boolean);
      const res = await fetch('/api/ai/christian/teaching/sermon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, style, scriptureRefs: refs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate sermon.');
      setSermon(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="sanctuary-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <BookOpenText className="h-7 w-7 text-sage-600" />
          <div>
            <h2 className="text-2xl font-light text-stone-800">Sermon Engine</h2>
            <p className="text-sm text-stone-500">Generate a structured sermon draft with guardrails.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Theme</label>
            <input className="soft-input" value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Style</label>
            <select className="soft-input" value={style} onChange={(e) => setStyle(e.target.value as any)}>
              <option value="expository">Expository</option>
              <option value="topical">Topical</option>
              <option value="narrative">Narrative</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Scripture references</label>
            <input className="soft-input" value={scriptureRefs} onChange={(e) => setScriptureRefs(e.target.value)} />
          </div>
          <button onClick={generate} disabled={loading || theme.trim().length < 3} className="prayer-button inline-flex w-full items-center justify-center disabled:opacity-60">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Generate Sermon
          </button>
          {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        </div>
      </div>

      <div className="sanctuary-card min-h-[32rem] p-8">
        {!sermon ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-stone-500">
            <BookOpenText className="mb-4 h-12 w-12 text-sage-300" />
            <p>Generate a sermon to see outline, scriptures, discussion questions, and safe-mode status.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> {sermon.safeMode ? 'Safe fallback mode' : 'AI assisted'}
              </div>
              <h2 className="text-3xl font-light text-stone-800">{sermon.title}</h2>
              <p className="mt-2 text-sm text-stone-500">Theme: {sermon.theme}</p>
            </div>

            {sermon.outline?.introduction && <p className="leading-7 text-stone-700">{sermon.outline.introduction}</p>}

            <div className="space-y-4">
              {sermon.outline?.points?.map((point, index) => (
                <div key={`${point.title}-${index}`} className="rounded-2xl border border-cream-200 bg-white/70 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-sage-600">Point {index + 1}</p>
                  <h3 className="mt-2 text-xl font-medium text-stone-800">{point.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-stone-600">{point.scripture}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{point.explanation}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-500">Application: {point.application}</p>
                </div>
              ))}
            </div>

            {!!sermon.discussionQuestions?.length && (
              <div>
                <p className="mb-2 font-semibold text-stone-700">Discussion questions</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-stone-600">
                  {sermon.discussionQuestions.map((question) => <li key={question}>{question}</li>)}
                </ul>
              </div>
            )}

            {sermon.disclaimer && <p className="border-t border-cream-200 pt-4 text-xs leading-5 text-stone-500">{sermon.disclaimer}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
