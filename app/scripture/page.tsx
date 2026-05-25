import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ScripturePage() {
  return (
    <MinistryRoutePage
      badge="Bible translation and scripture intelligence"
      emoji="📖"
      title="Search, compare, save, and project scripture with translation-aware safeguards."
      description="The scripture module now supports Bible provider configuration, enabled translation versions, local/public-domain passages, searchable verses, verse collections, sermon insertion, and presentation-ready scripture cards."
      primaryHref="/sermons"
      primaryLabel="Use in sermon studio"
      secondaryHref="/presentation"
      secondaryLabel="Open screen mode"
      features={[
        { title: 'Translation provider layer', description: 'Supports public-domain local passages and future licensed providers like API.Bible or YouVersion Platform.' },
        { title: 'Search and comparison', description: 'Search by text, reference, topic, emotion, or version to support sermon, prayer, and teaching workflows.' },
        { title: 'Verse collections', description: 'Members can save scripture collections for devotionals, services, prayer rooms, and teaching packs.' },
      ]}
      intelligence={[
        { title: 'Sermon-aware scripture', description: 'Scripture can feed sermon packs, presentation slides, children lessons, and Bible study guides.' },
        { title: 'Licensing safety', description: 'Modern translations remain provider-controlled so the app can avoid unsafe copying of copyrighted Bible text.' },
        { title: 'Offline readiness', description: 'Public-domain translations can be cached for low-data and offline spiritual access.' },
      ]}
      safeguards={[
        'Provider/license-aware Bible content',
        'Public-domain offline support',
        'Scripture collection privacy',
        'Sermon and slide integration',
      ]}
    />
  );
}
