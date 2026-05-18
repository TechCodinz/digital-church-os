import Link from 'next/link';
import { Settings, ShieldCheck, UserCircle } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="sanctuary-card p-8 shadow-2xl md:p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-3xl bg-sage-100 p-4 text-sage-700"><UserCircle className="h-10 w-10" /></div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage-600">Member profile</p>
                <h1 className="mt-2 text-4xl font-light text-stone-800">Your spiritual account center.</h1>
              </div>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-stone-600">Profile data supports your prayer history, ministry participation, family profiles, giving records, and AI care preferences. Keep settings private, intentional, and aligned with your faith journey.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {['Faith preference', 'Notification preferences', 'Privacy and consent'].map((item) => (
                <div key={item} className="rounded-2xl border border-cream-200 bg-white/70 p-4 text-sm text-stone-700"><ShieldCheck className="mb-3 h-5 w-5 text-sage-600" />{item}</div>
              ))}
            </div>
            <Link href="/profile/settings" className="prayer-button mt-8 inline-flex items-center">
              Open settings <Settings className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
