'use client'

import { useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'

interface GameCanvasProps {
  worldId: string
  levelId: string
  characterId?: string
  onQuestTriggered: (questIndex: number) => void
  onXPUpdate: (xp: number) => void
}

/**
 * GameCanvas — mounts the Phaser game inside a Next.js client component.
 * Phaser is dynamically imported to avoid SSR issues (no window on server).
 */
export function GameCanvas({
  worldId,
  levelId,
  characterId = 'warrior',
  onQuestTriggered,
  onXPUpdate,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    let game: Phaser.Game | null = null

    const initGame = async () => {
      const Phaser = (await import('phaser')).default
      const { BootScene, WorldMapScene, LevelScene, DEFAULT_PHASER_CONFIG } = await import(
        '@stellar-learn/game-engine'
      )

      game = new Phaser.Game({
        ...DEFAULT_PHASER_CONFIG,
        parent: containerRef.current!,
        scene: [BootScene, WorldMapScene, LevelScene],
      })

      // Tell BootScene to boot straight into the level (set before boot runs)
      // so only LevelScene is active — WorldMapScene never starts here.
      game.registry.set('bootScene', 'LevelScene')
      game.registry.set('bootData', { worldId, levelId, characterId })

      game.events.on('quest-triggered', ({ questIndex }: { questIndex: number }) => {
        onQuestTriggered(questIndex)
      })

      game.events.on('xp-updated', (xp: number) => {
        onXPUpdate(xp)
      })

      game.events.once('ready', () => {
        setIsLoading(false)
      })

      gameRef.current = game
    }

    void initGame()

    return () => {
      game?.destroy(true)
      gameRef.current = null
    }
  }, [worldId, levelId, characterId, onQuestTriggered, onXPUpdate])

  // Tell the game to resume when a quest panel is closed
  const resumeGame = () => {
    gameRef.current?.events.emit('quest-closed')
  }

  return (
    <div className="game-canvas-container h-[100svh] min-h-[420px] w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-dark">
          <div className="font-pixel text-xs text-brand-gold animate-pulse">Loading world...</div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
