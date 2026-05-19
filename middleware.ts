import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && token?.role !== 'CHURCH_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if ((path.startsWith('/command-center') || path.startsWith('/api/command-center')) && token?.role !== 'CHURCH_ADMIN') {
      return path.startsWith('/api/')
        ? NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        : NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (path.startsWith('/api/admin') && token?.role !== 'CHURCH_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/ai/:path*',
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
    '/journey/:path*',
    '/care/:path*',
    '/council/:path*',
    '/intelligence/:path*',
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
    '/church-network/:path*',
    '/impact/:path*',
    '/bible-games/:path*',
    '/sanctuary-host/:path*',
    '/command-center/:path*',
    '/journal/:path*',
    '/onboarding/:path*',
    '/api/live-chat',
  ],
};
