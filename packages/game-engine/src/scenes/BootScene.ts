import Phaser from 'phaser'
import { ART_ASSETS_AVAILABLE, ASSET_KEYS } from '../config'

/**
 * BootScene — first scene loaded.
 * Loads all global assets (UI, shared sprites) then transitions to PreloadScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Progress bar while assets load
    this.createLoadingBar()

    // Skip art loads until the asset drop lands — otherwise these 404.
    if (!ART_ASSETS_AVAILABLE) return

    // UI assets (always needed)
    this.load.image(ASSET_KEYS.UI_XP_BAR, '/assets/ui/xp-bar.png')
    this.load.image(ASSET_KEYS.UI_HEALTH_BAR, '/assets/ui/health-bar.png')

    // Particle effects
    this.load.spritesheet(ASSET_KEYS.FX_COIN, '/assets/effects/coin.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet(ASSET_KEYS.FX_LEVELUP, '/assets/effects/levelup.png', {
      frameWidth: 64,
      frameHeight: 64,
    })
  }

  create() {
    // Boot into whichever scene the host requested (set on the game registry
    // before boot). Defaults to the world map. This prevents the level page
    // from starting WorldMapScene *and* LevelScene at once — which left the
    // map constellation rendering, unclickable, behind the level.
    const next = (this.registry.get('bootScene') as string | undefined) ?? 'WorldMapScene'
    const data = (this.registry.get('bootData') as object | undefined) ?? {}
    this.scene.start(next, data)
  }

  private createLoadingBar() {
    const { width, height } = this.cameras.main
    const barWidth = width * 0.6
    const barHeight = 20
    const x = (width - barWidth) / 2
    const y = height / 2

    const bg = this.add.rectangle(x, y, barWidth, barHeight, 0x222244)
    bg.setOrigin(0, 0.5)

    const bar = this.add.rectangle(x, y, 0, barHeight - 4, 0x7b5ea7)
    bar.setOrigin(0, 0.5)

    const logo = this.add.text(width / 2, y - 60, 'STELLAR LEARN', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#e8d5b7',
    })
    logo.setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      bar.width = (barWidth - 4) * value
    })
  }
}
