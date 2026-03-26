'use client'

import { forwardRef } from 'react'
import { Sidebar as BaseSidebar, type SidebarProps } from '../components/sidebar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumSidebarStyles = css`
  @layer premium {
    @scope (.ui-premium-sidebar) {
      :scope {
        display: contents;
      }

      /* ── Glass morphism background ── */
      :scope .ui-sidebar {
        background:
          linear-gradient(
            180deg,
            oklch(from var(--bg-surface, oklch(18% 0.01 270)) l c h / 0.85) 0%,
            oklch(from var(--bg-surface, oklch(18% 0.01 270)) l c h / 0.92) 100%
          );
        backdrop-filter: blur(16px) saturate(1.4);
        border-inline-end-color: oklch(100% 0 0 / 0.06);
      }

      :scope .ui-sidebar[data-position="right"] {
        border-inline-start-color: oklch(100% 0 0 / 0.06);
      }

      /* ── Aurora glow on active item ── */
      :scope .ui-sidebar__item[data-active="true"] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.14);
        box-shadow:
          0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 24px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1),
          inset 0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        transition: background 0.2s var(--ease-out, ease-out),
                    box-shadow 0.3s var(--ease-out, ease-out);
      }

      :scope .ui-sidebar__item {
        transition: background 0.15s var(--ease-out, ease-out),
                    box-shadow 0.2s var(--ease-out, ease-out);
      }

      /* ── Hover glow for items ── */
      :scope .ui-sidebar__item:hover:not([data-active="true"]) {
        background: oklch(100% 0 0 / 0.06);
        box-shadow: 0 0 8px -4px oklch(100% 0 0 / 0.08);
      }

      /* ── Spring collapse/expand animation ── */
      :scope .ui-sidebar:not([data-motion="0"]) {
        transition: inline-size 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* ── Glass toggle button ── */
      :scope .ui-sidebar__toggle {
        background: oklch(from var(--bg-elevated, oklch(22% 0.01 270)) l c h / 0.8);
        backdrop-filter: blur(8px);
        border-color: oklch(100% 0 0 / 0.1);
        transition: background 0.15s, color 0.15s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope .ui-sidebar__toggle:hover {
        transform: scale(1.1);
        background: oklch(100% 0 0 / 0.12);
      }

      /* ── Motion level 0: no animation ── */
      :scope[data-motion="0"] .ui-sidebar {
        transition: none;
        backdrop-filter: none;
        background: var(--bg-surface, oklch(18% 0.01 270));
      }
      :scope[data-motion="0"] .ui-sidebar__item[data-active="true"] {
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-sidebar__toggle {
        backdrop-filter: none;
        transition: none;
      }

      /* ── Motion level 1: subtle glass, no spring ── */
      :scope[data-motion="1"] .ui-sidebar:not([data-motion="0"]) {
        transition: inline-size 0.2s var(--ease-out, ease-out);
      }
      :scope[data-motion="1"] .ui-sidebar__item[data-active="true"] {
        box-shadow: 0 0 8px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }
      :scope[data-motion="1"] .ui-sidebar__toggle:hover {
        transform: none;
      }

      /* ── Motion level 2: conservative spring ── */
      :scope[data-motion="2"] .ui-sidebar:not([data-motion="0"]) {
        transition: inline-size 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-sidebar {
          transition: none !important;
        }
        :scope .ui-sidebar__toggle {
          transition: background 0.15s, color 0.15s !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-sidebar {
          backdrop-filter: none;
          background: Canvas;
        }
        :scope .ui-sidebar__item[data-active="true"] {
          box-shadow: none;
        }
        :scope .ui-sidebar__toggle {
          backdrop-filter: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-sidebar', premiumSidebarStyles)

    return (
      <div className="ui-premium-sidebar" data-motion={motionLevel}>
        <BaseSidebar ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Sidebar.displayName = 'Sidebar'
