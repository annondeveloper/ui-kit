'use client'

import {
  forwardRef,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { useContainerSize, type ContainerSize } from '../core/utils/use-container-size'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ContainerQueryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Render-prop receives container size; plain ReactNode uses CSS @container */
  children: ((size: ContainerSize) => ReactNode) | ReactNode
}

// ─── Component ──────────────────────────────────────────────────────────────

export const ContainerQuery = forwardRef<HTMLDivElement, ContainerQueryProps>(
  ({ children, className, style, ...rest }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null)
    const size = useContainerSize(innerRef)

    const mergedStyle: React.CSSProperties = {
      containerType: 'inline-size' as const,
      ...style,
    }

    const content = typeof children === 'function' ? children(size) : children

    return (
      <div
        ref={(node) => {
          (innerRef as { current: HTMLDivElement | null }).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as { current: HTMLDivElement | null }).current = node
        }}
        className={cn('ui-container-query', className)}
        style={mergedStyle}
        {...rest}
      >
        {content}
      </div>
    )
  },
)

ContainerQuery.displayName = 'ContainerQuery'
