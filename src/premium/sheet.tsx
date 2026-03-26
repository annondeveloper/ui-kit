'use client'

import { Sheet as BaseSheet, type SheetProps } from '../components/sheet'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumSheetStyles = css`
  @layer premium {
    @scope (.ui-premium-sheet) {
      :scope {
        display: contents;
      }

      /* ── Spring-slide entrance with overshoot ── */
      :scope dialog:not([data-motion="0"]) {
        transition:
          transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 0.3s var(--ease-out, ease-out),
          display 0.4s allow-discrete,
          overlay 0.4s allow-discrete;
      }

      /* ── Aurora glow edge — right side ── */
      :scope dialog[open][data-side="right"] {
        box-shadow:
          -4px 0 16px oklch(0% 0 0 / 0.2),
          -2px 0 24px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08),
          -1px 0 48px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04);
      }

      /* ── Aurora glow edge — left side ── */
      :scope dialog[open][data-side="left"] {
        box-shadow:
          4px 0 16px oklch(0% 0 0 / 0.2),
          2px 0 24px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08),
          1px 0 48px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04);
      }

      /* ── Aurora glow edge — bottom side ── */
      :scope dialog[open][data-side="bottom"] {
        box-shadow:
          0 -4px 16px oklch(0% 0 0 / 0.2),
          0 -2px 24px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08),
          0 -1px 48px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04);
      }

      /* ── Enhanced backdrop blur ── */
      :scope dialog::backdrop {
        background: oklch(0% 0 0 / 0.5);
        backdrop-filter: blur(8px) saturate(1.2);
      }

      /* ── Subtle aurora wash on backdrop ── */
      :scope dialog[open]::backdrop {
        background:
          radial-gradient(
            ellipse at 50% 0%,
            oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.05) 0%,
            transparent 60%
          ),
          oklch(0% 0 0 / 0.5);
      }

      /* ── Motion level 0: no spring, no glow ── */
      :scope[data-motion="0"] dialog {
        transition: none;
        box-shadow: none !important;
      }
      :scope[data-motion="0"] dialog::backdrop {
        backdrop-filter: none;
      }

      /* ── Motion level 1: subtle glow, no spring ── */
      :scope[data-motion="1"] dialog:not([data-motion="0"]) {
        transition:
          transform 0.25s var(--ease-out, ease-out),
          opacity 0.25s var(--ease-out, ease-out),
          display 0.25s allow-discrete,
          overlay 0.25s allow-discrete;
      }
      :scope[data-motion="1"] dialog::backdrop {
        backdrop-filter: blur(4px);
      }

      /* ── Motion level 2: conservative spring ── */
      :scope[data-motion="2"] dialog:not([data-motion="0"]) {
        transition:
          transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1),
          opacity 0.3s var(--ease-out, ease-out),
          display 0.35s allow-discrete,
          overlay 0.35s allow-discrete;
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope dialog {
          transition: none !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope dialog {
          box-shadow: none !important;
        }
        :scope dialog::backdrop {
          backdrop-filter: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function Sheet({ motion: motionProp, ...rest }: SheetProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-sheet', premiumSheetStyles)

  return (
    <div className="ui-premium-sheet" data-motion={motionLevel}>
      <BaseSheet motion={motionProp} {...rest} />
    </div>
  )
}

Sheet.displayName = 'Sheet'
