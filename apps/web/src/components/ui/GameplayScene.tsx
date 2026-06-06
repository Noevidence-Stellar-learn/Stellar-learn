import { Coin } from './Coin'
import { SpriteSlot } from './SpriteSlot'

/**
 * GameplayScene — a CSS mock of the World 1 "Origin Plains" platformer
 * backdrop used by the UI shell to preview the HUD. In the real app the
 * Phaser GameCanvas renders here instead (packages/game-engine).
 */
export function GameplayScene() {
  return (
    <div
      className="absolute inset-0 z-[1] overflow-hidden"
      style={{
        background: 'linear-gradient(#161235 0%, #1d1a40 38%, #20303a 70%, #24402a 100%)',
      }}
    >
      {/* layered forest silhouettes */}
      <div
        className="absolute bottom-[120px] left-0 right-0 z-[1] h-[240px] opacity-90"
        style={{
          filter: 'saturate(.8)',
          background:
            'radial-gradient(60px 120px at 8% 100%, #14301a 60%, transparent 62%),' +
            'radial-gradient(80px 150px at 22% 100%, #12281a 60%, transparent 62%),' +
            'radial-gradient(70px 130px at 38% 100%, #163420 60%, transparent 62%),' +
            'radial-gradient(90px 160px at 58% 100%, #102414 60%, transparent 62%),' +
            'radial-gradient(70px 140px at 74% 100%, #163a22 60%, transparent 62%),' +
            'radial-gradient(85px 150px at 90% 100%, #12281a 60%, transparent 62%)',
        }}
      />

      {/* ancient hash-engraved pillars */}
      <Pillar style={{ left: 120, height: 200 }}>GABC...HASH</Pillar>
      <Pillar style={{ right: 180, height: 240 }}>7c1f...a9e2</Pillar>

      {/* floating platforms */}
      <Platform style={{ left: 380, bottom: 280, width: 160 }} />
      <Platform style={{ right: 300, bottom: 360, width: 140 }} />

      {/* ground */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[3] h-[120px]"
        style={{
          background:
            'repeating-linear-gradient(90deg, #2d5a1b 0 62px, #295217 62px 64px), #295217',
          borderTop: '6px solid #173d0e',
          boxShadow: 'inset 0 8px 0 #3a6e26, inset 0 14px 0 #173d0e',
        }}
      />

      {/* collectible coin */}
      <div className="absolute z-[4]" style={{ left: 452, bottom: 322, transform: 'scale(1.3)' }}>
        <Coin />
      </div>

      {/* player + enemy sprite slots */}
      <SpriteSlot
        className="absolute z-[4]"
        tint="#9b7ec7"
        label="PLAYER"
        dim="char-validator_run · 128²"
        style={{ left: 300, bottom: 120, width: 84, height: 84 }}
      />
      <SpriteSlot
        className="absolute z-[4]"
        tint="#9a9ab0"
        label="ENEMY"
        dim="doubter_walk · 128²"
        style={{ right: 420, bottom: 120, width: 78, height: 78 }}
      />

      {/* fireflies */}
      <Firefly style={{ left: 240, bottom: 300 }} />
      <Firefly style={{ left: 760, bottom: 240, animationDelay: '.6s' }} />
      <Firefly style={{ left: 980, bottom: 340, animationDelay: '1.1s' }} />
    </div>
  )
}

function Pillar({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div
      className="absolute bottom-[120px] z-[2] flex w-[54px] items-center justify-center text-[8px] text-stellar-teal"
      style={{
        background: '#6b7280',
        border: '4px solid #07071a',
        boxShadow: 'inset 0 0 0 2px #565b66',
        writingMode: 'vertical-rl',
        letterSpacing: 2,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Platform({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute z-[3] h-[30px]"
      style={{
        background: '#2d5a1b',
        border: '4px solid #173d0e',
        boxShadow: 'inset 0 4px 0 #3a6e26, 0 0 0 2px #07071a',
        ...style,
      }}
    />
  )
}

function Firefly({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute z-[4] h-1 w-1 animate-twinkle rounded-full"
      style={{ background: '#00bcd4', boxShadow: '0 0 8px 2px rgba(0,188,212,.8)', ...style }}
    />
  )
}
