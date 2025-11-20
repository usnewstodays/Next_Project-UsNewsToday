import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_HEADERS } from '@/lib/security';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add cache control headers
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp)$/)) {
    // Static assets - cache for 1 year
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (request.nextUrl.pathname.startsWith('/api/')) {
    // API routes - minimal cache
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  } else {
    // Pages - moderate cache
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
