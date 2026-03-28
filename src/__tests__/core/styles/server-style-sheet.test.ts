import { describe, it, expect } from 'vitest'
import { ServerStyleSheet } from '../../../core/styles/server-style-sheet'

describe('ServerStyleSheet', () => {
  it('collects styles by id', () => {
    const sheet = new ServerStyleSheet()
    sheet.collect('btn', '.ui-button { color: red; }')
    sheet.collect('card', '.ui-card { padding: 1rem; }')
    expect(sheet.size).toBe(2)
  })

  it('overwrites duplicate ids with latest CSS', () => {
    const sheet = new ServerStyleSheet()
    sheet.collect('btn', '.ui-button { color: red; }')
    sheet.collect('btn', '.ui-button { color: blue; }')
    expect(sheet.size).toBe(1)
    expect(sheet.getCSS()).toContain('color: blue')
    expect(sheet.getCSS()).not.toContain('color: red')
  })

  it('getStyleTags() returns HTML style tags with data attributes', () => {
    const sheet = new ServerStyleSheet()
    sheet.collect('btn', '.ui-button { color: red; }')
    sheet.collect('card', '.ui-card { padding: 1rem; }')
    const tags = sheet.getStyleTags()
    expect(tags).toContain('<style data-ui-style="btn">')
    expect(tags).toContain('<style data-ui-style="card">')
    expect(tags).toContain('.ui-button { color: red; }')
    expect(tags).toContain('.ui-card { padding: 1rem; }')
  })

  it('getStyleElement() returns a React element with combined CSS', () => {
    const sheet = new ServerStyleSheet()
    sheet.collect('btn', '.ui-button { color: red; }')
    sheet.collect('card', '.ui-card { padding: 1rem; }')
    const el = sheet.getStyleElement()
    expect(el.type).toBe('style')
    expect((el.props as any)['data-ui-styles']).toBe('ssr')
    // Verify the element contains both style chunks (library-generated CSS, safe for innerHTML)
    const innerCSS = (el.props as any).dangerouslySetInnerHTML.__html as string
    expect(innerCSS).toContain('.ui-button { color: red; }')
    expect(innerCSS).toContain('.ui-card { padding: 1rem; }')
  })

  it('getCSS() returns all CSS as a single string', () => {
    const sheet = new ServerStyleSheet()
    sheet.collect('a', '.a { display: flex; }')
    sheet.collect('b', '.b { display: grid; }')
    const css = sheet.getCSS()
    expect(css).toContain('.a { display: flex; }')
    expect(css).toContain('.b { display: grid; }')
  })

  it('seal() prevents further collection', () => {
    const sheet = new ServerStyleSheet()
    sheet.collect('btn', '.ui-button { color: red; }')
    sheet.seal()
    sheet.collect('card', '.ui-card { padding: 1rem; }')
    expect(sheet.size).toBe(1)
    expect(sheet.getCSS()).not.toContain('.ui-card')
  })

  it('size returns 0 when empty', () => {
    const sheet = new ServerStyleSheet()
    expect(sheet.size).toBe(0)
  })

  it('getStyleTags() returns empty string when empty', () => {
    const sheet = new ServerStyleSheet()
    expect(sheet.getStyleTags()).toBe('')
  })

  it('getCSS() returns empty string when empty', () => {
    const sheet = new ServerStyleSheet()
    expect(sheet.getCSS()).toBe('')
  })
})
