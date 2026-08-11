import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

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

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const adminUi = churchAdminUiPrefixes.some((prefix) => matchesPrefix(path, prefix));
    if (adminUi && token?.role !== 'CHURCH_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    const adminApi = churchAdminApiPrefixes.some((prefix) => matchesPrefix(path, prefix));
    if (adminApi && token?.role !== 'CHURCH_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Church-ops persistence deliberately does NOT use the global CHURCH_ADMIN
    // role as its tenant authorization decision. Middleware guarantees an
    // authenticated identity; each API request then verifies church ownership
    // or church_profile_members access for the requested church.
    if (path.startsWith('/api/church-ops') && !token?.sub) {
      return NextResponse.json({ error: 'Authenticated church workspace access required' }, { status: 401 });
    }

    if (path.startsWith('/api/ai') && !['CHURCH_ADMIN', 'AI_DEPARTMENT', 'MEMBER'].includes(token?.role as string)) {
      return NextResponse.json({ error: 'Authenticated member access required' }, { status: 403 });
    }

    const res = NextResponse.next();
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=(self)');

    return res;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

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
    '/api/conferences/:path*',
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
    '/live-service/:path*',
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
