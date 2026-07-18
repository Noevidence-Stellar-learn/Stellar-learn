/**
 * Procedural pixel-art spritesheet generator for Stellar Learn.
 *
 * Renders every character, enemy and boss spritesheet the game engine loads,
 * using only Node's stdlib (no image dependencies). Output is deterministic:
 * running this script always produces byte-identical PNGs, so the committed
 * art can be reviewed, regenerated and tweaked like source code.
 *
 *   node scripts/generate-sprites.mjs
 *
 * Frame layouts must stay in sync with:
 *   - packages/game-engine/src/config.ts   (SPRITE_SHEETS frame data)
 *   - apps/web/public/assets/sprites/README.md
 *
 * Sheets are drawn at a low logical resolution (32 or 64 px) and upscaled 4x
 * so the art keeps a chunky, consistent pixel grid.
 */

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'apps', 'web', 'public', 'assets', 'sprites')
const SCALE = 4

// ---------------------------------------------------------------------------
// Minimal PNG encoder (RGBA, 8-bit)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'ascii')
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', Buffer.alloc(0))])
}

// ---------------------------------------------------------------------------
// Logical-resolution drawing surface
// ---------------------------------------------------------------------------

/** Deterministic 0..1 hash, used for tatters/dissolves so output is stable. */
function hash2(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 974634551) >>> 0
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

class Grid {
  constructor(size) {
    this.size = size
    this.data = new Uint8Array(size * size * 4)
  }

  px(x, y, c) {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return
    const i = (y * this.size + x) * 4
    this.data[i] = c[0]
    this.data[i + 1] = c[1]
    this.data[i + 2] = c[2]
    this.data[i + 3] = c[3] ?? 255
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c)
  }

  line(x0, y0, x1, y1, c, w = 1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1)
    for (let t = 0; t <= steps; t++) {
      const x = x0 + ((x1 - x0) * t) / steps
      const y = y0 + ((y1 - y0) * t) / steps
      this.rect(Math.round(x - (w - 1) / 2), Math.round(y - (w - 1) / 2), w, w, c)
    }
  }

  ellipse(cx, cy, rx, ry, c) {
    for (let y = -Math.ceil(ry); y <= ry; y++)
      for (let x = -Math.ceil(rx); x <= rx; x++)
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) this.px(cx + x, cy + y, c)
  }

  /** Draw a 1px dark outline around every opaque region. */
  outline(c) {
    const s = this.size
    const src = this.data.slice()
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        if (src[(y * s + x) * 4 + 3] !== 0) continue
        const touching = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => {
          const xx = x + dx
          const yy = y + dy
          if (xx < 0 || yy < 0 || xx >= s || yy >= s) return false
          return src[(yy * s + xx) * 4 + 3] > 0
        })
        if (touching) this.px(x, y, c)
      }
    }
  }

  /** Multiply all RGB channels (f < 1 darkens, f > 1 brightens). */
  tone(f) {
    for (let i = 0; i < this.data.length; i += 4) {
      if (this.data[i + 3] === 0) continue
      this.data[i] = Math.min(255, this.data[i] * f)
      this.data[i + 1] = Math.min(255, this.data[i + 1] * f)
      this.data[i + 2] = Math.min(255, this.data[i + 2] * f)
    }
  }

  /** Erase a deterministic fraction p of opaque pixels (dissolve effect). */
  dissolve(p, seed) {
    for (let y = 0; y < this.size; y++)
      for (let x = 0; x < this.size; x++)
        if (hash2(x, y, seed) < p) this.data[(y * this.size + x) * 4 + 3] = 0
  }
}

