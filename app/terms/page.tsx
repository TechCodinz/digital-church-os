import { BookOpen, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    ['Spiritual support disclaimer', 'Digital Church OS supports ministry operations and spiritual encouragement. It does not replace clergy judgment, emergency services, licensed counseling, medical care, legal advice, or financial advice.'],
    ['Responsible AI use', 'AI-generated prayers, sermons, worship content, and counsel are drafts or support tools. Human leaders remain responsible for review, theology, pastoral care, and final decisions.'],
    ['Community conduct', 'Members should engage with dignity, truthfulness, compassion, privacy, and respect for vulnerable people, children, and those requesting support.'],
    ['Payments and support', 'Offerings and support workflows should be administered transparently according to the organization’s policies and applicable law.'],
  ];

  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
            <BookOpen className="mr-2 h-4 w-4" /> Terms of Use
          </div>
          <h1 className="text-4xl font-light text-stone-800 md:text-6xl">Terms for a safe digital sanctuary.</h1>
          <p className="mt-6 text-lg leading-8 text-stone-600">This starter terms page should be reviewed by a qualified legal professional before public launch, especially for payments, child data, AI use, and church governance.</p>
          <div className="mt-10 space-y-5">
            {sections.map(([title, body]) => (
              <div key={title} className="sanctuary-card p-6">
                <div className="mb-3 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-sage-600" /><h2 className="text-xl font-medium text-stone-800">{title}</h2></div>
                <p className="text-sm leading-7 text-stone-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
