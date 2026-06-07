import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const tracingBeamStyles = css`
  @layer components {
    @scope (.ui-lite-tracing-beam) {
      :scope {
        --beam-color: var(--tracing-beam-color, oklch(75% 0.15 270));
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--space-md, 1rem);
      }
      .ui-lite-tracing-beam__track {
        position: relative;
        inline-size: 2px;
        background: var(--bg-active, oklch(100% 0 0 / 0.08));
        border-radius: 1px;
      }
      .ui-lite-tracing-beam__progress {
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        inline-size: 100%;
        block-size: 100%;
        background: var(--beam-color);
        border-radius: 1px;
      }
      .ui-lite-tracing-beam__content {
        min-inline-size: 0;
      }
      @media (forced-colors: active) {
        .ui-lite-tracing-beam__track { background: CanvasText; }
        .ui-lite-tracing-beam__progress { background: Highlight; }
      }
    }
  }
`

export interface LiteTracingBeamProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  children: ReactNode
}

export const TracingBeam = forwardRef<HTMLDivElement, LiteTracingBeamProps>(
  ({ color, children, className, style, ...rest }, ref) => {
    useStyles('lite-tracing-beam', tracingBeamStyles)
    return (
      <div
        ref={ref}
        className={`ui-lite-tracing-beam${className ? ` ${className}` : ''}`}
        data-motion="0"
        style={color ? { ...style, '--tracing-beam-color': color } as React.CSSProperties : style}
        {...rest}
      >
        <div className="ui-lite-tracing-beam__track" aria-hidden="true">
          <div className="ui-lite-tracing-beam__progress" />
        </div>
        <div className="ui-lite-tracing-beam__content">{children}</div>
      </div>
    )
  }
)
TracingBeam.displayName = 'TracingBeam'
