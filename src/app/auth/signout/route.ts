import { createClient } from '../../../lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Sign-Out Route Handler
 * Terminates the authenticated Supabase session and clears all session cookies.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL('/login', requestUrl.origin), {
    status: 303, // See Other: forces GET request on redirect
  });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL('/login', requestUrl.origin), {
    status: 303,
  });
}