/** Assemble frames (array indexed row*cols+col, null = blank) into one sheet. */
function buildSheet(cols, rows, logical, frames) {
  const frame = logical * SCALE
  const W = cols * frame
  const H = rows * frame
  const rgba = Buffer.alloc(W * H * 4)
  frames.forEach((g, idx) => {
    if (!g) return
    const ox = (idx % cols) * frame
    const oy = Math.floor(idx / cols) * frame
    for (let y = 0; y < g.size; y++) {
      for (let x = 0; x < g.size; x++) {
        const i = (y * g.size + x) * 4
        if (g.data[i + 3] === 0) continue
        for (let sy = 0; sy < SCALE; sy++) {
          for (let sx = 0; sx < SCALE; sx++) {
            const o = ((oy + y * SCALE + sy) * W + ox + x * SCALE + sx) * 4
            rgba[o] = g.data[i]
            rgba[o + 1] = g.data[i + 1]
            rgba[o + 2] = g.data[i + 2]
            rgba[o + 3] = g.data[i + 3]
          }
        }
      }
    }
  })
  return { width: W, height: H, rgba }
}

function writeSheet(relPath, sheet, expectW, expectH) {
  if (sheet.width !== expectW || sheet.height !== expectH) {
    throw new Error(`${relPath}: got ${sheet.width}x${sheet.height}, expected ${expectW}x${expectH}`)
  }
  const abs = join(OUT, relPath)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, encodePng(sheet.width, sheet.height, sheet.rgba))
  console.log(`  wrote sprites/${relPath.replace(/\\/g, '/')} (${sheet.width}x${sheet.height})`)
}

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 255]

// ---------------------------------------------------------------------------
// Player characters — 32px logical, 8 cols x 5 rows of 128px frames
// Rows: 0 idle(4) / 1 run(6) / 2 jump(4) / 3 attack(6) / 4 death(6)
// ---------------------------------------------------------------------------

const OUTLINE = hex('#07071a')

const CHARACTERS = {
  warrior: {
    weapon: 'sword',
    pal: { armor: '#7b5ea7', armorLight: '#9b7ec7', armorDark: '#5a4380', helmet: '#6a4f96', accent: '#ffd700', rune: '#00bcd4' },
  },
  paladin: {
    weapon: 'sword',
    pal: { armor: '#9fb4c7', armorLight: '#c9d9e8', armorDark: '#6e8296', helmet: '#8ba1b5', accent: '#ffd700', rune: '#00bcd4' },
  },
  mage: {
    weapon: 'staff',
    pal: { armor: '#3d5a9e', armorLight: '#5c7ec7', armorDark: '#2b4076', helmet: '#33488a', accent: '#00bcd4', rune: '#ffd700' },
  },
  necromancer: {
    weapon: 'staff',
    pal: { armor: '#4a2a6e', armorLight: '#6b4396', armorDark: '#341c50', helmet: '#3c2260', accent: '#76d84a', rune: '#76d84a' },
  },
  archer: {
    weapon: 'bow',
    pal: { armor: '#4e7d3a', armorLight: '#6da154', armorDark: '#38592a', helmet: '#446e33', accent: '#ffd700', rune: '#00bcd4' },
  },
  rogue: {
    weapon: 'dagger',
    pal: { armor: '#4a545e', armorLight: '#66727e', armorDark: '#343c44', helmet: '#3f4851', accent: '#e05555', rune: '#e05555' },
  },
}

const SHARED_PAL = { skin: '#e8b98a', eye: '#07071a', boot: '#2a2438', wood: '#8d6e63', blade: '#cfd8dc', bladeDark: '#90a4ae', spark: '#ffffff' }

function resolvePal(raw) {
  const pal = { ...SHARED_PAL, ...raw }
  const out = Object.fromEntries(Object.entries(pal).map(([k, v]) => [k, typeof v === 'string' ? hex(v) : v]))
  // rear leg is shaded darker than the front one so the legs read separately
  out.legBack = out.armorDark.map((v, i) => (i === 3 ? v : Math.round(v * 0.6)))
  return out
}

