import { SignUp } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { clerkEnabled } from '@/lib/auth'

export const metadata = { title: 'Start Your Adventure — Stellar Learn' }

/**
 * /sign-up — renders Clerk's hosted sign-up form when auth is configured.
 * Without Clerk keys there is no account to create, so we drop the visitor
 * straight into the playable game UI instead of showing a dead/404 route.
 */
export default function SignUpPage() {
  if (!clerkEnabled) redirect('/game')

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12">
      <SignUp appearance={{ variables: { colorPrimary: '#7b5ea7' } }} />
    </main>
  )
}
