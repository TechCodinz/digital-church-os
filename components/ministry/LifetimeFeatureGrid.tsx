import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

export type LifetimeFeature = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status?: string;
};

export function LifetimeFeatureGrid({ features }: { features: LifetimeFeature[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Link key={feature.href} href={feature.href} className="sanctuary-card group block p-6 hover:-translate-y-1">
            <div className="mb-5 flex items-center justify-between">
              <div className="inline-flex rounded-2xl bg-sage-100 p-3 text-sage-700 transition group-hover:bg-sage-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              {feature.status && <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">{feature.status}</span>}
            </div>
            <h3 className="text-xl font-medium text-stone-800">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">{feature.description}</p>
            <div className="mt-5 inline-flex items-center text-sm font-semibold text-sage-700">
              Open module <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
