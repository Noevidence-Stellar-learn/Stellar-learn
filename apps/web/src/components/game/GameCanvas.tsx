'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type Phaser from 'phaser'

interface GameCanvasProps {
  worldId: string
  levelId: string
  characterId?: string
  onQuestTriggered: (questIndex: number) => void
  onXPUpdate: (xp: number) => void
}

export interface GameCanvasHandle {
  /** Notify the game a quest panel closed; `completed` retires its rune. */
  questClosed: (questIndex: number, completed: boolean) => void
  /** Push already-completed quest indices (persisted progress) into the game. */
  syncCompletedQuests: (indices: number[]) => void
}

/**
 * GameCanvas — mounts the Phaser game inside a Next.js client component.
 * Phaser is dynamically imported to avoid SSR issues (no window on server).
 */
export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(function GameCanvas(
  { worldId, levelId, characterId = 'warrior', onQuestTriggered, onXPUpdate },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // The level scene registers its event listeners during create(); anything
  // emitted before 'level-ready' would be lost, so buffer the progress sync.
  const levelReadyRef = useRef(false)
  const pendingSyncRef = useRef<number[] | null>(null)

  useImperativeHandle(ref, () => ({
    questClosed(questIndex: number, completed: boolean) {
      gameRef.current?.events.emit('quest-closed', { questIndex, completed })
    },
    syncCompletedQuests(indices: number[]) {
      if (levelReadyRef.current && gameRef.current) {
        gameRef.current.events.emit('quests-synced', indices)
      } else {
        pendingSyncRef.current = indices
      }
    },
  }))

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

      game.events.on('level-ready', () => {
        levelReadyRef.current = true
        if (pendingSyncRef.current) {
          game?.events.emit('quests-synced', pendingSyncRef.current)
          pendingSyncRef.current = null
        }
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
      levelReadyRef.current = false
    }
  }, [worldId, levelId, characterId, onQuestTriggered, onXPUpdate])

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
})
