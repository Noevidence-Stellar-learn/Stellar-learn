import { SignIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { clerkEnabled } from '@/lib/auth'

export const metadata = { title: 'Sign In — Stellar Learn' }

/**
 * /sign-in — renders Clerk's hosted sign-in form when auth is configured.
 * Without Clerk keys there is nothing to sign into, so we send the visitor
 * straight into the playable game UI instead of showing a dead/404 route.
 */
export default function SignInPage() {
  if (!clerkEnabled) redirect('/game')

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12">
      <SignIn appearance={{ variables: { colorPrimary: '#7b5ea7' } }} />
    </main>
  )
}
