'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CHARACTERS, ANIMS } from './pixel-data'
import { SpriteSlot } from './SpriteSlot'
import { PixelButton } from './PixelButton'
import { PixelPanel } from './PixelPanel'

interface CharacterSelectProps {
  onBack?: () => void
  onEmbark?: (characterId: string) => void
}

/**
 * CharacterSelect — 6 colour-coded hero frames with locked states, plus a
 * detail panel showing the selected builder's lore and animation set.
 */
export function CharacterSelect({ onBack, onEmbark }: CharacterSelectProps) {
  const [selected, setSelected] = useState(0)
  const char = CHARACTERS[selected]
  if (!char) return null

  return (
    <section className="absolute inset-0 flex flex-col">
      <div className="relative z-[2] flex min-h-0 flex-1 flex-col px-14 py-12">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-pixel text-[9px] tracking-[3px] text-stellar-teal">
              CHOOSE YOUR PATH
            </span>
            <span
              className="font-pixel text-[22px] tracking-[2px] text-brand-gold-bright"
              style={{ textShadow: '3px 3px 0 #07071a, 0 0 16px rgba(255,215,0,.3)' }}
            >
              CHOOSE YOUR BUILDER
            </span>
          </div>
          <PixelButton variant="ghost" sm onClick={onBack}>
            ‹ BACK
          </PixelButton>
        </div>

        {/* character grid */}
        <div className="mt-2 grid grid-cols-6 gap-[14px]">
          {CHARACTERS.map((c, i) => {
            const isSel = i === selected
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => setSelected(i)}
                whileHover={{ y: -4 }}
                className="relative flex cursor-pointer flex-col items-center gap-2 p-[10px]"
                style={{
                  background: '#1a1a2e',
                  border: '3px solid #07071a',
                  boxShadow: isSel
                    ? '0 0 0 3px #ffd700, 0 0 22px rgba(255,215,0,.6), 0 6px 0 #07071a'
                    : `0 0 0 3px ${c.col}, 0 6px 0 #07071a`,
                  filter: c.locked ? 'grayscale(.9) brightness(.6)' : undefined,
                }}
              >
                {isSel && (
                  <span
                    className="absolute -right-2 -top-[10px] animate-twinkle text-base text-brand-gold-bright"
                    style={{ textShadow: '0 0 8px #ffd700' }}
                  >
                    ✦
                  </span>
                )}
                {c.locked && (
                  <span className="absolute inset-0 z-[4] flex items-center justify-center text-[30px]">
                    🔒
                  </span>
                )}
                <SpriteSlot
                  className="aspect-square w-full"
                  tint={c.col}
                  silhouette={c.locked ? '❔' : '🧙'}
                />
                <div className="text-center font-pixel text-[8px] leading-[1.5] text-brand-gold">
                  {c.name}
                </div>
                <div className="font-read text-[15px] text-brand-purple-light">{c.arch}</div>
              </motion.button>
            )
          })}
        </div>

        {/* detail panel */}
        <PixelPanel ornate className="mt-[22px] flex items-stretch gap-6 p-0">
          <div className="flex w-full gap-6 p-[18px]">
            <SpriteSlot
              key={char.id}
              className="w-[230px] flex-none"
              tint={char.col}
              label={char.name}
              dim={`char-${char.id}_idle · 128²`}
            />
            <div className="flex flex-1 flex-col gap-[14px] px-1 py-[6px]">
              <h2
                className="font-pixel text-[20px] tracking-[2px] text-brand-gold-bright"
                style={{ textShadow: '2px 2px 0 #07071a' }}
              >
                {char.name}{' '}
                <span className="text-[12px] text-brand-purple-light">· {char.arch}</span>
              </h2>
              <div
                className="inline-flex items-center gap-2 self-start px-3 py-[7px] font-pixel text-[9px] text-stellar-teal"
                style={{
                  background: '#141436',
                  border: '2px solid #07071a',
                  boxShadow: '0 0 0 2px #3d5afe',
                }}
              >
                ⬡ REPRESENTS: {char.represents}
              </div>
              <p className="font-read text-[20px] leading-[1.35] text-brand-gold">{char.blurb}</p>
              <div className="font-pixel text-[9px] tracking-[3px] text-brand-gold">
                ANIMATION SET
              </div>
              <div className="flex flex-wrap gap-2">
                {ANIMS.map((a) => {
                  const [n, f] = a.split(' ')
                  return (
                    <span
                      key={a}
                      className="px-[9px] py-[7px] font-pixel text-[8px] text-brand-gold"
                      style={{
                        background: '#242444',
                        border: '2px solid #07071a',
                        boxShadow: 'inset 0 0 0 1px #34345e',
                      }}
                    >
                      {n} <b className="text-stellar-teal">{f}</b>
                    </span>
                  )
                })}
              </div>
              <div className="mt-[6px] flex">
                {char.locked ? (
                  <PixelButton sm disabled>
                    🔒 LOCKED · CLEAR WORLD 3
                  </PixelButton>
                ) : (
                  <PixelButton variant="gold" sm onClick={() => onEmbark?.(char.id)}>
                    SELECT &amp; EMBARK ▶
                  </PixelButton>
                )}
              </div>
            </div>
          </div>
        </PixelPanel>
      </div>
    </section>
  )
}
