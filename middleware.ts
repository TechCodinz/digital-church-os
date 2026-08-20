import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

const churchAdminUiPrefixes = [
  '/admin',
  '/ministry-command-center',
  '/leader-onboarding',
  '/intelligence',
  '/council',
  '/media-rights',
  '/release-readiness',
];

const churchAdminApiPrefixes = [
  '/api/admin',
  '/api/command-center',
  '/api/media-rights',
  '/api/release',
];

// These are experience surfaces first. They may offer authenticated actions,
// but the page itself must remain visitable when a visitor has no session or
// when production authentication has not yet been configured. Sensitive data
// remains behind the authenticated API routes below.
const publicExperiencePrefixes = [
  '/prayer-room',
  '/offering',
  '/community-wall',
  '/care',
  '/journey',
  '/growth-dna',
  '/formation',
  '/next-steps',
  '/service-response',
  '/dream-discernment',
  '/family-altar',
  '/fasting-prayer',
  '/fasting',
  '/prayer-practice',
  '/daily-guide',
  '/spiritual',
  '/sermons',
  '/choir',
  '/worship-media',
  '/live-broadcast',
  '/scripture',
  '/presentation',
  '/rewards',
  '/activities',
  '/conference-sponsorship',
  '/church-network',
  '/impact',
  '/bible-games',
  '/sanctuary-host',
  '/marketplace',
  '/website-builder',
  '/multilingual',
  '/mobile',
  '/journal',
  '/onboarding',
];

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=(self)');
  return response;
}

function signInRedirect(req: NextRequest, reason?: string) {
  const url = new URL('/auth/signin', req.url);
  url.searchParams.set('callbackUrl', `${req.nextUrl.pathname}${req.nextUrl.search}`);
  if (reason) url.searchParams.set('reason', reason);
  return withSecurityHeaders(NextResponse.redirect(url));
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isApi = path.startsWith('/api/');
  const publicExperience = publicExperiencePrefixes.some((prefix) => matchesPrefix(path, prefix));

  // Public sanctuary pages must never collapse into NextAuth's Configuration
  // error just because a deployment secret is missing. Authenticated actions
  // on those pages still call protected APIs and therefore still fail closed.
  if (!isApi && publicExperience) {
    return withSecurityHeaders(NextResponse.next());
  }

  const authSecret = process.env.NEXTAUTH_SECRET;
  if (!authSecret) {
    if (isApi) {
      return withSecurityHeaders(
        NextResponse.json(
          {
            error: 'Authentication is temporarily unavailable',
            code: 'AUTH_NOT_CONFIGURED',
          },
          { status: 503 },
        ),
      );
    }
    return signInRedirect(req, 'auth-unavailable');
  }

  const token = await getToken({ req, secret: authSecret });
  if (!token) {
    if (isApi) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
      );
    }
    return signInRedirect(req);
  }

  const adminUi = churchAdminUiPrefixes.some((prefix) => matchesPrefix(path, prefix));
  if (adminUi && token.role !== 'CHURCH_ADMIN') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', req.url)));
  }

  const adminApi = churchAdminApiPrefixes.some((prefix) => matchesPrefix(path, prefix));
  if (adminApi && token.role !== 'CHURCH_ADMIN') {
    return withSecurityHeaders(
      NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    );
  }

  // Church-ops persistence deliberately does NOT use the global CHURCH_ADMIN
  // role as its tenant authorization decision. Middleware guarantees an
  // authenticated identity; each API request then verifies church ownership
  // or church_profile_members access for the requested church.
  if (path.startsWith('/api/church-ops') && !token.sub) {
    return withSecurityHeaders(
      NextResponse.json({ error: 'Authenticated church workspace access required' }, { status: 401 }),
    );
  }

  if (path.startsWith('/api/ai') && !['CHURCH_ADMIN', 'AI_DEPARTMENT', 'MEMBER'].includes(token.role as string)) {
    return withSecurityHeaders(
      NextResponse.json({ error: 'Authenticated member access required' }, { status: 403 }),
    );
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ministry-command-center/:path*',
    '/minister-portal/:path*',
    '/prayer-watch/:path*',
    '/leader-onboarding/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/ai/:path*',
    '/api/church-ops/:path*',
    '/api/user/:path*',
    '/api/offerings/:path*',
    '/api/aid/:path*',
    '/api/care/:path*',
    '/api/journey/:path*',
    '/api/ministry/:path*',
    '/api/scripture/:path*',
    '/api/presentation/:path*',
    '/api/rewards/:path*',
    '/api/activities/:path*',
    '/api/gifts/:path*',
    '/api/workers/:path*',
    '/api/network/:path*',
    '/api/impact/:path*',
    '/api/games/:path*',
    '/api/sanctuary/:path*',
    '/api/command-center/:path*',
    '/api/marketplace/:path*',
    '/api/broadcast/:path*',
    '/api/worship/:path*',
    '/api/media-rights/:path*',
    '/api/release/:path*',
    '/aid-request',
    '/prayer-room',
    '/offering',
    '/community-wall',
    '/profile/:path*',
    '/children/:path*',
    '/spiritual/:path*',
    '/sermons/:path*',
    '/choir/:path*',
    '/live-broadcast/:path*',
    '/worship-media/:path*',
    '/journey/:path*',
    '/growth-dna/:path*',
    '/formation/:path*',
    '/next-steps/:path*',
    '/service-response/:path*',
    '/dream-discernment/:path*',
    '/family-altar/:path*',
    '/fasting-prayer/:path*',
    '/fasting/:path*',
    '/prayer-practice/:path*',
    '/daily-guide/:path*',
    '/care/:path*',
    '/council/:path*',
    '/intelligence/:path*',
    '/service-planner/:path*',
    '/communications/:path*',
    '/facilities/:path*',
    '/testimonies/:path*',
    '/outreach/:path*',
    '/departments/:path*',
    '/requests/:path*',
    '/marketplace/:path*',
    '/website-builder/:path*',
    '/multilingual/:path*',
    '/mobile/:path*',
    '/scripture/:path*',
    '/presentation/:path*',
    '/rewards/:path*',
    '/activities/:path*',
    '/gifts/:path*',
    '/workers/:path*',
    '/groups/:path*',
    '/events/:path*',
    '/follow-up/:path*',
    '/attendance/:path*',
    '/church-team/:path*',
    '/conference-sponsorship/:path*',
    '/church-network/:path*',
    '/impact/:path*',
    '/bible-games/:path*',
    '/sanctuary-host/:path*',
    '/command-center/:path*',
    '/media-rights/:path*',
    '/release-readiness/:path*',
    '/journal/:path*',
    '/onboarding/:path*',
    '/api/live-chat',
  ],
};
