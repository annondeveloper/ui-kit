import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import React from 'react'
import { StyleCollector } from '../../../core/styles/ssr'
import { StyleProvider } from '../../../core/styles/style-context'
import { useStyles } from '../../../core/styles/use-styles'
import { css } from '../../../core/styles/css-tag'

const cardStyles = css`.card { padding: 16px; }`

function Card() {
  const cls = useStyles('card', cardStyles)
  return <div className={cls('root')}>Card</div>
}

describe('StyleCollector', () => {
  it('deduplicates by ID', () => {
    const collector = new StyleCollector()
    collector.add('ui-0', '.a { color: red; }')
    collector.add('ui-0', '.a { color: red; }')
    expect(collector.getIds()).toHaveLength(1)
  })

  it('collect() returns all CSS', () => {
    const collector = new StyleCollector()
    collector.add('ui-0', '.a { color: red; }')
    collector.add('ui-1', '.b { color: blue; }')
    const result = collector.collect()
    expect(result).toContain('.a { color: red; }')
    expect(result).toContain('.b { color: blue; }')
  })

  it('clear() empties the collector', () => {
    const collector = new StyleCollector()
    collector.add('ui-0', '.a { color: red; }')
    collector.clear()
    expect(collector.getIds()).toHaveLength(0)
    expect(collector.collect()).toBe('')
  })
})

describe('useStyles with StyleProvider (SSR)', () => {
  afterEach(() => {
    cleanup()
  })

  it('registers with collector when StyleProvider is present', () => {
    const collector = new StyleCollector()
    render(
      <StyleProvider collector={collector}>
        <Card />
      </StyleProvider>
    )
    expect(collector.getIds().length).toBeGreaterThan(0)
    expect(collector.collect()).toContain('.card { padding: 16px; }')
  })

  it('does not inject into DOM when collector is present', () => {
    const collector = new StyleCollector()
    // Clear any existing style tags
    document.querySelectorAll('[data-ui-style]').forEach(el => el.remove())

    render(
      <StyleProvider collector={collector}>
        <Card />
      </StyleProvider>
    )

    const styleTags = document.querySelectorAll('[data-ui-style]')
    expect(styleTags.length).toBe(0)
  })
})
