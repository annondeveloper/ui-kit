import { describe, it, expect } from 'vitest'
import { iconPaths } from '../../../core/icons/paths'

// Coordinates each SVG path command consumes per repetition.
const ARITY: Record<string, number> = {
  M: 2, L: 2, T: 2, // moveto / lineto / smooth-quadratic
  H: 1, V: 1, // horizontal / vertical lineto
  C: 6, S: 4, Q: 4, // cubic / smooth-cubic / quadratic
}

/**
 * Validate an SVG path `d` string by splitting it into command segments and
 * checking each command's coordinate count is a positive multiple of its arity.
 * Catches malformed paths (e.g. a smooth-cubic `s` with 14 numbers) that browsers
 * warn about with "<path> attribute d: Expected number".
 *
 * Elliptical-arc commands (A/a) are skipped: their large-arc/sweep flags are
 * single 0/1 digits that may glue to adjacent coordinates (`...0 100 16...`),
 * which a generic number tokenizer can't reliably split. The bug class this guards
 * against (the eye icon's `s` command) is fully covered by the remaining commands.
 */
function validatePath(d: string): string | null {
  for (const m of d.matchAll(/([a-zA-Z])([^a-zA-Z]*)/g)) {
    const cmd = m[1]
    const upper = cmd.toUpperCase()
    const args = m[2].trim()
    if (upper === 'Z') {
      if (args) return `"${cmd}" takes no args, got "${args}"`
      continue
    }
    if (upper === 'A') continue // arc flag tokenization is ambiguous — skip
    const arity = ARITY[upper]
    if (arity === undefined) return `unknown command "${cmd}"`
    const nums = args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []
    if (nums.length === 0 || nums.length % arity !== 0) {
      return `"${cmd}" expects multiples of ${arity} coords, got ${nums.length}`
    }
  }
  return null
}

describe('icon path data', () => {
  const names = Object.keys(iconPaths)

  it('has a non-empty icon set', () => {
    expect(names.length).toBeGreaterThan(0)
  })

  it('every icon path is well-formed (correct coordinate counts per command)', () => {
    const bad: string[] = []
    for (const name of names) {
      for (const d of iconPaths[name]) {
        const err = validatePath(d)
        if (err) bad.push(`${name}: ${err} — "${d}"`)
      }
    }
    expect(bad).toEqual([])
  })

  it('rejects the previously-malformed eye path (regression guard)', () => {
    // The old eye outline had an `s` command with 14 coords (not a multiple of 4).
    expect(validatePath('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z')).toMatch(/expects multiples of 4/)
  })
})
