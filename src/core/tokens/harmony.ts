import { hexToOklch, oklchToHex } from '../utils/color'

export type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'

export interface HarmonyResult {
  type: HarmonyType
  colors: string[]
  description: string
}

const HARMONY_DESCRIPTIONS: Record<HarmonyType, string> = {
  complementary: 'Two colors opposite on the color wheel — maximum contrast and visual tension.',
  analogous: 'Three neighboring colors — harmonious and naturally pleasing.',
  triadic: 'Three colors equally spaced — vibrant and balanced.',
  'split-complementary':
    'A base color plus two colors adjacent to its complement — high contrast with less tension.',
  tetradic: 'Four colors forming a rectangle — rich palette with many possibilities.',
}

const HARMONY_OFFSETS: Record<HarmonyType, number[]> = {
  complementary: [0, 180],
  analogous: [-30, 0, 30],
  triadic: [0, 120, 240],
  'split-complementary': [0, 150, 210],
  tetradic: [0, 90, 180, 270],
}

function rotateHue(hue: number, degrees: number): number {
  return (((hue + degrees) % 360) + 360) % 360
}

/**
 * Generate a color-harmony palette from a brand hex color. Converts to OKLCH,
 * rotates hue by the harmony offsets (preserving lightness/chroma), and converts
 * each result back to hex.
 */
export function generateHarmony(brandHex: string, type: HarmonyType): HarmonyResult {
  const base = hexToOklch(brandHex)
  const colors = HARMONY_OFFSETS[type].map(offset =>
    oklchToHex({ l: base.l, c: base.c, h: rotateHue(base.h, offset) })
  )
  return { type, colors, description: HARMONY_DESCRIPTIONS[type] }
}

/** Returns all five harmony palettes for a given brand color. */
export function suggestHarmonies(brandHex: string): HarmonyResult[] {
  const types: HarmonyType[] = [
    'complementary',
    'analogous',
    'triadic',
    'split-complementary',
    'tetradic',
  ]
  return types.map(type => generateHarmony(brandHex, type))
}
