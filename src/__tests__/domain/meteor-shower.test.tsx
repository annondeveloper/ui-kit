import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MeteorShower } from '../../domain/meteor-shower'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('MeteorShower', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<MeteorShower />)
      expect(container.querySelector('.ui-meteor-shower')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<MeteorShower>Overlay content</MeteorShower>)
      expect(screen.getByText('Overlay content')).toBeInTheDocument()
    })

    it('renders default 20 meteors', () => {
      const { container } = render(<MeteorShower />)
      const meteors = container.querySelectorAll('.ui-meteor-shower--meteor')
      expect(meteors.length).toBe(20)
    })

    it('has displayName', () => {
      expect(MeteorShower.displayName).toBe('MeteorShower')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('renders custom count of meteors', () => {
      const { container } = render(<MeteorShower count={5} />)
      const meteors = container.querySelectorAll('.ui-meteor-shower--meteor')
      expect(meteors.length).toBe(5)
    })

    it('applies custom className', () => {
      const { container } = render(
        <MeteorShower className="custom" />
      )
      expect(container.querySelector('.ui-meteor-shower.custom')).toBeInTheDocument()
    })

    it('wraps children in content div', () => {
      const { container } = render(
        <MeteorShower>Content</MeteorShower>
      )
      expect(container.querySelector('.ui-meteor-shower--content')).toBeInTheDocument()
    })

    it('does not render content div without children', () => {
      const { container } = render(<MeteorShower />)
      expect(container.querySelector('.ui-meteor-shower--content')).not.toBeInTheDocument()
    })

    it('meteors have staggered animation delays', () => {
      const { container } = render(<MeteorShower count={3} />)
      const meteors = container.querySelectorAll('.ui-meteor-shower--meteor')
      const delays = Array.from(meteors).map(
        (m) => (m as HTMLElement).style.getPropertyValue('--meteor-delay')
      )
      // Each meteor should have a unique delay
      const unique = new Set(delays)
      expect(unique.size).toBe(3)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<MeteorShower motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<MeteorShower motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-hidden on the container (decorative)', () => {
      const { container } = render(<MeteorShower />)
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <div>
          <MeteorShower>
            <p>Content with meteors</p>
          </MeteorShower>
        </div>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
