import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { WavyBackground } from '../../domain/wavy-background'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('WavyBackground', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<WavyBackground />)
      expect(container.querySelector('.ui-wavy-background')).toBeInTheDocument()
    })

    it('renders children in content wrapper', () => {
      render(<WavyBackground><p>Hello</p></WavyBackground>)
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('renders SVG element', () => {
      const { container } = render(<WavyBackground />)
      expect(container.querySelector('.ui-wavy-background--svg')).toBeInTheDocument()
    })

    it('renders wave paths', () => {
      const { container } = render(<WavyBackground waveCount={3} />)
      const waves = container.querySelectorAll('.ui-wavy-background--wave')
      expect(waves.length).toBe(3)
    })

    it('renders default 5 waves', () => {
      const { container } = render(<WavyBackground />)
      const waves = container.querySelectorAll('.ui-wavy-background--wave')
      expect(waves.length).toBe(5)
    })

    it('has displayName', () => {
      expect(WavyBackground.displayName).toBe('WavyBackground')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(<WavyBackground className="custom" />)
      expect(container.querySelector('.ui-wavy-background.custom')).toBeInTheDocument()
    })

    it('applies custom color to wave fills', () => {
      const { container } = render(
        <WavyBackground color="oklch(50% 0.2 30)" waveCount={1} />
      )
      const wave = container.querySelector('.ui-wavy-background--wave') as SVGPathElement
      expect(wave.getAttribute('fill')).toBe('oklch(50% 0.2 30)')
    })

    it('passes data attributes', () => {
      render(<WavyBackground data-testid="wb" />)
      expect(screen.getByTestId('wb')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<WavyBackground motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<WavyBackground motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── SVG structure ────────────────────────────────────────────────

  describe('SVG structure', () => {
    it('SVG is aria-hidden', () => {
      const { container } = render(<WavyBackground />)
      const svg = container.querySelector('.ui-wavy-background--svg')
      expect(svg?.getAttribute('aria-hidden')).toBe('true')
    })

    it('waves have speed inline styles', () => {
      const { container } = render(<WavyBackground waveCount={1} />)
      const wave = container.querySelector('.ui-wavy-background--wave') as SVGPathElement
      expect(wave.style.getPropertyValue('--wave-speed')).toBeTruthy()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <WavyBackground><p>Content</p></WavyBackground>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
