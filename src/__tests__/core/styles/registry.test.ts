import { describe, it, expect, beforeEach } from 'vitest'
import { StyleRegistry } from '../../../core/styles/registry'

describe('StyleRegistry', () => {
  let registry: StyleRegistry

  beforeEach(() => {
    registry = new StyleRegistry()
  })

  it('registers a style and has ref count of 1', () => {
    registry.add('ui-0', '.a { color: red; }')
    expect(registry.has('ui-0')).toBe(true)
    expect(registry.refCount('ui-0')).toBe(1)
  })

  it('increments ref count on duplicate add', () => {
    registry.add('ui-0', '.a { color: red; }')
    registry.add('ui-0', '.a { color: red; }')
    expect(registry.refCount('ui-0')).toBe(2)
  })

  it('decrements ref count on remove', () => {
    registry.add('ui-0', '.a { color: red; }')
    registry.add('ui-0', '.a { color: red; }')
    registry.remove('ui-0')
    expect(registry.refCount('ui-0')).toBe(1)
  })

  it('removes style when ref count reaches zero', () => {
    registry.add('ui-0', '.a { color: red; }')
    registry.remove('ui-0')
    expect(registry.has('ui-0')).toBe(false)
    expect(registry.refCount('ui-0')).toBe(0)
  })

  it('collectCSS returns all registered CSS strings', () => {
    registry.add('ui-0', '.a { color: red; }')
    registry.add('ui-1', '.b { color: blue; }')
    const result = registry.collectCSS()
    expect(result).toContain('.a { color: red; }')
    expect(result).toContain('.b { color: blue; }')
  })

  it('remove on non-existent id is a no-op', () => {
    registry.remove('nonexistent')
    expect(registry.has('nonexistent')).toBe(false)
  })
})
