import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { clerkEnabled } from '@/lib/auth'

/**
 * Clerk middleware — required for `auth()` / `<SignedIn>` / `<SignedOut>` and
 * server-side user lookups. When Clerk isn't configured (no real key), this
 * becomes a no-op pass-through so the app still boots for UI preview instead
 * of redirecting to a non-existent Clerk handshake domain.
 */
export default clerkEnabled ? clerkMiddleware() : () => NextResponse.next()

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
