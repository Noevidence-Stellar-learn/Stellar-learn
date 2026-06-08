import type Phaser from 'phaser'

export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 720
export const TILE_SIZE = 64

/**
 * Whether real pixel-art assets have been added under `apps/web/public/assets`.
 *
 * Until the art drop lands, the files don't exist, so requesting them produces
 * 404s and (for character spritesheets) empty animations that crash Phaser.
 * While this is `false`, scenes skip those network loads and render generated
 * placeholder textures instead. Flip to `true` once the PNG/JSON assets exist.
 */
export const ART_ASSETS_AVAILABLE = false

export const DEFAULT_PHASER_CONFIG: Omit<Phaser.Types.Core.GameConfig, 'scene' | 'parent'> = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  pixelArt: true,               // critical for crisp pixel art rendering
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: process.env.NODE_ENV === 'development',
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    disableWebAudio: false,
  },
}

// Asset keys — consistent naming used across all scenes
export const ASSET_KEYS = {
  // Tilesets
  TILESET_FOREST: 'tileset-forest',
  TILESET_CASTLE: 'tileset-castle',
  TILESET_DUNGEON: 'tileset-dungeon',
  TILESET_MOUNTAIN: 'tileset-mountain',

  // Characters
  CHAR_WARRIOR: 'char-warrior',
  CHAR_MAGE: 'char-mage',
  CHAR_ARCHER: 'char-archer',
  CHAR_ROGUE: 'char-rogue',
  CHAR_PALADIN: 'char-paladin',
  CHAR_NECROMANCER: 'char-necromancer',

  // UI
  UI_XP_BAR: 'ui-xp-bar',
  UI_HEALTH_BAR: 'ui-health-bar',
  UI_QUEST_PANEL: 'ui-quest-panel',

  // Effects
  FX_COIN: 'fx-coin',
  FX_LEVELUP: 'fx-levelup',
  FX_CORRECT: 'fx-correct',
  FX_WRONG: 'fx-wrong',
} as const
