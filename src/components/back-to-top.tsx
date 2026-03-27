'use client'

import {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  type ButtonHTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface BackToTopProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  visibleFrom?: number
  smooth?: boolean
  target?: React.RefObject<HTMLElement>
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

const SIZE_MAP = { sm: 36, md: 44, lg: 56 } as const
const ICON_MAP = { sm: 16, md: 20, lg: 24 } as const

const backToTopStyles = css`
  @layer components {
    @scope (.ui-back-to-top) {
      :scope {
        position: fixed;
        inset-block-end: 20px;
        inset-inline-end: 20px;
        z-index: var(--z-sticky, 100);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-elevated, oklch(20% 0 0));
        color: var(--text-primary, oklch(90% 0 0));
        cursor: pointer;
        padding: 0;
        font-family: inherit;
        outline: none;
        backdrop-filter: blur(8px);
        box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.3));
        transition: opacity 0.2s var(--ease-out, ease-out),
                    transform 0.2s var(--ease-out, ease-out),
                    box-shadow 0.2s var(--ease-out, ease-out);
      }

      /* Hidden state */
      :scope[data-visible="false"] {
        opacity: 0;
        pointer-events: none;
        transform: translateY(10px);
      }

      :scope[data-visible="true"] {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }

      /* Motion level 0 — instant */
      :scope[data-motion="0"] {
        transition: none;
      }
      :scope[data-motion="0"][data-visible="false"] {
        transform: none;
      }

      /* Hover */
      :scope:hover:not(:disabled) {
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.4));
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Active press */
      :scope:active:not(:disabled):not([data-motion="0"]) {
        transform: scale(0.95);
        transition: transform 0.06s ease-out;
      }

      /* Focus visible */
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Disabled */
      :scope:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Progress ring */
      .ui-back-to-top__progress {
        position: absolute;
        inset: 0;
        border-radius: var(--radius-full, 9999px);
        pointer-events: none;
      }
      .ui-back-to-top__progress circle {
        fill: none;
        stroke-linecap: round;
      }
      .ui-back-to-top__progress-track {
        stroke: oklch(50% 0 0 / 0.15);
      }
      .ui-back-to-top__progress-fill {
        stroke: var(--brand, oklch(65% 0.2 270));
        transition: stroke-dashoffset 0.1s linear;
      }

      /* Icon */
      .ui-back-to-top__icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* Print — hide */
      @media print {
        :scope {
          display: none;
        }
      }
    }
  }
`

export const BackToTop = forwardRef<HTMLButtonElement, BackToTopProps>(
  (
    {
      visibleFrom = 400,
      smooth = true,
      target,
      showProgress = false,
      size = 'md',
      motion: motionProp,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('back-to-top', backToTopStyles)
    const motionLevel = useMotionLevel(motionProp)

    const [visible, setVisible] = useState(false)
    const [progress, setProgress] = useState(0)

    const getScrollElement = useCallback(() => {
      return target?.current ?? null
    }, [target])

    useEffect(() => {
      const el = getScrollElement()
      const scrollTarget = el ?? window

      const handleScroll = () => {
        const scrollTop = el ? el.scrollTop : window.scrollY
        const scrollHeight = el
          ? el.scrollHeight - el.clientHeight
          : document.documentElement.scrollHeight - window.innerHeight

        setVisible(scrollTop > visibleFrom)

        if (showProgress) {
          const safeScrollHeight = Math.max(scrollHeight, 1)
          setProgress(Math.min(scrollTop / safeScrollHeight, 1))
        }
      }

      scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()

      return () => {
        scrollTarget.removeEventListener('scroll', handleScroll)
      }
    }, [visibleFrom, showProgress, getScrollElement])

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const el = getScrollElement()
        const scrollTarget = el ?? window
        scrollTarget.scrollTo({
          top: 0,
          behavior: smooth ? 'smooth' : 'instant',
        })
        rest.onClick?.(e)
      },
      [smooth, getScrollElement, rest.onClick]
    )

    const dimension = SIZE_MAP[size]
    const iconSize = ICON_MAP[size]
    const strokeWidth = 2
    const radius = (dimension - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    return (
      <button
        ref={ref}
        type="button"
        className={cn(cls('root'), className)}
        data-visible={visible}
        data-motion={motionLevel}
        style={{
          inlineSize: `${dimension}px`,
          blockSize: `${dimension}px`,
          ...style,
        }}
        onClick={handleClick}
        aria-label="Back to top"
        {...rest}
      >
        {showProgress && (
          <svg
            className="ui-back-to-top__progress"
            viewBox={`0 0 ${dimension} ${dimension}`}
            width={dimension}
            height={dimension}
          >
            <circle
              className="ui-back-to-top__progress-track"
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <circle
              className="ui-back-to-top__progress-fill"
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
            />
          </svg>
        )}
        <span className="ui-back-to-top__icon">
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 19V5m0 0l-7 7m7-7l7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    )
  }
)
BackToTop.displayName = 'BackToTop'
