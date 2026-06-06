import type { Metadata } from 'next'
import { GameShell } from '@/components/ui/GameShell'

export const metadata: Metadata = {
  title: 'Stellar Learn — Game UI',
  description:
    'The Stellar Learn pixel-art game UI: main menu, character select, world map, gameplay HUD, quests and achievements.',
}

/**
 * /game — the interactive pixel UI shell built from the Claude Design handoff.
 * Renders the full screen flow inside a scaled 1280×720 canvas.
 */
export default function GamePage() {
  return <GameShell />
}
