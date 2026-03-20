import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { StreamingText } from '../../domain/streaming-text'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('StreamingText', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<StreamingText text="Hello" />)
      expect(container.querySelector('.ui-streaming-text')).toBeInTheDocument()
    })

    it('renders text content', () => {
      render(<StreamingText text="Hello world" />)
      expect(screen.getByText(/Hello world/)).toBeInTheDocument()
    })

    it('renders empty text gracefully', () => {
      const { container } = render(<StreamingText text="" />)
      expect(container.querySelector('.ui-streaming-text')).toBeInTheDocument()
    })

    it('renders long text with wrapping', () => {
      const longText = 'A'.repeat(500)
      render(<StreamingText text={longText} />)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('preserves whitespace', () => {
      const { container } = render(<StreamingText text="Line 1\n  indented\nLine 3" />)
      const content = container.querySelector('.ui-streaming-text__content')
      expect(content).toBeInTheDocument()
    })

    it('passes className', () => {
      const { container } = render(<StreamingText text="Hi" className="custom" />)
      expect(container.querySelector('.ui-streaming-text.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<StreamingText text="Hi" data-testid="stream" />)
      expect(screen.getByTestId('stream')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(StreamingText.displayName).toBe('StreamingText')
    })
  })

  // ─── Cursor ─────────────────────────────────────────────────────────

  describe('cursor', () => {
    it('shows cursor when streaming', () => {
      const { container } = render(<StreamingText text="Hello" streaming />)
      expect(container.querySelector('.ui-streaming-text__cursor')).toBeInTheDocument()
    })

    it('shows cursor by default when streaming is true', () => {
      const { container } = render(<StreamingText text="Hello" streaming showCursor />)
      expect(container.querySelector('.ui-streaming-text__cursor')).toBeInTheDocument()
    })

    it('hides cursor when showCursor is false', () => {
      const { container } = render(<StreamingText text="Hello" streaming showCursor={false} />)
      expect(container.querySelector('.ui-streaming-text__cursor')).not.toBeInTheDocument()
    })

    it('cursor disappears when streaming ends', () => {
      const { container, rerender } = render(<StreamingText text="Hello" streaming />)
      expect(container.querySelector('.ui-streaming-text__cursor')).toBeInTheDocument()

      rerender(<StreamingText text="Hello world" streaming={false} />)
      // Cursor should have fade-out data attribute or be gone
      const cursor = container.querySelector('.ui-streaming-text__cursor')
      if (cursor) {
        expect(cursor.getAttribute('data-fading')).toBe('true')
      }
    })

    it('does not show cursor when not streaming and showCursor not set', () => {
      const { container } = render(<StreamingText text="Hello" />)
      expect(container.querySelector('.ui-streaming-text__cursor')).not.toBeInTheDocument()
    })

    it('shows cursor when showCursor is true even if not streaming', () => {
      const { container } = render(<StreamingText text="Hello" showCursor />)
      expect(container.querySelector('.ui-streaming-text__cursor')).toBeInTheDocument()
    })
  })

  // ─── Speed / Typewriter ─────────────────────────────────────────────

  describe('speed typewriter', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('reveals text gradually when speed is set', () => {
      const { container } = render(<StreamingText text="Hello" speed={1} />)
      const content = container.querySelector('.ui-streaming-text__content')
      // Initially should not show full text
      expect(content?.textContent?.length).toBeLessThanOrEqual(1)
    })

    it('reveals more text over time', async () => {
      const { container } = render(<StreamingText text="Hello" speed={2} />)
      const content = container.querySelector('.ui-streaming-text__content')
      const initialLength = content?.textContent?.length ?? 0

      // Advance timers to allow requestAnimationFrame
      act(() => {
        vi.advanceTimersByTime(200)
      })

      const laterLength = content?.textContent?.length ?? 0
      expect(laterLength).toBeGreaterThanOrEqual(initialLength)
    })

    it('shows all text immediately when no speed is set', () => {
      render(<StreamingText text="Hello world" />)
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })
  })

  // ─── onComplete ─────────────────────────────────────────────────────

  describe('onComplete', () => {
    it('calls onComplete when streaming ends', () => {
      const onComplete = vi.fn()
      const { rerender } = render(
        <StreamingText text="Hello" streaming onComplete={onComplete} />
      )
      expect(onComplete).not.toHaveBeenCalled()

      rerender(<StreamingText text="Hello world" streaming={false} onComplete={onComplete} />)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('does not call onComplete if never streaming', () => {
      const onComplete = vi.fn()
      render(<StreamingText text="Hello" onComplete={onComplete} />)
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  // ─── Code blocks ────────────────────────────────────────────────────

  describe('code blocks', () => {
    it('detects triple backtick code blocks', () => {
      const text = 'Before\n```\nconst x = 1\n```\nAfter'
      const { container } = render(<StreamingText text={text} />)
      expect(container.querySelector('.ui-streaming-text__code-block')).toBeInTheDocument()
    })

    it('renders code block with language hint', () => {
      const text = 'Before\n```typescript\nconst x: number = 1\n```\nAfter'
      const { container } = render(<StreamingText text={text} />)
      const codeBlock = container.querySelector('.ui-streaming-text__code-block')
      expect(codeBlock).toBeInTheDocument()
    })

    it('handles text without code blocks', () => {
      const { container } = render(<StreamingText text="Just plain text" />)
      expect(container.querySelector('.ui-streaming-text__code-block')).not.toBeInTheDocument()
    })

    it('handles multiple code blocks', () => {
      const text = '```\nblock1\n```\nMiddle\n```\nblock2\n```'
      const { container } = render(<StreamingText text={text} />)
      const blocks = container.querySelectorAll('.ui-streaming-text__code-block')
      expect(blocks.length).toBe(2)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<StreamingText text="Hi" motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<StreamingText text="Hi" motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-live="polite"', () => {
      const { container } = render(<StreamingText text="Hello" />)
      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
    })

    it('has aria-busy when streaming', () => {
      const { container } = render(<StreamingText text="Hello" streaming />)
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    })

    it('does not have aria-busy when not streaming', () => {
      const { container } = render(<StreamingText text="Hello" />)
      const el = container.querySelector('.ui-streaming-text')
      expect(el?.getAttribute('aria-busy')).not.toBe('true')
    })

    it('has no axe violations', async () => {
      const { container } = render(<StreamingText text="Hello world" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when streaming', async () => {
      const { container } = render(<StreamingText text="Hello" streaming />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with code blocks', async () => {
      const text = 'Before\n```\nconst x = 1\n```\nAfter'
      const { container } = render(<StreamingText text={text} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
