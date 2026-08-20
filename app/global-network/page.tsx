import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';
import { ChurchNetworkIntelligence } from '@/components/ministry/ChurchNetworkIntelligence';

export default function GlobalNetworkPage() {
  return (
    <>
      <AdvancedMinistryWorkspace
        eyebrow="Global Network"
        title="Connect churches, ministries, leaders, and members across languages and regions without losing local accountability."
        description="Discover verified church communities, partnership opportunities, events, prayer connections, outreach, and ministry collaboration with clear source, privacy, and trust boundaries."
        emoji="🌍"
        focus={[
          { title: 'Church discovery', description: 'Explore church communities by region, language, worship context, ministry services, accessibility, and verified profile information.' },
          { title: 'Partnership workspace', description: 'Coordinate approved inter-church events, outreach, missions, resource sharing, prayer initiatives, and leader-to-leader collaboration.' },
          { title: 'Cross-language connection', description: 'Use language-aware presentation and translation assistance while keeping original statements available where accuracy matters.' },
        ]}
        intelligence={[
          { title: 'Relevant connection suggestions', description: 'Recommend churches, ministries, events, or partnership surfaces from explicit interests and location context rather than opaque popularity scores.' },
          { title: 'Trust-aware discovery', description: 'Distinguish verified church-provided information, public metadata, and unverified community content so users can judge sources clearly.' },
          { title: 'Local-to-global handoff', description: 'Move from discovery into church profile, event, group, prayer, or outreach workflows without exposing private member information.' },
        ]}
        actions={[
          { label: 'Explore Church Network', href: '/church-network', description: 'Open the existing church discovery and network engine.' },
          { label: 'Outreach', href: '/outreach', description: 'Coordinate mission and outreach relationships with accountable follow-up.' },
          { label: 'Events', href: '/events', description: 'Connect global or local ministry relationships to approved events.' },
          { label: 'Multilingual', href: '/multilingual', description: 'Use language-support tools for cross-language ministry access.' },
        ]}
        safeguards={[
          'Private member location, contact, care, and participation data must not become discoverable through the global network without appropriate consent.',
          'Church identity, doctrine, leadership, and service information should be marked according to verification source and freshness.',
          'Translation assistance should preserve the original text where material meaning, doctrine, safeguarding, or commitments depend on exact wording.',
        ]}
      />
      <ChurchNetworkIntelligence />
    </>
  );
}
