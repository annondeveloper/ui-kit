import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Typography } from '../../components/typography'

expect.extend(toHaveNoViolations)

describe('Typography', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders correct element per variant — h1 renders <h1>', () => {
      render(<Typography variant="h1">Heading</Typography>)
      expect(screen.getByText('Heading').tagName).toBe('H1')
    })

    it('renders correct element per variant — h3 renders <h3>', () => {
      render(<Typography variant="h3">Sub</Typography>)
      expect(screen.getByText('Sub').tagName).toBe('H3')
    })

    it('renders correct element per variant — body renders <p>', () => {
      render(<Typography variant="body">Paragraph</Typography>)
      expect(screen.getByText('Paragraph').tagName).toBe('P')
    })

    it('renders correct element per variant — code renders <code>', () => {
      render(<Typography variant="code">snippet</Typography>)
      expect(screen.getByText('snippet').tagName).toBe('CODE')
    })

    it('renders correct element per variant — overline renders <span>', () => {
      render(<Typography variant="overline">Label</Typography>)
      expect(screen.getByText('Label').tagName).toBe('SPAN')
    })

    it('renders correct element per variant — caption renders <span>', () => {
      render(<Typography variant="caption">Note</Typography>)
      expect(screen.getByText('Note').tagName).toBe('SPAN')
    })

    it('defaults to body variant (renders <p>)', () => {
      render(<Typography>Default</Typography>)
      const el = screen.getByText('Default')
      expect(el.tagName).toBe('P')
      expect(el).toHaveAttribute('data-variant', 'body')
    })

    it('applies ui-typography class', () => {
      render(<Typography>Styled</Typography>)
      expect(screen.getByText('Styled').className).toContain('ui-typography')
    })

    it('sets data-color attribute', () => {
      render(<Typography color="brand">Branded</Typography>)
      expect(screen.getByText('Branded')).toHaveAttribute('data-color', 'brand')
    })

    it('sets data-color="danger"', () => {
      render(<Typography color="danger">Error</Typography>)
      expect(screen.getByText('Error')).toHaveAttribute('data-color', 'danger')
    })

    it('applies weight via inline style', () => {
      render(<Typography weight={700}>Bold</Typography>)
      const el = screen.getByText('Bold')
      expect(el.style.fontWeight).toBe('700')
    })

    it('sets data-align attribute', () => {
      render(<Typography align="center">Centered</Typography>)
      expect(screen.getByText('Centered')).toHaveAttribute('data-align', 'center')
    })

    it('sets data-truncate="1" for truncate={true}', () => {
      render(<Typography truncate>Truncated</Typography>)
      expect(screen.getByText('Truncated')).toHaveAttribute('data-truncate', '1')
    })

    it('sets data-truncate-lines for multi-line truncate', () => {
      render(<Typography truncate={3}>Multi</Typography>)
      expect(screen.getByText('Multi')).toHaveAttribute('data-truncate-lines', '')
    })

    it('overrides element with as prop', () => {
      render(<Typography variant="body" as="div">Div</Typography>)
      expect(screen.getByText('Div').tagName).toBe('DIV')
    })

    it('forwards ref to rendered element', () => {
      const ref = createRef<HTMLElement>()
      render(<Typography variant="h2" ref={ref}>Ref</Typography>)
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('H2')
    })

    it('forwards className', () => {
      render(<Typography className="custom">Custom</Typography>)
      const el = screen.getByText('Custom')
      expect(el.className).toContain('ui-typography')
      expect(el.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<Typography data-testid="typo" id="t-1">Attrs</Typography>)
      const el = screen.getByTestId('typo')
      expect(el).toHaveAttribute('id', 't-1')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (heading)', async () => {
      const { container } = render(<Typography variant="h1">Accessible Heading</Typography>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (body)', async () => {
      const { container } = render(<Typography variant="body">Accessible body text.</Typography>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (code)', async () => {
      const { container } = render(<Typography variant="code">const x = 1</Typography>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Typography>Styled</Typography>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-typography)', () => {
      render(<Typography>Scoped</Typography>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-typography)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Typography"', () => {
      expect(Typography.displayName).toBe('Typography')
    })
  })
})
