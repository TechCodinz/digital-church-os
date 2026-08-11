'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  CalendarDays,
  Check,
  Church,
  Save,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

type Track = 'foundations' | 'baptism' | 'membership';
type Session = {
  id: string;
  title: string;
  scripture: string;
  reflection: string;
  completed: boolean;
};

const defaultSessions: Record<Track, Session[]> = {
  foundations: [
    { id: 'gospel', title: 'The gospel & following Jesus', scripture: 'Mark 1:14-20; Ephesians 2:1-10', reflection: '', completed: false },
    { id: 'scripture', title: 'Reading Scripture in context', scripture: 'Psalm 119:9-16; 2 Timothy 3:14-17', reflection: '', completed: false },
    { id: 'prayer', title: 'Prayer, worship & daily life', scripture: 'Matthew 6:5-13; Colossians 3:12-17', reflection: '', completed: false },
    { id: 'community', title: 'Church, community & service', scripture: 'Acts 2:42-47; 1 Corinthians 12:12-27', reflection: '', completed: false },
  ],
  baptism: [
    { id: 'meaning', title: 'Meaning of baptism', scripture: 'Matthew 28:18-20; Romans 6:1-11', reflection: '', completed: false },
    { id: 'testimony', title: 'Tell your story truthfully', scripture: 'Psalm 66:16; 1 Peter 3:15-16', reflection: '', completed: false },
    { id: 'church-process', title: 'Review this church’s baptism process', scripture: 'Acts 8:26-40', reflection: '', completed: false },
    { id: 'pastoral-conversation', title: 'Pastoral conversation & questions', scripture: 'Acts 2:37-42', reflection: '', completed: false },
  ],
  membership: [
    { id: 'belonging', title: 'Belonging to a local church', scripture: 'Hebrews 10:19-25; 1 Corinthians 12:12-27', reflection: '', completed: false },
    { id: 'beliefs', title: 'Review church beliefs & distinctives', scripture: 'Acts 17:10-12; 1 Thessalonians 5:19-22', reflection: '', completed: false },
    { id: 'community-life', title: 'Community, care & reconciliation', scripture: 'Romans 12:9-18; Ephesians 4:1-6', reflection: '', completed: false },
    { id: 'service', title: 'Gifts, service & mission', scripture: 'Romans 12:3-8; Ephesians 4:11-16', reflection: '', completed: false },
  ],
};

const trackCopy: Record<Track, { title: string; description: string }> = {
  foundations: { title: 'Christian foundations', description: 'A calm starting pathway for Scripture, prayer, gospel understanding, church community, and questions.' },
  baptism: { title: 'Baptism preparation', description: 'Review the biblical meaning of baptism and connect the person to the local church’s human-led preparation process.' },
  membership: { title: 'Membership & belonging', description: 'Understand the local church, its beliefs, community expectations, care, accountability, service, and mission before making a commitment.' },
};

function storageKey() {
  return 'digital-church-formation-pathway:v1';
}

