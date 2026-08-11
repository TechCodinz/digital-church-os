'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Baby,
  CalendarDays,
  Check,
  Church,
  HeartHandshake,
  Home,
  NotebookPen,
  ShieldCheck,
  UsersRound,
  Wine,
} from 'lucide-react';

type Workflow = {
  id: string;
  title: string;
  description: string;
  owner: string;
  icon: typeof Church;
  checklist: string[];
};

const workflows: Workflow[] = [
  {
    id: 'membership',
    title: 'Membership & belonging',
    description: 'Welcome visitors, explain church life, capture consented follow-up, and move people toward meaningful belonging rather than database enrollment alone.',
    owner: 'Pastoral / membership team',
    icon: UsersRound,
    checklist: ['Visitor follow-up', 'Membership conversation', 'Beliefs & expectations', 'Small-group connection', 'Serving pathway'],
  },
  {
    id: 'baptism',
    title: 'Baptism pathway',
    description: 'Prepare candidates, schedule pastoral conversations, coordinate service logistics, and retain an accountable milestone record.',
    owner: 'Pastor / discipleship leader',
    icon: Baby,
    checklist: ['Candidate request', 'Pastoral conversation', 'Preparation material', 'Service scheduling', 'Follow-up discipleship'],
  },
  {
    id: 'communion',
    title: 'Communion / Lord’s Supper',
    description: 'Plan service timing, pastoral wording, accessibility, supplies, and congregation guidance according to the church’s own doctrine and practice.',
    owner: 'Pastor / service leader',
    icon: Wine,
    checklist: ['Church doctrine reviewed', 'Service placement', 'Elements & accessibility', 'Serving team', 'Pastoral guidance'],
  },
  {
    id: 'groups',
    title: 'Small groups & home fellowship',
    description: 'Organize leaders, meeting rhythm, studies, care needs, attendance signals, and pathways back into the wider church community.',
    owner: 'Group / discipleship leaders',
    icon: Home,
    checklist: ['Leader assigned', 'Meeting rhythm', 'Study plan', 'Care pathway', 'Community follow-up'],
  },
  {
    id: 'visitation',
    title: 'Pastoral visitation & care',
    description: 'Coordinate hospital/home visits, bereavement support, practical needs, prayer, and follow-up while limiting access to sensitive information.',
    owner: 'Care team',
    icon: HeartHandshake,
    checklist: ['Consent & privacy', 'Assigned care leader', 'Visit purpose', 'Prayer / practical need', 'Follow-up date'],
  },
  {
    id: 'services',
    title: 'Service & ceremony planning',
    description: 'Coordinate worship services, dedications, weddings, memorials, commissioning, and other church gatherings with pastoral review and clear roles.',
    owner: 'Pastoral / service team',
    icon: CalendarDays,
    checklist: ['Purpose & doctrine', 'People / roles', 'Scripture & music', 'Run of service', 'Care / follow-up'],
  },
];

export default function ChurchLifePage() {
  const [selected, setSelected] = useState(workflows[0].id);
  const [completed, setCompleted] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const current = workflows.find((item) => item.id === selected)!;
  const currentDone = completed[selected] || [];
  const progress = useMemo(() => Math.round((currentDone.length / current.checklist.length) * 100), [currentDone.length, current.checklist.length]);

  const toggle = (item: string) => setCompleted((state) => ({ ...state, [selected]: currentDone.includes(item) ? currentDone.filter((entry) => entry !== item) : [...currentDone, item] }));

  const save = () => {
    try {
      window.localStorage.setItem('digital-church-life-operations', JSON.stringify({ completed, notes }));
    } catch {
      // Local planning storage is optional.
    }
  };

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><Church className="mr-2 h-4 w-4" /> Church life operations</div>
            <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight text-stone-900 md:text-6xl">Care for the full life of the church—from first visit to discipleship, ordinances, groups, pastoral care, and meaningful gatherings.</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">This is an operational workspace, not a replacement for denominational doctrine or pastoral authority. Each church configures its own practices while Digital Church OS keeps people, roles, follow-up, and privacy visible.</p>
          </div>
          <div className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-white shadow-sm">
            <ShieldCheck className="h-7 w-7 text-sage-300" />
            <h2 className="mt-4 text-2xl font-light">Doctrine stays church-owned.</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">Baptism, communion, weddings, dedications, funerals, membership, and pastoral care differ across Christian traditions. The platform coordinates workflow and records; accountable church leadership decides theology and practice.</p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            {workflows.map((workflow) => {
              const Icon = workflow.icon;
              const active = selected === workflow.id;
              return <button key={workflow.id} type="button" onClick={() => setSelected(workflow.id)} className={`w-full rounded-3xl border p-5 text-left transition ${active ? 'border-sage-300 bg-sage-50 shadow-sm' : 'border-stone-200 bg-white hover:border-sage-200'}`}><div className="flex items-start gap-4"><span className={`rounded-2xl p-3 ${active ? 'bg-sage-600 text-white' : 'bg-stone-100 text-sage-700'}`}><Icon className="h-5 w-5" /></span><div><h2 className="font-semibold text-stone-900">{workflow.title}</h2><p className="mt-1 text-sm leading-6 text-stone-600">{workflow.description}</p><p className="mt-2 text-xs font-semibold text-sage-700">Owner: {workflow.owner}</p></div></div></button>;
            })}
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Active workflow</p><h2 className="mt-2 text-3xl font-light text-stone-900">{current.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{current.description}</p></div>
              <div className="min-w-[150px] rounded-2xl bg-sage-50 p-4"><div className="flex justify-between text-xs font-semibold text-sage-800"><span>Readiness</span><span>{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-sage-100"><div className="h-full bg-sage-600" style={{ width: `${progress}%` }} /></div></div>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-2">{current.checklist.map((item) => { const done = currentDone.includes(item); return <button key={item} type="button" onClick={() => toggle(item)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm transition ${done ? 'border-sage-200 bg-sage-50 text-sage-800' : 'border-stone-200 bg-stone-50 text-stone-700'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-sage-600 text-white' : 'bg-white text-stone-500'}`}>{done ? <Check className="h-4 w-4" /> : '•'}</span>{item}</button>; })}</div>

            <label className="mt-6 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Private coordination notes</span><textarea value={notes[selected] || ''} onChange={(e) => setNotes((state) => ({ ...state, [selected]: e.target.value }))} className="min-h-[170px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 leading-6 outline-none focus:ring-2 focus:ring-sage-200" placeholder="People, roles, follow-up, supplies, questions, accessibility, pastoral review..." /></label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={save} className="inline-flex items-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white"><NotebookPen className="mr-2 h-4 w-4" /> Save private planning state</button>
              <Link href="/care" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Human Care</Link>
              <Link href="/workers" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Workers</Link>
              <Link href="/activities" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Activities</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
