# Stellar Learn — Claude Code Context

## What This Project Is

An open-source gamified web app that teaches Stellar blockchain development through a 2D pixel-art adventure game. Players explore themed worlds, complete quests (lessons/quizzes/coding challenges), and interact with the real Stellar testnet.

## Monorepo Structure

```
apps/web/          → Next.js 14 app (App Router, TypeScript)
packages/
  content/         → All lesson curriculum (worlds, quests, quiz questions)
  game-engine/     → Phaser.js 3 game scenes and systems
  stellar-sdk/     → Stellar network utilities (accounts, payments, assets)
  database/        → Prisma schema + client (PostgreSQL)
  config/          → Shared ESLint, TypeScript, Tailwind configs
  ui/              → Shared React components
```

## Key Commands

```bash
npm run dev          # Start all apps in dev mode (Turborepo)
npm run build        # Build all packages
npm run typecheck    # TypeScript check across monorepo
npm run lint         # ESLint across monorepo
npm run test         # Vitest tests
npm run db:push      # Push Prisma schema to DB
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Game Engine**: Phaser.js 3 (SSR-safe: dynamic import only in client components)
- **Auth**: Clerk
- **Database**: PostgreSQL via Prisma (Neon in prod)
- **Cache/Leaderboard**: Upstash Redis
- **State**: Zustand (game state) + TanStack Query (server state)
- **Styling**: Tailwind CSS + Framer Motion
- **Stellar**: @stellar/stellar-sdk, @stellar/freighter-api
- **Code Editor**: @monaco-editor/react (for in-game coding challenges)
- **Monorepo**: Turborepo + npm workspaces

## Critical Rules

1. **Phaser must NEVER be imported at the top level** in any file rendered on the server.
   Always use `dynamic import()` inside `useEffect` or Next.js `dynamic()`. See `GameCanvas.tsx`.

2. **The `packages/content/` package is the source of truth** for all curriculum.
   Never hardcode lesson text in React components.

3. **All Stellar operations use the testnet by default** (`NEXT_PUBLIC_STELLAR_NETWORK=testnet`).
   Guard every mainnet operation explicitly.

4. **Package naming**: internal packages use `@stellar-learn/` prefix.
   Import as `@stellar-learn/stellar`, `@stellar-learn/content`, etc.

5. **Game ↔ React communication** happens exclusively through `this.game.events.emit()` (Phaser → React)
   and `game.events.emit()` (React → Phaser). Never access React state from Phaser directly.

## Architecture Decisions

- **Why Phaser over a React game library?** Phaser gives us full spritesheet, tilemap, and physics
  support needed for the craftpix pixel art assets. React libraries can't handle Tiled maps well.

- **Why Turborepo?** With hundreds of contributors, package isolation prevents accidental coupling.
  A content contributor never needs to touch the game engine.

- **Why Clerk over NextAuth?** Faster setup, built-in UI, handles social + email out of the box.

- **Why Upstash Redis for leaderboard?** Sorted sets are the natural data structure for rankings.
  Upstash is serverless-compatible (no persistent connection required in Edge/Vercel).

## Contributor Onboarding

New contributors should start with:
1. Read `CONTRIBUTING.md`
2. Pick a `good-first-issue` label on GitHub
3. The most impactful contribution is adding world content in `packages/content/src/worlds/`
4. Follow the `world-1-origin-plains.ts` file as the template
