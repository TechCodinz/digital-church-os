import { CareEscalationForm } from '@/components/care/CareEscalationForm';
import { HeartHandshake, ShieldAlert, Users } from 'lucide-react';

export default function CarePage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <HeartHandshake className="mr-2 h-4 w-4" /> Human care escalation
            </div>
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">AI helps, but people still shepherd people.</h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">Care escalation gives members a clear path to request human follow-up when AI Pastor, prayer room, aid requests, or personal situations need pastoral attention.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['Care queue', 'Requests are recorded for care-team review.'],
                ['Urgency levels', 'Low, medium, high, and crisis flags guide response priority.'],
                ['Audit trail', 'Escalations are logged for accountability.'],
                ['Emergency clarity', 'The platform clearly warns that crisis situations need emergency services.'],
              ].map(([title, description]) => (
                <div key={title} className="sanctuary-card p-4">
                  <Users className="mb-3 h-5 w-5 text-sage-600" />
                  <h3 className="font-medium text-stone-800">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl border border-amber-100 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
              <ShieldAlert className="mr-2 inline h-4 w-4" /> This is a care workflow, not emergency dispatch. For immediate danger, contact local emergency services.
            </div>
          </div>
          <CareEscalationForm />
        </div>
      </section>
    </div>
  );
}