function drawLeg(g, pal, hipX, hipY, footDX, lift, isBack) {
  const footY = 30 - lift
  const kneeX = hipX + Math.round(footDX / 2)
  const kneeY = Math.min(hipY + 4, footY - 1)
  const c = isBack ? pal.legBack : pal.armorDark
  g.line(hipX, hipY, kneeX, kneeY, c, 3)
  g.line(kneeX, kneeY, hipX + footDX, Math.max(kneeY, footY - 1), c, 3)
  g.rect(hipX + footDX - 2, footY - 1, 5, 2, pal.boot)
}

function drawWeapon(g, pal, weapon, hx, hy, stance) {
  if (weapon === 'sword' || weapon === 'dagger') {
    const len = weapon === 'dagger' ? 5 : 9
    const dirs = { rest: [0.85, -0.5], back: [-0.35, -0.94], up: [0.1, -1], fwd: [1, -0.12], downfwd: [0.8, 0.6] }
    const [dx, dy] = dirs[stance] ?? dirs.rest
    const ex = hx + dx * len
    const ey = hy + dy * len
    g.line(hx + dx * 2, hy + dy * 2, ex, ey, pal.blade, 2)
    g.px(ex, ey, pal.spark)
    // crossguard perpendicular to the blade
    g.line(hx - dy * 2, hy + dx * 2, hx + dy * 2, hy - dx * 2, pal.accent, 1)
    g.px(hx - dx, hy - dy, pal.accent)
  } else if (weapon === 'staff') {
    const raised = stance === 'up' || stance === 'cast'
    const topX = hx + (raised ? 0 : 2)
    const topY = hy - (raised ? 12 : 10)
    g.line(hx - (raised ? 0 : 2), hy + 6, topX, topY, pal.wood, 2)
    g.ellipse(topX, topY - 1, 2, 2, pal.rune)
    if (stance === 'cast') {
      g.ellipse(topX, topY - 1, 3, 3, [...pal.rune.slice(0, 3), 140])
      g.px(topX, topY - 1, pal.spark)
    }
  } else if (weapon === 'bow') {
    const pull = stance === 'draw' ? -4 : stance === 'release' ? 0 : -1
    const tipTopX = hx + 3
    const tipTopY = hy - 8
    const tipBotX = hx + 3
    const tipBotY = hy + 8
    g.line(tipTopX, tipTopY, hx + 5, hy, pal.wood, 2)
    g.line(hx + 5, hy, tipBotX, tipBotY, pal.wood, 2)
    g.line(tipTopX, tipTopY, hx + pull, hy, pal.blade, 1)
    g.line(hx + pull, hy, tipBotX, tipBotY, pal.blade, 1)
    if (stance === 'draw') {
      g.line(hx + pull, hy, hx + 6, hy, pal.accent, 1)
      g.px(hx + 7, hy, pal.spark)
    }
  }
}

/**
 * Draw the hero in a standing pose. All poses share one rig so every
 * character reads consistently; `pose` nudges parts around it.
 */
