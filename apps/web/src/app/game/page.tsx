import { redirect } from 'next/navigation'

/**
 * /game — canonical entry point into playable gameplay.
 *
 * The real game lives at /world/[worldId]/level/[levelId] (Phaser via
 * GameCanvas). This route simply forwards players into World 1 so every
 * "Play" path lands in an interactive level. The old static UI mockup that
 * used to render here now lives at /design-preview.
 */
export default function GamePage() {
  redirect('/world/origin-plains/level/1')
}
