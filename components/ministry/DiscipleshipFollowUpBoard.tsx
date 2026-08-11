'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Church,
  HeartHandshake,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UsersRound,
} from 'lucide-react';

type FollowUpStage = 'response' | 'contacted' | 'foundations' | 'baptism' | 'membership' | 'group' | 'serving' | 'paused';
type ConsentState = 'unknown' | 'yes' | 'no';
type FollowUpItem = {
  id: string;
  person: string;
  contactReference: string;
  stage: FollowUpStage;
  owner: string;
  nextAction: string;
  dueDate: string;
  consent: ConsentState;
  careNeeded: boolean;
  completed: boolean;
};

const stages: Array<{ id: FollowUpStage; label: string; description: string }> = [
  { id: 'response', label: 'Response received', description: 'A person requested a next step or new-believer follow-up.' },
  { id: 'contacted', label: 'Human contact', description: 'A trusted leader has made an appropriate first contact.' },
  { id: 'foundations', label: 'Foundations', description: 'Scripture, prayer, questions, and basic discipleship are underway.' },
  { id: 'baptism', label: 'Baptism conversation', description: 'Meaning and church process are being discussed with leaders.' },
  { id: 'membership', label: 'Belonging / membership', description: 'Church belonging, expectations, and community are being explored.' },
  { id: 'group', label: 'Small group / community', description: 'The person is being connected into relationships beyond a single service.' },
  { id: 'serving', label: 'Serving pathway', description: 'Gifts, readiness, safeguarding, and healthy service opportunities are explored.' },
  { id: 'paused', label: 'Paused respectfully', description: 'Follow-up is paused because consent changed or the person asked for space.' },
];

const defaultItems: FollowUpItem[] = [];

function storageKey() {
  return 'digital-church-discipleship-follow-up:v1';
}

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

