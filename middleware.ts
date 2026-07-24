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
    '/api/admin/:path*',
    '/api/user/:path*',
  ],
};
