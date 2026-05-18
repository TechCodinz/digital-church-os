import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    ['Information we collect', 'Account details, ministry activity, prayer requests, giving metadata, support requests, AI interaction metadata, and preferences needed to operate the platform.'],
    ['Sensitive spiritual data', 'Prayer, counseling, support, and child-related information must be handled with dignity, role-based access, and privacy-first defaults.'],
    ['How data is used', 'Data supports authentication, spiritual care workflows, community features, giving records, audit trails, safety review, and service improvement.'],
    ['User control', 'Members should be able to update preferences, request support, and ask administrators about retention or correction of account data.'],
  ];

  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
            <ShieldCheck className="mr-2 h-4 w-4" /> Privacy Policy
          </div>
          <h1 className="text-4xl font-light text-stone-800 md:text-6xl">Privacy built for spiritual trust.</h1>
          <p className="mt-6 text-lg leading-8 text-stone-600">This starter policy explains the platform’s privacy posture. Before public launch, have a qualified legal professional adapt it to your operating country, church structure, payment processor, and data retention policy.</p>
          <div className="mt-10 space-y-5">
            {sections.map(([title, body]) => (
              <div key={title} className="sanctuary-card p-6">
                <h2 className="text-xl font-medium text-stone-800">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
