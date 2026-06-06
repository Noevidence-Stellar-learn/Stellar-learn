'use client'

import { motion } from 'framer-motion'
import { BADGES, type PixelBadge } from './pixel-data'
import { PixelButton } from './PixelButton'

interface AchievementsProps {
  onBack?: () => void
}

/**
 * Achievements — the trophy wall: 8 badge medallions in earned / locked
 * states with an unlocked-progress meter. Recreated from the design.
 */
export function Achievements({ onBack }: AchievementsProps) {
  const earned = BADGES.filter((b) => b.earned).length
  const pct = Math.round((earned / BADGES.length) * 100)

  return (
    <section className="absolute inset-0 flex flex-col">
      <div className="pixel-scroll relative z-[2] flex min-h-0 flex-1 flex-col overflow-auto px-14 py-12">
        {/* header */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-pixel text-[9px] tracking-[3px] text-stellar-teal">
              YOUR TROPHIES
            </span>
            <span
              className="font-pixel text-[22px] tracking-[2px] text-brand-gold-bright"
              style={{ textShadow: '3px 3px 0 #07071a, 0 0 16px rgba(255,215,0,.3)' }}
            >
              ACHIEVEMENTS
            </span>
          </div>
          <div className="flex flex-col items-end gap-[10px]">
            <PixelButton variant="ghost" sm onClick={onBack}>
              ‹ MENU
            </PixelButton>
            <div className="flex items-center gap-3 font-pixel text-[10px] text-brand-gold">
              UNLOCKED
              <div className="pixel-progress w-[160px]">
                <div className="pf" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-brand-gold-bright">
                {earned} / {BADGES.length}
              </span>
            </div>
          </div>
        </div>

        {/* badge grid */}
        <div className="mt-6 grid grid-cols-4 items-start gap-[18px]">
          {BADGES.map((b, i) => (
            <Badge key={b.name} badge={b} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Badge({ badge, index }: { badge: PixelBadge; index: number }) {
  return (
    <motion.div
      className="flex items-start gap-[14px] p-4"
      style={{
        minHeight: 114,
        background: '#1a1a2e',
        border: '3px solid #07071a',
        boxShadow: '0 0 0 2px #34345e, 0 5px 0 #07071a',
        filter: badge.earned ? undefined : 'grayscale(1) brightness(.55)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className="relative flex h-[64px] w-[64px] flex-none items-center justify-center text-[30px]"
        style={{
          border: '3px solid #07071a',
          background: !badge.earned
            ? '#2a2a3e'
            : badge.gold
              ? 'radial-gradient(circle at 40% 30%, #fff3b0, #ffd700 55%, #b9890b)'
              : 'radial-gradient(circle at 40% 30%, #9b7ec7, #7b5ea7 60%, #4a3a66)',
          boxShadow: 'inset 0 3px 0 rgba(255,255,255,.25), inset 0 -4px 0 rgba(0,0,0,.3)',
        }}
      >
        {badge.earned ? badge.icon : <span className="text-[22px]">🔒</span>}
      </div>
      <div className="flex flex-col gap-[10px] pt-[2px]">
        <b className="font-pixel text-[9px] leading-[1.6] text-brand-gold">{badge.name}</b>
        <span className="block min-h-[42px] font-read text-[15px] leading-[1.4] text-[#9a9abc]">
          {badge.desc}
        </span>
        <span className="font-pixel text-[7px] text-stellar-teal">{badge.date}</span>
      </div>
    </motion.div>
  )
}
