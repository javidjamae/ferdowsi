import { NextRequest, NextResponse } from 'next/server';

// Admin gate: a single env password (ADMIN_SECRET) exchanged for a cookie at
// /admin/login. Deliberately simple — no auth provider, no user table. In
// `next dev` with ADMIN_SECRET unset, the gate is open so you can explore
// immediately; in production an unset ADMIN_SECRET locks /admin entirely.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'development') return NextResponse.next();
    return new NextResponse('Set ADMIN_SECRET to enable the admin dashboard.', { status: 503 });
  }

  const cookie = request.cookies.get('ferdowsi_admin')?.value;
  if (cookie === secret) return NextResponse.next();

  const login = request.nextUrl.clone();
  login.pathname = '/admin/login';
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