function drawHero(g, pal, weapon, pose = {}) {
  const dy = pose.bob ?? 0
  const lean = pose.lean ?? 0
  const hipY = 21 + dy

  drawLeg(g, pal, 13, hipY, pose.backFoot?.[0] ?? 0, pose.backFoot?.[1] ?? 0, true)
  drawLeg(g, pal, 17, hipY, pose.frontFoot?.[0] ?? 0, pose.frontFoot?.[1] ?? 0, false)

  // back arm (behind torso)
  g.line(13 + lean, 14 + dy, 13 + lean + (pose.backArmDX ?? -1), 19 + dy, pal.armorDark, 2)

  // torso
  g.rect(11 + lean, 13 + dy, 10, 9, pal.armor)
  g.rect(11 + lean, 13 + dy, 10, 2, pal.armorLight)
  g.rect(11 + lean, 20 + dy, 10, 1, pal.armorDark)
  g.rect(12 + lean, 21 + dy, 8, 1, pal.accent)
  g.rect(17 + lean, 16 + dy, 2, 2, pal.rune)

  // head + helmet, face opening on the right (characters face right; the
  // engine flips the sprite for leftward movement)
  const hx = 12 + lean
  const hy = 3 + dy + (pose.headDY ?? 0)
  g.rect(hx, hy, 10, 10, pal.helmet)
  g.rect(hx + 6, hy + 4, 4, 5, pal.skin)
  g.rect(hx, hy + 3, 6, 1, pal.accent)
  g.rect(hx + 3, hy - 1, 3, 1, pal.accent)
  if (pose.eyesX) {
    g.px(hx + 7, hy + 5, pal.eye)
    g.px(hx + 9, hy + 5, pal.eye)
  } else {
    g.rect(hx + 8, hy + 5, 1, 2, pal.eye)
  }

  // front arm + weapon
  const hand = pose.hand ?? (weapon === 'staff' ? [22 + lean, 18 + dy] : [20 + lean, 18 + dy])
  g.line(18 + lean, 14 + dy, hand[0], hand[1], pal.armorLight, 2)
  if (!pose.noWeapon) drawWeapon(g, pal, weapon, hand[0], hand[1], pose.stance ?? 'rest')
  g.rect(hand[0] - 1, hand[1] - 1, 2, 2, pal.skin)

  if (pose.slash) {
    // slash arc sweeping in front of the hero
    const cx2 = 19 + lean
    const cy2 = 14 + dy
    const arc = pose.slash === 2 ? [[-0.5, -1.1], [0.2, -1], [0.8, -0.7], [1.1, -0.2], [1.15, 0.35]] : [[0.9, -0.5], [1.1, 0], [1.05, 0.5]]
    arc.forEach(([ax, ay], i) => {
      g.px(cx2 + ax * 11, cy2 + ay * 11, i % 2 ? pal.spark : pal.accent)
      if (pose.slash === 2) g.px(cx2 + ax * 9, cy2 + ay * 9, pal.accent)
    })
  }
}

function drawHeroLying(g, pal, weapon, dim) {
  // collapsed on the ground, head to the right
  g.rect(6, 27, 4, 3, pal.armorDark)
  g.rect(3, 28, 4, 2, pal.boot)
  g.rect(9, 26, 11, 5, pal.armor)
  g.rect(9, 26, 11, 1, pal.armorLight)
  g.rect(14, 27, 2, 2, pal.rune)
  g.rect(19, 24, 8, 7, pal.helmet)
  g.rect(21, 26, 4, 3, pal.skin)
  g.px(23, 27, pal.eye)
  g.px(25, 27, pal.eye)
  g.rect(19, 24, 8, 1, pal.accent)
  if (weapon === 'sword' || weapon === 'dagger') {
    g.line(24, 30, 24 + (weapon === 'dagger' ? 4 : 7), 30, pal.blade, 1)
  } else if (weapon === 'staff') {
    g.line(2, 25, 12, 24, pal.wood, 1)
    g.ellipse(13, 24, 1, 1, pal.rune)
  } else if (weapon === 'bow') {
    g.line(25, 27, 28, 30, pal.wood, 1)
  }
  g.outline(OUTLINE)
  if (dim) g.tone(0.75)
}