export function DiscipleshipFollowUpBoard() {
  const [items, setItems] = useState<FollowUpItem[]>(defaultItems);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.items)) setItems(data.items);
    } catch {
      // Local prototype persistence is optional.
    }
  }, []);

  const active = useMemo(() => items.filter((item) => !item.completed && item.stage !== 'paused'), [items]);
  const overdue = useMemo(() => active.filter((item) => item.dueDate && item.dueDate < todayText()), [active]);
  const unowned = useMemo(() => active.filter((item) => !item.owner.trim()), [active]);
  const consentUnknown = useMemo(() => active.filter((item) => item.consent === 'unknown'), [active]);
  const careQueue = useMemo(() => active.filter((item) => item.careNeeded), [active]);

  const updateItem = (id: string, patch: Partial<FollowUpItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const addItem = () => setItems((current) => [{ id: `${Date.now()}`, person: '', contactReference: '', stage: 'response', owner: '', nextAction: 'Make a respectful first contact and ask how the church can support the next step.', dueDate: '', consent: 'unknown', careNeeded: false, completed: false }, ...current]);
  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));

  const save = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ items, updatedAt: new Date().toISOString() }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><UsersRound className="mr-2 h-4 w-4" /> Discipleship follow-up board</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Make sure a spiritual response becomes human relationship, accountable discipleship, and an appropriate next step.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Track only the minimum operational information needed for follow-up: who needs contact, consent posture, human owner, next action, due date, and stage. This prototype stores the board only on this device; do not use it as a confidential counseling record.</p>
            </div>
            <div className="min-w-[205px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Active follow-up</p>
              <p className="mt-1 text-4xl font-light">{active.length}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span className="rounded-lg bg-white/5 p-2 text-amber-300">{overdue.length} overdue</span><span className="rounded-lg bg-white/5 p-2 text-rose-300">{careQueue.length} care</span></div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {stages.filter((stage) => stage.id !== 'paused').map((stage) => {
              const count = active.filter((item) => item.stage === stage.id).length;
              return <div key={stage.id} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600"><strong className="text-stone-900">{count}</strong> {stage.label}</div>;
            })}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={addItem} className="inline-flex items-center rounded-xl bg-sage-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sage-800"><Plus className="mr-2 h-4 w-4" /> Add follow-up</button>
            <button type="button" onClick={save} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Board saved locally' : 'Save board locally'}</button>
          </div>

          <div className="mt-6 space-y-4">
            {items.map((item) => {
              const isOverdue = !item.completed && item.stage !== 'paused' && item.dueDate && item.dueDate < todayText();
              return (
                <article key={item.id} className={`rounded-3xl border p-5 ${item.completed ? 'border-sage-200 bg-sage-50' : isOverdue ? 'border-amber-200 bg-amber-50/60' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <button type="button" onClick={() => updateItem(item.id, { completed: !item.completed })} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.completed ? 'bg-sage-600 text-white' : 'border border-stone-300 bg-white text-stone-400'}`} aria-label={`Mark follow-up ${item.completed ? 'active' : 'complete'}`}><Check className="h-4 w-4" /></button>
                    <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Person / reference</span><input value={item.person} onChange={(e) => updateItem(item.id, { person: e.target.value })} placeholder="Name or church contact ID" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Contact reference</span><input value={item.contactReference} onChange={(e) => updateItem(item.id, { contactReference: e.target.value })} placeholder="Existing CRM/contact reference" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Stage</span><select value={item.stage} onChange={(e) => updateItem(item.id, { stage: e.target.value as FollowUpStage })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Consent to contact</span><select value={item.consent} onChange={(e) => updateItem(item.id, { consent: e.target.value as ConsentState, stage: e.target.value === 'no' ? 'paused' : item.stage })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="unknown">Not recorded</option><option value="yes">Yes</option><option value="no">No / stop follow-up</option></select></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Human owner</span><input value={item.owner} onChange={(e) => updateItem(item.id, { owner: e.target.value })} placeholder="Pastor / leader / mentor" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Next action due</span><input type="date" value={item.dueDate} onChange={(e) => updateItem(item.id, { dueDate: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" /></label>
                      <label className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Next operational action</span><input value={item.nextAction} onChange={(e) => updateItem(item.id, { nextAction: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm" placeholder="Call, invite to foundations, introduce small-group leader..." /></label>
                      <label className="md:col-span-2 xl:col-span-4"><button type="button" onClick={() => updateItem(item.id, { careNeeded: !item.careNeeded })} className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold ${item.careNeeded ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-stone-200 bg-white text-stone-600'}`}>{item.careNeeded ? 'Human pastoral-care handoff requested' : 'No pastoral-care handoff marked'}</button></label>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="rounded-xl border border-rose-100 bg-white p-2.5 text-rose-500" aria-label="Remove follow-up"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
            {!items.length && <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center"><UsersRound className="mx-auto h-8 w-8 text-stone-300" /><p className="mt-3 font-semibold text-stone-700">No follow-up records on this device.</p><p className="mt-2 text-sm leading-6 text-stone-500">Add a record when a person has consented to an appropriate church next-step workflow.</p></div>}
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <ShieldCheck className="h-8 w-8 text-sage-300" />
          <h3 className="mt-5 text-3xl font-light">Follow-up with consent, ownership, and pastoral boundaries.</h3>
          <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="mb-2 h-5 w-5 text-sage-300" /><strong className="text-white">Do not lose the moment.</strong> Every active follow-up should have a human owner and a clear next action rather than an automated spiritual score.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Church className="mb-2 h-5 w-5 text-sage-300" /><strong className="text-white">Belonging takes time.</strong> Foundations, baptism, membership, community, and serving are pathways for relationship—not a forced funnel.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><HeartHandshake className="mb-2 h-5 w-5 text-rose-300" /><strong className="text-white">Care stays separate.</strong> Mark that care is needed, then use the dedicated care workflow. Do not write counseling, abuse, medical, or crisis details here.</div>
          </div>

          {(overdue.length > 0 || unowned.length > 0 || consentUnknown.length > 0) && <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4"><div className="flex items-center gap-2 text-amber-200"><AlertTriangle className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-wider">Attention needed</p></div><ul className="mt-3 space-y-2 text-xs leading-5 text-amber-100">{overdue.length > 0 && <li>• {overdue.length} active follow-up{overdue.length === 1 ? '' : 's'} overdue.</li>}{unowned.length > 0 && <li>• {unowned.length} active follow-up{unowned.length === 1 ? '' : 's'} without a human owner.</li>}{consentUnknown.length > 0 && <li>• {consentUnknown.length} active record{consentUnknown.length === 1 ? '' : 's'} without recorded contact consent.</li>}</ul></div>}

          <div className="mt-6 rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-xs leading-5 text-blue-100">This is a local operational prototype. A production church CRM should use authenticated role-based access, encryption, audit trails, retention policies, consent history, deletion workflows, and church-approved messaging integrations before storing member contact data centrally.</div>

          <div className="mt-6 grid gap-3">
            <Link href="/care" className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"><HeartHandshake className="mr-2 h-4 w-4" /> Human pastoral care</Link>
            <Link href="/next-steps" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-sage-200">Member next-step pathways →</Link>
            <Link href="/church-network" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200"><Church className="mr-2 h-4 w-4" /> Church belonging</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
