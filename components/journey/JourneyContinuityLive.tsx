'use client';

import { useEffect, useState } from 'react';
import { JourneyContinuityPanel } from '@/components/journey/JourneyContinuityPanel';

export function JourneyContinuityLive() {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener('digital-church:journey-updated', refresh);
    return () => window.removeEventListener('digital-church:journey-updated', refresh);
  }, []);

  return <JourneyContinuityPanel key={revision} />;
}
