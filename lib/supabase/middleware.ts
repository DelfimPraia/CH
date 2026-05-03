import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/auth/callback', '/install'];

type CookieToSet = { name: string; value: string; options: CookieOptions };

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  // Supabase SSR cookies are named like `sb-<project-ref>-auth-token` (and chunked variants).
  return request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = isPublicPath(path);
  const hasAuth = hasSupabaseAuthCookie(request);

  // Fast path: anonymous visitor on a public route — skip Supabase round trip entirely.
  // Saves ~100–300ms on every cold/first request from far regions (e.g. Angola → Frankfurt).
  if (isPublic && !hasAuth) {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isPublic) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = '/login';
      redirect.searchParams.set('redirect', path);
      return NextResponse.redirect(redirect);
    }

    return supabaseResponse;
  } catch (err) {
    console.error('[middleware] supabase session refresh failed:', err);
    return supabaseResponse;
  }
}
