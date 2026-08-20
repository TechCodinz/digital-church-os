'use client';

import { useMemo, useState } from 'react';
import { Copy, Download, FileText, Loader2, ShieldCheck } from 'lucide-react';

type Entry = {
  id: string;
  source: string;
  title: string;
  content: string;
  createdAt: string;
};

type Range = '7' | '30' | 'all';

function withinRange(value: string, range: Range) {
  if (range === 'all') return true;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return time >= Date.now() - Number(range) * 24 * 60 * 60 * 1000;
}

function makeMarkdown(entries: Entry[], range: Range) {
  const label = range === '7' ? 'Last 7 days' : range === '30' ? 'Last 30 days' : 'All saved continuity moments';
  const sections = entries.map((entry) => [
    `## ${entry.title}`,
    `**Source:** ${entry.source}`,
    `**Saved:** ${new Date(entry.createdAt).toLocaleString()}`,
    '',
    entry.content.trim(),
  ].join('\n'));

  return [
    '# Digital Church OS — Private Journey Review',
    '',
    `Range: ${label}`,
    `Generated locally: ${new Date().toLocaleString()}`,
    '',
    '> This export contains only continuity moments intentionally saved to your signed-in Journey. Review it before sharing because it may contain private spiritual reflections.',
    '',
    ...sections.flatMap((section) => [section, '', '---', '']),
  ].join('\n');
}

export function JourneyExportCenter() {
  const [range, setRange] = useState<Range>('7');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => entries.filter((entry) => withinRange(entry.createdAt, range)), [entries, range]);

  const load = async () => {
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/journey/library', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to load your private Journey.');
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setStatus('Private Journey moments loaded for local export.');
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'Unable to load your private Journey.');
    } finally {
      setLoading(false);
    }
  };

  const copyReview = async () => {
    const text = makeMarkdown(filtered, range);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied locally. Review the text before sharing it outside Digital Church OS.');
    } catch {
      setStatus('Clipboard access is unavailable in this browser. You can use the download option instead.');
    }
  };

  const downloadReview = () => {
    const text = makeMarkdown(filtered, range);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `digital-church-journey-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus('Private Journey review downloaded from this browser.');
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><FileText className="h-5 w-5" /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sage-700">Private review export</p>
              <h2 className="mt-1 text-2xl font-light text-stone-900">Take your saved formation notes with you.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Create a Markdown review from moments you deliberately saved to Journey. The export is assembled in your browser and is not sent to another AI provider for summarization.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[220px_1fr]">
            <select value={range} onChange={(event) => setRange(event.target.value as Range)} className="min-h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All saved moments</option>
            </select>
            <button type="button" onClick={load} disabled={loading} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}{loading ? 'Loading privately…' : 'Prepare review'}
            </button>
          </div>

          {entries.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={copyReview} disabled={!filtered.length} className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 disabled:opacity-50"><Copy className="mr-2 h-4 w-4" /> Copy Markdown</button>
              <button type="button" onClick={downloadReview} disabled={!filtered.length} className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white disabled:opacity-50"><Download className="mr-2 h-4 w-4" /> Download .md</button>
              <span className="text-xs text-stone-500">{filtered.length} moment{filtered.length === 1 ? '' : 's'} in selected range</span>
            </div>
          )}

          {status && <p className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs leading-5 text-stone-600" role="status">{status}</p>}
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
          <ShieldCheck className="h-7 w-7 text-sage-300" />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-sage-300">Share deliberately</p>
          <h3 className="mt-2 text-2xl font-light">Private by default, portable by choice.</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
            <p>The export contains continuity reflections you intentionally saved; it does not add giving amounts, child activity, pastoral case records, or a spiritual score.</p>
            <p>Review the file before sending it to a pastor, small group, counselor, friend, or another application because your own notes may contain sensitive information.</p>
            <p>No generated spiritual diagnosis, prophecy, or holiness ranking is added to the export.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
