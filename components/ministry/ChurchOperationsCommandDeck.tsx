'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Baby,
  CalendarCheck,
  Check,
  Church,
  CircleDollarSign,
  ClipboardCheck,
  Copyright,
  HeartHandshake,
  Megaphone,
  Music2,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type Area = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Church;
  critical?: boolean;
};

const areas: Area[] = [
  { id: 'service', title: 'Service & broadcast', description: 'Full run-of-show, owners, stream, presentation, response, accessibility, and fallback readiness.', href: '/service-planner', icon: Radio, critical: true },
  { id: 'sermon', title: 'Sermon & teaching', description: 'Scripture context, thesis, teaching flow, live cues, response, and follow-up.', href: '/sermons', icon: ClipboardCheck, critical: true },
  { id: 'worship', title: 'Worship & choir', description: 'Songs, hymns, rehearsals, keys, choir structure, playlists, and projection.', href: '/choir', icon: Music2 },
  { id: 'care', title: 'Prayer & pastoral care', description: 'Prayer requests, human care, safeguarding, sensitive escalations, and accountable follow-up.', href: '/care', icon: HeartHandshake, critical: true },
  { id: 'follow-up', title: 'Discipleship follow-up', description: 'Consent-aware response ownership across contact, foundations, baptism, belonging, groups, and serving.', href: '/admin/follow-up', icon: UsersRound, critical: true },
  { id: 'attendance', title: 'Attendance & assimilation', description: 'Aggregate attendance, guest flow, response ownership, and connection signals without individual surveillance.', href: '/admin/attendance', icon: UsersRound },
  { id: 'groups', title: 'Small groups & community', description: 'Group leadership depth, meeting rhythm, healthy capacity, and places for people to belong.', href: '/groups', icon: Church },
  { id: 'people', title: 'Workers & volunteers', description: 'Rota coverage, roles, primaries/backups, call times, gaps, appreciation, and ministry ownership.', href: '/workers', icon: UsersRound },
  { id: 'children', title: 'Children & family', description: 'Age-aware teaching, guardian controls, family discipleship, and trusted-adult pathways.', href: '/children', icon: Baby, critical: true },
  { id: 'giving', title: 'Giving & benevolence', description: 'Giving operations, aid requests, stewardship review, and accountable disbursement.', href: '/giving', icon: CircleDollarSign },
  { id: 'rights', title: 'Media & rights', description: 'Licensing, public-domain checks, distribution clearance, takedowns, and attribution.', href: '/media-rights', icon: Copyright, critical: true },
  { id: 'outreach', title: 'Outreach & communication', description: 'Invitations, follow-up, testimony/story review, community needs, and mission activity.', href: '/activities', icon: Megaphone },
  { id: 'network', title: 'Church network', description: 'Church discovery, collaboration, shared ministry opportunities, and belonging pathways.', href: '/church-network', icon: Church },
  { id: 'calendar', title: 'Events & calendar', description: 'Services, rehearsals, meetings, conferences, registrations, campaigns, and readiness.', href: '/events', icon: CalendarCheck },
];

function storageKey() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return `digital-church-ops-week:${start.toISOString().slice(0, 10)}`;
}

export function ChurchOperationsCommandDeck() {
  const [ready, setReady] = useState<string[]>([]);
  const [priority, setPriority] = useState('');
  const [risk, setRisk] = useState('');
  const [win, setWin] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      setReady(Array.isArray(data.ready) ? data.ready : []);
      setPriority(data.priority || '');
      setRisk(data.risk || '');
      setWin(data.win || '');
    } catch {
      // Local command-deck persistence is optional.
    }
  }, []);

  const readiness = useMemo(() => Math.round((ready.length / areas.length) * 100), [ready.length]);
  const criticalReady = useMemo(() => areas.filter((area) => area.critical).every((area) => ready.includes(area.id)), [ready]);

  const toggle = (id: string) => setReady((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const save = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ ready, priority, risk, win }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.18fr_0.82fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><Sparkles className="mr-2 h-4 w-4" /> Church operations command deck</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">One weekly view for the ministries people actually depend on.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Use readiness as an operational checklist—not a ministry score. Open each area to do the real work, then return here to keep leadership attention focused.</p>
            </div>
            <div className="min-w-[180px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Weekly readiness</p>
              <p className="mt-1 text-4xl font-light">{readiness}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-sage-400" style={{ width: `${readiness}%` }} /></div>
              <p className={`mt-3 text-xs ${criticalReady ? 'text-sage-300' : 'text-amber-300'}`}>{criticalReady ? 'Critical areas reviewed' : 'Critical review still open'}</p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {areas.map((area) => {
              const Icon = area.icon;
              const done = ready.includes(area.id);
              return (
                <article key={area.id} className={`rounded-2xl border p-4 transition ${done ? 'border-sage-200 bg-sage-50' : area.critical ? 'border-amber-200 bg-amber-50/50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${done ? 'bg-sage-600 text-white' : 'bg-white text-stone-700 shadow-sm'}`}>{done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}</span>
                    {area.critical && <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">Critical</span>}
                  </div>
                  <h3 className="mt-4 font-semibold text-stone-900">{area.title}</h3>
                  <p className="mt-1 min-h-[60px] text-xs leading-5 text-stone-500">{area.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Link href={area.href} className="text-xs font-semibold text-sage-700">Open module →</Link>
                    <button type="button" onClick={() => toggle(area.id)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${done ? 'bg-white text-sage-700' : 'bg-stone-200 text-stone-600'}`}>{done ? 'Reviewed' : 'Mark reviewed'}</button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <ShieldCheck className="h-8 w-8 text-sage-300" />
          <h3 className="mt-5 text-3xl font-light">Leadership attention, not surveillance.</h3>
          <p className="mt-3 text-sm leading-6 text-stone-400">Record the week’s biggest priority, risk, and win. Keep sensitive pastoral details inside the appropriate care systems rather than this general leadership scratchpad.</p>

          <label className="mt-7 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">This week’s priority</span><textarea value={priority} onChange={(e) => setPriority(e.target.value)} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" placeholder="What must leadership make sure happens well?" /></label>
          <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Risk / gap</span><textarea value={risk} onChange={(e) => setRisk(e.target.value)} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-amber-400" placeholder="Coverage gap, unresolved care, rights issue, technical dependency..." /></label>
          <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Win / testimony to review</span><textarea value={win} onChange={(e) => setWin(e.target.value)} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" placeholder="What went well and should be thanked, learned from, or followed up?" /></label>

          <button type="button" onClick={save} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-sage-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sage-400">{saved ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}{saved ? 'Weekly attention saved' : 'Save weekly attention'}</button>
          <p className="mt-4 text-xs leading-5 text-stone-500">This local scratchpad should not contain confidential counseling notes, medical details, abuse reports, financial credentials, or other sensitive case data.</p>
        </aside>
      </div>
    </section>
  );
}
