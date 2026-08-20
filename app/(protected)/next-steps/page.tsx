import Link from 'next/link';
import {
  ArrowRight,
  BookOpenText,
  Church,
  Droplets,
  HandHeart,
  HeartHandshake,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const steps = [
  {
    title: 'I chose to follow Christ',
    description: 'Begin a gentle new-believer pathway with Scripture, prayer, human follow-up, Christian foundations, and room for questions.',
    href: '/formation',
    icon: Sparkles,
  },
  {
    title: 'I want prayer or pastoral care',
    description: 'Share what you are carrying and request human pastoral follow-up when you need it.',
    href: '/care',
    icon: HeartHandshake,
  },
  {
    title: 'I want to prepare for baptism',
    description: 'Study the meaning of baptism, record questions, and connect with church leadership for the local preparation process.',
    href: '/formation',
    icon: Droplets,
  },
  {
    title: 'I want to belong to a church',
    description: 'Discover church communities, review membership/belonging preparation, and take a clear path toward participation.',
    href: '/formation',
    icon: Church,
  },
  {
    title: 'I want a small group or community',
    description: 'Find the community pathway where relationships, Scripture, prayer, care, and everyday discipleship can continue beyond Sunday.',
    href: '/groups',
    icon: UsersRound,
  },
  {
    title: 'I want to grow in Scripture',
    description: 'Continue through Scripture study, sermon notes, devotional reflection, and your private spiritual journey.',
    href: '/scripture',
    icon: BookOpenText,
  },
  {
    title: 'I want to serve',
    description: 'Find meaningful ministry activities, volunteer opportunities, outreach work, and practical ways to help others.',
    href: '/activities',
    icon: UsersRound,
  },
  {
    title: 'I want to support ministry',
    description: 'Give intentionally, understand impact, and keep generosity connected to transparent ministry outcomes.',
    href: '/offering',
    icon: HandHeart,
  },
];

export default function NextStepsPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-16 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Your next faithful step
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-light leading-tight text-stone-900 md:text-6xl">
                Don’t leave a meaningful moment without a clear next step.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                Whether you responded during a service, asked AI Pastor a question, received prayer, or simply want to grow, choose what you need now. Sensitive care remains human-led and AI guidance stays advisory.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/formation" className="inline-flex items-center rounded-full bg-sage-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sage-700">
                  Begin formation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/care" className="inline-flex items-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-sage-300 hover:text-sage-700">
                  Talk to a person
                </Link>
              </div>
            </div>

            <aside className="bg-stone-950 p-7 text-white sm:p-10 lg:p-12">
              <HeartHandshake className="h-9 w-9 text-sage-300" />
              <h2 className="mt-6 text-3xl font-light">A response should lead to relationship, not a dead end.</h2>
              <p className="mt-4 text-sm leading-7 text-stone-300">
                Digital Church OS connects spiritual response to formation, baptism preparation, church belonging, small-group community, pastoral care, Scripture, service, and transparent generosity so people can keep moving with support.
              </p>
              <div className="mt-8 rounded-2xl border border-sage-300/20 bg-sage-300/10 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-sage-300">Pastoral safeguard</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  Urgent or sensitive care needs should be reviewed by qualified human leaders. AI experiences can support reflection but do not replace pastoral, medical, counseling, or emergency services.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-700">Choose what describes you</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900">Move from inspiration to formation and community.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Link key={step.title} href={step.href} className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sage-200 hover:shadow-md">
                  <span className="inline-flex rounded-2xl bg-sage-50 p-3 text-sage-700 transition group-hover:bg-sage-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-stone-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{step.description}</p>
                  <span className="mt-5 inline-flex items-center text-sm font-semibold text-sage-700">
                    Continue <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
