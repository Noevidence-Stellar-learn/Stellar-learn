import { world1 } from './world-1-origin-plains'
import { world2 } from './world-2-wallet-kingdom'
import { world3 } from './world-3-asset-forge'
import type { World } from '../curriculum/types'

export const worlds: World[] = [world1, world2, world3]

export { world1, world2, world3 }

// Placeholder exports for worlds to be contributed by the community
// See CONTRIBUTING.md — each world is a separate contribution opportunity
export const worldSlugs = [
  'origin-plains',        // World 1 ✅
  'wallet-kingdom',       // World 2 — open for contribution
  'asset-forge',          // World 3 — open for contribution
  'trading-bazaar',       // World 4 — open for contribution
  'payment-realm',        // World 5 — open for contribution
  'soroban-citadel',      // World 6 — open for contribution
] as const

export type WorldSlug = typeof worldSlugs[number]
