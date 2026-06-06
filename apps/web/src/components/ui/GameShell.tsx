'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { StarField } from './StarField'
import { MainMenu } from './MainMenu'
import { CharacterSelect } from './CharacterSelect'
import { WorldMap } from './WorldMap'
import { GameplayScene } from './GameplayScene'
import { GameHUD } from './GameHUD'
import { Achievements } from './Achievements'
import { QuestModal } from './QuestModal'

type Screen = 'menu' | 'chars' | 'map' | 'play' | 'ach'

const SCREENS: { id: Screen; label: string }[] = [
  { id: 'menu', label: 'MENU' },
  { id: 'chars', label: 'CHARACTERS' },
  { id: 'map', label: 'MAP' },
  { id: 'play', label: 'GAMEPLAY' },
  { id: 'ach', label: 'BADGES' },
]

/**
 * GameShell — recreates the design prototype: a fixed 1280×720 pixel "game"
 * canvas scaled to fit the viewport, a cosmic backdrop, the five screens
 * wired into a flow, plus the quest modal and a boss-HUD toggle. The dark
 * prototype bar below the canvas (chrome, not game UI) jumps between screens.
 */
export function GameShell() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [questOpen, setQuestOpen] = useState(false)
  const [boss, setBoss] = useState(false)
  const [xp, setXp] = useState(64)
  const [scale, setScale] = useState(1)
  const gameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fit = () => {
      const pad = 24
      const barH = 70
      setScale(Math.min((window.innerWidth - pad) / 1280, (window.innerHeight - pad - barH) / 720))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const goto = (s: Screen) => {
    setScreen(s)
    if (s !== 'play') setQuestOpen(false)
  }

  const openQuest = () => {
    setScreen('play')
    setQuestOpen(true)
  }

  const toggleBoss = () => {
    setScreen('play')
    setBoss((b) => !b)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background:
          'radial-gradient(1200px 700px at 50% -10%, #1d1640 0%, transparent 60%),' +
          'radial-gradient(900px 600px at 80% 110%, #16243f 0%, transparent 55%), #07071a',
      }}
    >
      <div
        ref={gameRef}
        className="relative overflow-hidden"
        style={{
          width: 1280,
          height: 720,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: '#0d0d2b',
          boxShadow: '0 0 0 4px #07071a, 0 0 0 8px #20203c, 0 24px 80px rgba(0,0,0,.6)',
          imageRendering: 'pixelated',
        }}
      >
        <StarField />

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {screen === 'menu' && (
              <MainMenu
                onNewGame={() => goto('chars')}
                onContinue={() => goto('map')}
                onAchievements={() => goto('ach')}
              />
            )}
            {screen === 'chars' && (
              <CharacterSelect onBack={() => goto('menu')} onEmbark={() => goto('map')} />
            )}
            {screen === 'map' && (
              <WorldMap onBack={() => goto('menu')} onEnterWorld={() => goto('play')} />
            )}
            {screen === 'play' && (
              <>
                <GameplayScene />
                <GameHUD xp={xp} bossMode={boss} onPrompt={openQuest} />
              </>
            )}
            {screen === 'ach' && <Achievements onBack={() => goto('menu')} />}
          </motion.div>
        </AnimatePresence>

        <QuestModal
          open={questOpen}
          onClose={() => setQuestOpen(false)}
          onComplete={() => setXp((v) => Math.min(100, v + 12))}
        />
      </div>

      {/* prototype bar — chrome, not part of the game */}
      <nav
        className="fixed bottom-[14px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[6px] rounded-[10px] px-2 py-[7px] font-pixel"
        style={{ background: '#0a0a18', border: '1px solid #2a2a46', boxShadow: '0 10px 40px rgba(0,0,0,.6)' }}
      >
        <span className="px-[6px] text-[7px] text-[#6a6a8a]">SCREENS</span>
        {SCREENS.map((s) => (
          <ProtoBtn key={s.id} active={screen === s.id} onClick={() => goto(s.id)}>
            {s.label}
          </ProtoBtn>
        ))}
        <span className="mx-[2px] h-[22px] w-px bg-[#2a2a46]" />
        <ProtoBtn active={questOpen} accent onClick={() => (questOpen ? setQuestOpen(false) : openQuest())}>
          QUEST MODAL
        </ProtoBtn>
        <ProtoBtn active={boss} accent onClick={toggleBoss}>
          BOSS HUD
        </ProtoBtn>
      </nav>
    </div>
  )
}

function ProtoBtn({
  children,
  active,
  accent,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  accent?: boolean
  onClick?: () => void
}) {
  const base =
    'cursor-pointer rounded-[6px] px-[10px] py-2 font-pixel text-[8px] tracking-[.5px] whitespace-nowrap transition-colors'
  const style: React.CSSProperties = active
    ? accent
      ? { background: '#00bcd4', color: '#07071a', border: '1px solid #7df0ff' }
      : { background: '#7b5ea7', color: '#fff', border: '1px solid #9b7ec7' }
    : { background: '#15152a', color: '#b9b9d6', border: '1px solid #2c2c4a' }

  return (
    <button type="button" onClick={onClick} className={base} style={style}>
      {children}
    </button>
  )
}
