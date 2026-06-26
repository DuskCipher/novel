import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to the root URL "/"
  if (request.nextUrl.pathname === '/') {
    // Check if user has passed the Valora Hub before
    const hasPassedHub = request.cookies.get('valora_hub_passed');
    
    // If not, redirect to the Valora Home gateway
    if (!hasPassedHub) {
      return NextResponse.redirect(new URL('/valora', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/', // Only run middleware on the root path
};