function characterFrames(weapon, rawPal) {
  const pal = resolvePal(rawPal)
  const L = 32
  const frames = new Array(8 * 5).fill(null)
  const draw = (pose) => {
    const g = new Grid(L)
    drawHero(g, pal, weapon, pose)
    g.outline(OUTLINE)
    return g
  }

  // row 0 — idle (4): gentle breathing bob
  ;[0, 0, 1, 1].forEach((bob, i) => {
    frames[i] = draw({ bob, backArmDX: -1 })
  })

  // row 1 — run (6): sine leg cycle, arms counter-swinging
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2
    const pose = {
      bob: k % 3 === 1 ? 1 : 0,
      backFoot: [Math.round(4 * Math.sin(a)), Math.max(0, Math.round(2 * Math.cos(a)))],
      frontFoot: [Math.round(4 * Math.sin(a + Math.PI)), Math.max(0, Math.round(2 * Math.cos(a + Math.PI)))],
      backArmDX: Math.round(3 * Math.sin(a + Math.PI)),
      hand: [20 + Math.round(1.5 * Math.sin(a)), 18],
    }
    frames[8 + k] = draw(pose)
  }

  // row 2 — jump (4): crouch, launch, tuck, fall
  frames[16] = draw({ bob: 3, backFoot: [-1, 0], frontFoot: [1, 0], hand: [19, 20], backArmDX: -2 })
  frames[17] = draw({ bob: -1, backFoot: [-3, 4], frontFoot: [-1, 2], hand: [21, 14], backArmDX: -3 })
  frames[18] = draw({ bob: -1, backFoot: [-2, 6], frontFoot: [1, 5], hand: [21, 15], backArmDX: -2 })
  frames[19] = draw({ bob: 0, backFoot: [-2, 2], frontFoot: [2, 1], hand: [20, 14], backArmDX: 1 })

  // row 3 — attack (6): weapon-specific swing / cast / shot
  const attack = {
    sword: [
      { lean: -1, hand: [16, 10], stance: 'back' },
      { lean: -1, hand: [17, 8], stance: 'up' },
      { lean: 1, hand: [21, 12], stance: 'up', frontFoot: [2, 0] },
      { lean: 1, hand: [22, 16], stance: 'fwd', frontFoot: [3, 0], slash: 2 },
      { lean: 1, hand: [21, 19], stance: 'downfwd', frontFoot: [2, 0], slash: 1 },
      { lean: 0, hand: [20, 18], stance: 'rest' },
    ],
    staff: [
      { hand: [19, 14], stance: 'up' },
      { lean: -1, hand: [18, 12], stance: 'up' },
      { lean: -1, hand: [18, 11], stance: 'cast' },
      { lean: 1, hand: [20, 12], stance: 'cast', slash: 2 },
      { lean: 1, hand: [20, 13], stance: 'cast', slash: 1 },
      { hand: [20, 16], stance: 'rest' },
    ],
    bow: [
      { hand: [20, 15], stance: 'rest' },
      { hand: [20, 15], stance: 'draw' },
      { lean: -1, hand: [19, 15], stance: 'draw' },
      { lean: 1, hand: [21, 15], stance: 'release', slash: 1 },
      { lean: 1, hand: [21, 15], stance: 'release' },
      { hand: [20, 16], stance: 'rest' },
    ],
  }
  attack.dagger = attack.sword
  attack[weapon].forEach((pose, k) => {
    frames[24 + k] = draw(pose)
  })

  // row 4 — death (6): stagger, kneel, collapse, lie still
  frames[32] = draw({ lean: -1, bob: 1, eyesX: true, backArmDX: -3 })
  frames[33] = draw({ lean: -1, bob: 3, eyesX: true, noWeapon: true, hand: [19, 21], backFoot: [-1, 0], frontFoot: [1, 0] })
  frames[34] = draw({ lean: 0, bob: 5, eyesX: true, noWeapon: true, hand: [19, 23], backFoot: [-3, 0], frontFoot: [3, 0] })
  frames[35] = draw({ lean: 3, bob: 6, eyesX: true, noWeapon: true, hand: [22, 25], headDY: 1, backFoot: [-4, 0], frontFoot: [2, 0] })
  const lying = new Grid(L)
  drawHeroLying(lying, pal, weapon, false)
  frames[36] = lying
  const still = new Grid(L)
  drawHeroLying(still, pal, weapon, true)
  frames[37] = still

  return frames
}

// ---------------------------------------------------------------------------
// Boss: The Doubt Wraith — 64px logical, 6 cols x 4 rows of 256px frames
// Rows: idle(0-5) / attack(6-11) / hurt(12-17) / defeat(18-23)
// ---------------------------------------------------------------------------

