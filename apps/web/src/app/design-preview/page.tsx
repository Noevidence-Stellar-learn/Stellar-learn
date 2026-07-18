import type { Metadata } from 'next'
import { GameShell } from '@/components/ui/GameShell'

export const metadata: Metadata = {
  title: 'Stellar Learn — Design Preview',
  description:
    'Static design preview of the Stellar Learn pixel-art UI: main menu, character select, world map, gameplay HUD, quests and achievements. Not the playable game.',
}

/**
 * /design-preview — the static pixel UI shell from the original design handoff.
 *
 * This is a style/dev preview only: the GAMEPLAY screen is a CSS mockup, not
 * the Phaser game. The playable game is at /world/[worldId]/level/[levelId]
 * (canonical entry: /game).
 */
export default function DesignPreviewPage() {
  return <GameShell />
}
