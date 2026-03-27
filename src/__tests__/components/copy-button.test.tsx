import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { CopyButton } from '../../components/copy-button'

expect.extend(toHaveNoViolations)

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: mockWriteText,
    },
  })
  mockWriteText.mockClear()
})

describe('CopyButton', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a button element', () => {
      render(
        <CopyButton value="test">
          {({ copied }) => <span>{copied ? 'Copied' : 'Copy'}</span>}
        </CopyButton>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders with ui-copy-button class', () => {
      const { container } = render(
        <CopyButton value="test">
          {() => <span>Copy</span>}
        </CopyButton>
      )
      expect(container.querySelector('.ui-copy-button')).toBeInTheDocument()
    })

    it('forwards ref to button element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(
        <CopyButton ref={ref} value="test">
          {() => <span>Copy</span>}
        </CopyButton>
      )
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('forwards className', () => {
      const { container } = render(
        <CopyButton value="test" className="custom">
          {() => <span>Copy</span>}
        </CopyButton>
      )
      expect(container.querySelector('.ui-copy-button')?.className).toContain('custom')
    })

    it('renders children via render prop with copied=false initially', () => {
      render(
        <CopyButton value="test">
          {({ copied }) => <span>{copied ? 'Copied!' : 'Copy'}</span>}
        </CopyButton>
      )
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })

    it('has type="button"', () => {
      render(
        <CopyButton value="test">
          {() => <span>Copy</span>}
        </CopyButton>
      )
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })
  })

  // ─── Size ─────────────────────────────────────────────────────────

  describe('size', () => {
    it('renders with default size="md"', () => {
      const { container } = render(
        <CopyButton value="test">{() => <span>Copy</span>}</CopyButton>
      )
      expect(container.querySelector('.ui-copy-button')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(
        <CopyButton value="test" size="sm">{() => <span>Copy</span>}</CopyButton>
      )
      expect(container.querySelector('.ui-copy-button')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(
        <CopyButton value="test" size="lg">{() => <span>Copy</span>}</CopyButton>
      )
      expect(container.querySelector('.ui-copy-button')).toHaveAttribute('data-size', 'lg')
    })
  })

  // ─── Copy behavior ───────────────────────────────────────────────

  describe('copy behavior', () => {
    it('copies value to clipboard on click', async () => {
      render(
        <CopyButton value="hello world">
          {({ copied }) => <span>{copied ? 'Copied!' : 'Copy'}</span>}
        </CopyButton>
      )
      await userEvent.click(screen.getByRole('button'))
      expect(mockWriteText).toHaveBeenCalledWith('hello world')
    })

    it('sets copied=true after click', async () => {
      render(
        <CopyButton value="test">
          {({ copied }) => <span>{copied ? 'Copied!' : 'Copy'}</span>}
        </CopyButton>
      )
      await userEvent.click(screen.getByRole('button'))
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    it('resets copied state after timeout', async () => {
      vi.useFakeTimers()
      render(
        <CopyButton value="test" timeout={1000}>
          {({ copied }) => <span>{copied ? 'Copied!' : 'Copy'}</span>}
        </CopyButton>
      )
      await act(async () => {
        screen.getByRole('button').click()
        // Allow the promise to resolve
        await Promise.resolve()
      })
      expect(screen.getByText('Copied!')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText('Copy')).toBeInTheDocument()
      vi.useRealTimers()
    })

    it('provides copy function via render prop', async () => {
      const copyFn = vi.fn()
      render(
        <CopyButton value="test">
          {({ copy }) => (
            <span onClick={() => { copy(); copyFn() }}>Custom Copy</span>
          )}
        </CopyButton>
      )
      await userEvent.click(screen.getByText('Custom Copy'))
      expect(mockWriteText).toHaveBeenCalledWith('test')
    })

    it('calls onClick handler along with copy', async () => {
      const handleClick = vi.fn()
      render(
        <CopyButton value="test" onClick={handleClick}>
          {() => <span>Copy</span>}
        </CopyButton>
      )
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Aria ─────────────────────────────────────────────────────────

  describe('aria', () => {
    it('has aria-label "Copy to clipboard" by default', () => {
      render(
        <CopyButton value="test">{() => <span>Copy</span>}</CopyButton>
      )
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy to clipboard')
    })

    it('changes aria-label to "Copied" after copy', async () => {
      render(
        <CopyButton value="test">
          {({ copied }) => <span>{copied ? 'Done' : 'Copy'}</span>}
        </CopyButton>
      )
      await userEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copied')
    })

    it('sets data-copied attribute when copied', async () => {
      const { container } = render(
        <CopyButton value="test">
          {({ copied }) => <span>{copied ? 'Done' : 'Copy'}</span>}
        </CopyButton>
      )
      await userEvent.click(screen.getByRole('button'))
      expect(container.querySelector('.ui-copy-button')).toHaveAttribute('data-copied', 'true')
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(
        <CopyButton value="test" motion={2}>{() => <span>Copy</span>}</CopyButton>
      )
      expect(container.querySelector('.ui-copy-button')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(
        <CopyButton value="test">{() => <span>Copy</span>}</CopyButton>
      )
      expect(container.querySelector('.ui-copy-button')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <CopyButton value="test">{() => <span>Copy</span>}</CopyButton>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<CopyButton value="test">{() => <span>Copy</span>}</CopyButton>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-copy-button)', () => {
      render(<CopyButton value="test">{() => <span>Copy</span>}</CopyButton>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map((s) => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-copy-button)')
    })
  })

  // ─── Display name ────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "CopyButton"', () => {
      expect(CopyButton.displayName).toBe('CopyButton')
    })
  })
})
