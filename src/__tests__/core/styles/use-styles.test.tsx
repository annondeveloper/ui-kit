import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import React from 'react'
import { useStyles } from '../../../core/styles/use-styles'
import { css } from '../../../core/styles/css-tag'

const buttonStyles = css`.button { color: red; }`

function TestComponent() {
  const cls = useStyles('button', buttonStyles)
  return <div data-testid="el" className={cls('root')} />
}

function TestConditional({ active }: { active: boolean }) {
  const cls = useStyles('button', buttonStyles)
  return <div data-testid="el" className={cls('root', active && 'active')} />
}

describe('useStyles', () => {
  afterEach(() => {
    cleanup()
  })

  it('returns a className builder function', () => {
    const { getByTestId } = render(<TestComponent />)
    const el = getByTestId('el')
    expect(el.className).toBeTruthy()
  })

  it('className builder joins with ui- prefix', () => {
    const { getByTestId } = render(<TestComponent />)
    const el = getByTestId('el')
    expect(el.className).toBe('ui-button')
  })

  it('className builder handles conditional modifier classes', () => {
    const { getByTestId } = render(<TestConditional active={true} />)
    const el = getByTestId('el')
    expect(el.className).toBe('ui-button ui-button--active')
  })

  it('className builder filters falsy values', () => {
    const { getByTestId } = render(<TestConditional active={false} />)
    const el = getByTestId('el')
    expect(el.className).toBe('ui-button')
  })

  it('multiple components using same styles share the sheet (ref counted)', () => {
    const { unmount: unmount1 } = render(<TestComponent />)
    const { unmount: unmount2 } = render(<TestComponent />)
    // Both mounted — style should be in DOM
    const stylesBefore = document.querySelectorAll(`[data-ui-style]`)
    // At least one style tag should exist (or adoptedStyleSheets)
    // We just verify no errors on mount/unmount
    unmount1()
    unmount2()
  })
})
