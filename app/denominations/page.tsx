import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';
import { DenominationExplorer } from '@/components/ministry/DenominationExplorer';

export default function DenominationsPage() {
  return (
    <>
      <AdvancedMinistryWorkspace
        eyebrow="Denominations"
        title="Explore Christian traditions with context, charity, and room for local church identity."
        description="Give members a respectful orientation to historical families, worship practices, governance, sacramental traditions, theological emphases, and points of shared Christian confession without turning differences into a contest."
        emoji="⛪"
        focus={[
          { title: 'Tradition explorer', description: 'Organize Christian traditions by history, worship, governance, teaching emphases, sacramental practice, and regional expression.' },
          { title: 'Compare with nuance', description: 'Place selected traditions side by side using clearly labeled categories while preserving internal diversity and avoiding caricatures.' },
          { title: 'Local church profile', description: 'Connect general denominational context to a church’s own verified statement of faith, leadership structure, worship practice, and ministry information.' },
        ]}
        intelligence={[
          { title: 'Shared ground first', description: 'Surface major areas of common Christian belief before explaining differences, using neutral language rather than ranking traditions.' },
          { title: 'Distinguish official from local', description: 'Keep denominational source material separate from local-church practice and clearly mark information that needs church verification.' },
          { title: 'Question-led learning', description: 'Help users ask better questions about history, worship, sacraments, governance, mission, spirituality, and doctrine without declaring one tradition superior.' },
        ]}
        actions={[
          { label: 'Church Network', href: '/church-network', description: 'Discover churches and inspect their own verified community information.' },
          { label: 'Scripture Study', href: '/scripture', description: 'Study biblical passages directly with translation and context awareness.' },
          { label: 'Church Life', href: '/church-life', description: 'Explore ministry participation beyond denominational labels.' },
          { label: 'Community Wall', href: '/community-wall', description: 'Join moderated community conversation with respect for different Christian backgrounds.' },
        ]}
        safeguards={[
          'Descriptions should be sourced and reviewed; the system must not invent official doctrines, histories, or positions for a denomination.',
          'No tradition is scored, mocked, spiritually ranked, or presented as automatically more faithful than another.',
          'Local churches control their own verified profile and can clarify where local practice differs from broad denominational summaries.',
        ]}
      />
      <DenominationExplorer />
    </>
  );
}
