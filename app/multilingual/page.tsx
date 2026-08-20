import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function MultilingualPage() {
  return (
    <MinistryRoutePage
      badge="Global multilingual ministry"
      emoji="🌍"
      title="Make sermons, prayers, devotionals, and live service content accessible across languages."
      description="The multilingual module prepares Digital Church OS for global adoption with translation-ready sermons, prayer requests, devotionals, live captions, local care resources, and low-data ministry support."
      primaryHref="/sermons"
      primaryLabel="Translate sermon content"
      secondaryHref="/live-service"
      secondaryLabel="Prepare live service"
      features={[
        { title: 'Translation-ready content', description: 'Sermons, prayer points, devotionals, newsletters, and children lessons can be structured for language translation.' },
        { title: 'Live captions roadmap', description: 'Future live service captions can support multilingual members and visitors.' },
        { title: 'Local care resources', description: 'Care and crisis guidance should adapt by country and region instead of assuming one location.' },
      ]}
      intelligence={[
        { title: 'Global ministry expansion', description: 'Churches can serve diaspora, local languages, and international audiences from one content engine.' },
        { title: 'Cultural adaptation', description: 'Content can be adapted for tone, examples, and local context after human review.' },
        { title: 'Low-data access', description: 'Text-first and offline-friendly flows support regions with unstable connectivity.' },
      ]}
      safeguards={[
        'Human review for translated theology',
        'Country-aware crisis resources',
        'Low-data fallback content',
        'No unsupported prophecy claims',
      ]}
    />
  );
}
