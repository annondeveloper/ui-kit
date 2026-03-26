'use client'

import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  sticky?: boolean
  bordered?: boolean
  transparent?: boolean
  height?: number
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const navbarStyles = css`
  @layer components {
    @scope (.ui-navbar) {
      :scope {
        display: flex;
        align-items: center;
        gap: var(--space-md, 0.75rem);
        block-size: var(--navbar-height, 56px);
        padding-inline: var(--space-lg, 1.25rem);
        background: var(--bg-surface, oklch(18% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
        z-index: 100;
        position: relative;
      }

      /* Sticky */
      :scope[data-sticky="true"] {
        position: sticky;
        inset-block-start: 0;
        backdrop-filter: blur(12px) saturate(1.5);
        background: oklch(18% 0.01 270 / 0.85);
      }

      /* Bordered */
      :scope[data-bordered="true"] {
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* Transparent */
      :scope[data-transparent="true"] {
        background: transparent;
      }
      :scope[data-transparent="true"][data-sticky="true"] {
        background: oklch(18% 0.01 270 / 0.4);
      }

      /* Logo */
      .ui-navbar__logo {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      /* Nav */
      .ui-navbar__nav {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        flex: 1;
        min-inline-size: 0;
      }

      /* Actions */
      .ui-navbar__actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        flex-shrink: 0;
        margin-inline-start: auto;
      }

      /* Hamburger button (hidden on desktop) */
      .ui-navbar__hamburger {
        display: none;
        align-items: center;
        justify-content: center;
        inline-size: 2.25rem;
        block-size: 2.25rem;
        padding: 0;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        cursor: pointer;
        margin-inline-start: auto;
      }
      .ui-navbar__hamburger:hover {
        background: var(--bg-hover);
      }
      .ui-navbar__hamburger:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Mobile nav dropdown */
      .ui-navbar__mobile-nav {
        display: none;
        position: absolute;
        inset-block-start: 100%;
        inset-inline: 0;
        background: var(--bg-surface, oklch(18% 0.01 270));
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        padding: var(--space-md, 0.75rem);
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        z-index: 99;
      }
      :scope[data-mobile-open="true"] .ui-navbar__mobile-nav {
        display: flex;
      }

      /* Responsive: show hamburger on narrow containers */
      @container (max-width: 640px) {
        .ui-navbar__nav {
          display: none;
        }
        .ui-navbar__hamburger {
          display: inline-flex;
        }
      }

      /* Fallback: media query for non-container contexts */
      @media (max-width: 640px) {
        .ui-navbar__nav {
          display: none;
        }
        .ui-navbar__hamburger {
          display: inline-flex;
        }
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-navbar__hamburger {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          background: Canvas;
          border-color: ButtonText;
        }
        .ui-navbar__hamburger {
          color: ButtonText;
          border: 1px solid ButtonText;
        }
        .ui-navbar__mobile-nav {
          background: Canvas;
          border-color: ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          position: static;
          backdrop-filter: none;
          border-block-end: 1px solid #000;
        }
        .ui-navbar__hamburger {
          display: none;
        }
        .ui-navbar__nav {
          display: flex !important;
        }
        .ui-navbar__mobile-nav {
          display: none !important;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        :scope {
          backdrop-filter: none;
        }
      }
    }
  }
`

// ─── Hamburger Icon ─────────────────────────────────────────────────────────

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3 5H15M3 9H15M3 13H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  function Navbar(
    {
      logo,
      children,
      actions,
      sticky = true,
      bordered = true,
      transparent = false,
      height = 56,
      className,
      style,
      ...rest
    },
    ref
  ) {
    useStyles('navbar', navbarStyles)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
      <header
        ref={ref}
        className={cn('ui-navbar', className)}
        data-sticky={String(sticky)}
        data-bordered={String(bordered)}
        data-transparent={transparent ? 'true' : undefined}
        data-mobile-open={String(mobileOpen)}
        style={{
          '--navbar-height': `${height}px`,
          ...style,
        } as React.CSSProperties}
        {...rest}
      >
        {logo && <div className="ui-navbar__logo">{logo}</div>}

        {children && <nav className="ui-navbar__nav">{children}</nav>}

        {actions && <div className="ui-navbar__actions">{actions}</div>}

        {children && (
          <button
            type="button"
            className="ui-navbar__hamburger"
            aria-label="Toggle menu"
            aria-expanded={String(mobileOpen) as 'true' | 'false'}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <HamburgerIcon />
          </button>
        )}

        {children && (
          <nav className="ui-navbar__mobile-nav" aria-label="Mobile navigation">
            {children}
          </nav>
        )}
      </header>
    )
  }
)

Navbar.displayName = 'Navbar'
