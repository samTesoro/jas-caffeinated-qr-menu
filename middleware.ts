import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - customer (customer routes, no auth required)
     * Feel free to modify this pattern to include more paths.
     */
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - customer (customer routes, no auth required)
    // - api (public API routes)
    // - common image extensions
    '/((?!_next/static|_next/image|favicon.ico|customer|customer/|api|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
