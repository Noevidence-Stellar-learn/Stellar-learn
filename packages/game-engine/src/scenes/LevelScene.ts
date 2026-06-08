import Phaser from 'phaser'
import { ART_ASSETS_AVAILABLE, TILE_SIZE } from '../config'

/**
 * LevelScene — the main 2D platformer level.
 * Player walks through the level, collecting quest items and triggering lesson panels.
 * Each "trigger zone" opens a lesson/quiz in the React overlay layer.
 */
export class LevelScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>
  private questTriggers: Phaser.GameObjects.Zone[] = []
  private isInteracting = false

  constructor() {
    super({ key: 'LevelScene' })
  }

  init(data: { worldId: string; levelId: string; characterId: string }) {
    this.registry.set('worldId', data.worldId)
    this.registry.set('levelId', data.levelId)
    this.registry.set('characterId', data.characterId)
  }

  preload() {
    // Skip art loads until the asset drop lands — otherwise these 404 and the
    // missing character spritesheet produces empty animations that crash on play.
    if (!ART_ASSETS_AVAILABLE) return

    const characterId = this.registry.get('characterId') as string
    this.load.spritesheet(`char-${characterId}`, `/assets/sprites/characters/${characterId}.png`, {
      frameWidth: 128,
      frameHeight: 128,
    })

    const worldId = this.registry.get('worldId') as string
    this.load.image(`tileset-${worldId}`, `/assets/tilesets/${worldId}.png`)
    this.load.tilemapTiledJSON(`map-${worldId}`, `/assets/maps/${worldId}.json`)
  }

  create() {
    this.ensureCharacterTexture()
    this.createAnimations()
    this.createMap()
    this.createPlayer()
    this.createQuestTriggers()
    this.setupCamera()
    this.setupInput()
    this.createHUD()
  }

  /**
   * Guarantee a usable character texture. When the real spritesheet didn't load
   * (no art yet, or a 404), generate a single-frame placeholder box so the
   * player sprite still renders instead of Phaser's missing-texture marker.
   */
  private ensureCharacterTexture() {
    const characterId = this.registry.get('characterId') as string
    const key = `char-${characterId}`
    if (this.textures.exists(key)) return

    const size = 128
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(0x7b5ea7, 1)
    g.fillRect(0, 0, size, size)
    g.lineStyle(6, 0x07071a, 1)
    g.strokeRect(3, 3, size - 6, size - 6)
    // simple eyes so the box reads as a character
    g.fillStyle(0x07071a, 1)
    g.fillRect(size * 0.32, size * 0.34, size * 0.12, size * 0.12)
    g.fillRect(size * 0.56, size * 0.34, size * 0.12, size * 0.12)
    g.generateTexture(key, size, size)
    g.destroy()
  }

  update() {
    if (this.isInteracting) return
    this.handleMovement()
    this.updateAnimations()
  }

  private createAnimations() {
    const characterId = this.registry.get('characterId') as string
    const key = `char-${characterId}`

    // A multi-frame spritesheet is required. With only a single-frame
    // placeholder (no art yet) we skip animations and show the static sprite —
    // creating zero-frame animations would crash Phaser when played.
    if (!this.textures.exists(key) || this.textures.get(key).frameTotal <= 1) return

    const anims = [
      { key: 'idle', frames: { start: 0, end: 3 }, repeat: -1, frameRate: 6 },
      { key: 'run', frames: { start: 8, end: 13 }, repeat: -1, frameRate: 10 },
      { key: 'jump', frames: { start: 16, end: 19 }, repeat: 0, frameRate: 10 },
      { key: 'attack', frames: { start: 24, end: 29 }, repeat: 0, frameRate: 12 },
    ]

    anims.forEach(({ key: animKey, frames, repeat, frameRate }) => {
      if (!this.anims.exists(`${characterId}-${animKey}`)) {
        this.anims.create({
          key: `${characterId}-${animKey}`,
          frames: this.anims.generateFrameNumbers(key, frames),
          frameRate,
          repeat,
        })
      }
    })
  }

  private createMap() {
    const worldId = this.registry.get('worldId') as string

    // No tilemap loaded (no art yet) — use the fallback ground instead of
    // calling make.tilemap on a missing key, which logs "No map data found".
    if (!this.cache.tilemap.has(`map-${worldId}`)) {
      this.createFallbackGround()
      return
    }

    try {
      const map = this.make.tilemap({ key: `map-${worldId}` })
      const tileset = map.addTilesetImage('tileset', `tileset-${worldId}`)
      if (!tileset) return

      map.createLayer('Background', tileset, 0, 0)
      const ground = map.createLayer('Ground', tileset, 0, 0)
      if (ground) {
        ground.setCollisionByProperty({ collides: true })
        this.registry.set('groundLayer', ground)
      }
      map.createLayer('Foreground', tileset, 0, 0)?.setDepth(10)
    } catch {
      // Fallback ground for development before tilesets are added
      this.createFallbackGround()
    }
  }

  private createFallbackGround() {
    const ground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - TILE_SIZE / 2,
      this.scale.width * 4,
      TILE_SIZE,
      0x2d5a1b
    )
    const groundBody = this.physics.add.staticGroup()
    groundBody.add(ground)
    this.registry.set('groundBodyGroup', groundBody)
  }

  private createPlayer() {
    const characterId = this.registry.get('characterId') as string

    this.player = this.physics.add.sprite(200, this.scale.height - 200, `char-${characterId}`)
    this.player.setCollideWorldBounds(true)
    this.player.setScale(0.5)
    this.player.setDepth(5)

    const groundLayer = this.registry.get('groundLayer')
    const groundBodyGroup = this.registry.get('groundBodyGroup')

    if (groundLayer) {
      this.physics.add.collider(this.player, groundLayer as Phaser.Tilemaps.TilemapLayer)
    }
    if (groundBodyGroup) {
      this.physics.add.collider(this.player, groundBodyGroup as Phaser.Physics.Arcade.StaticGroup)
    }
  }

  private createQuestTriggers() {
    // Quest trigger zones — positioned along the level
    // Each triggers a lesson panel overlay in React
    const triggerPositions = [400, 700, 1000, 1300, 1600]

    triggerPositions.forEach((x, i) => {
      const zone = this.add.zone(x, this.scale.height - 150, 80, 150)
      this.physics.world.enable(zone)
      this.questTriggers.push(zone)

      // Visual indicator
      const indicator = this.add.text(x, this.scale.height - 220, '!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#ffd700',
      }).setOrigin(0.5)

      this.tweens.add({
        targets: indicator,
        y: this.scale.height - 230,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      this.physics.add.overlap(this.player, zone, () => {
        if (!this.isInteracting) {
          this.isInteracting = true
          indicator.setVisible(false)
          this.game.events.emit('quest-triggered', { questIndex: i })
        }
      })
    })
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
    this.cameras.main.setZoom(1.2)
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    // Listen for React layer telling us interaction is done
    this.game.events.on('quest-closed', () => {
      this.isInteracting = false
    })
  }

  private handleMovement() {
    const onGround = this.player.body.blocked.down
    const goLeft = this.cursors.left.isDown || this.wasd['left']?.isDown
    const goRight = this.cursors.right.isDown || this.wasd['right']?.isDown
    const jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd['up'] as Phaser.Input.Keyboard.Key)

    if (goLeft) {
      this.player.setVelocityX(-220)
      this.player.setFlipX(true)
    } else if (goRight) {
      this.player.setVelocityX(220)
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
    }

    if (jump && onGround) {
      this.player.setVelocityY(-520)
    }
  }

  private updateAnimations() {
    const characterId = this.registry.get('characterId') as string

    // No animations were created (placeholder/missing spritesheet) — playing a
    // non-existent / zero-frame animation throws in Phaser, so bail early.
    if (!this.anims.exists(`${characterId}-idle`)) return

    const onGround = this.player.body.blocked.down
    const vx = this.player.body.velocity.x
    const vy = this.player.body.velocity.y

    if (!onGround && vy < 0) {
      this.player.play(`${characterId}-jump`, true)
    } else if (Math.abs(vx) > 10) {
      this.player.play(`${characterId}-run`, true)
    } else {
      this.player.play(`${characterId}-idle`, true)
    }
  }

  private createHUD() {
    const hud = this.add.container(0, 0).setScrollFactor(0).setDepth(20)

    const xpLabel = this.add.text(20, 20, 'XP: 0', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#ffd700',
    })
    hud.add(xpLabel)

    this.game.events.on('xp-updated', (xp: number) => {
      xpLabel.setText(`XP: ${xp}`)
    })
  }
}
