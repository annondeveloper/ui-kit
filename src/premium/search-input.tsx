'use client'

import { forwardRef } from 'react'
import { SearchInput as BaseSearchInput, type SearchInputProps } from '../components/search-input'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumSearchInputStyles = css`
  @layer premium {
    @scope (.ui-premium-search-input) {
      :scope {
        display: contents;
      }

      /* ── Aurora glow focus ring ── */
      :scope .ui-search-input__field:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
          0 0 16px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 32px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
        transition: box-shadow 0.3s var(--ease-out, ease-out),
                    border-color 0.2s var(--ease-out, ease-out);
      }
      :scope .ui-search-input__field {
        transition: box-shadow 0.25s var(--ease-out, ease-out),
                    border-color 0.15s var(--ease-out, ease-out);
      }

      /* ── Spring-bounce clear button ── */
      :scope .ui-search-input__clear {
        animation: ui-premium-clear-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope .ui-search-input__clear:active {
        animation: ui-premium-clear-press 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes ui-premium-clear-enter {
        0%   { transform: scale(0); opacity: 0; }
        60%  { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes ui-premium-clear-press {
        0%   { transform: scale(1); }
        50%  { transform: scale(0.8); }
        100% { transform: scale(1); }
      }

      /* ── Shimmer loading state ── */
      :scope .ui-search-input[data-loading] .ui-search-input__field {
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04) 48%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08) 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04) 52%,
          transparent 70%
        );
        background-size: 250% 100%;
        animation: ui-premium-search-shimmer 1.8s ease-in-out infinite;
      }
      @keyframes ui-premium-search-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* ── Motion level 0: no animation ── */
      :scope[data-motion="0"] .ui-search-input__field:focus {
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }
      :scope[data-motion="0"] .ui-search-input__clear {
        animation: none;
      }
      :scope[data-motion="0"] .ui-search-input[data-loading] .ui-search-input__field {
        animation: none;
        background: transparent;
      }

      /* ── Motion level 1: subtle glow, no spring ── */
      :scope[data-motion="1"] .ui-search-input__field:focus {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          0 0 8px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }
      :scope[data-motion="1"] .ui-search-input__clear {
        animation: none;
      }

      /* ── Motion level 2: conservative spring ── */
      :scope[data-motion="2"] .ui-search-input__clear {
        animation: ui-premium-clear-enter-soft 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
      }
      @keyframes ui-premium-clear-enter-soft {
        0%   { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-search-input__clear {
          animation: none !important;
        }
        :scope .ui-search-input[data-loading] .ui-search-input__field {
          animation: none !important;
          background: transparent !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-search-input__field:focus {
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-search-input', premiumSearchInputStyles)

    return (
      <div className="ui-premium-search-input" data-motion={motionLevel}>
        <BaseSearchInput ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
