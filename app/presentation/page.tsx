import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function PresentationPage() {
  return (
    <MinistryRoutePage
      badge="Live presentation and sanctuary screen mode"
      emoji="🖥️"
      title="Control sermon slides, worship lyrics, verse cards, announcements, and live-service screen wording."
      description="Presentation mode gives churches a ProPresenter-style foundation inside Digital Church OS with deck creation, slide ordering, scripture cards, media slots, and live-service session support."
      primaryHref="/api/presentation/decks"
      primaryLabel="Presentation API"
      secondaryHref="/live-service"
      secondaryLabel="Open live service"
      features={[
        { title: 'Slide deck records', description: 'Decks and slides are persisted for services, sermon packs, and sanctuary screens.' },
        { title: 'Scripture and wording display', description: 'Slides can contain Bible references, translation codes, body text, media URLs, and styling.' },
        { title: 'Live-service ready', description: 'Decks can be attached to live services for controlled worship, teaching, giving, and response moments.' },
      ]}
      intelligence={[
        { title: 'Sermon-to-screen flow', description: 'Sermon packs can produce live presentation decks, Bible study content, and recap assets.' },
        { title: 'Multilingual expansion', description: 'Slide content can later connect to translation jobs and live caption workflows.' },
        { title: 'Sanctuary screen resilience', description: 'Slides are stored in the database so services can recover presentation state reliably.' },
      ]}
      safeguards={[
        'Authenticated deck creation',
        'Service-linked screen mode',
        'Bible translation codes',
        'Export-ready structure',
      ]}
    />
  );
}
