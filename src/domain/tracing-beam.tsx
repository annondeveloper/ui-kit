'use client'

import {
  useRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TracingBeamProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const tracingBeamStyles = css`
  @layer components {
    @scope (.ui-tracing-beam) {
      :scope {
        --beam-color: var(--tracing-beam-color, oklch(75% 0.15 270));
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--space-md, 1rem);
      }

      .ui-tracing-beam--track {
        position: relative;
        inline-size: 2px;
        background: var(--bg-active);
        border-radius: 1px;
      }

      /* Filled portion */
      .ui-tracing-beam--progress {
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        inline-size: 100%;
        block-size: var(--beam-progress, 0%);
        background: linear-gradient(
          to bottom,
          var(--beam-color),
          oklch(from var(--beam-color) l c calc(h + 40))
        );
        border-radius: 1px;
        transition: block-size 0.1s linear;
      }

      /* Glowing dot */
      .ui-tracing-beam--dot {
        position: absolute;
        inset-block-start: var(--beam-progress, 0%);
        inset-inline-start: 50%;
        transform: translate(-50%, -50%);
        inline-size: 10px;
        block-size: 10px;
        border-radius: 50%;
        background: var(--beam-color);
        box-shadow:
          0 0 8px 2px oklch(from var(--beam-color) l c h / 0.5),
          0 0 20px 4px oklch(from var(--beam-color) l c h / 0.2);
        transition: inset-block-start 0.1s linear;
      }

      .ui-tracing-beam--content {
        min-inline-size: 0;
      }

      /* Motion 0: static, full line shown */
      :scope[data-motion="0"] .ui-tracing-beam--progress {
        block-size: 100%;
        transition: none;
      }

      :scope[data-motion="0"] .ui-tracing-beam--dot {
        display: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-tracing-beam--progress {
          block-size: 100% !important;
          transition: none;
        }
        .ui-tracing-beam--dot {
          display: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-tracing-beam--track {
          background: CanvasText;
        }
        .ui-tracing-beam--progress {
          background: Highlight;
        }
        .ui-tracing-beam--dot {
          background: Highlight;
          box-shadow: none;
        }
      }

      /* Print */
      @media print {
        .ui-tracing-beam--progress {
          block-size: 100% !important;
        }
        .ui-tracing-beam--dot {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function TracingBeam({
  color,
  children,
  motion: motionProp,
  className,
  style,
  ...rest
}: TracingBeamProps) {
  useStyles('tracing-beam', tracingBeamStyles)
  const motionLevel = useMotionLevel(motionProp)
  const ref = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (motionLevel === 0) return

    const el = ref.current
    if (!el) return

    const handleScroll = () => {
      const rect = el.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate how far through the element we've scrolled
      const elementTop = rect.top
      const elementHeight = rect.height

      if (elementTop >= windowHeight) {
        setProgress(0)
        return
      }

      if (elementTop + elementHeight <= 0) {
        setProgress(100)
        return
      }

      // Progress based on how much of the element has scrolled past the viewport top
      const scrolled = windowHeight - elementTop
      const total = windowHeight + elementHeight
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100))
      setProgress(pct)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [motionLevel])

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(color ? { '--tracing-beam-color': color } as any : {}),
  }

  return (
    <div
      ref={ref}
      className={cn('ui-tracing-beam', className)}
      data-motion={motionLevel}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      {...rest}
    >
      <div className="ui-tracing-beam--track" ref={trackRef} aria-hidden="true">
        <div
          className="ui-tracing-beam--progress"
          style={{ '--beam-progress': `${progress}%` } as React.CSSProperties}
        />
        <div
          className="ui-tracing-beam--dot"
          style={{ '--beam-progress': `${progress}%` } as React.CSSProperties}
        />
      </div>
      <div className="ui-tracing-beam--content">
        {children}
      </div>
    </div>
  )
}

TracingBeam.displayName = 'TracingBeam'
