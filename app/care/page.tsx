import Link from 'next/link';
import { CareEscalationForm } from '@/components/care/CareEscalationForm';
import { ArrowRight, HeartHandshake, ShieldAlert, Sparkles, Users } from 'lucide-react';

const pathways = [
  { title: 'I need someone to listen', description: 'Create a private care request for a real care-team review and follow-up.', href: '#request-care' },
  { title: 'I need prayer first', description: 'Enter the Prayer Room before deciding whether you also want human follow-up.', href: '/prayer-room' },
  { title: 'I need practical support', description: 'Use the assistance flow for needs that may require reviewed aid or practical help.', href: '/aid-request' },
];

export default function CarePage() {
  return (
    <div className="sanctuary-page-shell min-h-screen bg-[#06110f] pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center rounded-full border border-rose-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-rose-100 backdrop-blur-xl">
              <HeartHandshake className="mr-2 h-4 w-4" /> Human care sanctuary
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-light leading-[1.05] text-white md:text-7xl">You do not have to turn a difficult moment into a prompt and face it alone.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/58 sm:text-lg">Digital Church OS can help you find Scripture, prayer, and next steps. When a situation needs a person, this space records a request for accountable human care.</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {pathways.map((path) => (
                <Link key={path.title} href={path.href} className="sacred-panel-dark group p-4 transition hover:-translate-y-1">
                  <p className="text-sm font-semibold text-white">{path.title}</p>
                  <p className="mt-2 text-xs leading-5 text-white/45">{path.description}</p>
                  <ArrowRight className="mt-4 h-4 w-4 text-amber-100 transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="sacred-panel-dark relative z-10 p-6 sm:p-8">
            <p className="sanctuary-section-label text-emerald-200/60">How care works</p>
            <h2 className="mt-2 text-3xl font-light text-white">Private request → human review → accountable follow-up</h2>
            <div className="mt-6 space-y-3">
              {[
                ['Care queue', 'Your request is recorded for the care workflow rather than answered with a fake human assignment.'],
                ['Urgency', 'Low, medium, high, and crisis flags help a real team prioritize review.'],
                ['Follow-up', 'A scheduled check-in can be created without claiming someone has already accepted the request.'],
                ['Boundaries', 'AI never becomes clergy, emergency dispatch, a clinician, or a substitute for trusted people.'],
              ].map(([title, description], index) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-200/10 text-xs font-bold text-emerald-100">0{index + 1}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/45">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="request-care" className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="sanctuary-section-label text-emerald-700">Request human care</p>
            <h2 className="mt-3 text-4xl font-light leading-tight text-stone-800">Tell the team only what they need to know.</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">Use the form for a care-team follow-up. Sensitive details should be limited to what is necessary for the team to understand the request.</p>

            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              <ShieldAlert className="mr-2 inline h-4 w-4" /> This queue is not emergency dispatch. If there is immediate danger, contact local emergency services or nearby trusted people first.
            </div>

            <div className="mt-4 rounded-3xl border border-emerald-100 bg-white p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-stone-800">AI stays underneath the experience</p>
                  <p className="mt-2 text-xs leading-6 text-stone-600">It may help with Scripture or reflection elsewhere, but care ownership belongs to accountable people.</p>
                </div>
              </div>
            </div>

            <Link href="/church-network" className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-700">Find church connection <Users className="ml-2 h-4 w-4" /></Link>
          </div>

          <CareEscalationForm />
        </div>
      </section>
    </div>
  );
}
