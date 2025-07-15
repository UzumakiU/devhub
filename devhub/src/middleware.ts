import { NextRequest, NextResponse } from 'next/server'
import { featureFlags } from '@/lib/config'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Define route to feature flag mapping
  const routeFeatureMap: Record<string, boolean> = {
    '/projects': featureFlags.projects,
    '/customers': featureFlags.customers,
    '/invoices': featureFlags.invoices,
    '/crm': featureFlags.crm,
    '/dashboard': featureFlags.dashboard,
    '/database': featureFlags.database,
    // Add more routes as needed
  }

  // Check if the current path matches a disabled feature
  for (const [route, isEnabled] of Object.entries(routeFeatureMap)) {
    if (pathname.startsWith(route) && !isEnabled) {
      // Redirect to CRM (our main focus) or dashboard
      const redirectUrl = featureFlags.crm ? '/crm' : '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
