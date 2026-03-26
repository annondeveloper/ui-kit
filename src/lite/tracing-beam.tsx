import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteTracingBeamProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  children: ReactNode
}

export const TracingBeam = forwardRef<HTMLDivElement, LiteTracingBeamProps>(
  ({ color, children, className, style, ...rest }, ref) => (
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
)
TracingBeam.displayName = 'TracingBeam'
