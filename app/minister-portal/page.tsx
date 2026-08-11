import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';
import { MinisterPreparationBoard } from '@/components/ministry/MinisterPreparationBoard';

export default function MinisterPortalPage() {
  return (
    <>
      <AdvancedMinistryWorkspace
        eyebrow="Minister Portal"
        title="Prepare, coordinate, serve, and follow up from one ministry command surface."
        description="A connected workspace for ministers and ministry leaders to move between service preparation, Scripture, sermon work, worship, teams, requests, follow-up, and accountable next actions."
        emoji="🕊️"
        focus={[
          { title: 'Service preparation', description: 'Keep message focus, Scripture, worship, response moments, volunteers, communications, and follow-up aligned before the service begins.' },
          { title: 'Ministry task board', description: 'Surface upcoming responsibilities, unresolved requests, people coverage, event needs, and handoffs without mixing confidential pastoral cases into general operations.' },
          { title: 'Post-service follow-up', description: 'Carry response moments into prayer, groups, discipleship, care, testimony review, and leader-owned follow-up workflows.' },
        ]}
        intelligence={[
          { title: 'Attention assistant', description: 'Summarize what needs a minister’s attention from existing ministry workflows while keeping sensitive decisions human-led.' },
          { title: 'Preparation continuity', description: 'Carry Scripture and sermon context into live-service, presentation, worship, and response workflows instead of re-entering the same information.' },
          { title: 'Accountable handoffs', description: 'Recommend the right Church OS workspace for each next action and preserve role boundaries around care, finance, children, and administration.' },
        ]}
        actions={[
          { label: 'Ministry Command Center', href: '/ministry-command-center', description: 'Open the protected operational workspace for church ministry coordination.' },
          { label: 'Prepare Sermon', href: '/sermons', description: 'Use Scripture-aware sermon preparation, live preaching, notes, and follow-up tooling.' },
          { label: 'Plan Service', href: '/service-planner', description: 'Coordinate worship, service flow, teams, response moments, and operational readiness.' },
          { label: 'Church Team', href: '/church-team/manage', description: 'Manage role-aware ministry team membership and invitations.' },
        ]}
        safeguards={[
          'Role-protected actions remain subject to church workspace permissions and human authorization.',
          'Confidential pastoral notes do not belong in shared operational scratchpads or broad team views.',
          'AI may organize, summarize, and recommend next actions; it does not become the minister, pastor, or final decision maker.',
        ]}
      />
      <MinisterPreparationBoard />
    </>
  );
}
