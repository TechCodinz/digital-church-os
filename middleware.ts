import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && token?.role !== 'CHURCH_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
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
    '/journal/:path*',
    '/onboarding/:path*',
    '/api/live-chat',
  ],
};
