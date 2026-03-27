import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Affix } from '../../components/affix'

expect.extend(toHaveNoViolations)

describe('Affix', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders children content', () => {
      render(<Affix><button>Click</button></Affix>)
      expect(screen.getByText('Click')).toBeInTheDocument()
    })

    it('renders a div with ui-affix class', () => {
      const { container } = render(<Affix><span>Content</span></Affix>)
      const root = container.firstElementChild
      expect(root?.className).toContain('ui-affix')
    })

    it('renders as a div element', () => {
      const { container } = render(<Affix><span>Content</span></Affix>)
      expect(container.firstElementChild?.tagName).toBe('DIV')
    })
  })

  // ─── Position ──────────────────────────────────────────────────────

  describe('position', () => {
    it('applies default bottom and right positioning', () => {
      const { container } = render(<Affix><span>Content</span></Affix>)
      const root = container.firstElementChild as HTMLElement
      expect(root.style.bottom).toBe('20px')
      expect(root.style.right).toBe('20px')
    })

    it('applies custom top position', () => {
      const { container } = render(<Affix position={{ top: 10 }}><span>Content</span></Affix>)
      const root = container.firstElementChild as HTMLElement
      expect(root.style.top).toBe('10px')
    })

    it('applies custom bottom and left position', () => {
      const { container } = render(
        <Affix position={{ bottom: 30, left: 15 }}><span>Content</span></Affix>
      )
      const root = container.firstElementChild as HTMLElement
      expect(root.style.bottom).toBe('30px')
      expect(root.style.left).toBe('15px')
    })

    it('applies all four position values', () => {
      const { container } = render(
        <Affix position={{ top: 5, bottom: 10, left: 15, right: 20 }}>
          <span>Content</span>
        </Affix>
      )
      const root = container.firstElementChild as HTMLElement
      expect(root.style.top).toBe('5px')
      expect(root.style.bottom).toBe('10px')
      expect(root.style.left).toBe('15px')
      expect(root.style.right).toBe('20px')
    })
  })

  // ─── Z-index ───────────────────────────────────────────────────────

  describe('zIndex', () => {
    it('applies default zIndex of 100', () => {
      const { container } = render(<Affix><span>Content</span></Affix>)
      const root = container.firstElementChild as HTMLElement
      expect(root.style.zIndex).toBe('100')
    })

    it('applies custom zIndex', () => {
      const { container } = render(<Affix zIndex={500}><span>Content</span></Affix>)
      const root = container.firstElementChild as HTMLElement
      expect(root.style.zIndex).toBe('500')
    })
  })

  // ─── Custom style ─────────────────────────────────────────────────

  describe('custom style', () => {
    it('merges custom style with position styles', () => {
      const { container } = render(
        <Affix style={{ background: 'red' }}><span>Content</span></Affix>
      )
      const root = container.firstElementChild as HTMLElement
      expect(root.style.background).toBe('red')
      expect(root.style.bottom).toBe('20px')
    })
  })

  // ─── Ref & className ──────────────────────────────────────────────

  describe('ref and className', () => {
    it('forwards ref to root div', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Affix ref={ref}><span>Content</span></Affix>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('merges custom className', () => {
      const { container } = render(<Affix className="custom"><span>Content</span></Affix>)
      const root = container.firstElementChild
      expect(root?.className).toContain('ui-affix')
      expect(root?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<Affix data-testid="my-affix" id="affix-1"><span>Content</span></Affix>)
      expect(screen.getByTestId('my-affix')).toHaveAttribute('id', 'affix-1')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Affix><button>Action</button></Affix>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Affix><span>Content</span></Affix>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-affix)', () => {
      render(<Affix><span>Content</span></Affix>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-affix)')
    })
  })

  // ─── Display name ──────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Affix"', () => {
      expect(Affix.displayName).toBe('Affix')
    })
  })
})