export function FormationPathwayPlanner() {
  const [track, setTrack] = useState<Track>('foundations');
  const [leader, setLeader] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [questions, setQuestions] = useState('');
  const [churchRequirements, setChurchRequirements] = useState('');
  const [sessions, setSessions] = useState<Record<Track, Session[]>>(defaultSessions);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      if (['foundations', 'baptism', 'membership'].includes(data.track)) setTrack(data.track);
      setLeader(data.leader || '');
      setTargetDate(data.targetDate || '');
      setQuestions(data.questions || '');
      setChurchRequirements(data.churchRequirements || '');
      if (data.sessions) setSessions({ ...defaultSessions, ...data.sessions });
    } catch {
      // Local formation planning is optional.
    }
  }, []);

  const activeSessions = sessions[track];
  const completed = activeSessions.filter((session) => session.completed).length;
  const progress = useMemo(() => Math.round((completed / Math.max(activeSessions.length, 1)) * 100), [completed, activeSessions.length]);

  const updateSession = (id: string, patch: Partial<Session>) => setSessions((current) => ({ ...current, [track]: current[track].map((session) => session.id === id ? { ...session, ...patch } : session) }));

  const save = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ track, leader, targetDate, questions, churchRequirements, sessions, updatedAt: new Date().toISOString() }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.12fr_0.88fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><BookOpenText className="mr-2 h-4 w-4" /> Formation pathway</div>
              <h2 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Prepare for foundations, baptism, and church membership with Scripture, questions, and accountable human leadership.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Digital Church OS can organize the learning journey, but it does not impose one denomination’s baptism or membership requirements. Each church must review doctrine, age/guardian needs, pastoral readiness, and its own process.</p>
            </div>
            <div className="min-w-[190px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Track progress</p>
              <p className="mt-1 text-4xl font-light">{progress}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-sage-400" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-xs text-stone-400">{completed}/{activeSessions.length} sessions reviewed</p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {(Object.keys(trackCopy) as Track[]).map((id) => <button key={id} type="button" onClick={() => setTrack(id)} className={`rounded-2xl border p-4 text-left transition ${track === id ? 'border-sage-300 bg-sage-50' : 'border-stone-200 bg-stone-50'}`}><p className="font-semibold text-stone-900">{trackCopy[id].title}</p><p className="mt-2 text-xs leading-5 text-stone-500">{trackCopy[id].description}</p></button>)}
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Human leader / mentor</span><input value={leader} onChange={(e) => setLeader(e.target.value)} placeholder="Pastor, class leader, mentor" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Target conversation / ceremony date · optional</span><input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" /></label>
          </div>

          <div className="mt-7 space-y-3">
            {activeSessions.map((session, index) => <article key={session.id} className={`rounded-3xl border p-5 ${session.completed ? 'border-sage-200 bg-sage-50' : 'border-stone-200 bg-stone-50'}`}><div className="flex items-start gap-4"><button type="button" onClick={() => updateSession(session.id, { completed: !session.completed })} className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${session.completed ? 'bg-sage-600 text-white' : 'border border-stone-300 bg-white text-stone-400'}`} aria-label={`Mark ${session.title} ${session.completed ? 'incomplete' : 'complete'}`}><Check className="h-4 w-4" /></button><div className="flex-1"><p className="text-xs font-bold uppercase tracking-wider text-sage-700">Session {index + 1}</p><h3 className="mt-1 font-semibold text-stone-900">{session.title}</h3><Link href="/scripture" className="mt-2 inline-flex text-xs font-semibold text-blue-700">{session.scripture} → Bible study</Link><textarea value={session.reflection} onChange={(e) => updateSession(session.id, { reflection: e.target.value })} className="mt-3 min-h-[90px] w-full rounded-2xl border border-stone-200 bg-white p-3 text-sm leading-6" placeholder="Questions, what you learned, what to discuss with a leader..." /></div></div></article>)}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Questions for a human leader</span><textarea value={questions} onChange={(e) => setQuestions(e.target.value)} className="min-h-[120px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Doctrine, baptism, membership, doubts, practical questions..." /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">This church’s requirements / process</span><textarea value={churchRequirements} onChange={(e) => setChurchRequirements(e.target.value)} className="min-h-[120px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Church-specific class, meeting, guardian consent, testimony, scheduling, membership covenant..." /></label>
          </div>

          <button type="button" onClick={save} className="mt-5 inline-flex items-center rounded-xl bg-sage-700 px-5 py-3 text-sm font-semibold text-white">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Formation notes saved' : 'Save formation notes privately'}</button>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <ShieldCheck className="h-8 w-8 text-sage-300" />
          <h3 className="mt-5 text-3xl font-light">Formation is relationship and understanding—not a checkbox race.</h3>
          <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><BookOpenText className="mb-2 h-5 w-5 text-sage-300" /><strong className="text-white">Scripture stays primary.</strong> References are starting points for reading and discussion, not generated proof-text shortcuts.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="mb-2 h-5 w-5 text-sage-300" /><strong className="text-white">Questions are welcome.</strong> A person should be able to ask difficult questions without being pressured into a ceremony or commitment.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Church className="mb-2 h-5 w-5 text-sage-300" /><strong className="text-white">Local church process matters.</strong> Baptism and membership practice vary across Christian traditions; accountable church leaders must review final preparation.</div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><CalendarDays className="mb-2 h-4 w-4" /> A target date is a coordination aid, not pressure. Readiness should be determined by the person and accountable church leadership, with appropriate guardian involvement for minors.</div>

          <div className="mt-6 grid gap-3">
            <Link href="/admin/follow-up" className="inline-flex items-center justify-center rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white">Leader follow-up board</Link>
            <Link href="/groups" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200">Connect to community →</Link>
            <Link href="/care" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200">Ask for pastoral care →</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
