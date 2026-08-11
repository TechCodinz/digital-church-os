'use client';

import Link from 'next/link';
import { CheckCircle2, Footprints, Loader2 } from 'lucide-react';
import { useState } from 'react';

type JourneySource =
  | 'Daily Guide'
  | 'Scripture'
  | 'Prayer'
  | 'Fasting'
  | 'Family Altar'
  | 'Choir'
  | 'Sermon'
  | 'Service Response';

type JourneyContinuityActionProps = {
  source: JourneySource;
  sourceKey?: string;
  title?: string;
  content?: string;
  scriptureRefs?: string[];
  nextStep?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  compact?: boolean;
};

export function JourneyContinuityAction({
  source,
  sourceKey,
  title,
  content,
  scriptureRefs = [],
  nextStep,
  disabled = false,
  label = 'Save to Journey',
  className = '',
  compact = false,
}: JourneyContinuityActionProps) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (saving || disabled) return;
    const reflection = content?.trim() || '';
    const step = nextStep?.trim() || '';
    if (!reflection && !step) {
      setSaved(false);
      setStatus('Add a reflection or next step before saving to Journey.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setStatus('');
    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          sourceKey,
          title,
          content: reflection,
          scriptureRefs,
          nextStep: step,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(data.error || 'Unable to save this private Journey moment.');
        return;
      }
      setSaved(true);
      setStatus(data.operation === 'updated' ? 'Private Journey moment updated.' : 'Saved privately to your Journey.');
      window.dispatchEvent(new CustomEvent('digital-church:journey-updated', {
        detail: { source, sourceKey: data.sourceKey || sourceKey || '', operation: data.operation || 'created' },
      }));
    } catch {
      setStatus('Journey sync is temporarily unavailable. Nothing else was shared.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={compact ? 'inline-flex flex-col items-start' : 'space-y-2'}>
      <button
        type="button"
        onClick={save}
        disabled={disabled || saving}
        className={className || 'inline-flex min-h-11 items-center justify-center rounded-xl border border-sage-200 bg-sage-50 px-4 py-2.5 text-sm font-semibold text-sage-800 transition hover:bg-sage-100 disabled:cursor-not-allowed disabled:opacity-50'}
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Footprints className="mr-2 h-4 w-4" />}
        {saving ? 'Saving privately…' : saved ? 'Saved to Journey' : label}
      </button>
      {status && (
        <p className={`max-w-sm text-xs leading-5 ${saved ? 'text-emerald-700' : 'text-stone-500'}`} role="status">
          {status}{saved && <> <Link href="/journey" className="font-semibold underline">Open Journey</Link></>}
        </p>
      )}
    </div>
  );
}
