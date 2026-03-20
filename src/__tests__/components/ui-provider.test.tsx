import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, renderHook } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)
import { UIProvider, type UIProviderProps } from '../../components/ui-provider'
import { useTheme } from '../../core/tokens/theme-context'
import { useMotionLevel } from '../../core/motion/use-motion-level'
import { useDensity } from '../../core/tokens/density-context'
import type { ReactNode } from 'react'

// Mock applyTheme to verify it gets called
vi.mock('../../core/tokens/generator', async () => {
  const actual = await vi.importActual<typeof import('../../core/tokens/generator')>('../../core/tokens/generator')
  return {
    ...actual,
    applyTheme: vi.fn(),
  }
})

import { applyTheme } from '../../core/tokens/generator'

const mockedApplyTheme = vi.mocked(applyTheme)

function renderWithProvider(ui: ReactNode, props: Partial<UIProviderProps> = {}) {
  return render(
    <UIProvider {...props}>{ui}</UIProvider>
  )
}

describe('UIProvider', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('light')
    mockedApplyTheme.mockClear()
  })

  afterEach(() => {
    document.documentElement.classList.remove('light')
    vi.restoreAllMocks()
  })

  it('renders children', () => {
    renderWithProvider(<span data-testid="child">Hello</span>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('provides theme context to children', () => {
    function ThemeConsumer() {
      const { mode } = useTheme()
      return <span data-testid="mode">{mode}</span>
    }
    renderWithProvider(<ThemeConsumer />, { mode: 'light' })
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('provides motion context to children', () => {
    function MotionConsumer() {
      const level = useMotionLevel()
      return <span data-testid="motion">{level}</span>
    }
    renderWithProvider(<MotionConsumer />, { motion: 1 })
    expect(screen.getByTestId('motion').textContent).toBe('1')
  })

  it('provides density context to children', () => {
    function DensityConsumer() {
      const density = useDensity()
      return <span data-testid="density">{density}</span>
    }
    renderWithProvider(<DensityConsumer />, { density: 'compact' })
    expect(screen.getByTestId('density').textContent).toBe('compact')
  })

  it('sets data-motion attribute on wrapper', () => {
    renderWithProvider(<span>test</span>, { motion: 2 })
    const wrapper = document.querySelector('[data-ui-provider]')
    expect(wrapper).toBeTruthy()
    expect(wrapper?.getAttribute('data-motion')).toBe('2')
  })

  it('sets data-density attribute on wrapper', () => {
    renderWithProvider(<span>test</span>, { density: 'comfortable' })
    const wrapper = document.querySelector('[data-ui-provider]')
    expect(wrapper?.getAttribute('data-density')).toBe('comfortable')
  })

  it('sets data-ui-provider attribute on wrapper', () => {
    renderWithProvider(<span>test</span>)
    expect(document.querySelector('[data-ui-provider]')).toBeTruthy()
  })

  it('applies theme tokens when provided', () => {
    const tokens = { brand: 'oklch(65% 0.2 270)' } as any
    renderWithProvider(<span>test</span>, { theme: tokens })
    expect(mockedApplyTheme).toHaveBeenCalledWith(tokens)
  })

  it('does not call applyTheme when no theme provided', () => {
    renderWithProvider(<span>test</span>)
    expect(mockedApplyTheme).not.toHaveBeenCalled()
  })

  it('toggles html.light class for light mode', () => {
    renderWithProvider(<span>test</span>, { mode: 'light' })
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('removes html.light class for dark mode', () => {
    document.documentElement.classList.add('light')
    renderWithProvider(<span>test</span>, { mode: 'dark' })
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('defaults to motion=3', () => {
    renderWithProvider(<span>test</span>)
    const wrapper = document.querySelector('[data-ui-provider]')
    expect(wrapper?.getAttribute('data-motion')).toBe('3')
  })

  it('defaults to density=default', () => {
    renderWithProvider(<span>test</span>)
    const wrapper = document.querySelector('[data-ui-provider]')
    expect(wrapper?.getAttribute('data-density')).toBe('default')
  })

  it('defaults to mode=dark', () => {
    renderWithProvider(<span>test</span>)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('provides useTheme with mode dark by default', () => {
    function ThemeConsumer() {
      const { mode } = useTheme()
      return <span data-testid="mode">{mode}</span>
    }
    renderWithProvider(<ThemeConsumer />)
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  it('provides useMotionLevel with level 3 by default', () => {
    function MotionConsumer() {
      const level = useMotionLevel()
      return <span data-testid="motion">{level}</span>
    }
    renderWithProvider(<MotionConsumer />)
    expect(screen.getByTestId('motion').textContent).toBe('3')
  })

  it('provides useDensity with default by default', () => {
    function DensityConsumer() {
      const density = useDensity()
      return <span data-testid="density">{density}</span>
    }
    renderWithProvider(<DensityConsumer />)
    expect(screen.getByTestId('density').textContent).toBe('default')
  })

  it('passes onModeChange to ThemeProvider', () => {
    const onModeChange = vi.fn()
    function ThemeConsumer() {
      const { setMode } = useTheme()
      return <button onClick={() => setMode('light')}>toggle</button>
    }
    renderWithProvider(<ThemeConsumer />, { onModeChange })
    screen.getByText('toggle').click()
    expect(onModeChange).toHaveBeenCalledWith('light')
  })

  it('handles motion=0 for reduced motion', () => {
    function MotionConsumer() {
      const level = useMotionLevel()
      return <span data-testid="motion">{level}</span>
    }
    renderWithProvider(<MotionConsumer />, { motion: 0 })
    expect(screen.getByTestId('motion').textContent).toBe('0')
    expect(document.querySelector('[data-ui-provider]')?.getAttribute('data-motion')).toBe('0')
  })

  it('handles density=auto', () => {
    function DensityConsumer() {
      const density = useDensity()
      return <span data-testid="density">{density}</span>
    }
    renderWithProvider(<DensityConsumer />, { density: 'auto' })
    // auto resolves to default
    expect(screen.getByTestId('density').textContent).toBe('default')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithProvider(
      <main>
        <h1>App</h1>
        <p>Content</p>
      </main>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
