
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // If user is trying to access admin routes without a session, redirect to login
  if (pathname.startsWith('/admin') && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is logged in and trying to access login page, redirect to admin dashboard
  if (pathname.startsWith('/login') && sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
}
