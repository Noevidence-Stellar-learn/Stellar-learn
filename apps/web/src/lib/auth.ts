/**
 * Auth configuration helper.
 *
 * Clerk is optional for local development: if no real publishable key is set,
 * the app boots without auth so the UI (e.g. /game) is viewable offline.
 * Add real keys from https://dashboard.clerk.com to apps/web/.env.local to
 * enable sign-in, the dashboard, and protected routes.
 *
 * NEXT_PUBLIC_ vars are inlined at build time, so this works in both server
 * and client components.
 */
export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''

/** True only when a real-looking Clerk key is configured (not blank/placeholder). */
export const clerkEnabled =
  clerkPublishableKey.startsWith('pk_') && !clerkPublishableKey.includes('Y2xlcmsuZXhhbXBsZS5jb20')
