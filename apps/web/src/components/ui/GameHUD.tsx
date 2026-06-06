'use client'

import { Coin } from './Coin'

interface GameHUDProps {
  /** XP bar fill, 0–100 */
  xp?: number
  level?: number
  worldName?: string
  worldEmoji?: string
  xlm?: number
  quests?: string
  /** boss battle mode shows the HP bar + nameplate and hides the prompt */
  bossMode?: boolean
  bossName?: string
  bossHp?: number
  hp?: number
  prompt?: string
  promptKey?: string
  onPrompt?: () => void
}

/**
 * GameHUD — the heads-up display overlay that sits above the game canvas:
 * XP bar with liquid teal fill, top-right info chips, an interaction prompt,
 * and a toggleable boss nameplate + HP bar. Pointer-events pass through the
 * empty regions to the game underneath.
 */
export function GameHUD({
  xp = 64,
  level = 7,
  worldName = 'ORIGIN PLAINS',
  worldEmoji = '🌲',
  xlm = 128,
  quests = '3/5',
  bossMode = false,
  bossName = 'THE DOUBT WRAITH',
  bossHp = 72,
  hp = 80,
  prompt = 'Read the ancient rune to begin a lesson',
  promptKey = 'E',
  onPrompt,
}: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {/* left stat bars */}
      <div className="absolute left-[18px] top-[18px] flex flex-col gap-2 [&>*]:pointer-events-auto">
        <div className="pixel-statbar">
          <span className="icon">⭐</span>
          <span className="fill" style={{ width: `${xp}%` }} />
          <span className="lbl">XP</span>
          <span className="lvl">LV {level}</span>
        </div>
        {bossMode && (
          <div className="pixel-statbar hp">
            <span className="icon">❤️</span>
            <span className="fill" style={{ width: `${hp}%` }} />
            <span className="lbl">HP</span>
          </div>
        )}
      </div>

      {/* top-right chips */}
      <div className="absolute right-[18px] top-[18px] flex flex-col items-end gap-[10px] [&>*]:pointer-events-auto">
        <div className="pixel-chip">
          <span className="em">{worldEmoji}</span>
          <span>
            WORLD 1 · <span className="v">{worldName}</span>
          </span>
        </div>
        <div className="pixel-chip">
          <Coin scale={0.8} />
          <span className="v">{xlm}</span> <span>XLM</span>
        </div>
        <div className="pixel-chip">
          <span className="em">📜</span>
          <span>
            QUESTS <span className="v">{quests}</span>
          </span>
        </div>
      </div>

      {/* boss nameplate */}
      {bossMode && (
        <div className="absolute left-1/2 top-[14px] flex w-[560px] -translate-x-1/2 flex-col items-center gap-[6px] [&>*]:pointer-events-auto">
          <div
            className="font-pixel text-[12px] tracking-[2px]"
            style={{ color: '#ff8a98', textShadow: '2px 2px 0 #07071a' }}
          >
            ⚔ {bossName} ⚔
          </div>
          <div className="pixel-statbar hp w-[560px]">
            <span className="fill" style={{ width: `${bossHp}%` }} />
            <span className="lbl">BOSS</span>
          </div>
        </div>
      )}

      {/* interaction prompt */}
      {!bossMode && (
        <button
          type="button"
          onClick={onPrompt}
          className="pixel-prompt pointer-events-auto absolute bottom-6 left-1/2 animate-bob"
        >
          <span className="pixel-kbd">{promptKey}</span> {prompt}
        </button>
      )}
    </div>
  )
}
