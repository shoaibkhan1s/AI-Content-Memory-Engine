import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that don't need auth
  const isPublicRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/api/auth');

  // If there's no auth token and the user is trying to access a protected route or the root
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/signup', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user has a token and is trying to access auth pages
  if (token && isPublicRoute) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
