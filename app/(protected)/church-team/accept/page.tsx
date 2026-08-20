import { ChurchTeamInvitationAccept } from '@/components/ministry/ChurchTeamInvitationAccept';

export default function ChurchTeamAcceptPage({ searchParams }: { searchParams?: { token?: string } }) {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <ChurchTeamInvitationAccept token={searchParams?.token || ''} />
    </main>
  );
}
