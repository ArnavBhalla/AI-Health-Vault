import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData } from './lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    try {
      const response = NextResponse.next();
      const session = await getIronSession<SessionData>(request, response, {
        password: process.env.SESSION_SECRET as string,
        cookieName: 'ai-health-vault-session',
      });

      if (!session.isLoggedIn || !session.userId) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect logged-in users away from login/register pages
  if (pathname === '/login' || pathname === '/register') {
    try {
      const response = NextResponse.next();
      const session = await getIronSession<SessionData>(request, response, {
        password: process.env.SESSION_SECRET as string,
        cookieName: 'ai-health-vault-session',
      });

      if (session.isLoggedIn && session.userId) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Continue to login/register page if session check fails
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