const WRAITH_PAL = {
  cloak: hex('#2a1b4a'),
  cloakLight: hex('#463175'),
  cloakDark: hex('#1a1030'),
  void: hex('#0a0714'),
  eye: hex('#00e5ff'),
  eyeCore: hex('#c9f7ff'),
  rune: hex('#ffd700'),
  orb: hex('#7b2ff7'),
  orbLight: hex('#b388ff'),
  spark: hex('#ffffff'),
}

function drawWraith(g, o = {}) {
  const p = WRAITH_PAL
  const cx = 30 + (o.lunge ?? 0)
  const top = 8 + (o.bob ?? 0) + (o.topDrop ?? 0)
  const bottom = 56
  const phase = o.phase ?? 0
  const height = bottom - top

  // cloak silhouette: hood dome flaring into a tattered skirt
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / height
    let hw
    if (t < 0.3) {
      hw = Math.round(11 * Math.sin((t / 0.3) * Math.PI * 0.5) + 2)
    } else {
      hw = Math.round(13 + 7 * ((t - 0.3) / 0.7))
    }
    // side-to-side drift of the skirt
    const sway = t > 0.45 ? Math.round(2 * Math.sin(t * 9 + phase * 1.1)) : 0
    for (let x = cx - hw + sway; x <= cx + hw + sway; x++) {
      // tattered lower edge: deterministic bites out of the last rows
      if (t > 0.82) {
        const bite = hash2(x, 0, 31 + phase) * 8
        if (bottom - y < bite * (t - 0.82) * 6) continue
      }
      const shade = x < cx - hw * 0.4 ? p.cloakDark : x > cx + hw * 0.35 ? p.cloakLight : p.cloak
      g.px(x, y, shade)
    }
  }

  // hood interior + eyes
  g.ellipse(cx + 3, top + 9, 6, 6, p.void)
  if (!o.noEyes) {
    const eye = o.eyesFlash ? p.spark : p.eye
    g.rect(cx + 1, top + 8, 2, 2, eye)
    g.rect(cx + 6, top + 8, 2, 2, eye)
    g.px(cx + 2, top + 8, o.eyesFlash ? p.spark : p.eyeCore)
    g.px(cx + 7, top + 8, o.eyesFlash ? p.spark : p.eyeCore)
  }

  // chest rune (a Stellar-gold sigil half-buried in the cloak)
  g.rect(cx - 1, top + 20, 3, 1, p.rune)
  g.rect(cx, top + 19, 1, 3, p.rune)

  // arms
  const armY = top + 16
  if (o.arms === 'raised') {
    g.line(cx - 9, armY, cx - 14, top + 4, p.cloakDark, 3)
    g.line(cx + 9, armY, cx + 15, top + 3, p.cloakLight, 3)
    g.rect(cx - 16, top + 2, 3, 3, p.cloakDark)
    g.rect(cx + 15, top + 1, 3, 3, p.cloakLight)
  } else if (o.arms === 'thrust') {
    g.line(cx - 9, armY, cx - 13, armY + 8, p.cloakDark, 3)
    g.line(cx + 9, armY, cx + 18, armY + 2, p.cloakLight, 3)
    g.rect(cx + 18, armY, 4, 4, p.cloakLight)
  } else if (o.arms !== 'none') {
    const drift = Math.round(Math.sin(phase * 1.3) * 1.5)
    g.line(cx - 9, armY, cx - 14, armY + 12 + drift, p.cloakDark, 3)
    g.line(cx + 9, armY, cx + 14, armY + 12 - drift, p.cloakLight, 3)
    g.rect(cx - 16, armY + 12 + drift, 3, 3, p.cloakDark)
    g.rect(cx + 13, armY + 12 - drift, 3, 3, p.cloakLight)
  }

  // dark orb (attack)
  if (o.orb) {
    const [ox, oy, r] = o.orb
    g.ellipse(ox, oy, r + 1, r + 1, [...p.orb.slice(0, 3), 130])
    g.ellipse(ox, oy, r, r, p.orb)
    g.ellipse(ox, oy, Math.max(1, r - 2), Math.max(1, r - 2), p.void)
    if (o.orbFlash) {
      g.px(ox - r - 2, oy, p.spark)
      g.px(ox + r + 2, oy, p.spark)
      g.px(ox, oy - r - 2, p.spark)
      g.px(ox, oy + r + 2, p.spark)
      g.px(ox, oy, p.spark)
    }
  }
  if (o.streaks) {
    for (let s = 0; s < 3; s++) g.line(cx - 18, top + 12 + s * 8, cx - 10, top + 12 + s * 8, p.orbLight, 1)
  }

  // ambient motes drifting around the wraith
  const motes = o.motes ?? 5
  for (let m = 0; m < motes; m++) {
    const mx = cx - 20 + Math.round(hash2(m, 1, 7) * 40 + 3 * Math.sin(phase + m))
    const my = top + 4 + Math.round(hash2(m, 2, 7) * 44 - (o.motesRise ?? 0))
    g.px(mx, my, m % 2 ? p.orbLight : p.eye)
  }
}

