'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  Children,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  autoPlay?: boolean
  autoPlayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  loop?: boolean
  slidesPerView?: number
  gap?: number | string
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const carouselStyles = css`
  @layer components {
    @scope (.ui-carousel) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        container-type: inline-size;
        font-family: inherit;
      }

      /* ── Track ─────────────────────────────────────────── */

      .ui-carousel__track {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        scrollbar-width: none;
        -ms-overflow-style: none;
        -webkit-overflow-scrolling: touch;
      }
      .ui-carousel__track::-webkit-scrollbar {
        display: none;
      }

      :scope[data-motion="0"] .ui-carousel__track {
        scroll-behavior: auto;
      }

      /* ── Slide ─────────────────────────────────────────── */

      .ui-carousel__slide {
        scroll-snap-align: start;
        flex-shrink: 0;
        min-inline-size: 0;
      }

      /* ── Arrows ────────────────────────────────────────── */

      .ui-carousel__arrows {
        position: absolute;
        inset-block: 0;
        inset-inline: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        pointer-events: none;
        z-index: 2;
      }

      .ui-carousel__arrow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 2.5rem;
        block-size: 2.5rem;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-full, 9999px);
        background: var(--surface-elevated, oklch(22% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
        cursor: pointer;
        pointer-events: auto;
        font-family: inherit;
        font-size: 1rem;
        line-height: 1;
        padding: 0;
        transition: background 0.15s var(--ease-out, ease-out),
                    opacity 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
        box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2));
        outline: none;
      }

      .ui-carousel__arrow:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
      }

      .ui-carousel__arrow:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-carousel__arrow:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .ui-carousel__arrow--prev {
        margin-inline-start: var(--space-xs, 0.25rem);
      }

      .ui-carousel__arrow--next {
        margin-inline-end: var(--space-xs, 0.25rem);
      }

      :scope[data-motion="0"] .ui-carousel__arrow {
        transition: none;
      }

      .ui-carousel__arrow svg {
        inline-size: 1.25em;
        block-size: 1.25em;
        flex-shrink: 0;
      }

      /* ── Dots ──────────────────────────────────────────── */

      .ui-carousel__dots {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: var(--space-xs, 0.25rem);
      }

      .ui-carousel__dot {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border: none;
        border-radius: var(--radius-full, 9999px);
        background: var(--text-tertiary, oklch(60% 0 0));
        opacity: 0.4;
        cursor: pointer;
        padding: 0;
        transition: opacity 0.15s var(--ease-out, ease-out),
                    background 0.15s var(--ease-out, ease-out),
                    transform 0.15s var(--ease-out, ease-out);
        outline: none;
      }

      .ui-carousel__dot[data-active] {
        opacity: 1;
        background: var(--brand, oklch(65% 0.2 270));
        transform: scale(1.25);
      }

      .ui-carousel__dot:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      :scope[data-motion="0"] .ui-carousel__dot {
        transition: none;
      }

      /* ── Live region ───────────────────────────────────── */

      .ui-carousel__live {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }

      /* ── Touch targets ─────────────────────────────────── */

      @media (pointer: coarse) {
        .ui-carousel__arrow {
          inline-size: 44px;
          block-size: 44px;
        }
        .ui-carousel__dot {
          inline-size: 44px;
          block-size: 44px;
          background: transparent;
          position: relative;
        }
        .ui-carousel__dot::after {
          content: '';
          position: absolute;
          inset: 50%;
          transform: translate(-50%, -50%);
          inline-size: 0.5rem;
          block-size: 0.5rem;
          border-radius: var(--radius-full, 9999px);
          background: var(--text-tertiary, oklch(60% 0 0));
          opacity: 0.4;
        }
        .ui-carousel__dot[data-active]::after {
          opacity: 1;
          background: var(--brand, oklch(65% 0.2 270));
          transform: translate(-50%, -50%) scale(1.25);
        }
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        .ui-carousel__arrow {
          border: 2px solid ButtonText;
        }
        .ui-carousel__arrow:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-carousel__dot {
          border: 2px solid ButtonText;
        }
        .ui-carousel__dot[data-active] {
          background: Highlight;
        }
      }

      /* ── Print ──────────────────────────────────────────── */

      @media print {
        .ui-carousel__track {
          overflow: visible;
          flex-wrap: wrap;
          scroll-snap-type: none;
        }
        .ui-carousel__arrows {
          display: none;
        }
        .ui-carousel__dots {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      autoPlay = false,
      autoPlayInterval = 5000,
      showArrows = true,
      showDots = true,
      loop = false,
      slidesPerView = 1,
      gap = 0,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('carousel', carouselStyles)
    const motionLevel = useMotionLevel(motionProp)
    const id = useStableId('carousel')

    const trackRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    // Count slides
    const slides = Children.toArray(children)
    const totalSlides = slides.length
    const totalPages = Math.max(1, Math.ceil(totalSlides / slidesPerView))

    // ── Merge refs ──────────────────────────────────────────────────────
    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    // ── Resolve gap as CSS value ────────────────────────────────────────
    const gapValue = typeof gap === 'number' ? `${gap}px` : gap

    // ── Scroll to index ─────────────────────────────────────────────────
    const scrollToIndex = useCallback(
      (index: number) => {
        const track = trackRef.current
        if (!track) return
        const slideEls = track.querySelectorAll<HTMLElement>('.ui-carousel__slide')
        if (!slideEls.length) return

        const targetSlideIdx = index * slidesPerView
        const targetEl = slideEls[Math.min(targetSlideIdx, slideEls.length - 1)]
        if (!targetEl) return

        track.scrollTo({
          left: targetEl.offsetLeft - track.offsetLeft,
          behavior: motionLevel === 0 ? 'auto' : 'smooth',
        })
      },
      [slidesPerView, motionLevel]
    )

    // ── Navigate ────────────────────────────────────────────────────────
    const goTo = useCallback(
      (index: number) => {
        let nextIdx = index
        if (loop) {
          if (nextIdx < 0) nextIdx = totalPages - 1
          else if (nextIdx >= totalPages) nextIdx = 0
        } else {
          nextIdx = Math.max(0, Math.min(nextIdx, totalPages - 1))
        }
        setCurrentIndex(nextIdx)
        scrollToIndex(nextIdx)
        // Reset autoplay interval on user interaction
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
          autoPlayRef.current = null
        }
      },
      [loop, totalPages, scrollToIndex]
    )

    const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex])
    const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex])

    // ── Track scroll observation ────────────────────────────────────────
    useEffect(() => {
      const track = trackRef.current
      if (!track) return

      let scrollTimer: ReturnType<typeof setTimeout>
      const handleScroll = () => {
        clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
          const slideEls = track.querySelectorAll<HTMLElement>('.ui-carousel__slide')
          if (!slideEls.length) return

          const trackLeft = track.scrollLeft + track.offsetLeft
          let closestIdx = 0
          let closestDist = Infinity

          slideEls.forEach((el, i) => {
            const dist = Math.abs(el.offsetLeft - trackLeft)
            if (dist < closestDist) {
              closestDist = dist
              closestIdx = i
            }
          })

          const pageIdx = Math.floor(closestIdx / slidesPerView)
          setCurrentIndex(pageIdx)
        }, 50)
      }

      track.addEventListener('scroll', handleScroll, { passive: true })
      return () => {
        track.removeEventListener('scroll', handleScroll)
        clearTimeout(scrollTimer)
      }
    }, [slidesPerView])

    // ── Auto-play ───────────────────────────────────────────────────────
    useEffect(() => {
      if (!autoPlay || isPaused || totalPages <= 1) {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
          autoPlayRef.current = null
        }
        return
      }

      autoPlayRef.current = setInterval(() => {
        goTo(currentIndex + 1)
      }, autoPlayInterval)

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
          autoPlayRef.current = null
        }
      }
    }, [autoPlay, autoPlayInterval, isPaused, currentIndex, totalPages, goTo])

    // ── Keyboard ────────────────────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          goPrev()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          goNext()
        } else if (e.key === 'Home') {
          e.preventDefault()
          goTo(0)
        } else if (e.key === 'End') {
          e.preventDefault()
          goTo(totalPages - 1)
        }
      },
      [goPrev, goNext, goTo, totalPages]
    )

    // ── Determine arrow disabled states ─────────────────────────────────
    const prevDisabled = !loop && currentIndex === 0
    const nextDisabled = !loop && currentIndex >= totalPages - 1

    return (
      <div
        ref={setRootRef}
        className={cn(cls('root'), className)}
        data-motion={motionLevel}
        role="region"
        aria-roledescription="carousel"
        aria-label={rest['aria-label'] ?? 'Carousel'}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        {...rest}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="ui-carousel__track"
          aria-live={autoPlay ? 'off' : 'polite'}
          style={{ gap: gapValue }}
        >
          {slides.map((child, i) => (
            <div
              key={i}
              className="ui-carousel__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${totalSlides}`}
              style={{
                flexBasis: slidesPerView > 1
                  ? `calc((100% - ${gapValue} * ${slidesPerView - 1}) / ${slidesPerView})`
                  : '100%',
              }}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Arrows */}
        {showArrows && totalPages > 1 && (
          <div className="ui-carousel__arrows" aria-hidden="true">
            <button
              type="button"
              className="ui-carousel__arrow ui-carousel__arrow--prev"
              onClick={goPrev}
              disabled={prevDisabled}
              aria-label="Previous slide"
              tabIndex={-1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className="ui-carousel__arrow ui-carousel__arrow--next"
              onClick={goNext}
              disabled={nextDisabled}
              aria-label="Next slide"
              tabIndex={-1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* Dots */}
        {showDots && totalPages > 1 && (
          <div className="ui-carousel__dots" role="tablist" aria-label="Slides">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className="ui-carousel__dot"
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Go to slide ${i + 1}`}
                {...(i === currentIndex ? { 'data-active': '' } : {})}
                onClick={() => goTo(i)}
                tabIndex={i === currentIndex ? 0 : -1}
              />
            ))}
          </div>
        )}

        {/* Live region for screen readers */}
        <div className="ui-carousel__live" aria-live="polite" aria-atomic="true">
          {`Slide ${currentIndex + 1} of ${totalPages}`}
        </div>
      </div>
    )
  }
)
Carousel.displayName = 'Carousel'
