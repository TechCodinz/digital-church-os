'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpenText, ChevronDown, ChevronUp, HeartHandshake, MessageCircleHeart, Sparkles } from 'lucide-react';

const responses = [
  {
    title: 'I want prayer',
    description: 'Share a request privately or with the prayer community.',
    href: '/prayer-room',
    icon: MessageCircleHeart,
  },
  {
    title: 'I need human care',
    description: 'Ask a pastor or care team to follow up with you.',
    href: '/care',
    icon: HeartHandshake,
  },
  {
    title: 'Reflect on the message',
    description: 'Write what stood out and what you want to carry forward.',
    href: '/journal',
    icon: BookOpenText,
  },
  {
    title: 'Continue discipleship',
    description: 'Turn today’s service into a meaningful next step.',
    href: '/journey',
    icon: Sparkles,
  },
];

export function LiveServiceResponseDock() {
  const [open, setOpen] = useState(true);

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-stone-950/95 text-white shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left sm:px-6"
          aria-expanded={open}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sage-300">Respond to the service</p>
            <p className="mt-1 text-sm text-stone-200">Prayer, care, reflection, and discipleship should continue after the stream.</p>
          </div>
          {open ? <ChevronDown className="h-5 w-5 shrink-0 text-stone-400" /> : <ChevronUp className="h-5 w-5 shrink-0 text-stone-400" />}
        </button>

        {open && (
          <div className="grid gap-2 border-t border-white/10 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
            {responses.map((response) => {
              const Icon = response.icon;
              return (
                <Link
                  key={response.title}
                  href={response.href}
                  className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-sage-400/40 hover:bg-white/10"
                >
                  <span className="rounded-lg bg-sage-400/10 p-2 text-sage-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{response.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-stone-400">{response.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