function wraithFrames() {
  const L = 64
  const frames = []
  const draw = (o) => {
    const g = new Grid(L)
    drawWraith(g, o)
    g.outline(OUTLINE)
    if (o.tone) g.tone(o.tone)
    if (o.dissolve) g.dissolve(o.dissolve, 91)
    return g
  }

  // idle (0-5): hover bob, skirt sway
  const bobs = [0, 1, 2, 3, 2, 1]
  for (let k = 0; k < 6; k++) frames.push(draw({ bob: bobs[k], phase: k }))

  // attack (6-11): summon a dark orb, lunge, recover
  frames.push(draw({ phase: 1, arms: 'raised', orb: [40, 12, 1] }))
  frames.push(draw({ phase: 2, arms: 'raised', orb: [41, 10, 3] }))
  frames.push(draw({ phase: 3, lunge: 2, arms: 'raised', orb: [42, 10, 4], orbFlash: true }))
  frames.push(draw({ phase: 4, lunge: 7, arms: 'thrust', orb: [53, 26, 3], orbFlash: true, streaks: true }))
  frames.push(draw({ phase: 5, lunge: 3, arms: 'thrust', orb: [52, 27, 1] }))
  frames.push(draw({ phase: 0, lunge: 0 }))

  // hurt (12-17): recoil + flicker
  const recoil = [-2, -4, -3, -2, -1, 0]
  for (let k = 0; k < 6; k++) {
    frames.push(draw({ phase: k, lunge: recoil[k], eyesFlash: k % 2 === 0, tone: k % 2 === 0 ? 1.6 : 1 }))
  }

  // defeat (18-23): collapse downward and dissolve into motes
  const drop = [0, 6, 14, 24, 34, 42]
  const gone = [0, 0.08, 0.18, 0.32, 0.52, 0.78]
  for (let k = 0; k < 6; k++) {
    frames.push(
      draw({
        phase: k,
        topDrop: drop[k],
        arms: k > 1 ? 'none' : 'idle',
        noEyes: k > 3,
        eyesFlash: k > 1,
        motes: 5 + k * 2,
        motesRise: k * 5,
        dissolve: gone[k],
        tone: 1 - k * 0.06,
      })
    )
  }

  return frames
}

// ---------------------------------------------------------------------------
// Enemy: The Doubter — 32px logical, 8 cols x 2 rows of 128px frames
// Rows: walk(0-5) / death(8-13)
// ---------------------------------------------------------------------------

const DOUBTER_PAL = {
  body: hex('#4e6e5d'),
  bodyLight: hex('#6d8f7b'),
  bodyDark: hex('#35503f'),
  eyeWhite: hex('#e8e6da'),
  pupil: hex('#07071a'),
  mark: hex('#ffd700'),
}

