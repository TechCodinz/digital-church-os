import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function WorshipMediaPage() {
  return (
    <MinistryRoutePage
      badge="Worship, praise, and atmosphere media"
      emoji="🎶"
      title="Build prayer atmospheres with Christian songs, worship playlists, praise videos, uploads, and rewarded listening sequences."
      description="Worship Media adds approved music/video uploads, playlists, prayer atmosphere sequences, playback tracking, and rewards so broadcasts, devotions, prayer rooms, and services can carry a richer spiritual atmosphere."
      primaryHref="/live-broadcast"
      primaryLabel="Open live broadcast"
      secondaryHref="/rewards"
      secondaryLabel="View rewards"
      features={[
        { title: 'Media library', description: 'Upload or link audio, video, lyric videos, instrumentals, choir clips, children songs, youth media, and prayer atmosphere sounds.' },
        { title: 'Playlists', description: 'Create worship, praise, devotion, children, youth, conference, and prayer atmosphere playlists.' },
        { title: 'Reward sequences', description: 'Listening or watching approved media can earn points, while full playlist sequences can unlock bonus rewards.' },
      ]}
      intelligence={[
        { title: 'Broadcast atmosphere', description: 'Hosts can use worship playlists during live devotions, prayers, conferences, and public gatherings.' },
        { title: 'Meaningful engagement', description: 'Members are rewarded for intentional spiritual listening and participation, not passive spam.' },
        { title: 'Creator expansion', description: 'Approved worship creators can later publish songs, instrumentals, and worship resources into the marketplace.' },
      ]}
      safeguards={[
        'License type tracking',
        'Admin review for uploads',
        'Private/church/public visibility',
        'Reward sequence controls',
      ]}
    />
  );
}
