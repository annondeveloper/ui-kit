import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { useRef, useState } from 'react'
import { useFocusTrap } from '../../../core/a11y/focus-trap'

function FocusTrapTestComponent({ active, returnFocus }: { active: boolean; returnFocus?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, { active, returnFocus })

  return (
    <div ref={ref} data-testid="container">
      <button data-testid="btn1">First</button>
      <button data-testid="btn2">Second</button>
      <button data-testid="btn3">Third</button>
    </div>
  )
}

describe('useFocusTrap', () => {
  it('focuses first focusable element when activated', () => {
    render(<FocusTrapTestComponent active={true} />)
    expect(document.activeElement).toBe(screen.getByTestId('btn1'))
  })

  it('does not focus when inactive', () => {
    const previousActive = document.activeElement
    render(<FocusTrapTestComponent active={false} />)
    expect(document.activeElement).toBe(previousActive)
  })

  it('wraps focus from last to first on Tab', () => {
    render(<FocusTrapTestComponent active={true} />)
    const container = screen.getByTestId('container')
    const btn3 = screen.getByTestId('btn3')

    // Focus the last button
    btn3.focus()
    expect(document.activeElement).toBe(btn3)

    // Simulate Tab on last element
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const preventSpy = vi.spyOn(event, 'preventDefault')
    container.dispatchEvent(event)

    expect(preventSpy).toHaveBeenCalled()
  })

  it('wraps focus from first to last on Shift+Tab', () => {
    render(<FocusTrapTestComponent active={true} />)
    const container = screen.getByTestId('container')
    const btn1 = screen.getByTestId('btn1')

    // Focus should already be on first button
    expect(document.activeElement).toBe(btn1)

    // Simulate Shift+Tab on first element
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    const preventSpy = vi.spyOn(event, 'preventDefault')
    container.dispatchEvent(event)

    expect(preventSpy).toHaveBeenCalled()
  })

  it('returns focus to previous element on deactivate when returnFocus is true', () => {
    const outerButton = document.createElement('button')
    document.body.appendChild(outerButton)
    outerButton.focus()
    expect(document.activeElement).toBe(outerButton)

    const { unmount } = render(<FocusTrapTestComponent active={true} returnFocus={true} />)
    // Focus should have moved into the trap
    expect(document.activeElement).toBe(screen.getByTestId('btn1'))

    unmount()
    // Focus should return to the outer button
    expect(document.activeElement).toBe(outerButton)

    document.body.removeChild(outerButton)
  })
})
