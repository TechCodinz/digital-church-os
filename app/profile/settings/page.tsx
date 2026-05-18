import { Bell, Lock, Settings, ShieldCheck } from 'lucide-react';

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Settings className="mr-2 h-4 w-4" /> Profile settings
            </div>
            <h1 className="text-4xl font-light text-stone-800 md:text-6xl">Control privacy, notifications, and spiritual preferences.</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Privacy', description: 'Manage how prayers, posts, and profile details are shown.', icon: Lock },
              { title: 'Notifications', description: 'Choose email, push, and follow-up reminders.', icon: Bell },
              { title: 'Faith journey', description: 'Set faith preference and pastoral support expectations.', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="sanctuary-card p-6">
                  <Icon className="mb-4 h-7 w-7 text-sage-600" />
                  <h2 className="text-xl font-medium text-stone-800">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
