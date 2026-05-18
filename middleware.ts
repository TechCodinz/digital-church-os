import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes — CHURCH_ADMIN only
    if (path.startsWith('/admin') && token?.role !== 'CHURCH_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // AI department routes — Admin or AI_DEPARTMENT role only
    if (path.startsWith('/ai') && !['CHURCH_ADMIN', 'AI_DEPARTMENT'].includes(token?.role as string)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Authenticated page routes — any valid session passes
    const res = NextResponse.next();

    // Add security headers to all responses
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

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
    '/api/ai/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/offerings/:path*',
    '/prayer-room',
    '/offering',
    '/community-wall',
    '/profile/:path*',
    '/children/:path*',
    '/spiritual/:path*',
    '/journal/:path*',
    '/onboarding/:path*',
    '/api/live-chat',
  ],
};
