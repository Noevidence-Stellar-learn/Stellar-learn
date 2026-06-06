'use client'

import { useState } from 'react'
import { WORLDS, type PixelWorld } from './pixel-data'
import { PixelButton } from './PixelButton'
import { PixelPanel, PixelStrip } from './PixelPanel'

interface WorldMapProps {
  onBack?: () => void
  onEnterWorld?: (worldIndex: number) => void
}

/**
 * WorldMap — the constellation map: 6 world nodes linked by glowing dotted
 * paths, each with completed / current-pulsing / locked states, plus a
 * per-world info panel.
 */
export function WorldMap({ onBack, onEnterWorld }: WorldMapProps) {
  const [selected, setSelected] = useState(1)
  const w = WORLDS[selected]
  const cleared = w.state === 'done'
  const open = w.state !== 'locked'

  return (
    <section className="absolute inset-0 flex flex-col">
      <div className="relative z-[2] px-14 pb-[18px] pt-12">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-pixel text-[9px] tracking-[3px] text-stellar-teal">
              YOUR JOURNEY
            </span>
            <span
              className="font-pixel text-[22px] tracking-[2px] text-brand-gold-bright"
              style={{ textShadow: '3px 3px 0 #07071a, 0 0 16px rgba(255,215,0,.3)' }}
            >
              THE CONSTELLATION MAP
            </span>
          </div>
          <PixelButton variant="ghost" sm onClick={onBack}>
            ‹ MENU
          </PixelButton>
        </div>
      </div>

      {/* map stage */}
      <div className="relative z-[2] flex-1">
        <svg
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
          viewBox="0 0 1280 560"
          preserveAspectRatio="none"
        >
          {WORLDS.slice(0, -1).map((a, i) => {
            const b = WORLDS[i + 1]
            const done = a.state === 'done'
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={done ? '#ffd700' : '#3a3a5e'}
                strokeWidth={4}
                strokeDasharray="3 12"
                strokeLinecap="round"
                opacity={done ? 0.9 : 0.6}
              />
            )
          })}
        </svg>

        {WORLDS.map((world, i) => (
          <WorldNode
            key={world.n}
            world={world}
            selected={i === selected}
            onClick={() => setSelected(i)}
          />
        ))}

        {/* info panel */}
        <PixelPanel
          ornate
          className="absolute right-[34px] top-1/2 z-[5] w-[340px] -translate-y-1/2 p-0"
        >
          <PixelStrip className="text-[13px]">WORLD {w.n} · {w.name}</PixelStrip>
          <div className="flex flex-col gap-3 p-[18px]">
            <MetaRow label="THEME" value={w.theme} />
            <MetaRow label="YOU LEARN" value={w.topic} />
            <MetaRow label="QUESTS" value={w.quests} />
            <div className="pixel-progress">
              <div className="pf" style={{ width: `${w.prog}%` }} />
            </div>
            <div
              className="flex items-center gap-2 px-[10px] py-2 font-pixel text-[9px]"
              style={{
                color: '#ff8a98',
                background: '#141436',
                border: '2px solid #07071a',
                boxShadow: '0 0 0 2px #5a1622',
              }}
            >
              ☠ BOSS · {w.boss.toUpperCase()}
            </div>
            {open ? (
              <PixelButton variant="gold" sm block onClick={() => onEnterWorld?.(i)}>
                {cleared ? 'REPLAY WORLD ▶' : 'ENTER WORLD ▶'}
              </PixelButton>
            ) : (
              <PixelButton sm block disabled>
                🔒 CLEAR WORLD {w.n - 1} FIRST
              </PixelButton>
            )}
          </div>
        </PixelPanel>
      </div>
    </section>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between font-pixel text-[9px] text-brand-gold">
      <span>{label}</span>
      <span className="max-w-[200px] text-right text-stellar-teal">{value}</span>
    </div>
  )
}

function WorldNode({
  world,
  selected,
  onClick,
}: {
  world: PixelWorld
  selected: boolean
  onClick: () => void
}) {
  const base =
    'absolute z-[2] flex w-[108px] -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center gap-2'

  let orbStyle: React.CSSProperties = {}
  let orbClass = ''
  if (world.state === 'locked') {
    orbStyle = { background: '#2a2a3e', color: '#6a6a86', boxShadow: '0 0 0 3px #6b7280, 0 5px 0 #07071a' }
  } else if (world.state === 'unlocked') {
    orbClass = 'animate-nodepulse'
    orbStyle = {
      background: '#7b5ea7',
      color: '#fff',
      boxShadow: '0 0 0 3px #9b7ec7, 0 0 22px rgba(155,126,199,.7), 0 5px 0 #07071a',
    }
  } else {
    orbStyle = {
      background: '#ffd700',
      color: '#07071a',
      boxShadow: '0 0 0 3px #fff3b0, 0 0 18px rgba(255,215,0,.5), 0 5px 0 #07071a',
    }
  }

  const pin = world.state === 'done' ? '✅' : world.state === 'locked' ? '🔒' : ''

  return (
    <div
      className={base}
      style={{ left: `${(world.x / 1280) * 100}%`, top: `${(world.y / 560) * 100}%` }}
      onClick={onClick}
    >
      <div
        className={`relative flex h-[74px] w-[74px] items-center justify-center text-[30px] ${orbClass}`}
        style={{
          border: '4px solid #07071a',
          outline: selected ? '3px solid #00bcd4' : undefined,
          outlineOffset: selected ? 4 : undefined,
          ...orbStyle,
        }}
      >
        {world.state === 'locked' ? '🔒' : world.emoji}
        {pin && <span className="absolute -right-[14px] -top-[14px] text-sm">{pin}</span>}
      </div>
      <div
        className="text-center font-pixel text-[8px] leading-[1.5]"
        style={{
          color: world.state === 'locked' ? '#7a7a96' : '#e8d5b7',
          textShadow: '1px 1px 0 #07071a',
        }}
      >
        {world.n}. {world.name}
      </div>
    </div>
  )
}
