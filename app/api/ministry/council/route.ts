import { NextResponse } from 'next/server';
import { getCouncilBriefing } from '@/lib/ministry-os/ministryCouncil';

export async function GET() {
  return NextResponse.json(getCouncilBriefing());
}
