import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Check for custom admin session cookie
  const adminSession = request.cookies.get('admin_session');
  const pathname = request.nextUrl.pathname;
  const isProtectedAdminPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/protected') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/notes');

  // If using custom admin session, validate it's not blocked on protected admin paths
  if (adminSession && isProtectedAdminPath) {
    try {
      const { data: adminUser } = await supabase
        .from('adminusers')
        .select('user_id, is_blocked')
        .eq('user_id', adminSession.value)
        .single();

      if (!adminUser || (adminUser as any).is_blocked) {
        // Clear cookie and redirect to login with a hint
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('blocked', '1');
        const redirectResponse = NextResponse.redirect(url);
        // Copy over supabase cookies to avoid session desync
        for (const c of supabaseResponse.cookies.getAll()) {
          redirectResponse.cookies.set(c.name, c.value);
        }
        // Explicitly clear the custom admin cookie
        redirectResponse.cookies.set('admin_session', '', {
          expires: new Date(0),
          path: '/',
        });
        return redirectResponse;
      }
    } catch {
      // On error validating admin session, be safe and redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      const redirectResponse = NextResponse.redirect(url);
      for (const c of supabaseResponse.cookies.getAll()) {
        redirectResponse.cookies.set(c.name, c.value);
      }
      redirectResponse.cookies.set('admin_session', '', {
        expires: new Date(0),
        path: '/',
      });
      return redirectResponse;
    }
  }

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !adminSession &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") 
  ) {
    // no user and no admin session, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
