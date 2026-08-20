import Link from 'next/link';
import { ArrowRight, BookOpenText, GraduationCap, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { SundaySchoolLessonBuilder } from '@/components/ministry/SundaySchoolLessonBuilder';
import { SundaySchoolClassCommandBoard } from '@/components/ministry/SundaySchoolClassCommandBoard';

const preparationFlow = [
  { title: 'Observe the passage', description: 'Establish context and what the text says before generating application.', icon: BookOpenText },
  { title: 'Adapt for learners', description: 'Adjust vocabulary, questions, movement, discussion, and timing for the real class.', icon: UsersRound },
  { title: 'Teacher reviews', description: 'A responsible adult checks theology, safeguarding, accessibility, and local church fit before use.', icon: ShieldCheck },
];

export default function SundaySchoolPage() {
  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl"><GraduationCap className="mr-2 h-4 w-4" /> Adult-led teaching studio</div>
              <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">Prepare a lesson with intelligence. Teach it with human wisdom and responsibility.</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Build Scripture-rich lesson flow, age-aware questions, activities, family continuation, and classroom preparation without turning AI into a child’s pastor, teacher, counselor, or trusted-adult replacement.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href="#lesson-builder" className="sacred-primary-button"><Sparkles className="h-4 w-4" /> Build a lesson</Link><Link href="/scripture" className="sacred-secondary-button"><BookOpenText className="h-4 w-4" /> Study the passage first</Link></div>
            </div>

            <div className="sacred-panel-dark relative z-10 p-6">
              <p className="sanctuary-section-label text-emerald-200/60">Safeguarding posture</p>
              <h2 className="mt-2 text-2xl font-light text-white">Every generated plan remains a teacher draft.</h2>
              <div className="mt-5 space-y-3 text-xs leading-6 text-white/48"><p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Teachers review biblical accuracy, context, age suitability, and local church standards.</p><p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Activities must remain age-safe and follow the church’s child-protection procedures.</p><p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Children are never asked to disclose private pastoral, family, medical, or safeguarding concerns to an AI lesson tool.</p></div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">{preparationFlow.map((step, index) => { const Icon = step.icon; return <div key={step.title} className="sacred-panel-dark p-5"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-amber-100" /><span className="text-[10px] font-bold tracking-[0.18em] text-white/25">0{index + 1}</span></div><h2 className="mt-4 text-lg font-semibold text-white">{step.title}</h2><p className="mt-2 text-xs leading-6 text-white/45">{step.description}</p></div>; })}</div>
        </div>
      </section>

      <div id="lesson-builder" className="bg-[#f7f5ef] text-stone-900">
        <SundaySchoolLessonBuilder />
        <SundaySchoolClassCommandBoard />
        <section className="px-4 pb-16 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3"><Link href="/children" className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><UsersRound className="h-5 w-5 text-emerald-600" /><h3 className="mt-4 font-semibold text-stone-800">Children’s Sanctuary</h3><p className="mt-2 text-xs leading-6 text-stone-500">Use guardian-controlled child experiences outside teacher preparation.</p><span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Open children’s space <ArrowRight className="ml-2 h-3.5 w-3.5" /></span></Link><Link href="/groups" className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><GraduationCap className="h-5 w-5 text-emerald-600" /><h3 className="mt-4 font-semibold text-stone-800">Continue in groups</h3><p className="mt-2 text-xs leading-6 text-stone-500">Move suitable lessons into accountable small-group and adult formation contexts.</p><span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Open groups <ArrowRight className="ml-2 h-3.5 w-3.5" /></span></Link><Link href="/daily-guide" className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><Sparkles className="h-5 w-5 text-amber-600" /><h3 className="mt-4 font-semibold text-stone-800">Family continuation</h3><p className="mt-2 text-xs leading-6 text-stone-500">Carry a reviewed Scripture theme into home reflection without exposing class records.</p><span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Open Daily Guide <ArrowRight className="ml-2 h-3.5 w-3.5" /></span></Link></div></section>
      </div>
    </main>
  );
}