function drawDoubter(g, o = {}) {
  const p = DOUBTER_PAL
  const h = o.h ?? 13
  const rw = o.w ?? 11
  const cy = 30 - h / 2

  // feet peeking out under the blob
  if (!o.noFeet) {
    g.rect(10 + (o.stepA ?? 0), 28, 3, 3, p.bodyDark)
    g.rect(19 + (o.stepB ?? 0), 28, 3, 3, p.bodyDark)
  }

  g.ellipse(16, cy, rw, h / 2, p.body)
  g.ellipse(16, cy - h * 0.12, rw * 0.75, h * 0.3, p.bodyLight)
  for (let x = 16 - rw + 1; x <= 16 + rw - 1; x++) g.px(x, 29, p.bodyDark)

  if (o.eyesX) {
    // crossed-out eyes
    for (const ex of [12, 19]) {
      g.px(ex - 1, cy - 2, p.pupil)
      g.px(ex + 1, cy, p.pupil)
      g.px(ex + 1, cy - 2, p.pupil)
      g.px(ex - 1, cy, p.pupil)
    }
  } else if (!o.noFace) {
    // droopy, doubtful eyes + wavy worried mouth
    for (const ex of [12, 19]) {
      g.rect(ex - 1, cy - 2, 3, 2, p.eyeWhite)
      g.px(ex + (o.look ?? 0), cy - 1, p.pupil)
      g.rect(ex - 1, cy - 3, 3, 1, p.bodyDark)
    }
    g.px(13, cy + 3, p.pupil)
    g.px(14, cy + 2, p.pupil)
    g.px(15, cy + 3, p.pupil)
    g.px(16, cy + 2, p.pupil)
    g.px(17, cy + 3, p.pupil)
  }

  // floating question mark: its whole identity is doubt
  if (!o.noMark) {
    const qx = 22
    const qy = 30 - h - 9 + (o.qBob ?? 0)
    g.rect(qx, qy, 3, 1, p.mark)
    g.px(qx + 3, qy + 1, p.mark)
    g.px(qx + 2, qy + 2, p.mark)
    g.px(qx + 1, qy + 3, p.mark)
    g.px(qx + 1, qy + 5, p.mark)
  }
}

function doubterFrames() {
  const L = 32
  const frames = new Array(8 * 2).fill(null)
  const draw = (o) => {
    const g = new Grid(L)
    drawDoubter(g, o)
    g.outline(OUTLINE)
    if (o.tone) g.tone(o.tone)
    return g
  }

  // walk (0-5): squishy bounce with alternating feet
  const hs = [13, 12, 11, 12, 13, 14]
  for (let k = 0; k < 6; k++) {
    frames[k] = draw({
      h: hs[k],
      w: 11 + (13 - hs[k]) * 0.5,
      stepA: k < 3 ? 1 : -1,
      stepB: k < 3 ? -1 : 1,
      qBob: k % 3 === 0 ? 1 : 0,
      look: k < 3 ? 1 : -1,
    })
  }

  // death (8-13): deflate into a puddle of doubt
  const dh = [11, 9, 7, 5, 3, 2]
  const dw = [12, 13, 14, 15, 15, 15]
  for (let k = 0; k < 6; k++) {
    frames[8 + k] = draw({
      h: dh[k],
      w: dw[k],
      eyesX: k < 3,
      noFace: k >= 3,
      noFeet: k > 0,
      noMark: k > 1,
      qBob: -k,
      tone: 1 - k * 0.08,
    })
  }

  return frames
}

// ---------------------------------------------------------------------------
// Build everything
// ---------------------------------------------------------------------------

console.log('Generating spritesheets...')

for (const [id, { weapon, pal }] of Object.entries(CHARACTERS)) {
  writeSheet(join('characters', `${id}.png`), buildSheet(8, 5, 32, characterFrames(weapon, pal)), 1024, 640)
}

writeSheet(join('enemies', 'enemy-doubter.png'), buildSheet(8, 2, 32, doubterFrames()), 1024, 256)
writeSheet(join('bosses', 'boss-doubt-wraith.png'), buildSheet(6, 4, 64, wraithFrames()), 1536, 1024)

console.log('Done.')
