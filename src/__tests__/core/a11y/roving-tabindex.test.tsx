import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { useRovingTabindex } from '../../../core/a11y/roving-tabindex'

function RovingTestComponent({ orientation = 'horizontal' as const, loop = true, onActivate }: {
  orientation?: 'horizontal' | 'vertical' | 'both'
  loop?: boolean
  onActivate?: (index: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useRovingTabindex(ref, { orientation, loop, onActivate })

  return (
    <div ref={ref} data-testid="container" role="tablist">
      <button role="tab" data-testid="tab0">Tab 0</button>
      <button role="tab" data-testid="tab1">Tab 1</button>
      <button role="tab" data-testid="tab2">Tab 2</button>
    </div>
  )
}

describe('useRovingTabindex', () => {
  it('sets first item tabindex=0 and rest tabindex=-1', () => {
    render(<RovingTestComponent />)
    expect(screen.getByTestId('tab0').getAttribute('tabindex')).toBe('0')
    expect(screen.getByTestId('tab1').getAttribute('tabindex')).toBe('-1')
    expect(screen.getByTestId('tab2').getAttribute('tabindex')).toBe('-1')
  })

  it('moves focus forward with ArrowRight for horizontal', () => {
    const onActivate = vi.fn()
    render(<RovingTestComponent onActivate={onActivate} />)
    const container = screen.getByTestId('container')

    // Focus first tab
    screen.getByTestId('tab0').focus()

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))

    expect(screen.getByTestId('tab0').getAttribute('tabindex')).toBe('-1')
    expect(screen.getByTestId('tab1').getAttribute('tabindex')).toBe('0')
    expect(onActivate).toHaveBeenCalledWith(1)
  })

  it('moves focus backward with ArrowLeft for horizontal', () => {
    const onActivate = vi.fn()
    render(<RovingTestComponent onActivate={onActivate} />)
    const container = screen.getByTestId('container')

    // Move to tab1 first
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    // Then move back
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))

    expect(screen.getByTestId('tab0').getAttribute('tabindex')).toBe('0')
    expect(onActivate).toHaveBeenLastCalledWith(0)
  })

  it('loops from last to first when loop is true', () => {
    render(<RovingTestComponent loop={true} />)
    const container = screen.getByTestId('container')

    // Move forward 3 times (0 -> 1 -> 2 -> 0)
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))

    expect(screen.getByTestId('tab0').getAttribute('tabindex')).toBe('0')
  })

  it('does not loop when loop is false', () => {
    render(<RovingTestComponent loop={false} />)
    const container = screen.getByTestId('container')

    // Move forward 3 times (should stay at last)
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))

    expect(screen.getByTestId('tab2').getAttribute('tabindex')).toBe('0')
  })

  it('Home moves to first item', () => {
    render(<RovingTestComponent />)
    const container = screen.getByTestId('container')

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))

    expect(screen.getByTestId('tab0').getAttribute('tabindex')).toBe('0')
  })

  it('End moves to last item', () => {
    render(<RovingTestComponent />)
    const container = screen.getByTestId('container')

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))

    expect(screen.getByTestId('tab2').getAttribute('tabindex')).toBe('0')
  })

  it('uses ArrowUp/ArrowDown for vertical orientation', () => {
    const onActivate = vi.fn()
    render(<RovingTestComponent orientation="vertical" onActivate={onActivate} />)
    const container = screen.getByTestId('container')

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(onActivate).toHaveBeenCalledWith(1)

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(onActivate).toHaveBeenCalledWith(0)
  })
})
