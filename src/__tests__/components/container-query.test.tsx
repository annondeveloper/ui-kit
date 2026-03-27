import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ContainerQuery } from '../../components/container-query'
import { createRef } from 'react'

// ─── ResizeObserver mock ────────────────────────────────────────────────────

type ROCallback = (entries: ResizeObserverEntry[]) => void
let roCallback: ROCallback | null = null

class MockResizeObserver {
  constructor(cb: ROCallback) {
    roCallback = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  roCallback = null
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

function fireResize(width: number, height: number) {
  if (!roCallback) throw new Error('ResizeObserver not initialized')
  roCallback([
    {
      borderBoxSize: [{ inlineSize: width, blockSize: height }],
      contentBoxSize: [{ inlineSize: width, blockSize: height }],
      contentRect: { width, height, x: 0, y: 0, top: 0, left: 0, bottom: height, right: width, toJSON: () => {} },
      target: document.createElement('div'),
      devicePixelContentBoxSize: [],
    } as unknown as ResizeObserverEntry,
  ])
}

describe('ContainerQuery', () => {
  it('renders children as ReactNode', () => {
    render(
      <ContainerQuery data-testid="cq">
        <span>Hello</span>
      </ContainerQuery>,
    )
    expect(screen.getByTestId('cq')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies container-type: inline-size', () => {
    render(
      <ContainerQuery data-testid="cq">
        <span>content</span>
      </ContainerQuery>,
    )
    const el = screen.getByTestId('cq')
    expect(el.style.containerType).toBe('inline-size')
  })

  it('has the ui-container-query class', () => {
    render(
      <ContainerQuery data-testid="cq" className="custom">
        <span>content</span>
      </ContainerQuery>,
    )
    const el = screen.getByTestId('cq')
    expect(el.classList.contains('ui-container-query')).toBe(true)
    expect(el.classList.contains('custom')).toBe(true)
  })

  it('calls render-prop children with container size', () => {
    const spy = vi.fn(() => <span>rendered</span>)
    render(<ContainerQuery>{spy}</ContainerQuery>)

    // Initial call with default size
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ width: 0, height: 0, breakpoint: 'xs' }),
    )
  })

  it('updates render-prop with new size on resize', () => {
    const spy = vi.fn(() => <span data-testid="content">rendered</span>)
    render(<ContainerQuery>{spy}</ContainerQuery>)

    act(() => fireResize(700, 400))

    // Should have been called with the updated size
    const calls = spy.mock.calls as unknown[][]
    const lastCall = calls[calls.length - 1]
    expect(lastCall).toBeDefined()
    const sizeArg = lastCall[0] as { width: number; height: number; breakpoint: string }
    expect(sizeArg.width).toBe(700)
    expect(sizeArg.height).toBe(400)
    expect(sizeArg.breakpoint).toBe('lg')
  })

  it('always renders as div', () => {
    const { container } = render(
      <ContainerQuery>
        <span>content</span>
      </ContainerQuery>,
    )
    expect(container.firstElementChild?.tagName).toBe('DIV')
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <ContainerQuery ref={ref}>
        <span>content</span>
      </ContainerQuery>,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('has correct displayName', () => {
    expect(ContainerQuery.displayName).toBe('ContainerQuery')
  })

  it('merges custom style with container-type', () => {
    render(
      <ContainerQuery data-testid="cq" style={{ color: 'red' }}>
        <span>content</span>
      </ContainerQuery>,
    )
    const el = screen.getByTestId('cq')
    expect(el.style.containerType).toBe('inline-size')
    expect(el.style.color).toBe('red')
  })
})
