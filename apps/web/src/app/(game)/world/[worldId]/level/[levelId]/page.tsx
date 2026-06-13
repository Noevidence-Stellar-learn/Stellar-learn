'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameCanvas } from '@/components/game/GameCanvas'
import { QuestPanel } from '@/components/game/QuestPanel'
import { worlds } from '@stellar-learn/content'
import type { Quest } from '@stellar-learn/content'

interface PageProps {
  params: { worldId: string; levelId: string }
}

export default function LevelPage({ params }: PageProps) {
  const { worldId, levelId } = params
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null)
  const [xp, setXP] = useState(0)
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set())

  const world = worlds.find((w) => w.slug === worldId)

  // Load any saved XP / completed quests for the signed-in player on entry.
  useEffect(() => {
    let cancelled = false
    fetch('/api/progress')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { xp?: number; progress?: { questId: string; status: string }[] } | null) => {
        if (cancelled || !data) return
        if (typeof data.xp === 'number') setXP(data.xp)
        if (Array.isArray(data.progress)) {
          setCompletedQuests(
            new Set(
              data.progress.filter((p) => p.status === 'COMPLETED').map((p) => p.questId)
            )
          )
        }
      })
      .catch(() => {
        /* not signed in / offline — start fresh */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleQuestTriggered = useCallback(
    (questIndex: number) => {
      const quest = world?.quests[questIndex]
      if (quest && !completedQuests.has(quest.id)) {
        setActiveQuest(quest)
      }
    },
    [world, completedQuests]
  )

  const handleQuestComplete = useCallback(async (questId: string, xpEarned: number) => {
    setCompletedQuests((prev) => new Set([...prev, questId]))
    setActiveQuest(null)
    setXP((prev) => prev + xpEarned) // optimistic; reconciled with server below

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, xpEarned }),
      })
      if (res.ok) {
        const data = (await res.json()) as { totalXP?: number }
        if (typeof data.totalXP === 'number') setXP(data.totalXP)
      }
    } catch {
      // not signed in / offline — keep the optimistic local XP
    }
  }, [])

  const handleQuestClose = useCallback(() => {
    setActiveQuest(null)
  }, [])

  if (!world) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark">
        <div className="font-pixel text-sm text-brand-gold/60">World not found</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-brand-dark">
      {/* HUD overlay */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div>
          <div className="font-pixel text-[10px] text-brand-gold/50">World {world.order}</div>
          <div className="font-pixel text-xs text-brand-gold">{world.title}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[10px] text-brand-gold/50">XP</span>
          <span className="font-pixel text-sm text-brand-gold-bright">{xp}</span>
        </div>
        <div className="font-pixel text-[10px] text-brand-gold/50">
          {completedQuests.size}/{world.quests.length} quests
        </div>
      </div>

      {/* Game Canvas */}
      <GameCanvas
        worldId={worldId}
        levelId={levelId}
        onQuestTriggered={handleQuestTriggered}
        onXPUpdate={setXP}
      />

      {/* Quest Panel Overlay */}
      <AnimatePresence>
        {activeQuest && (
          <QuestPanel
            quest={activeQuest}
            onComplete={handleQuestComplete}
            onClose={handleQuestClose}
          />
        )}
      </AnimatePresence>

      {/* XP gain notification */}
      <AnimatePresence>
        {xp > 0 && (
          <motion.div
            key={xp}
            className="pointer-events-none fixed bottom-20 right-8 font-pixel text-sm text-brand-gold-bright"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -60 }}
            transition={{ duration: 1.2 }}
          >
            +{xp} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
