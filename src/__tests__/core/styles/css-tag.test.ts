import { describe, it, expect } from 'vitest'
import { css, type CSSDefinition } from '../../../core/styles/css-tag'

describe('css tagged template literal', () => {
  it('returns a CSSDefinition with id and css string', () => {
    const result = css`
      .button { color: red; }
    `
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('css')
    expect(typeof result.id).toBe('string')
    expect(result.id).toMatch(/^ui-\d+$/)
    expect(result.css).toBe('.button { color: red; }')
  })

  it('generates unique IDs for different templates', () => {
    const a = css`.a { color: red; }`
    const b = css`.b { color: blue; }`
    expect(a.id).not.toBe(b.id)
  })

  it('handles template interpolation', () => {
    const color = 'red'
    const size = 16
    const result = css`.text { color: ${color}; font-size: ${size}px; }`
    expect(result.css).toBe('.text { color: red; font-size: 16px; }')
  })
})
