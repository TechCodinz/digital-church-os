import { AIPastorConsole } from '@/components/ai/AIPastorConsole';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function SpiritualPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4" /> AI Pastor and spiritual care
            </div>
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">Guidance that is compassionate, scripture-aware, and guarded.</h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">The AI Pastor route helps members reflect, receive encouragement, identify practical next steps, and know when human or emergency support is required.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Never replaces clergy or licensed counselors',
                'Crisis language receives immediate safety direction',
                'Scripture references are treated as support, not prophecy',
                'Sensitive interactions can be reviewed by care leaders',
              ].map((item) => (
                <div key={item} className="sanctuary-card flex items-start gap-3 p-4 text-sm text-stone-700">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-sage-600" /> {item}
                </div>
              ))}
            </div>
          </div>
          <AIPastorConsole />
        </div>
      </section>
    </div>
  );
}
