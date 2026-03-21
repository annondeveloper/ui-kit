'use client'

import {
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WavyBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  waveCount?: number
  speed?: number
  color?: string
  children?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const wavyBackgroundStyles = css`
  @layer components {
    @scope (.ui-wavy-background) {
      :scope {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      .ui-wavy-background--svg {
        position: absolute;
        inset: 0;
        inline-size: 100%;
        block-size: 100%;
        pointer-events: none;
        z-index: 0;
      }

      .ui-wavy-background--wave {
        animation: ui-wave-shift var(--wave-speed, 10s) linear infinite;
        animation-delay: var(--wave-delay, 0s);
      }

      .ui-wavy-background--content {
        position: relative;
        z-index: 1;
      }

      /* Motion 0: static waves */
      :scope[data-motion="0"] .ui-wavy-background--wave {
        animation: none;
      }

      @keyframes ui-wave-shift {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-wavy-background--wave {
          animation: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-wavy-background--svg {
          display: none;
        }
      }

      /* Print */
      @media print {
        .ui-wavy-background--svg {
          display: none;
        }
      }
    }
  }
`

// ─── Deterministic pseudo-random ────────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// ─── Wave path generator ────────────────────────────────────────────────────

function generateWavePath(
  index: number,
  totalWaves: number,
  width: number,
  height: number
): string {
  const amplitude = 15 + seededRandom(index + 10) * 25
  const frequency = 2 + seededRandom(index + 20) * 2
  const yBase = (height * (index + 1)) / (totalWaves + 1)
  const points: string[] = []
  const steps = 100

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width * 2 // double width for seamless loop
    const y = yBase + Math.sin((i / steps) * Math.PI * 2 * frequency) * amplitude
    points.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`)
  }

  // Close path to bottom
  points.push(`L ${width * 2},${height}`)
  points.push(`L 0,${height}`)
  points.push('Z')

  return points.join(' ')
}

// ─── Component ──────────────────────────────────────────────────────────────

export function WavyBackground({
  waveCount = 5,
  speed = 10,
  color,
  children,
  motion: motionProp,
  className,
  style,
  ...rest
}: WavyBackgroundProps) {
  useStyles('wavy-background', wavyBackgroundStyles)
  const motionLevel = useMotionLevel(motionProp)

  const waves = useMemo(() => {
    const w = 800
    const h = 400
    return Array.from({ length: waveCount }, (_, i) => ({
      id: i,
      path: generateWavePath(i, waveCount, w, h),
      opacity: 0.1 + seededRandom(i + 30) * 0.15,
      speed: speed * (0.8 + seededRandom(i + 40) * 0.6),
      delay: seededRandom(i + 50) * speed * 0.5,
    }))
  }, [waveCount, speed])

  const baseColor = color || 'oklch(75% 0.15 270)'

  const combinedStyle: React.CSSProperties = {
    ...style,
  }

  return (
    <div
      className={cn('ui-wavy-background', className)}
      data-motion={motionLevel}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      {...rest}
    >
      <svg
        className="ui-wavy-background--svg"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {waves.map((wave) => (
          <path
            key={wave.id}
            className="ui-wavy-background--wave"
            d={wave.path}
            fill={baseColor}
            fillOpacity={wave.opacity}
            style={{
              '--wave-speed': `${wave.speed}s`,
              '--wave-delay': `${wave.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </svg>
      {children && (
        <div className="ui-wavy-background--content">
          {children}
        </div>
      )}
    </div>
  )
}

WavyBackground.displayName = 'WavyBackground'
