'use client'

import {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

export interface AffixProps extends HTMLAttributes<HTMLDivElement> {
  position?: { top?: number; bottom?: number; left?: number; right?: number }
  zIndex?: number
  withinPortal?: boolean
  target?: React.RefObject<HTMLElement>
  children: ReactNode
}

const affixStyles = css`
  @layer components {
    @scope (.ui-affix) {
      :scope {
        position: fixed;
        z-index: var(--z-sticky, 100);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
      }

      /* Print — hide fixed elements */
      @media print {
        :scope {
          display: none;
        }
      }
    }
  }
`

export const Affix = forwardRef<HTMLDivElement, AffixProps>(
  (
    {
      position = { bottom: 20, right: 20 },
      zIndex = 100,
      withinPortal = false,
      target,
      children,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('affix', affixStyles)

    const positionStyle: React.CSSProperties = {
      ...(position.top !== undefined ? { top: `${position.top}px` } : {}),
      ...(position.bottom !== undefined ? { bottom: `${position.bottom}px` } : {}),
      ...(position.left !== undefined ? { left: `${position.left}px` } : {}),
      ...(position.right !== undefined ? { right: `${position.right}px` } : {}),
      zIndex,
      ...style,
    }

    const element = (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        style={positionStyle}
        {...rest}
      >
        {children}
      </div>
    )

    if (withinPortal && typeof document !== 'undefined') {
      const { createPortal } = require('react-dom')
      return createPortal(element, document.body)
    }

    return element
  }
)
Affix.displayName = 'Affix'
