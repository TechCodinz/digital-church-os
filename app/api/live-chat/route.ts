import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const disabledResponse = () => NextResponse.json({
  error: 'Legacy global live chat is disabled because it is not scoped to a church or broadcast room.',
  code: 'TENANT_BROADCAST_SCOPE_REQUIRED',
  nextSteps: ['/service-response', '/prayer-room'],
}, {
  status: 410,
  headers: { 'Cache-Control': 'no-store' },
});

/**
 * The legacy LiveChatMessage model has no church/broadcast-room identity.
 * Returning or accepting those records on a tenant service page would mix
 * messages between churches. Keep the endpoint closed until a scoped room
 * model and membership checks are implemented.
 */
export async function GET() {
  return disabledResponse();
}

export async function POST() {
  return disabledResponse();
}
