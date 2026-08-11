'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BookOpenText, Compass, HeartHandshake, Radio, Sparkles, X } from 'lucide-react';

type GuideAction = {
  label: string;
  href: string;
  description: string;
  icon: typeof Sparkles;
};

type GuideContext = {
  eyebrow: string;
  title: string;
  description: string;
  actions: GuideAction[];
};

const baseActions: GuideAction[] = [
  { label: 'Live worship', href: '/live-service', description: 'Join the live sanctuary and service response flow.', icon: Radio },
  { label: 'Prayer & care', href: '/prayer-room', description: 'Pray privately or request human pastoral follow-up.', icon: HeartHandshake },
  { label: 'Study Scripture', href: '/scripture', description: 'Open translation-aware Scripture study and private notes.', icon: BookOpenText },
  { label: 'Daily Guide', href: '/daily-guide', description: 'Choose one calm, faithful next step for today.', icon: Compass },
];

function contextFor(pathname: string): GuideContext {
  if (pathname.startsWith('/live-service') || pathname.startsWith('/sermons')) {
    return {
      eyebrow: 'Service companion',
      title: 'Carry the message into a faithful response.',
      description: 'Move from listening into Scripture, prayer, private notes, human care, or one practical next action.',
      actions: [
        { label: 'Sermon notes', href: '/journal', description: 'Capture a private reflection or key point.', icon: BookOpenText },
        { label: 'Service response', href: '/service-response', description: 'Choose prayer, care, discipleship, serving, or church connection.', icon: HeartHandshake },
        { label: 'Study Scripture', href: '/scripture', description: 'Check references in context and compare enabled translations.', icon: BookOpenText },
        { label: 'Daily Guide', href: '/daily-guide', description: 'Turn one sermon insight into a practical next step.', icon: Compass },
      ],
    };
  }

  if (pathname.startsWith('/prayer') || pathname.startsWith('/care') || pathname.startsWith('/pastoral-hub')) {
    return {
      eyebrow: 'Prayer & care companion',
      title: 'Keep prayer connected to Scripture and human support.',
      description: 'Use private prayer tools, responsible fasting, Scripture study, or a clear human-care handoff when needed.',
      actions: [
        { label: 'Private prayer', href: '/prayer-practice', description: 'Use a timed, private prayer practice and answered-prayer memory.', icon: HeartHandshake },
        { label: 'Fasting & prayer', href: '/fasting-prayer', description: 'Plan a responsible Scripture-led fasting rhythm.', icon: Compass },
        { label: 'Scripture', href: '/scripture', description: 'Open a passage, jot reflections, and keep source context visible.', icon: BookOpenText },
        { label: 'Human care', href: '/care', description: 'Request pastoral care instead of relying on AI for sensitive needs.', icon: HeartHandshake },
      ],
    };
  }

  if (pathname.startsWith('/choir') || pathname.startsWith('/worship-media') || pathname.startsWith('/presentation')) {
    return {
      eyebrow: 'Worship creation companion',
      title: 'Move from inspiration to a service-ready worship flow.',
      description: 'Keep original composition, Scripture grounding, rehearsal, presentation, and media-rights review connected.',
      actions: [
        { label: 'Choir Studio', href: '/choir', description: 'Create original hymns, worship songs, parts, and rehearsal takes.', icon: Sparkles },
        { label: 'Worship media', href: '/worship-media', description: 'Build an atmosphere and media sequence with rights safeguards.', icon: Radio },
        { label: 'Presentation', href: '/presentation', description: 'Prepare verses, lyrics, cues, and service wording.', icon: BookOpenText },
        { label: 'Service planner', href: '/service-planner', description: 'Connect worship preparation to the whole service flow.', icon: Compass },
      ],
    };
  }

  if (pathname.startsWith('/family-altar') || pathname.startsWith('/children') || pathname.startsWith('/sunday-school')) {
    return {
      eyebrow: 'Family discipleship companion',
      title: 'Keep formation age-aware, gentle, and connected at home.',
      description: 'Move between household worship, children’s learning, Scripture, and a shared daily rhythm without spiritual scoring.',
      actions: [
        { label: 'Family Altar', href: '/family-altar', description: 'Plan a sustainable household worship rhythm.', icon: HeartHandshake },
        { label: 'Children', href: '/children', description: 'Open guardian-aware, age-appropriate Bible learning.', icon: Sparkles },
        { label: 'Scripture', href: '/scripture', description: 'Study the family passage with source and translation context.', icon: BookOpenText },
        { label: 'Daily Guide', href: '/daily-guide', description: 'Carry the theme into prayer, service, and evening reflection.', icon: Compass },
      ],
    };
  }

  return {
    eyebrow: 'Sanctuary Guide',
    title: 'What would help you move forward faithfully?',
    description: 'Choose a meaningful next step. This guide organizes ministry pathways; it does not claim divine authority or replace human pastoral leadership.',
    actions: baseActions,
  };
}

export function FloatingSanctuaryGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const context = useMemo(() => contextFor(pathname), [pathname]);

  return (
    <div className="pointer-events-none fixed bottom-[5.25rem] right-4 z-40 md:bottom-6 md:right-6">
      {open && (
        <section className="pointer-events-auto mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-2xl" aria-label="Sanctuary Guide">
          <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-sage-950 p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sage-300">{context.eyebrow}</p>
                <h2 className="mt-2 text-xl font-light leading-7">{context.title}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close Sanctuary Guide" className="rounded-xl border border-white/10 bg-white/10 p-2 text-stone-200 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-300">{context.description}</p>
          </div>

          <div className="grid gap-2 p-3">
            {context.actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={`${pathname}-${action.href}-${action.label}`} href={action.href} onClick={() => setOpen(false)} className="group flex min-h-16 items-start gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-3 transition hover:border-sage-200 hover:bg-sage-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sage-700 shadow-sm"><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-stone-800">{action.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-stone-500">{action.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="border-t border-stone-100 bg-cream-50 px-4 py-3 text-[10px] leading-4 text-stone-500">
            Sensitive care, safeguarding, medical, crisis, or emergency needs should move to appropriate trusted human support and local services.
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close Sanctuary Guide' : 'Open Sanctuary Guide'}
        className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full border border-sage-300/70 bg-gradient-to-br from-sage-700 via-violet-800 to-stone-950 text-white shadow-[0_14px_40px_rgba(76,29,149,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(76,29,149,0.34)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sage-200"
      >
        <span className="absolute h-10 w-10 rounded-full border border-white/10" />
        <Sparkles className="relative h-5 w-5" />
      </button>
    </div>
  );
}
