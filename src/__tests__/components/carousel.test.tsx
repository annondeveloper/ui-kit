import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Carousel } from '../../components/carousel'

expect.extend(toHaveNoViolations)

// ─── Test slides ────────────────────────────────────────────────────────────

function Slide({ children }: { children: React.ReactNode }) {
  return <div style={{ width: '100%', height: 200 }}>{children}</div>
}

const threeSlides = [
  <Slide key="1">Slide 1</Slide>,
  <Slide key="2">Slide 2</Slide>,
  <Slide key="3">Slide 3</Slide>,
]

const fiveSlides = [
  <Slide key="1">Slide 1</Slide>,
  <Slide key="2">Slide 2</Slide>,
  <Slide key="3">Slide 3</Slide>,
  <Slide key="4">Slide 4</Slide>,
  <Slide key="5">Slide 5</Slide>,
]

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Carousel', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render ─────────────────────────────────────────────────────────────

  describe('render', () => {
    it('renders a region with carousel role description', () => {
      render(<Carousel>{threeSlides}</Carousel>)
      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    })

    it('renders all slides', () => {
      render(<Carousel>{threeSlides}</Carousel>)
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
      expect(screen.getByText('Slide 3')).toBeInTheDocument()
    })

    it('slides have role group and slide role description', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const slides = container.querySelectorAll('.ui-carousel__slide')
      slides.forEach((slide) => {
        expect(slide).toHaveAttribute('role', 'group')
        expect(slide).toHaveAttribute('aria-roledescription', 'slide')
      })
    })

    it('slides have aria-label with index', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const slides = container.querySelectorAll('.ui-carousel__slide')
      expect(slides[0]).toHaveAttribute('aria-label', 'Slide 1 of 3')
      expect(slides[2]).toHaveAttribute('aria-label', 'Slide 3 of 3')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Carousel ref={ref}>{threeSlides}</Carousel>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(
        <Carousel className="custom">{threeSlides}</Carousel>
      )
      expect(container.querySelector('.ui-carousel')?.className).toContain('custom')
    })

    it('sets data-motion attribute', () => {
      const { container } = render(
        <Carousel motion={0}>{threeSlides}</Carousel>
      )
      expect(container.querySelector('.ui-carousel')).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Arrows ───────────────────────────────────────────────────────────

  describe('arrows', () => {
    it('shows prev and next arrows by default', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      expect(container.querySelector('.ui-carousel__arrow--prev')).toBeInTheDocument()
      expect(container.querySelector('.ui-carousel__arrow--next')).toBeInTheDocument()
    })

    it('hides arrows when showArrows=false', () => {
      const { container } = render(
        <Carousel showArrows={false}>{threeSlides}</Carousel>
      )
      expect(container.querySelector('.ui-carousel__arrow--prev')).not.toBeInTheDocument()
      expect(container.querySelector('.ui-carousel__arrow--next')).not.toBeInTheDocument()
    })

    it('prev arrow is disabled at start when loop=false', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const prevBtn = container.querySelector('.ui-carousel__arrow--prev') as HTMLButtonElement
      expect(prevBtn).toBeDisabled()
    })

    it('prev arrow has aria-label', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const prevBtn = container.querySelector('.ui-carousel__arrow--prev')
      expect(prevBtn).toHaveAttribute('aria-label', 'Previous slide')
    })

    it('next arrow has aria-label', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const nextBtn = container.querySelector('.ui-carousel__arrow--next')
      expect(nextBtn).toHaveAttribute('aria-label', 'Next slide')
    })
  })

  // ─── Dots ─────────────────────────────────────────────────────────────

  describe('dots', () => {
    it('shows dot indicators by default', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const dots = container.querySelectorAll('.ui-carousel__dot')
      expect(dots).toHaveLength(3)
    })

    it('hides dots when showDots=false', () => {
      const { container } = render(
        <Carousel showDots={false}>{threeSlides}</Carousel>
      )
      expect(container.querySelector('.ui-carousel__dot')).not.toBeInTheDocument()
    })

    it('first dot is active initially', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const dots = container.querySelectorAll('.ui-carousel__dot')
      expect(dots[0]).toHaveAttribute('data-active', '')
      expect(dots[1]).not.toHaveAttribute('data-active')
    })

    it('dots have aria-label', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const dots = container.querySelectorAll('.ui-carousel__dot')
      expect(dots[0]).toHaveAttribute('aria-label', 'Go to slide 1')
      expect(dots[2]).toHaveAttribute('aria-label', 'Go to slide 3')
    })

    it('dots have role="tab"', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const dots = container.querySelectorAll('.ui-carousel__dot')
      dots.forEach((dot) => {
        expect(dot).toHaveAttribute('role', 'tab')
      })
    })

    it('active dot has aria-selected=true', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const dots = container.querySelectorAll('.ui-carousel__dot')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
      expect(dots[1]).toHaveAttribute('aria-selected', 'false')
    })
  })

  // ─── Keyboard ─────────────────────────────────────────────────────────

  describe('keyboard', () => {
    it('is focusable with tabIndex', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const root = container.querySelector('.ui-carousel')
      expect(root).toHaveAttribute('tabindex', '0')
    })
  })

  // ─── Auto-play ─────────────────────────────────────────────────────────

  describe('autoPlay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not auto-advance when autoPlay=false', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const dots = container.querySelectorAll('.ui-carousel__dot')
      expect(dots[0]).toHaveAttribute('data-active', '')
      vi.advanceTimersByTime(10000)
      expect(dots[0]).toHaveAttribute('data-active', '')
    })
  })

  // ─── Single slide ─────────────────────────────────────────────────────

  describe('single slide', () => {
    it('does not show arrows for single slide', () => {
      const { container } = render(
        <Carousel>
          <Slide>Only</Slide>
        </Carousel>
      )
      expect(container.querySelector('.ui-carousel__arrow--prev')).not.toBeInTheDocument()
    })

    it('does not show dots for single slide', () => {
      const { container } = render(
        <Carousel>
          <Slide>Only</Slide>
        </Carousel>
      )
      expect(container.querySelector('.ui-carousel__dot')).not.toBeInTheDocument()
    })
  })

  // ─── Multiple slides per view ─────────────────────────────────────────

  describe('slidesPerView', () => {
    it('creates correct number of pages', () => {
      const { container } = render(
        <Carousel slidesPerView={2}>{fiveSlides}</Carousel>
      )
      // 5 slides / 2 per view = 3 pages
      const dots = container.querySelectorAll('.ui-carousel__dot')
      expect(dots).toHaveLength(3)
    })
  })

  // ─── Gap ──────────────────────────────────────────────────────────────

  describe('gap', () => {
    it('applies numeric gap as px', () => {
      const { container } = render(
        <Carousel gap={16}>{threeSlides}</Carousel>
      )
      const track = container.querySelector('.ui-carousel__track') as HTMLElement
      expect(track.style.gap).toBe('16px')
    })

    it('applies string gap as-is', () => {
      const { container } = render(
        <Carousel gap="1rem">{threeSlides}</Carousel>
      )
      const track = container.querySelector('.ui-carousel__track') as HTMLElement
      expect(track.style.gap).toBe('1rem')
    })
  })

  // ─── Live region ──────────────────────────────────────────────────────

  describe('live region', () => {
    it('has a live region announcing current slide', () => {
      const { container } = render(<Carousel>{threeSlides}</Carousel>)
      const liveRegion = container.querySelector('.ui-carousel__live')
      expect(liveRegion).toBeInTheDocument()
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      expect(liveRegion?.textContent).toBe('Slide 1 of 3')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('no axe violations', async () => {
      const { container } = render(
        <Carousel aria-label="Test carousel">{threeSlides}</Carousel>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Styles ───────────────────────────────────────────────────────────

  describe('styles', () => {
    it('CSS includes @layer components', () => {
      render(<Carousel>{threeSlides}</Carousel>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags)
        .map((s) => s.textContent)
        .join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-carousel)', () => {
      render(<Carousel>{threeSlides}</Carousel>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags)
        .map((s) => s.textContent)
        .join('')
      expect(allCSS).toContain('@scope (.ui-carousel)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Carousel"', () => {
      expect(Carousel.displayName).toBe('Carousel')
    })
  })
})
