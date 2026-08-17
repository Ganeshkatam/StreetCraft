import { type NextRequest } from 'next/server';
import { updateSession } from './src/lib/supabase/middleware';

/**
 * StreetCraft Root Next.js Middleware
 * Intercepts requests to maintain fresh Supabase Auth sessions and enforce route boundaries.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (HMR WebSocket & chunks)
     * - favicon.ico (favicon file)
     * - static extensions: css, js, map, json, svg, png, jpg, jpeg, gif, webp, woff, woff2, ttf, txt, ico
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map|woff|woff2|ttf|ico|json|txt)$).*)',
  ],
};
