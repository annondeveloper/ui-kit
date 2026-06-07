'use client'

import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type ReactElement,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const tooltipStyles = css`
  @layer components {
    @scope (.ui-lite-tooltip) {
      :scope {
        position: relative;
        display: inline-block;
      }
      .ui-lite-tooltip__panel {
        position: absolute;
        z-index: 9999;
        pointer-events: none;
        background: var(--surface-elevated, var(--bg-elevated, oklch(25% 0 0)));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: 0.875rem;
        line-height: 1.4;
        padding-block: 0.375rem;
        padding-inline: 0.625rem;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.25rem);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.35);
        white-space: nowrap;
      }
    }
  }
`

export interface LiteTooltipProps {
  content: ReactNode
  children: ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  offset?: number
  disabled?: boolean
  interactive?: boolean
  maxWidth?: number | string
}

const panelBase: CSSProperties = {
  position: 'absolute',
  zIndex: 9999,
  pointerEvents: 'none',
  background: 'var(--surface-elevated, oklch(25% 0 0))',
  color: 'var(--text-primary, oklch(90% 0 0))',
  fontSize: '0.875rem',
  lineHeight: '1.4',
  padding: '0.375rem 0.625rem',
  border: '1px solid var(--border-subtle, oklch(100% 0 0 / 0.1))',
  borderRadius: '0.25rem',
  boxShadow: '0 4px 16px oklch(0% 0 0 / 0.35)',
  whiteSpace: 'nowrap',
}

const placementStyles: Record<string, CSSProperties> = {
  top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
  bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
  left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
  right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
}

export const Tooltip = forwardRef<HTMLSpanElement, LiteTooltipProps>(
  ({ content, children, placement = 'top', delay = 300, disabled, interactive, maxWidth }, ref) => {
    useStyles('lite-tooltip', tooltipStyles)
    const [visible, setVisible] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const tooltipId = useId()

    const clear = useCallback(() => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    }, [])

    const show = useCallback(() => {
      if (disabled) return
      clear()
      timerRef.current = setTimeout(() => setVisible(true), delay)
    }, [disabled, delay, clear])

    const hide = useCallback(() => { clear(); setVisible(false) }, [clear])

    useEffect(() => clear, [clear])

    const mw: CSSProperties | undefined = maxWidth != null
      ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth, whiteSpace: 'normal' }
      : undefined

    return (
      <span
        ref={ref}
        className="ui-lite-tooltip"
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
        {visible && (
          <span
            className="ui-lite-tooltip__panel"
            role="tooltip"
            id={tooltipId}
            style={{ ...panelBase, ...placementStyles[placement], ...(interactive ? { pointerEvents: 'auto' } : {}), ...mw }}
          >
            {content}
          </span>
        )}
      </span>
    )
  }
)
Tooltip.displayName = 'Tooltip'
