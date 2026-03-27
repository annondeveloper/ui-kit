'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TourStep {
  target: string
  title: string
  description: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  onShow?: () => void
}

export interface TourProps {
  steps: TourStep[]
  open?: boolean
  onClose?: () => void
  onFinish?: () => void
  currentStep?: number
  onStepChange?: (step: number) => void
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  showProgress?: boolean
  showSkip?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const tourStyles = css`
  @layer components {
    @scope (.ui-tour) {
      :scope {
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
      }

      :scope[data-open] {
        pointer-events: auto;
      }

      /* ── SVG Overlay ───────────────────────────────────── */

      .ui-tour__overlay {
        position: fixed;
        inset: 0;
        inline-size: 100%;
        block-size: 100%;
      }

      .ui-tour__overlay-bg {
        fill: oklch(0% 0 0 / 0.6);
      }

      /* ── Spotlight cutout ──────────────────────────────── */

      .ui-tour__spotlight {
        fill: black;
      }

      /* ── Tooltip card ──────────────────────────────────── */

      .ui-tour__tooltip {
        position: fixed;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        max-inline-size: 20rem;
        padding: var(--space-lg, 1.5rem);
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-elevated, oklch(22% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        color: var(--text-primary, oklch(90% 0 0));
        box-shadow:
          0 4px 24px oklch(0% 0 0 / 0.4),
          0 0 60px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
      }

      :scope[data-motion='1'] .ui-tour__tooltip,
      :scope[data-motion='2'] .ui-tour__tooltip,
      :scope[data-motion='3'] .ui-tour__tooltip {
        transition: top 0.3s ease, left 0.3s ease, opacity 0.2s ease;
      }

      .ui-tour__tooltip[data-entering] {
        opacity: 0;
        transform: translateY(8px);
      }

      .ui-tour__title {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 600;
        margin: 0;
        color: var(--text-primary, oklch(95% 0 0));
      }

      .ui-tour__description {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.5;
        margin: 0;
      }

      /* ── Footer ────────────────────────────────────────── */

      .ui-tour__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
        margin-block-start: var(--space-xs, 0.25rem);
      }

      .ui-tour__progress {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-tour__actions {
        display: flex;
        gap: var(--space-xs, 0.25rem);
        margin-inline-start: auto;
      }

      /* ── Buttons ───────────────────────────────────────── */

      .ui-tour__btn {
        display: inline-flex;
        align-items: center;
        padding-inline: var(--space-md, 1rem);
        padding-block: var(--space-xs, 0.25rem);
        border-radius: var(--radius-md, 0.5rem);
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        transition: background 0.15s ease, color 0.15s ease;
      }

      .ui-tour__btn:hover {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-tour__btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-tour__btn[data-primary] {
        background: var(--brand, oklch(65% 0.2 270));
        color: oklch(100% 0 0);
        border-color: transparent;
      }

      .ui-tour__btn[data-primary]:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.05) c h);
        color: oklch(100% 0 0);
      }

      .ui-tour__btn[data-skip] {
        border: none;
        color: var(--text-tertiary, oklch(55% 0 0));
        padding-inline: var(--space-sm, 0.5rem);
      }

      .ui-tour__btn[data-skip]:hover {
        color: var(--text-secondary, oklch(70% 0 0));
        background: transparent;
      }

      /* ── Step dots ─────────────────────────────────────── */

      .ui-tour__dots {
        display: flex;
        gap: var(--space-2xs, 0.125rem);
        align-items: center;
      }

      .ui-tour__dot {
        inline-size: 6px;
        block-size: 6px;
        border-radius: 50%;
        background: var(--text-tertiary, oklch(45% 0 0));
        transition: background 0.15s ease, transform 0.15s ease;
      }

      .ui-tour__dot[data-active] {
        background: var(--brand, oklch(65% 0.2 270));
        transform: scale(1.3);
      }

      .ui-tour__dot[data-completed] {
        background: var(--status-ok, oklch(72% 0.19 155));
      }

      /* ── Aurora glow ───────────────────────────────────── */

      :scope[data-motion='3'] .ui-tour__tooltip::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: conic-gradient(
          from 0deg,
          oklch(65% 0.2 270 / 0.3),
          oklch(72% 0.19 155 / 0.2),
          oklch(78% 0.15 80 / 0.2),
          oklch(65% 0.2 270 / 0.3)
        );
        z-index: -1;
        filter: blur(8px);
        animation: ui-tour-glow 4s linear infinite;
      }

      @keyframes ui-tour-glow {
        to { transform: rotate(360deg); }
      }

      /* ── Spotlight transition ───────────────────────────── */

      :scope[data-motion='1'] .ui-tour__overlay,
      :scope[data-motion='2'] .ui-tour__overlay,
      :scope[data-motion='3'] .ui-tour__overlay {
        transition: opacity 0.2s ease;
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        .ui-tour__tooltip {
          border: 2px solid ButtonText;
          background: Canvas;
          color: ButtonText;
          box-shadow: none;
        }
        .ui-tour__btn {
          border: 1px solid ButtonText;
          color: ButtonText;
        }
        .ui-tour__btn[data-primary] {
          background: Highlight;
          color: HighlightText;
          border-color: Highlight;
        }
        .ui-tour__btn:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-tour__dot {
          background: ButtonText;
        }
        .ui-tour__dot[data-active] {
          background: Highlight;
        }
        .ui-tour__overlay-bg {
          fill: Canvas;
          fill-opacity: 0.8;
        }
      }

      /* ── Print ──────────────────────────────────────────── */

      @media print {
        :scope {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

interface SpotlightRect {
  x: number
  y: number
  width: number
  height: number
}

export function Tour({
  steps,
  open = false,
  onClose,
  onFinish,
  currentStep: controlledStep,
  onStepChange,
  closeOnOverlay = true,
  closeOnEscape = true,
  showProgress = true,
  showSkip = true,
  motion: motionProp,
}: TourProps) {
  useStyles('tour', tourStyles)
  const motionLevel = useMotionLevel(motionProp)

  const isControlled = controlledStep !== undefined
  const [internalStep, setInternalStep] = useState(0)
  const step = isControlled ? controlledStep : internalStep
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [isEntering, setIsEntering] = useState(false)
  const [targetNotFound, setTargetNotFound] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStepData = steps[step]
  const isFirst = step === 0
  const isLast = step === steps.length - 1

  const goTo = useCallback(
    (idx: number) => {
      if (!isControlled) setInternalStep(idx)
      onStepChange?.(idx)
    },
    [isControlled, onStepChange]
  )

  const handleNext = useCallback(() => {
    if (isLast) {
      onFinish?.()
      onClose?.()
    } else {
      goTo(step + 1)
    }
  }, [isLast, step, goTo, onFinish, onClose])

  const handlePrev = useCallback(() => {
    if (!isFirst) goTo(step - 1)
  }, [isFirst, step, goTo])

  const handleSkip = useCallback(() => {
    onClose?.()
  }, [onClose])

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlay) onClose?.()
  }, [closeOnOverlay, onClose])

  // Escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closeOnEscape, onClose])

  // Position spotlight and tooltip
  useEffect(() => {
    if (!open || !currentStepData) return

    // Set entering state for animation
    setIsEntering(true)
    setTargetNotFound(false)
    const enteringTimer = setTimeout(() => setIsEntering(false), 300)

    const updatePositionImmediate = () => {
      const target = document.querySelector(currentStepData.target)
      if (!target) {
        setSpotlight(null)
        setTargetNotFound(true)
        // Center tooltip on screen
        const tooltipEl = tooltipRef.current
        const tooltipW = tooltipEl?.offsetWidth ?? 320
        const tooltipH = tooltipEl?.offsetHeight ?? 200
        setTooltipPos({
          top: window.innerHeight / 2 - tooltipH / 2,
          left: window.innerWidth / 2 - tooltipW / 2,
        })
        return
      }

      setTargetNotFound(false)
      const rect = target.getBoundingClientRect()
      const padding = 8

      const spotRect: SpotlightRect = {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }
      setSpotlight(spotRect)

      // Scroll into view
      if (
        rect.top < 0 ||
        rect.bottom > window.innerHeight
      ) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      // Position tooltip
      const tooltipEl = tooltipRef.current
      const tooltipW = tooltipEl?.offsetWidth ?? 320
      const tooltipH = tooltipEl?.offsetHeight ?? 200
      const gap = 16

      const placement = currentStepData.placement || 'bottom'
      let top = 0
      let left = 0

      switch (placement) {
        case 'bottom':
          top = rect.bottom + gap
          left = rect.left + rect.width / 2 - tooltipW / 2
          break
        case 'top':
          top = rect.top - tooltipH - gap
          left = rect.left + rect.width / 2 - tooltipW / 2
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipH / 2
          left = rect.right + gap
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipH / 2
          left = rect.left - tooltipW - gap
          break
      }

      // Clamp to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8))
      top = Math.max(8, Math.min(top, window.innerHeight - tooltipH - 8))

      setTooltipPos({ top, left })
    }

    // Debounced version for ResizeObserver/scroll/resize
    const updatePosition = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(updatePositionImmediate, 100)
    }

    updatePositionImmediate()

    // Watch for layout changes
    const observer = new ResizeObserver(updatePosition)
    const target = document.querySelector(currentStepData.target)
    if (target) observer.observe(target)

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    // Call onShow
    currentStepData.onShow?.()

    return () => {
      clearTimeout(enteringTimer)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      observer.disconnect()
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
      cancelAnimationFrame(rafRef.current)
    }
  }, [open, step, currentStepData])

  if (!open || !currentStepData) return null

  const spotlightRadius = 8

  return (
    <div
      className="ui-tour"
      data-motion={motionLevel}
      data-open=""
      role="dialog"
      aria-modal="true"
      aria-label={`Tour step ${step + 1} of ${steps.length}: ${currentStepData.title}`}
    >
      {/* SVG overlay with spotlight cutout */}
      <svg
        className="ui-tour__overlay"
        onClick={handleOverlayClick}
        aria-hidden="true"
      >
        <defs>
          <mask id="ui-tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.width}
                height={spotlight.height}
                rx={spotlightRadius}
                ry={spotlightRadius}
                fill="black"
                className="ui-tour__spotlight"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          className="ui-tour__overlay-bg"
          mask="url(#ui-tour-mask)"
        />
      </svg>

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="ui-tour__tooltip"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
        role="status"
        {...(isEntering ? { 'data-entering': '' } : {})}
      >
        <h3 className="ui-tour__title">{currentStepData.title}</h3>
        {targetNotFound && (
          <div className="ui-tour__description" style={{ color: 'oklch(80% 0.15 60)' }}>
            Target element not found. It may not be visible on the page.
          </div>
        )}
        <div className="ui-tour__description">{currentStepData.description}</div>

        <div className="ui-tour__footer">
          {showProgress && (
            <span className="ui-tour__progress">
              Step {step + 1} of {steps.length}
            </span>
          )}

          <div className="ui-tour__dots" aria-hidden="true">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className="ui-tour__dot"
                {...(idx === step ? { 'data-active': '' } : {})}
                {...(idx < step ? { 'data-completed': '' } : {})}
              />
            ))}
          </div>

          <div className="ui-tour__actions">
            {showSkip && !isLast && (
              <button
                className="ui-tour__btn"
                data-skip=""
                onClick={handleSkip}
                type="button"
              >
                Skip
              </button>
            )}
            {!isFirst && (
              <button
                className="ui-tour__btn"
                onClick={handlePrev}
                type="button"
              >
                Previous
              </button>
            )}
            <button
              className="ui-tour__btn"
              data-primary=""
              onClick={handleNext}
              type="button"
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

Tour.displayName = 'Tour'
