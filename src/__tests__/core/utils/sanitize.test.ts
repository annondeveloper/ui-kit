import { describe, it, expect } from 'vitest'
import { sanitize } from '../../../core/utils/sanitize'

describe('sanitize', () => {
  it('strips script tags and their content', () => {
    const result = sanitize('<p>Hello</p><script>alert("xss")</script>')
    expect(result).not.toContain('<script')
    expect(result).not.toContain('alert')
    expect(result).toContain('<p>Hello</p>')
  })

  it('strips event handler attributes', () => {
    const result = sanitize('<p onerror="alert(1)" onclick="steal()">text</p>')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('onclick')
    expect(result).toContain('<p>text</p>')
  })

  it('strips javascript: URLs from href', () => {
    const result = sanitize('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain('javascript:')
    expect(result).toBe('<a>click</a>')
  })

  it('allows whitelisted tags', () => {
    const input = '<p><strong>bold</strong> <em>italic</em> <code>code</code></p>'
    const result = sanitize(input)
    expect(result).toContain('<p>')
    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('<em>italic</em>')
    expect(result).toContain('<code>code</code>')
  })

  it('preserves href with http/https URLs', () => {
    const result = sanitize('<a href="https://example.com">link</a>')
    expect(result).toContain('href="https://example.com"')
  })

  it('removes data: URLs from href', () => {
    const result = sanitize('<a href="data:text/html,<script>alert(1)</script>">click</a>')
    expect(result).not.toContain('data:')
    expect(result).toBe('<a>click</a>')
  })

  it('handles nested tags correctly', () => {
    const result = sanitize('<div><p><strong>nested</strong></p></div>')
    expect(result).toBe('<div><p><strong>nested</strong></p></div>')
  })

  it('returns empty string for empty input', () => {
    expect(sanitize('')).toBe('')
  })

  it('preserves class and id attributes', () => {
    const result = sanitize('<p class="foo" id="bar">text</p>')
    expect(result).toContain('class="foo"')
    expect(result).toContain('id="bar"')
  })

  it('strips dangerous tags completely including children', () => {
    const result = sanitize('<iframe>content</iframe>')
    expect(result).not.toContain('<iframe')
    expect(result).not.toContain('content')
  })

  it('strips unknown tags but keeps their children', () => {
    const result = sanitize('<section><p>kept</p></section>')
    expect(result).not.toContain('<section')
    expect(result).toContain('<p>kept</p>')
  })

  it('handles br as self-closing', () => {
    const result = sanitize('<p>line1<br>line2</p>')
    expect(result).toContain('<br />')
  })

  it('escapes text content', () => {
    const result = sanitize('<p>&lt;script&gt;</p>')
    expect(result).not.toContain('<script>')
  })
})
