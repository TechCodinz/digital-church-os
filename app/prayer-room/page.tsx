import Link from 'next/link';
import { Heart, Lock, MessageCircleHeart, Send, ShieldCheck } from 'lucide-react';

export default function PrayerRoomPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Heart className="mr-2 h-4 w-4" /> Prayer room
            </div>
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">A calm place to request prayer, intercede, and receive spiritual support.</h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">The prayer room is designed for private, public, and anonymous prayer journeys with offline saving, follow-up reminders, and pastoral care visibility where appropriate.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {['Private', 'Public', 'Anonymous'].map((item) => (
                <div key={item} className="sanctuary-card p-4 text-center text-sm font-medium text-stone-700">{item}</div>
              ))}
            </div>
          </div>

          <div className="sanctuary-card p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <MessageCircleHeart className="h-7 w-7 text-sage-600" />
              <h2 className="text-2xl font-light text-stone-800">Prayer request flow</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Prayer title</label>
                <input className="soft-input" placeholder="Healing, guidance, family, gratitude..." aria-label="Prayer title preview" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Prayer details</label>
                <textarea className="soft-input min-h-36" placeholder="Share what you want the community or care team to pray about..." aria-label="Prayer details preview" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {['PRIVATE', 'PUBLIC', 'ANONYMOUS'].map((item) => (
                  <div key={item} className="rounded-xl border border-cream-200 bg-white/70 p-3 text-center text-xs font-semibold text-stone-600">{item}</div>
                ))}
              </div>
              <Link href="/dashboard" className="prayer-button inline-flex w-full items-center justify-center">
                Continue in dashboard <Send className="ml-2 h-4 w-4" />
              </Link>
              <p className="flex items-center justify-center gap-2 text-xs text-stone-500"><Lock className="h-3.5 w-3.5" /> Offline prayer sync is handled by the app provider.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white/60 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ['Offline resilience', 'Prayer requests can be saved locally and synced when the user comes back online.'],
            ['Intercession scheduling', 'Requests can connect to follow-up and intercession models for structured care.'],
            ['Safety and dignity', 'Sensitive prayers remain protected through visibility controls and authenticated routes.'],
          ].map(([title, description]) => (
            <div key={title} className="sanctuary-card p-6">
              <ShieldCheck className="mb-4 h-6 w-6 text-sage-600" />
              <h3 className="text-xl font-medium text-stone-800">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
